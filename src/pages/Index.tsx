
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import QuestionnaireForm from "@/components/QuestionnaireForm";
import QuestionModifier from "@/components/QuestionModifier";

const Index = () => {
  const [activeTab, setActiveTab] = useState<"generate" | "modify">("generate");

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary/50 to-background">
      <div className="container max-w-4xl mx-auto py-12 px-4 sm:px-6 space-y-8">
        <div className="text-center space-y-4">
          <div className="inline-flex rounded-lg bg-secondary p-1">
            <Button
              variant={activeTab === "generate" ? "default" : "ghost"}
              onClick={() => setActiveTab("generate")}
              className="rounded-lg transition-all duration-300"
            >
              Generate Questionnaire
            </Button>
            <Button
              variant={activeTab === "modify" ? "default" : "ghost"}
              onClick={() => setActiveTab("modify")}
              className="rounded-lg transition-all duration-300"
            >
              Modify Questions
            </Button>
          </div>
        </div>

        <div className="animate-in">
          {activeTab === "generate" ? <QuestionnaireForm /> : <QuestionModifier />}
        </div>
      </div>
    </div>
  );
};

export default Index;
