
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FormData {
  numberOfQuestions: number;
  numberOfAlternatives: number;
  questionType: "multiple choice" | "assertion-reason";
  difficulty: "easy" | "medium" | "hard";
}

interface QuestionFormOptionsProps {
  formData: FormData;
  onChange: (key: keyof FormData, value: any) => void;
}

const QuestionFormOptions = ({ formData, onChange }: QuestionFormOptionsProps) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="form-group">
          <label className="text-sm font-medium">Número de Questões</label>
          <Input
            type="number"
            value={formData.numberOfQuestions}
            onChange={(e) => onChange("numberOfQuestions", parseInt(e.target.value))}
            min={1}
            max={30}
          />
        </div>

        <div className="form-group">
          <label className="text-sm font-medium">Alternativas por Questão</label>
          <Input
            type="number"
            value={formData.numberOfAlternatives}
            onChange={(e) => onChange("numberOfAlternatives", parseInt(e.target.value))}
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
              onChange("questionType", value)}
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
              onChange("difficulty", value)}
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
    </div>
  );
};

export default QuestionFormOptions;
