export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIResponse {
  reply: string;
  suggestedState?: 'happy' | 'thinking' | 'excited' | 'idle' | 'surprised';
}

export interface AIProvider {
  readonly name: string;
  sendMessage(message: string, history?: AIMessage[]): Promise<AIResponse>;
  isAvailable(): Promise<boolean>;
}
