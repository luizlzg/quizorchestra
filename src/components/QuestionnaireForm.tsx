
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

const WEBSOCKET_URL = "wss://w7ocv6deoj.execute-api.us-east-1.amazonaws.com/v1";

const QuestionnaireForm = () => {
  const [formData, setFormData] = useState({
    numberOfQuestions: 3,
    numberOfAlternatives: 5,
    questionType: "multiple choice",
    difficulty: "medium",
    professorInput: "",
  });

  const [isConnecting, setIsConnecting] = useState(false);
  const [questionnaireDetails, setQuestionnaireDetails] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsConnecting(true);
    setQuestionnaireDetails(null);
    setQuestions([]);
    
    try {
      const websocketKey = `key-${Date.now()}`;
      const ws = new WebSocket(`${WEBSOCKET_URL}?key=${websocketKey}`);

      ws.onopen = () => {
        const body = {
          action: "generateQuestionnaire",
          sendJustStatus: false,
          key: websocketKey,
          ...formData,
          modulesList: [],
          contextId: "37960", // Changed to string as per schema
          applicationId: 1,
          tenantId: 1,
          institutionId: 1,
          userId: 1,
          languageId: "pt-br",
        };

        ws.send(JSON.stringify(body));
        toast.success("WebSocket conectado com sucesso!");
      };

      ws.onmessage = (event) => {
        const response = JSON.parse(event.data);
        console.log("WebSocket response:", response);

        if (response.action === "partialQuestionGenerated") {
          const newQuestion = response.partialResponse.response;
          setQuestions(prev => [...prev, newQuestion]);
          toast.info(`Questão ${questions.length + 1} gerada`);
        } else if (response.action === "questionnaireDetails") {
          setQuestionnaireDetails(response.questionnaireDetails);
          toast.info("Detalhes do questionário recebidos");
        } else if (response.action === "questionnaireGenerated") {
          toast.success("Questionário completo gerado!");
          setIsConnecting(false);
          ws.close();
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        toast.error("Erro na conexão WebSocket");
        setIsConnecting(false);
      };

      ws.onclose = () => {
        setIsConnecting(false);
        toast.info("Conexão WebSocket fechada");
      };

    } catch (error) {
      toast.error("Falha ao conectar ao WebSocket");
      setIsConnecting(false);
    }
  };

  return (
    <div className="space-y-8">
      <Card className="questionnaire-card">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="form-group">
              <label className="text-sm font-medium">Number of Questions</label>
              <Input
                type="number"
                value={formData.numberOfQuestions}
                onChange={(e) => setFormData(prev => ({ ...prev, numberOfQuestions: parseInt(e.target.value) }))}
                min={1}
                max={10}
              />
            </div>

            <div className="form-group">
              <label className="text-sm font-medium">Alternatives per Question</label>
              <Input
                type="number"
                value={formData.numberOfAlternatives}
                onChange={(e) => setFormData(prev => ({ ...prev, numberOfAlternatives: parseInt(e.target.value) }))}
                min={2}
                max={6}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="form-group">
              <label className="text-sm font-medium">Question Type</label>
              <Select
                value={formData.questionType}
                onValueChange={(value) => setFormData(prev => ({ ...prev, questionType: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="multiple choice">Multiple Choice</SelectItem>
                  <SelectItem value="assertion-reason">Assertion-Reason</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="form-group">
              <label className="text-sm font-medium">Difficulty</label>
              <Select
                value={formData.difficulty}
                onValueChange={(value) => setFormData(prev => ({ ...prev, difficulty: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="form-group">
            <label className="text-sm font-medium">Professor Instructions</label>
            <Textarea
              value={formData.professorInput}
              onChange={(e) => setFormData(prev => ({ ...prev, professorInput: e.target.value }))}
              placeholder="Enter instructions for the questionnaire..."
              className="min-h-[100px]"
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isConnecting}
          >
            {isConnecting ? "Connecting..." : "Generate Questionnaire"}
          </Button>
        </form>
      </Card>

      {questionnaireDetails && (
        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-semibold">Questionário Gerado</h2>
          <div className="space-y-2">
            <p className="font-medium">ID do Questionário: {questionnaireDetails.questionnaireId}</p>
            <p className="text-gray-700">{questionnaireDetails.questionnaireStatement}</p>
          </div>
        </Card>
      )}

      {questions.length > 0 && (
        <div className="space-y-6">
          {questions.map((question, index) => (
            <Card key={index} className="p-6 space-y-4">
              <h3 className="font-medium">Questão {index + 1}</h3>
              <p>{question.content}</p>
              <div className="space-y-2">
                {question.options?.map((option: any, optIndex: number) => (
                  <div key={optIndex} className="flex items-start gap-2 p-2 rounded bg-secondary/50">
                    <div className="w-6">{String.fromCharCode(65 + optIndex)})</div>
                    <p>{option.text}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-4 bg-secondary/30 rounded">
                <p className="font-medium">Feedback:</p>
                <p className="text-sm text-gray-600">{question.feedback}</p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuestionnaireForm;
