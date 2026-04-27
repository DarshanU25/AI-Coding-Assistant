import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Code2, Zap, Bug, FileText, CheckCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { chatQuery, agentExecute } from '../services/api';

const Chat = ({ contextCode, setContextCode }) => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am your AI Code Assistant. You can ask me questions about your repo or perform agentic actions on the code editor.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;

    const query = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: query }]);
    setIsLoading(true);

    try {
      const response = await chatQuery(query, contextCode);
      setMessages(prev => [...prev, { role: 'assistant', content: response.response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Is the backend running?' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAgentAction = async (intent) => {
    setMessages(prev => [...prev, { role: 'user', content: `Agent Action: ${intent.toUpperCase()}` }]);
    setIsLoading(true);

    try {
      const resp = await agentExecute(intent, contextCode, '');
      setMessages(prev => [...prev, { role: 'assistant', content: resp.response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Agent action failed. Backend running?` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full relative">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center flex-shrink-0"><Bot size={18} /></div>}
            <div className={`max-w-[85%] p-3 rounded-lg ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-200'}`}>
               <ReactMarkdown className="prose prose-invert max-w-none text-sm">{msg.content}</ReactMarkdown>
            </div>
            {msg.role === 'user' && <div className="w-8 h-8 rounded-full bg-slate-500 flex items-center justify-center flex-shrink-0"><User size={18} /></div>}
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3">
             <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center"><Bot size={18} /></div>
             <div className="p-3 rounded-lg bg-gray-700 text-gray-400 animate-pulse text-sm">Processing request...</div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Agent Toolbar */}
      <div className="bg-gray-900 border-t border-gray-700 p-3 flex gap-2 justify-center flex-wrap shrink-0">
        <button onClick={() => handleAgentAction('explain')} className="text-xs bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded flex items-center gap-1 transition-colors"><FileText size={14}/> Explain</button>
        <button onClick={() => handleAgentAction('optimize')} className="text-xs bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded flex items-center gap-1 transition-colors"><Zap size={14}/> Optimize</button>
        <button onClick={() => handleAgentAction('debug')} className="text-xs bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded flex items-center gap-1 transition-colors"><Bug size={14}/> Debug</button>
        <button onClick={() => handleAgentAction('test')} className="text-xs bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded flex items-center gap-1 transition-colors"><CheckCircle size={14}/> Generate Tests</button>
        <button onClick={() => handleAgentAction('refactor')} className="text-xs bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded flex items-center gap-1 transition-colors"><Code2 size={14}/> Refactor</button>
      </div>

      {/* Input */}
      <div className="p-4 bg-gray-800 shrink-0">
        <form onSubmit={handleSend} className="flex gap-2">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your code or uploaded repo..." 
            className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full text-sm"
          />
          <button type="submit" disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-lg transition disabled:opacity-50">
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
