
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

const QuestionnaireForm = () => {
  const [formData, setFormData] = useState({
    numberOfQuestions: 3,
    numberOfAlternatives: 5,
    questionType: "multiple choice",
    difficulty: "medium",
    professorInput: "",
  });

  const [isConnecting, setIsConnecting] = useState(false);
  const [wsStatus, setWsStatus] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsConnecting(true);
    
    try {
      const websocketKey = `key-${Date.now()}`;
      // Websocket connection will be implemented here when URL is provided
      const mockBody = {
        action: "generateQuestionnaire",
        sendJustStatus: false,
        key: websocketKey,
        ...formData,
        modulesList: [],
        contextId: 37960,
        applicationId: 1,
        tenantId: 1,
        institutionId: 1,
        userId: 1,
        languageId: "pt-br",
      };
      
      toast.info("Websocket connection will be implemented when URL is provided");
      console.log("Request body:", mockBody);
    } catch (error) {
      toast.error("Failed to connect to websocket");
    } finally {
      setIsConnecting(false);
    }
  };

  return (
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
  );
};

export default QuestionnaireForm;
