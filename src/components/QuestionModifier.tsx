import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useQuestionnaireStore } from "@/store/questionnaireStore";

const WEBSOCKET_URL = "wss://w7ocv6deoj.execute-api.us-east-1.amazonaws.com/v1";

const QuestionModifier = () => {
  const { questionnaireId, questions } = useQuestionnaireStore();
  
  const [modifyData, setModifyData] = useState({
    questionId: "",
    questionnaireId: questionnaireId || "",
    levelChange: "" as "easy" | "medium" | "hard" | "",
    instructionChange: "",
    directLevelChange: "" as "easier" | "harder" | "",
    typeChange: "" as "multiple choice" | "assertion-reason" | "",
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [modifiedQuestion, setModifiedQuestion] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setModifiedQuestion(null);

    try {
      const websocketKey = `key-${Date.now()}`;
      const ws = new WebSocket(`${WEBSOCKET_URL}?key=${websocketKey}`);

      ws.onopen = () => {
        const body = {
          action: "changeQuestion",
          key: websocketKey,
          questionId: modifyData.questionId,
          questionnaireId: modifyData.questionnaireId,
          levelChange: modifyData.levelChange,
          instructionChange: modifyData.instructionChange,
          directLevelChange: modifyData.directLevelChange,
          typeChange: modifyData.typeChange,
        };

        ws.send(JSON.stringify(body));
        toast.success("WebSocket conectado com sucesso!");
      };

      ws.onmessage = (event) => {
        const response = JSON.parse(event.data);
        console.log("WebSocket response:", response);

        if (response.action === "questionChanged") {
          setModifiedQuestion(response.questionChangeResponse.response);
          toast.success("Questão modificada com sucesso!");
          setIsProcessing(false);
          ws.close();
        } else if (response.action === "questionChangedSuccess") {
          toast.success("Processo finalizado com sucesso!");
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        toast.error("Erro na conexão WebSocket");
        setIsProcessing(false);
      };

      ws.onclose = () => {
        setIsProcessing(false);
        toast.info("Conexão WebSocket fechada");
      };

    } catch (error) {
      toast.error("Falha ao conectar ao WebSocket");
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8">
      <Card className="questionnaire-card">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="form-group">
              <label className="text-sm font-medium">Question ID</label>
              <Select
                value={modifyData.questionId}
                onValueChange={(value) => setModifyData(prev => ({ ...prev, questionId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma questão" />
                </SelectTrigger>
                <SelectContent>
                  {questions.map((question, index) => (
                    <SelectItem key={question.id || index} value={question.id || `temp-${index}`}>
                      Questão {index + 1}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="form-group">
              <label className="text-sm font-medium">Questionnaire ID</label>
              <Input
                value={modifyData.questionnaireId}
                onChange={(e) => setModifyData(prev => ({ ...prev, questionnaireId: e.target.value }))}
                placeholder="Enter questionnaire ID"
                readOnly
              />
            </div>
          </div>

          <div className="form-group">
            <label className="text-sm font-medium">Modification Type</label>
            <Select
              value={modifyData.modificationType}
              onValueChange={(value) => setModifyData(prev => ({ ...prev, modificationType: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="instruction">Custom Instruction</SelectItem>
                <SelectItem value="level">Specific Level</SelectItem>
                <SelectItem value="direct">Easier/Harder</SelectItem>
                <SelectItem value="type">Change Type</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {modifyData.modificationType === "instruction" && (
            <div className="form-group">
              <label className="text-sm font-medium">Modification Instructions</label>
              <Textarea
                value={modifyData.instructionChange}
                onChange={(e) => setModifyData(prev => ({ ...prev, instructionChange: e.target.value }))}
                placeholder="Enter modification instructions..."
                className="min-h-[100px]"
              />
            </div>
          )}

          {modifyData.modificationType === "level" && (
            <div className="form-group">
              <label className="text-sm font-medium">Desired Level</label>
              <Select
                value={modifyData.levelChange}
                onValueChange={(value) => setModifyData(prev => ({ ...prev, levelChange: value }))}
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
          )}

          {modifyData.modificationType === "direct" && (
            <div className="form-group">
              <label className="text-sm font-medium">Difficulty Change</label>
              <Select
                value={modifyData.directLevelChange}
                onValueChange={(value) => setModifyData(prev => ({ ...prev, directLevelChange: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easier">Make Easier</SelectItem>
                  <SelectItem value="harder">Make Harder</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {modifyData.modificationType === "type" && (
            <div className="form-group">
              <label className="text-sm font-medium">New Question Type</label>
              <Select
                value={modifyData.typeChange}
                onValueChange={(value) => setModifyData(prev => ({ ...prev, typeChange: value }))}
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
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={isProcessing}
          >
            {isProcessing ? "Processing..." : "Modify Question"}
          </Button>
        </form>
      </Card>

      {modifiedQuestion && (
        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-semibold">Questão Modificada</h2>
          <p>{modifiedQuestion.content}</p>
          <div className="space-y-2">
            {modifiedQuestion.options?.map((option: any, index: number) => (
              <div key={index} className="flex items-start gap-2 p-2 rounded bg-secondary/50">
                <div className="w-6">{String.fromCharCode(65 + index)})</div>
                <p>{option.text}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 p-4 bg-secondary/30 rounded">
            <p className="font-medium">Feedback:</p>
            <p className="text-sm text-gray-600">{modifiedQuestion.feedback}</p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default QuestionModifier;
