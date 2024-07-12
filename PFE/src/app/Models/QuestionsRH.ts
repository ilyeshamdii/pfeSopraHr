// src/app/Models/QuestionsRH.ts
export interface QuestionsRH {
  id: number;
  categories: string;
  sousCategories: string;
  titre: string;
  descriptions: string;
  piecesJoint?: string;
  userId: number;
  username?: string; // Add this line
}
