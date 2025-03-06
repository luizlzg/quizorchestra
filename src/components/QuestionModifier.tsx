import { useState, useEffect } from "react";
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

  const getDifficultyInPortuguese = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return 'Fácil';
      case 'medium':
        return 'Médio';
      case 'hard':
        return 'Difícil';
      default:
        return 'Médio';
    }
  };

  const { updateQuestion, getQuestionById } = useQuestionnaireStore();
  
  const [modifyData, setModifyData] = useState({
    questionId: "",
    questionnaireId: "", // Agora começará vazio
    modificationType: "instruction" as ModificationType,
    levelChange: "" as "easy" | "medium" | "hard" | "",
    instructionChange: "",
    directLevelChange: "" as "easier" | "harder" | "",
    typeChange: "" as "multiple choice" | "assertion-reason" | "",
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [modifiedQuestion, setModifiedQuestion] = useState<any>(null);

  useEffect(() => {
    if (modifyData.questionId) {
      const question = getQuestionById(modifyData.questionId);
      if (question) {
        setModifiedQuestion(question);
      }
    }
  }, [modifyData.questionId, getQuestionById]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!modifyData.questionId) {
      toast.error("ID da questão não encontrado");
      return;
    }
    
    if (!modifyData.questionnaireId) {
      toast.error("ID do questionário não encontrado");
      return;
    }
    
    setIsProcessing(true);

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
          questionId: modifyData.questionId,
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
          const newQuestion = response.questionChangeResponse.response;
          console.log("Nova questão:", newQuestion);
          updateQuestion(newQuestion);
          setModifiedQuestion(newQuestion);
          toast.success("Questão modificada com sucesso!");
          setIsProcessing(false);
          ws.close();
        } else if (response.action === "error" || response.error) {
          console.error("WebSocket error:", response);
          toast.error("Aconteceu um erro durante a modificação. Revise as entradas passadas e tente novamente.", {
            style: { backgroundColor: "#fef2f2", color: "#ea384c", border: "1px solid #f87171" }
          });
          setIsProcessing(false);
          ws.close();
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        toast.error("Aconteceu um erro durante a modificação. Revise as entradas passadas e tente novamente.", {
          style: { backgroundColor: "#fef2f2", color: "#ea384c", border: "1px solid #f87171" }
        });
        setIsProcessing(false);
      };

      ws.onclose = (event) => {
        console.log("WebSocket closed:", event);
        if (event.code !== 1000 && isProcessing) { // 1000 is normal closure
          toast.error("Aconteceu um erro durante a modificação. Revise as entradas passadas e tente novamente.", {
            style: { backgroundColor: "#fef2f2", color: "#ea384c", border: "1px solid #f87171" }
          });
        }
        setIsProcessing(false);
      };

    } catch (error) {
      console.error("Failed to connect to WebSocket:", error);
      toast.error("Aconteceu um erro durante a modificação. Revise as entradas passadas e tente novamente.", {
        style: { backgroundColor: "#fef2f2", color: "#ea384c", border: "1px solid #f87171" }
      });
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8">
      <Card className="questionnaire-card">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-group">
              <label className="text-sm font-medium">ID da Questão</label>
              <Input
                type="text"
                value={modifyData.questionId}
                onChange={(e) => setModifyData(prev => ({ ...prev, questionId: e.target.value }))}
                placeholder="Digite o ID da questão"
              />
            </div>
            <div className="form-group">
              <label className="text-sm font-medium">ID do Questionário</label>
              <Input
                type="text"
                value={modifyData.questionnaireId}
                onChange={(e) => setModifyData(prev => ({ ...prev, questionnaireId: e.target.value }))}
                placeholder="Digite o ID do questionário"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="text-sm font-medium">Tipo de Modificação</label>
            <Select
              value={modifyData.modificationType}
              onValueChange={(value: ModificationType) => setModifyData(prev => ({ ...prev, modificationType: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo de modificação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="instruction">Instruções</SelectItem>
                <SelectItem value="level">Nível de Dificuldade</SelectItem>
                <SelectItem value="direct">Diretamente mais fácil/difícil</SelectItem>
                <SelectItem value="type">Tipo de Questão</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {modifyData.modificationType === "level" && (
            <div className="form-group">
              <label className="text-sm font-medium">Novo Nível de Dificuldade</label>
              <Select
                value={modifyData.levelChange}
                onValueChange={(value: "easy" | "medium" | "hard") => 
                  setModifyData(prev => ({ ...prev, levelChange: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a dificuldade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Fácil</SelectItem>
                  <SelectItem value="medium">Médio</SelectItem>
                  <SelectItem value="hard">Difícil</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {modifyData.modificationType === "direct" && (
            <div className="form-group">
              <label className="text-sm font-medium">Mudança Direta de Nível</label>
              <Select
                value={modifyData.directLevelChange}
                onValueChange={(value: "easier" | "harder") => 
                  setModifyData(prev => ({ ...prev, directLevelChange: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a direção" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easier">Tornar mais fácil</SelectItem>
                  <SelectItem value="harder">Tornar mais difícil</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {modifyData.modificationType === "type" && (
            <div className="form-group">
              <label className="text-sm font-medium">Novo Tipo de Questão</label>
              <Select
                value={modifyData.typeChange}
                onValueChange={(value: "multiple choice" | "assertion-reason") => 
                  setModifyData(prev => ({ ...prev, typeChange: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="multiple choice">Múltipla Escolha</SelectItem>
                  <SelectItem value="assertion-reason">Asserção-Razão</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {modifyData.modificationType === "instruction" && (
            <div className="form-group">
              <label className="text-sm font-medium">Instruções para Modificação</label>
              <Textarea
                value={modifyData.instructionChange}
                onChange={(e) => setModifyData(prev => ({ ...prev, instructionChange: e.target.value }))}
                placeholder="Digite instruções para modificar a questão..."
                className="min-h-[100px]"
              />
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={isProcessing}
          >
            {isProcessing ? "Processando..." : "Modificar Questão"}
          </Button>
        </form>
      </Card>

      {modifiedQuestion && (
        <Card className="p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Questão Modificada</h2>
            {modifiedQuestion.difficulty && (
              <span className={`text-sm px-2 py-1 rounded border ${getDifficultyColor(modifiedQuestion.difficulty)}`}>
                {getDifficultyInPortuguese(modifiedQuestion.difficulty)}
              </span>
            )}
          </div>
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
              modifiedQuestion.options?.findIndex((opt: any) => opt.correct) >= 0 
                ? String.fromCharCode(65 + modifiedQuestion.options?.findIndex((opt: any) => opt.correct))
                : 'N/A'
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
