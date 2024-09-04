import Container from '@/components/Container';
import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface Message {
  content: string;
  isUser: boolean;
  type: 'text' | 'image';
}

const ChatWidget: React.FC<{ flowId: string }> = ({ flowId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [userId, setUserId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const generatedUserId = uuidv4();
    setUserId(generatedUserId);
    startChat(generatedUserId);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const startChat = async (userId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/chatbot/${flowId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action: 'start' }),
      });
      const data = await response.json();
      if (data.actions) {
        setMessages(data.actions.map((action: any) => ({
          content: action.content,
          isUser: false,
          type: action.type || 'text'
        })));
      }
    } catch (error) {
      console.error('Error starting chat:', error);
    }
    setIsLoading(false);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    setMessages(prev => [...prev, { content: input, isUser: true, type: 'text' }]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(`/api/chatbot/${flowId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action: 'message', message: input }),
      });
      const data = await response.json();
      if (data.actions) {
        setMessages(prev => [
          ...prev,
          ...data.actions.map((action: any) => ({
            content: action.content,
            isUser: false,
            type: action.type || 'text'
          }))
        ]);
      }
      if (data.isEnd) {
        setMessages(prev => [...prev, { content: "Chat ended. Thank you!", isUser: false, type: 'text' }]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-[700px] w-full max-w-md mx-auto bg-zinc-100 dark:bg-zinc-900 rounded-xl overflow-hidden shadow-lg border border-zinc-800">
      <div className="bg-zinc-200 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 p-4 text-center font-semibold text-lg border-b border-[#0affed]">
        Chat Widget
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div key={index} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[70%] p-3 rounded-lg ${
              message.isUser 
                ? 'bg-[#0affed] text-zinc-800' 
                : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200'
            }`}>
              {message.type === 'text' ? (
                <p className="break-words">{message.content}</p>
              ) : (
                <img src={message.content} alt="Bot response" className="max-w-full h-auto rounded-lg" />
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="border-t border-zinc-300 dark:border-[#0affed] p-4 bg-zinc-200 dark:bg-zinc-900">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            className="flex-1 bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 placeholder-zinc-500 dark:placeholder-zinc-400 border border-zinc-300 dark:border-zinc-800 rounded-full px-4 py-2 focus:outline-none "
            placeholder="Digite sua mensagem..."
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            className="bg-zinc-300 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 px-6 py-2 rounded-full hover:bg-zinc-400 dark:hover:bg-zinc-600 border border-zinc-800 focus:outline-none transition-colors duration-300"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Enviando...
              </span>
            ) : (
              'Enviar'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWidget;