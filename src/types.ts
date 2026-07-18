export type ViewState = "form" | "processing" | "result";

export type EmailInput = {
  sender: string;
  subject: string;
  body: string;
};

export type AnalysisResult = {
  action: "DRAFT" | "ACKNOWLEDGE" | "ESCALATE";
  actionLabel: string;
  category: string;
  customerStatus: string;
  recipient: string;
  outputTitle: string;
  output: string;
  reasons: string[];
  humanMinutes: number;
  aiSeconds: number;
  hourlyCost: number;
  confidence: number;
};
