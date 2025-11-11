
import React from 'react';
import { ChatMessage, MessageRole } from '../types';
import { UserIcon, BotIcon } from './Icons';

interface ChatMessageProps {
  message: ChatMessage;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === MessageRole.USER;

  const containerClasses = `flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'}`;
  const bubbleClasses = `max-w-md md:max-w-lg lg:max-w-xl rounded-2xl px-4 py-3 ${
    isUser
      ? 'bg-sky-500 text-white rounded-br-none'
      : 'bg-slate-700 text-slate-200 rounded-bl-none'
  }`;
  const textClasses = 'whitespace-pre-wrap';

  const Avatar = () => (
    <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
        isUser ? 'bg-slate-600' : 'bg-sky-800'
    }`}>
      {isUser ? <UserIcon /> : <BotIcon />}
    </div>
  );

  return (
    <div className={containerClasses}>
      {!isUser && <Avatar />}
      <div className={bubbleClasses}>
        <p className={textClasses}>{message.text}</p>
      </div>
      {isUser && <Avatar />}
    </div>
  );
};

export default ChatMessage;
