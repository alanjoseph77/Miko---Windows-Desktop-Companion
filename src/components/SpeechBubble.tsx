import React from 'react';

interface SpeechBubbleProps {
  text: string;
  visible: boolean;
  onDismiss?: () => void;
}

export const SpeechBubble: React.FC<SpeechBubbleProps> = ({ text, visible, onDismiss }) => {
  if (!visible || !text.trim()) return null;

  return (
    <div className="miko-speech-bubble-wrapper">
      <div className="miko-speech-bubble" onClick={onDismiss}>
        <div className="miko-speech-content">{text}</div>
        <button
          className="miko-speech-close"
          onClick={(e) => {
            e.stopPropagation();
            onDismiss?.();
          }}
          title="Dismiss message"
        >
          ×
        </button>
        <div className="miko-speech-pointer" />
      </div>
    </div>
  );
};
