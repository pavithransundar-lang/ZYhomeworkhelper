export enum MessageRole {
  USER = 'user',
  MODEL = 'model',
}

export interface ChatMessage {
  role: MessageRole;
  text: string;
}

export interface HomeworkItem {
  id: number;
  text: string;
  completed: boolean;
  dueDate?: string;
  category?: string;
}