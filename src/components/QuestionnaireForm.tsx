
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useQuestionnaireStore, themes } from "@/store/questionnaireStore";
import { Textarea } from "@/components/ui/textarea";

const WEBSOCKET_URL = "wss://w7ocv6deoj.execute-api.us-east-1.amazonaws.com/v1";

const QuestionnaireForm = () => {
  const { 
    selectedTheme, 
    setSelectedTheme, 
    setQuestionnaireId, 
    setQuestions,
    questionnaireDetails,
    setQuestionnaireDetails,
    questions
  } = useQuestionnaireStore();
  
  const [formData, setFormData] = useState({
    numberOfQuestions: 3,
    numberOfAlternatives: 5,
    questionType: "multiple choice" as "multiple choice" | "assertion-reason",
    difficulty: "medium" as "easy" | "medium" | "hard",
    professorInput: "",
  });

  const [isConnecting, setIsConnecting] = useState(false);
  const [localQuestions, setLocalQuestions] = useState<any[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTheme) {
      toast.error("Por favor, selecione um tema");
      return;
    }

    setIsConnecting(true);
    setQuestionnaireDetails(null);
    setLocalQuestions([]);
    
    try {
      const websocketKey = `key-${Date.now()}`;
      const ws = new WebSocket(`${WEBSOCKET_URL}?key=${websocketKey}`);

      ws.onopen = () => {
        const body = {
          action: "generateQuestionnaire",
          key: websocketKey,
          sendJustStatus: false,
          numberOfQuestions: formData.numberOfQuestions,
          numberOfAlternatives: formData.numberOfAlternatives,
          difficulty: formData.difficulty,
          questionType: formData.questionType,
          professorInput: formData.professorInput,
          modulesList: [
            {
              moduleName: selectedTheme.moduleName,
              contentCode: selectedTheme.contentCode,
            }
          ],
          contextId: selectedTheme.contextId,
          applicationId: 1,
          tenantId: 1,
          institutionId: 1,
          userId: 1,
          languageId: "pt-br" as "pt-br" | "en" | "es",
        };

        ws.send(JSON.stringify(body));
        toast.success("WebSocket conectado com sucesso!");
      };

      ws.onmessage = (event) => {
        const response = JSON.parse(event.data);
        console.log("WebSocket response:", response);

        if (response.action === "partialQuestionGenerated") {
          console.log('Resposta:', response.partialResponse.response);
          const newQuestion = response.partialResponse.response;
          console.log('New question:', newQuestion);
          setLocalQuestions(prev => {
            const updated = [...prev, newQuestion];
            setQuestions(updated);
            return updated;
          });
          toast.info(`Questão ${localQuestions.length + 1} gerada`);
        } else if (response.action === "questionnaireDetails") {
          setQuestionnaireDetails(response.questionnaireDetails);
          setQuestionnaireId(response.questionnaireDetails.questionnaireId);
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

  // Função para obter a cor de acordo com a dificuldade
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-400';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'hard':
        return 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  // Usar as questões do estado global para renderização
  const questionsToDisplay = questions;

  return (
    <div className="space-y-8">
      <Card className="questionnaire-card">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="form-group">
            <label className="text-sm font-medium">Tema do Questionário</label>
            <Select
              value={selectedTheme?.contentCode || ""}
              onValueChange={(value) => setSelectedTheme(themes.find(t => t.contentCode === value) || null)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um tema" />
              </SelectTrigger>
              <SelectContent>
                {themes.map((theme) => (
                  <SelectItem key={theme.contentCode} value={theme.contentCode}>
                    {theme.moduleName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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
                onValueChange={(value: "multiple choice" | "assertion-reason") => 
                  setFormData(prev => ({ ...prev, questionType: value }))}
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
                onValueChange={(value: "easy" | "medium" | "hard") => 
                  setFormData(prev => ({ ...prev, difficulty: value }))}
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
            <label className="text-sm font-medium">Instruções do Professor</label>
            <Textarea
              value={formData.professorInput}
              onChange={(e) => setFormData(prev => ({ ...prev, professorInput: e.target.value }))}
              placeholder="Digite instruções adicionais para a geração do questionário..."
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

      {questionsToDisplay.length > 0 && (
        <div className="space-y-6">
          {questionsToDisplay.map((question, index) => (
            <Card key={question.questionId || index} className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Questão {index + 1}</h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground bg-secondary/30 px-2 py-1 rounded">
                    ID: {question.questionId}
                  </span>
                  <span className={`text-sm px-2 py-1 rounded border ${getDifficultyColor(question.difficulty)}`}>
                    {question.difficulty?.charAt(0).toUpperCase() + question.difficulty?.slice(1) || 'Média'}
                  </span>
                </div>
              </div>
              <p>{question.content}</p>
              <div className="space-y-2">
                {question.options?.map((option: any, optIndex: number) => (
                  <div 
                    key={optIndex} 
                    className={`flex items-start gap-2 p-2 rounded ${
                      option.correct ? 'bg-green-100 dark:bg-green-900/20' : 'bg-secondary/50'
                    }`}
                  >
                    <div className="w-6">
                      {String.fromCharCode(65 + optIndex)}
                      {option.correct && (
                        <span className="ml-1 text-green-600 dark:text-green-400">✓</span>
                      )}
                    </div>
                    <p>{option.text}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-4 bg-secondary/30 rounded">
                <p className="font-medium">Feedback da alternativa correta ({
                  question.options?.findIndex((opt: any) => opt.correct) >= 0 
                    ? String.fromCharCode(65 + question.options?.findIndex((opt: any) => opt.correct))
                    : 'N/A'
                }):</p>
                <p className="text-sm text-gray-600">
                  {question.options?.find((opt: any) => opt.correct)?.feedback || "Feedback não disponível"}
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuestionnaireForm;
