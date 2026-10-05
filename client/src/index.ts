export interface User {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  credits: number;
  totalCreations: number;
}

export interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface Version {
  id: string;
  code: string;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  initialPrompt: string;
  currentCode: string | null;
  isPublic: boolean;
  createdAt: string;
  conversation?: Message[];
}

export interface PricingPlan {
  name: string;
  credits: number;
  price: number;
  features: string[];
}