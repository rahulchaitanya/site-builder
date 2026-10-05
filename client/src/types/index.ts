// Shared front-end types — mirror the Prisma models on the server
// (User, WebsiteProject, Version, Conversation, Transaction)

export interface User {
  id: string;
  name: string;
  email: string;
  credits: number;
  totalCreations: number;
  image?: string | null;
}

export interface WebsiteProject {
  id: string;
  userId: string;
  name: string;
  initialPrompt: string;
  currentCode: string | null;
  currentVersionIndex: string | null;
  isPublic: boolean;
  createdAt: string;
}

export interface Version {
  id: string;
  projectId: string;
  code: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  projectId: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  credits: number;
  amount: number;
  status: "pending" | "completed" | "failed";
  createdAt: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  credits: number;
  price: number;
  highlighted?: boolean;
}
