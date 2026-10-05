import { AIProvider, AIResponse, AIMessage } from './types';
import { MockAIProvider } from './MockAIProvider';

export class AIService {
  private static instance: AIService | null = null;
  private currentProvider: AIProvider;

  private constructor() {
    // Default to the MockAIProvider with rich anime companion personality
    this.currentProvider = new MockAIProvider();
  }

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  public setProvider(provider: AIProvider): void {
    this.currentProvider = provider;
  }

  public getProviderName(): string {
    return this.currentProvider.name;
  }

  public async sendMessage(message: string, history: AIMessage[] = []): Promise<AIResponse> {
    return this.currentProvider.sendMessage(message, history);
  }
}

export * from './types';
export { MockAIProvider };
export default AIService;
