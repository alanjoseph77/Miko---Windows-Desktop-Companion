import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, Trash2 } from 'lucide-react';
import { FloatingPanel } from './FloatingPanel';
import { ChatMessage, CharacterState } from '../types';
import { AIService } from '../ai/AIProvider';
import { loadStoredChat, saveStoredChat } from '../store/companionStore';

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onBackToMenu?: () => void;
  onCharacterStateChange: (state: CharacterState) => void;
  onSpeak: (message: string, duration?: number) => void;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  isOpen,
  onClose,
  onBackToMenu,
  onCharacterStateChange,
  onSpeak,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => loadStoredChat());
  const [inputText, setInputText] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [isOpen, messages, isTyping]);

  useEffect(() => {
    saveStoredChat(messages);
  }, [messages]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend ?? inputText).trim();
    if (!text || isTyping) return;

    setInputText('');

    const userMessage: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);
    onCharacterStateChange('thinking');

    try {
      const history = messages.slice(-10).map((m) => ({
        role: (m.sender === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
        content: m.text,
      }));

      const aiService = AIService.getInstance();
      const response = await aiService.sendMessage(text, history);

      const mikoMessage: ChatMessage = {
        id: `m-${Date.now()}`,
        sender: 'miko',
        text: response.reply,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, mikoMessage]);
      onCharacterStateChange(response.suggestedState ?? 'happy');
      onSpeak(response.reply, 5);
    } catch {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'miko',
        text: "I'm having a little trouble thinking right now, but I'm still cheering for you! ✨",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMsg]);
      onCharacterStateChange('sad');
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearHistory = () => {
    const freshChat: ChatMessage[] = [
      {
        id: `init-${Date.now()}`,
        sender: 'miko',
        text: 'Chat cleared! What shall we tackle next? (✿◠‿◠)',
        timestamp: Date.now(),
      },
    ];
    setMessages(freshChat);
  };

  return (
    <FloatingPanel
      title="Miko Chat"
      icon={<span className="miko-status-indicator"><span className="miko-status-dot online" /></span>}
      isOpen={isOpen}
      onClose={onClose}
      onBackToMenu={onBackToMenu}
      className="miko-chat-panel-container"
    >
      <div className="miko-chat-header-status">
        <span className="miko-chat-badge">● Online & Ready</span>
        <button
          className="miko-chat-clear-btn"
          onClick={handleClearHistory}
          title="Clear chat history"
        >
          <Trash2 size={13} />
        </button>
      </div>

      <div className="miko-chat-messages">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`miko-chat-bubble ${m.sender === 'user' ? 'user' : 'miko'}`}
          >
            {m.sender === 'miko' && <div className="miko-chat-avatar">🐾</div>}
            <div className="miko-chat-text">{m.text}</div>
          </div>
        ))}

        {isTyping && (
          <div className="miko-chat-bubble miko typing">
            <div className="miko-chat-avatar">🐾</div>
            <div className="miko-typing-indicator">
              <span />
              <span />
              <span />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="miko-chat-quick-replies">
        <button
          className="miko-quick-chip"
          onClick={() => handleSend("I need to finish my project.")}
        >
          Finish project 🎯
        </button>
        <button
          className="miko-quick-chip"
          onClick={() => handleSend("Tell me a funny programmer joke!")}
        >
          Joke! 🐛
        </button>
        <button
          className="miko-quick-chip"
          onClick={() => handleSend("Let's do a focus session!")}
        >
          Focus 🚀
        </button>
      </div>

      <form
        className="miko-chat-input-row"
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Talk to Miko..."
          className="miko-chat-input"
          autoFocus
        />
        <button
          type="submit"
          className="miko-chat-send-btn"
          disabled={!inputText.trim() || isTyping}
          title="Send message"
        >
          {isTyping ? <Sparkles size={16} className="miko-spin" /> : <Send size={16} />}
        </button>
      </form>
    </FloatingPanel>
  );
};
