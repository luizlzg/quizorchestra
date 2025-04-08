
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { themes } from "@/store/questionnaireStore";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";

interface QuestionFormCreationMethodProps {
  creationMethod: "theme" | "input";
  selectedThemes: string[];
  customInput: string;
  setCreationMethod: (method: "theme" | "input") => void;
  setSelectedThemes: (themeCodes: string[]) => void;
  setCustomInput: (input: string) => void;
}

const QuestionFormCreationMethod = ({
  creationMethod,
  selectedThemes,
  customInput,
  setCreationMethod,
  setSelectedThemes,
  setCustomInput
}: QuestionFormCreationMethodProps) => {

  const handleThemeSelection = (themeCode: string, checked: boolean) => {
    if (checked) {
      setSelectedThemes([...selectedThemes, themeCode]);
    } else {
      setSelectedThemes(selectedThemes.filter(code => code !== themeCode));
    }
  };

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
            <label className="text-sm font-medium mb-2">Temas do Questionário</label>
            <div className="border rounded-md p-3">
              <ScrollArea className="h-[220px]">
                <div className="space-y-2">
                  {themes.map((theme) => (
                    <div key={theme.contentCode} className="flex items-start space-x-2">
                      <Checkbox 
                        id={`theme-${theme.contentCode}`} 
                        checked={selectedThemes.includes(theme.contentCode)}
                        onCheckedChange={(checked) => 
                          handleThemeSelection(theme.contentCode, checked as boolean)
                        }
                      />
                      <label 
                        htmlFor={`theme-${theme.contentCode}`}
                        className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {theme.moduleName}
                      </label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Selecione um ou mais temas para gerar o questionário.
            </p>
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
