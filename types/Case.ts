import type { AIAnalysis } from "./AIAnalysis";

export type Case = {
  id: number;
  title: string;
  clientId: number;
  lawyer: string;
  category: string;
  status: string;
  courtDate: string;
  aiAnalysis: AIAnalysis;
  relatedDocuments: number[];
};