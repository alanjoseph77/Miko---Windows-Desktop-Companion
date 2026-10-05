import { AIProvider, AIResponse, AIMessage } from './types';

export class MockAIProvider implements AIProvider {
  public readonly name = 'Miko Local Intelligence';

  public async isAvailable(): Promise<boolean> {
    return true;
  }

  public async sendMessage(message: string, _history: AIMessage[] = []): Promise<AIResponse> {
    // Simulate slight natural thinking delay for realism
    await new Promise((resolve) => setTimeout(resolve, 600));

    const lower = message.toLowerCase().trim();

    if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
      return {
        reply: "Yahho! ( ´ ▽ ` )ﾉ I'm right here beside you! Ready to be productive today?",
        suggestedState: 'happy',
      };
    }

    if (lower.includes('project') || lower.includes('work') || lower.includes('task')) {
      return {
        reply: "Let's break it down into bite-sized steps! Have you added them to your Task List yet? 📝",
        suggestedState: 'excited',
      };
    }

    if (lower.includes('tired') || lower.includes('sleep') || lower.includes('break')) {
      return {
        reply: "You've been working hard! Stretch your arms, drink some water, and rest your eyes for 5 minutes. 🍵",
        suggestedState: 'thinking',
      };
    }

    if (lower.includes('focus') || lower.includes('pomodoro') || lower.includes('timer')) {
      return {
        reply: "Let's do 25 minutes of deep focus! Put your phone away and let's conquer this together! 🚀",
        suggestedState: 'excited',
      };
    }

    if (lower.includes('love') || lower.includes('cute') || lower.includes('miko')) {
      return {
        reply: "Ehehe~ Thank you! (⁄ ⁄> ⁄ ▽ ⁄ <⁄ ⁄) You make me blush! I'll always cheer you on!",
        suggestedState: 'happy',
      };
    }

    if (lower.includes('who are you') || lower.includes('what are you')) {
      return {
        reply: "I'm Miko, your faithful desktop companion! I live on your screen to help you stay focused, organized, and happy! ✨",
        suggestedState: 'excited',
      };
    }

    if (lower.includes('joke') || lower.includes('funny')) {
      return {
        reply: "Why do programmers prefer dark mode? Because light attracts bugs! 🐛 Hehe!",
        suggestedState: 'happy',
      };
    }

    if (lower.includes('help') || lower.includes('how')) {
      return {
        reply: "You can click on me to open my menu! Use the Pomodoro timer for focus sessions or the task list for today's goals! 💡",
        suggestedState: 'thinking',
      };
    }

    const defaultResponses: Array<{ reply: string; state: 'happy' | 'thinking' | 'excited' }> = [
      { reply: "I'm listening closely! Let's give it our best effort! ✨", state: 'happy' },
      { reply: "Hmm, that's interesting! Keep going, I'm right here cheering for you! 🌟", state: 'thinking' },
      { reply: "One step at a time! Even small progress adds up to big victories! 🐾", state: 'excited' },
      { reply: "Let's stay focused and finish this strong! You can do it! 💫", state: 'happy' },
    ];

    const pick = defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
    return {
      reply: pick.reply,
      suggestedState: pick.state,
    };
  }
}

export default MockAIProvider;
