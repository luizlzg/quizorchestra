
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { useQuestionnaireStore, themes } from "@/store/questionnaireStore";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
    professorInput: "",
    customInput: "",
  });

  const [isConnecting, setIsConnecting] = useState(false);
  const [localQuestions, setLocalQuestions] = useState<any[]>([]);
  const [creationMethod, setCreationMethod] = useState<"theme" | "input">("theme");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
          professorInput: formData.professorInput,
          customInput: creationMethod === "input" ? formData.customInput : undefined,
          modulesList: creationMethod === "theme" ? [
            {
              moduleName: selectedTheme?.moduleName,
              contentCode: selectedTheme?.contentCode,
            }
          ] : [],
          contextId: creationMethod === "theme" ? selectedTheme?.contextId : "0",
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

  // Usar as questões do estado global para renderização
  const questionsToDisplay = questions;

  const closeErrorMessage = () => {
    setErrorMessage(null);
  };

  return (
    <div className="space-y-8">
      <Card className="questionnaire-card">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="form-group">
            <label className="text-sm font-medium mb-2">Método de criação</label>
            <Select
              value={creationMethod}
              onValueChange={(value: "theme" | "input") => setCreationMethod(value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="theme">Via tema</SelectItem>
                <SelectItem value="input">Via texto</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {errorMessage && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{errorMessage}</span>
              <span 
                className="absolute top-0 bottom-0 right-0 px-4 py-3 cursor-pointer" 
                onClick={closeErrorMessage}
              >
                <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <title>Close</title>
                  <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/>
                </svg>
              </span>
            </div>
          )}

          <Tabs value={creationMethod} onValueChange={(value: "theme" | "input") => setCreationMethod(value)}>
            <TabsContent value="theme">
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
            </TabsContent>
            
            <TabsContent value="input">
              <div className="form-group">
                <label className="text-sm font-medium">Conteúdo do Questionário</label>
                <Textarea 
                  placeholder="Insira o conteúdo para gerar o questionário"
                  value={formData.customInput}
                  onChange={(e) => setFormData(prev => ({ ...prev, customInput: e.target.value }))}
                  className="min-h-[120px]"
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="form-group">
              <label className="text-sm font-medium">Número de Questões</label>
              <Input
                type="number"
                value={formData.numberOfQuestions}
                onChange={(e) => setFormData(prev => ({ ...prev, numberOfQuestions: parseInt(e.target.value) }))}
                min={1}
                max={30}
              />
            </div>

            <div className="form-group">
              <label className="text-sm font-medium">Alternativas por Questão</label>
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
              <label className="text-sm font-medium">Tipo de questão</label>
              <Select
                value={formData.questionType}
                onValueChange={(value: "multiple choice" | "assertion-reason") => 
                  setFormData(prev => ({ ...prev, questionType: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="multiple choice">Múltipla escolha</SelectItem>
                  <SelectItem value="assertion-reason">Asserção-razão</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="form-group">
              <label className="text-sm font-medium">Dificuldade</label>
              <Select
                value={formData.difficulty}
                onValueChange={(value: "easy" | "medium" | "hard") => 
                  setFormData(prev => ({ ...prev, difficulty: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Fácil</SelectItem>
                  <SelectItem value="medium">Médio</SelectItem>
                  <SelectItem value="hard">Díficil</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="form-group">
            <label className="text-sm font-medium">Instruções adicionais (opcional)</label>
            <Textarea 
              placeholder="Instruções adicionais para a geração do questionário"
              value={formData.professorInput}
              onChange={(e) => setFormData(prev => ({ ...prev, professorInput: e.target.value }))}
            />
          </div>
          
          <Button
            type="submit"
            className="w-full"
            disabled={isConnecting}
          >
            {isConnecting ? "Gerando..." : "Gerar questionário"}
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
                  {getDifficultyInPortuguese(question.difficulty)}
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
