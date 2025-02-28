import React, { useState } from "react";
import QuestionnaireForm from "./QuestionnaireForm";
import QuestionModifier from "./QuestionModifier";
import { Card } from "@/components/ui/card";

const QuestionnaireManager = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary/50 to-background">
      <div className="container max-w-4xl mx-auto py-12 px-4 sm:px-6 space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Geração de questionários</h1>
        </div>
        <h2 className="text-lg font-semibold">Criar questionário</h2>
        <QuestionnaireForm />
        <h2 className="text-lg font-semibold">Modificar questões</h2>
        <QuestionModifier />
      </div>
    </div>
  );
};

export default QuestionnaireManager;