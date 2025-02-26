
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Theme {
  moduleName: string;
  contentCode: string;
  contextId: string;
}

interface QuestionnaireStore {
  selectedTheme: Theme | null;
  questionnaireId: string | null;
  questions: any[];
  questionnaireDetails: any | null;
  modifiedQuestions: Record<string, any>;
  setSelectedTheme: (theme: Theme | null) => void;
  setQuestionnaireId: (id: string | null) => void;
  setQuestions: (questions: any[]) => void;
  setQuestionnaireDetails: (details: any | null) => void;
  updateQuestion: (updatedQuestion: any) => void;
  getQuestionById: (questionId: string) => any;
}

export const useQuestionnaireStore = create<QuestionnaireStore>()(
  persist(
    (set, get) => ({
      selectedTheme: null,
      questionnaireId: null,
      questions: [],
      questionnaireDetails: null,
      modifiedQuestions: {},
      setSelectedTheme: (theme) => set({ selectedTheme: theme }),
      setQuestionnaireId: (id) => set({ questionnaireId: id }),
      setQuestions: (questions) => set({ questions }),
      setQuestionnaireDetails: (details) => set({ questionnaireDetails: details }),
      updateQuestion: (updatedQuestion) =>
        set((state) => {
          // Atualiza a questão nas duas listas
          const updatedQuestions = state.questions.map((q) =>
            q.questionId === updatedQuestion.questionId ? updatedQuestion : q
          );

          // Armazena a versão modificada da questão
          const updatedModifiedQuestions = {
            ...state.modifiedQuestions,
            [updatedQuestion.questionId]: updatedQuestion,
          };

          return {
            questions: updatedQuestions,
            modifiedQuestions: updatedModifiedQuestions,
          };
        }),
      getQuestionById: (questionId) => {
        const state = get();
        // Primeiro procura na lista de questões modificadas
        if (state.modifiedQuestions[questionId]) {
          return state.modifiedQuestions[questionId];
        }
        // Se não encontrar, procura na lista original
        return state.questions.find((q) => q.questionId === questionId);
      },
    }),
    {
      name: 'questionnaire-store',
      // Apenas persiste as questões modificadas e o ID do questionário
      partialize: (state) => ({
        modifiedQuestions: state.modifiedQuestions,
        questionnaireId: state.questionnaireId,
      }),
    }
  )
);

export const themes: Theme[] = [
  { moduleName: "Balanço de entropia", contentCode: "97434", contextId: "39428" },
  { moduleName: "Sistema nervoso: comprometimento por acidente vascular encefálico", contentCode: "85034", contextId: "37958" },
  { moduleName: "SQL, conceitos e funcionalidades", contentCode: "91791", contextId: "38068" },
  { moduleName: "Desempenho, Competências Essenciais e Produtividade", contentCode: "92579", contextId: "38068" },
  { moduleName: "AGRICULTURA DE PRECISÃO - ANÁLISE DE INFORMAÇÕES DO COMPUTADOR DE BORDO DA COLHEDORA", contentCode: "85081", contextId: "37960" },
  { moduleName: "Evolução da arquitetura de computadores", contentCode: "85089", contextId: "37960" },
  { moduleName: "O que é um software CAD?", contentCode: "85098", contextId: "37960" },
  { moduleName: "Desenho Técnico: formas de elaboração, padronização e Normas da ABNT", contentCode: "85107", contextId: "37960" },
  { moduleName: "Switches em redes de computadores", contentCode: "85116", contextId: "37960" },
  { moduleName: "Introdução à administração de redes de computadores", contentCode: "85125", contextId: "37960" },
  { moduleName: "Tomografia computadorizada", contentCode: "85134", contextId: "37960" },
  { moduleName: "Redes de Computadores", contentCode: "85143", contextId: "37960" },
  { moduleName: "Infraestrutura dos sistemas de produção sucroenergética e florestal", contentCode: "43708", contextId: "21773" },
];
