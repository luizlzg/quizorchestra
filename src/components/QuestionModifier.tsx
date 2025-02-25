import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useQuestionnaireStore } from "@/store/questionnaireStore";

const WEBSOCKET_URL = "wss://w7ocv6deoj.execute-api.us-east-1.amazonaws.com/v1";

type ModificationType = "instruction" | "level" | "direct" | "type";

const QuestionModifier = () => {
  const { questionnaireId, questions } = useQuestionnaireStore();
  
  const [modifyData, setModifyData] = useState({
    questionId: "",
    questionnaireId: questionnaireId || "",
    modificationType: "instruction" as ModificationType,
    levelChange: "" as "easy" | "medium" | "hard" | "",
    instructionChange: "",
    directLevelChange: "" as "easier" | "harder" | "",
    typeChange: "" as "multiple choice" | "assertion-reason" | "",
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [modifiedQuestion, setModifiedQuestion] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedQuestion = questions.find((q) => q.questionId === modifyData.questionId);
    
    if (!selectedQuestion?.questionId) {
      toast.error("ID da questão não encontrado");
      return;
    }
    
    if (!modifyData.questionnaireId) {
      toast.error("ID do questionário não encontrado");
      return;
    }
    
    setIsProcessing(true);
    setModifiedQuestion(null);

    try {
      const websocketKey = `key-${Date.now()}`;
      const ws = new WebSocket(`${WEBSOCKET_URL}?key=${websocketKey}`);

      ws.onopen = () => {
        let levelChange = "";
        let directLevelChange = "";
        let typeChange = "";
        let instructionChange = "";

        switch (modifyData.modificationType) {
          case "level":
            levelChange = modifyData.levelChange;
            break;
          case "direct":
            directLevelChange = modifyData.directLevelChange;
            break;
          case "type":
            typeChange = modifyData.typeChange;
            break;
          case "instruction":
            instructionChange = modifyData.instructionChange;
            break;
        }

        const body = {
          action: "changeQuestion",
          key: websocketKey,
          questionId: selectedQuestion.questionId,
          questionnaireId: modifyData.questionnaireId,
          levelChange,
          instructionChange,
          directLevelChange,
          typeChange,
        };

        console.log("Sending request:", body);
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
              <Input
                value={modifyData.questionId}
                onChange={(e) => setModifyData(prev => ({ ...prev, questionId: e.target.value }))}
                placeholder="Digite o ID da questão"
              />
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
              onValueChange={(value: ModificationType) => {
                setModifyData(prev => ({
                  ...prev,
                  modificationType: value,
                  levelChange: "",
                  instructionChange: "",
                  directLevelChange: "",
                  typeChange: ""
                }));
              }}
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
                onValueChange={(value: "easy" | "medium" | "hard" | "") => 
                  setModifyData(prev => ({ ...prev, levelChange: value }))}
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
                onValueChange={(value: "easier" | "harder" | "") => 
                  setModifyData(prev => ({ ...prev, directLevelChange: value }))}
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
                onValueChange={(value: "multiple choice" | "assertion-reason" | "") => 
                  setModifyData(prev => ({ ...prev, typeChange: value }))}
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
              <div 
                key={index} 
                className={`flex items-start gap-2 p-2 rounded ${
                  option.correct ? 'bg-green-100 dark:bg-green-900/20' : 'bg-secondary/50'
                }`}
              >
                <div className="w-6">
                  {String.fromCharCode(65 + index)}
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
              String.fromCharCode(65 + modifiedQuestion.options?.findIndex((opt: any) => opt.correct))
            }):</p>
            <p className="text-sm text-gray-600">
              {modifiedQuestion.options?.find((opt: any) => opt.correct)?.feedback || "Feedback não disponível"}
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default QuestionModifier;
