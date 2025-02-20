
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

const QuestionModifier = () => {
  const [modifyData, setModifyData] = useState({
    questionId: "",
    questionnaireId: "",
    modificationType: "instruction",
    instructionChange: "",
    levelChange: "medium",
    directLevelChange: "easier",
    typeChange: "multiple choice",
  });

  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const websocketKey = `key-${Date.now()}`;
      // Websocket connection will be implemented here when URL is provided
      const mockBody = {
        action: "changeQuestion",
        key: websocketKey,
        questionId: modifyData.questionId,
        questionnaireId: modifyData.questionnaireId,
        levelChange: modifyData.modificationType === "level" ? modifyData.levelChange : "",
        instructionChange: modifyData.modificationType === "instruction" ? modifyData.instructionChange : "",
        directLevelChange: modifyData.modificationType === "direct" ? modifyData.directLevelChange : "",
        typeChange: modifyData.modificationType === "type" ? modifyData.typeChange : "",
      };

      toast.info("Websocket connection will be implemented when URL is provided");
      console.log("Request body:", mockBody);
    } catch (error) {
      toast.error("Failed to connect to websocket");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="questionnaire-card">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="form-group">
            <label className="text-sm font-medium">Question ID</label>
            <Input
              value={modifyData.questionId}
              onChange={(e) => setModifyData(prev => ({ ...prev, questionId: e.target.value }))}
              placeholder="Enter question ID"
            />
          </div>

          <div className="form-group">
            <label className="text-sm font-medium">Questionnaire ID</label>
            <Input
              value={modifyData.questionnaireId}
              onChange={(e) => setModifyData(prev => ({ ...prev, questionnaireId: e.target.value }))}
              placeholder="Enter questionnaire ID"
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
  );
};

export default QuestionModifier;
