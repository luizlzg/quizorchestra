
import React from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { X } from "lucide-react";

interface QuestionnaireErrorProps {
  errorMessage: string | null;
  onClose: () => void;
}

const QuestionnaireError = ({ errorMessage, onClose }: QuestionnaireErrorProps) => {
  if (!errorMessage) return null;
  
  return (
    <Alert className="bg-red-100 border border-red-400 text-red-700 mb-4 relative" variant="destructive">
      <AlertDescription className="text-red-700">{errorMessage}</AlertDescription>
      <button 
        className="absolute top-2 right-2 text-red-700 hover:text-red-900"
        onClick={onClose}
        aria-label="Close"
      >
        <X className="h-4 w-4" />
      </button>
    </Alert>
  );
};

export default QuestionnaireError;
