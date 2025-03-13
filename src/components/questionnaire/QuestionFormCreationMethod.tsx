
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { themes } from "@/store/questionnaireStore";

interface QuestionFormCreationMethodProps {
  creationMethod: "theme" | "input";
  selectedThemeCode: string | undefined;
  customInput: string;
  setCreationMethod: (method: "theme" | "input") => void;
  setSelectedTheme: (themeCode: string) => void;
  setCustomInput: (input: string) => void;
}

const QuestionFormCreationMethod = ({
  creationMethod,
  selectedThemeCode,
  customInput,
  setCreationMethod,
  setSelectedTheme,
  setCustomInput
}: QuestionFormCreationMethodProps) => {
  return (
    <div className="space-y-4">
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

      <Tabs value={creationMethod} onValueChange={(value: "theme" | "input") => setCreationMethod(value)}>
        <TabsContent value="theme">
          <div className="form-group">
            <label className="text-sm font-medium">Tema do Questionário</label>
            <Select
              value={selectedThemeCode || ""}
              onValueChange={(value) => setSelectedTheme(value)}
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
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              className="min-h-[120px]"
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default QuestionFormCreationMethod;
