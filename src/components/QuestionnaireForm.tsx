
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { useQuestionnaireStore, themes } from "@/store/questionnaireStore";
import QuestionFormCreationMethod from "./questionnaire/QuestionFormCreationMethod";
import QuestionFormOptions from "./questionnaire/QuestionFormOptions";
import QuestionnaireError from "./questionnaire/QuestionnaireError";
import QuestionnaireResult from "./questionnaire/QuestionnaireResult";

const WEBSOCKET_URL = "wss://w7ocv6deoj.execute-api.us-east-1.amazonaws.com/v1";

const QuestionnaireForm = () => {
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
    customInput: "",
  });

  const [isConnecting, setIsConnecting] = useState(false);
  const [localQuestions, setLocalQuestions] = useState<any[]>([]);
  const [creationMethod, setCreationMethod] = useState<"theme" | "input">("theme");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFormDataChange = (key: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (creationMethod === "theme" && !selectedTheme) {
      toast({
        title: "Erro",
        description: "Por favor, selecione um tema",
        variant: "error",
      });
      return;
    }

    if (creationMethod === "input" && !formData.customInput.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, insira o conteúdo para o questionário",
        variant: "error",
      });
      return;
    }

    setIsConnecting(true);
    setQuestionnaireDetails(null);
    setLocalQuestions([]);
    setErrorMessage(null);
    
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
          professorInput: "",
          customInput: creationMethod === "input" ? formData.customInput : undefined,
          modulesList: creationMethod === "theme" ? [
            {
              moduleName: selectedTheme?.moduleName,
              contentCode: selectedTheme?.contentCode,
            }
          ] : [],
          contextId: creationMethod === "theme" ? selectedTheme?.contextId : "37960",
          applicationId: 1,
          tenantId: 1,
          institutionId: 1,
          userId: 1,
          languageId: "pt-br" as "pt-br" | "en" | "es",
        };

        ws.send(JSON.stringify(body));
        toast({
          title: "Sucesso",
          description: "WebSocket conectado com sucesso!",
        });
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
          toast({
            title: "Questão gerada",
            description: `Questão ${localQuestions.length + 1} gerada`,
          });
        } else if (response.action === "questionnaireDetails") {
          setQuestionnaireDetails(response.questionnaireDetails);
          setQuestionnaireId(response.questionnaireDetails.questionnaireId);
          toast({
            title: "Informação",
            description: "Detalhes do questionário recebidos",
          });
        } else if (response.action === "questionnaireGenerated") {
          toast({
            title: "Sucesso",
            description: "Questionário completo gerado!",
          });
          setIsConnecting(false);
          ws.close();
        } else if (response.action === "error" || response.error) {
          console.error("WebSocket error:", response);
          setErrorMessage("Aconteceu um erro durante a geração. Revise as entradas passadas e tente novamente.");
          setIsConnecting(false);
          ws.close();
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        setErrorMessage("Aconteceu um erro durante a geração. Revise as entradas passadas e tente novamente.");
        setIsConnecting(false);
      };

      ws.onclose = (event) => {
        console.log("WebSocket closed:", event);
        if (event.code !== 1000 && isConnecting) { // 1000 is normal closure
          setErrorMessage("Aconteceu um erro durante a geração. Revise as entradas passadas e tente novamente.");
        }
        setIsConnecting(false);
      };

    } catch (error) {
      console.error("Failed to connect to WebSocket:", error);
      setErrorMessage("Aconteceu um erro durante a geração. Revise as entradas passadas e tente novamente.");
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

  const closeErrorMessage = () => {
    setErrorMessage(null);
  };

  const selectedThemeCode = selectedTheme?.contentCode;
  
  return (
    <div className="space-y-8">
      <Card className="questionnaire-card p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <QuestionnaireError errorMessage={errorMessage} onClose={closeErrorMessage} />
          
          <QuestionFormCreationMethod
            creationMethod={creationMethod}
            selectedThemeCode={selectedThemeCode}
            customInput={formData.customInput}
            setCreationMethod={setCreationMethod}
            setSelectedTheme={(themeCode) => {
              const theme = themes.find(t => t.contentCode === themeCode);
              setSelectedTheme(theme || null);
            }}
            setCustomInput={(value) => handleFormDataChange("customInput", value)}
          />

          <QuestionFormOptions 
            formData={formData} 
            onChange={handleFormDataChange} 
          />
          
          <Button
            type="submit"
            className="w-full"
            disabled={isConnecting}
          >
            {isConnecting ? "Gerando..." : "Gerar questionário"}
          </Button>
        </form>
      </Card>

      <QuestionnaireResult 
        questionnaireDetails={questionnaireDetails}
        questions={questions}
        getDifficultyInPortuguese={getDifficultyInPortuguese}
        getDifficultyColor={getDifficultyColor}
      />
    </div>
  );
};

export default QuestionnaireForm;
