export type Client = {
  id: number;
  name: string;
  contact: string;
  phone: string;
  status: "VIP" | "Active" | "Archived";
  responsibleLawyer: string;
  activeCases: number[];
  aiScore: number;
};