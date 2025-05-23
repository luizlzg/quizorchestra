
import { Card } from "@/components/ui/card";

interface QuestionnaireResultProps {
  questionnaireDetails: any | null;
  questions: any[];
  getDifficultyInPortuguese: (difficulty: string) => string;
  getDifficultyColor: (difficulty: string) => string;
}

const QuestionnaireResult = ({ 
  questionnaireDetails, 
  questions, 
  getDifficultyInPortuguese,
  getDifficultyColor 
}: QuestionnaireResultProps) => {
  if (!questionnaireDetails && questions.length === 0) return null;

  // Function to format assertion-reason questions
  const formatContent = (content: string, questionType: string) => {
    if (questionType?.toLowerCase() !== 'assertion-reason') {
      return content;
    }
    
    // Format assertion-reason questions with appropriate line breaks
    return content.replace(
      /(.*?)(I\.\s.*?)\s(PORQUE)\s(II\.\s.*?)(\sA\srespeito)/i,
      '$1\n\n$2\n\n$3\n\n$4\n\n$5'
    );
  };

  return (
    <div className="space-y-6">
      {questionnaireDetails && (
        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-semibold">Questionário Gerado</h2>
          <div className="space-y-2">
            <p className="font-medium">ID do Questionário: {questionnaireDetails.questionnaireId}</p>
            <p className="text-gray-700">{questionnaireDetails.questionnaireStatement}</p>
          </div>
        </Card>
      )}

      {questions.length > 0 && (
        <div className="space-y-6">
          {questions.map((question, index) => (
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
              <div className="whitespace-pre-line">
                {formatContent(question.content, question.questionType)}
              </div>
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
              {question.feedback && (
                <div className="mt-4 p-4 bg-secondary/30 rounded">
                  <p className="font-medium">Feedback:</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {question.feedback}
                  </p>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuestionnaireResult;
