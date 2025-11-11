import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage as ChatMessageType, MessageRole, HomeworkItem } from './types';
import { sendMessageToGemini, getInitialMessage } from './services/geminiService';
import ChatMessage from './components/ChatMessage';
import { SendIcon, DashboardIcon, TasksIcon, CheckCircleIcon, ClockIcon } from './components/Icons';
import HomeworkList from './components/HomeworkList';

type View = 'dashboard' | 'tasks';

const Header: React.FC<{ activeView: View }> = ({ activeView }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = time.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const formattedTime = time.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <header className="flex-shrink-0 p-6 flex justify-between items-center border-b border-white/10">
      <h1 className="text-2xl font-bold capitalize tracking-wide">{activeView}</h1>
      <div className="text-right">
        <div className="text-xl font-semibold">{formattedTime}</div>
        <div className="text-sm text-slate-400">{formattedDate}</div>
      </div>
    </header>
  );
};

const Sidebar: React.FC<{ activeView: View; setActiveView: (view: View) => void }> = ({ activeView, setActiveView }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
    { id: 'tasks', label: 'Tasks', icon: <TasksIcon /> },
  ];

  return (
    <nav className="w-64 bg-slate-800/50 border-r border-white/10 flex flex-col p-4">
      <div className="flex items-center gap-2 p-2 mb-6">
         <svg className="w-8 h-8 text-sky-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-2h2v2h-2zm2-4h-2V7h2v6z"></path></svg>
        <h1 className="text-xl font-bold">Homework Helper</h1>
      </div>
      <ul className="space-y-2">
        {navItems.map(item => (
          <li key={item.id}>
            <button
              onClick={() => setActiveView(item.id as View)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors duration-200 ${
                activeView === item.id
                  ? 'bg-sky-500 text-white'
                  : 'text-slate-300 hover:bg-white/10'
              }`}
            >
              {item.icon}
              <span className="font-semibold">{item.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

const App: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [homeworkItems, setHomeworkItems] = useState<HomeworkItem[]>([]);
  const [activeView, setActiveView] = useState<View>('dashboard');
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  const pendingTasks = homeworkItems.filter(item => !item.completed).length;
  const completedTasks = homeworkItems.filter(item => item.completed).length;

  useEffect(() => {
    const fetchInitialMessage = async () => {
      try {
        const initialMessageText = await getInitialMessage();
        setMessages([
          { role: MessageRole.MODEL, text: initialMessageText },
        ]);
      } catch (err) {
        setError('Failed to get initial message. Please try refreshing.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialMessage();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleAddHomework = (text: string, dueDate: string, category: string) => {
    const newItem: HomeworkItem = {
      id: Date.now(),
      text,
      dueDate,
      category,
      completed: false,
    };
    setHomeworkItems(prev => [...prev, newItem]);
  };

  const handleDeleteHomework = (id: number) => {
    setHomeworkItems(prev => prev.filter(item => item.id !== id));
  };

  const handleToggleHomework = (id: number) => {
    setHomeworkItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessageType = { role: MessageRole.USER, text: input };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    
    const homeworkContext = homeworkItems.length > 0
      ? `\n\n--- Current Homework ---\n${homeworkItems.map(item => {
          const status = item.completed ? '[x]' : '[ ]';
          const category = item.category ? ` [${item.category}]` : '';
          const dueDate = item.dueDate ? ` (Due: ${item.dueDate})` : '';
          return `${status}${category} ${item.text}${dueDate}`;
        }).join('\n')}\n-----------------------\n\n`
      : '';

    const messageWithContext = `${homeworkContext}My question is: ${input}`;
    
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const modelResponse = await sendMessageToGemini(messageWithContext);
      const modelMessage: ChatMessageType = { role: MessageRole.MODEL, text: modelResponse };
      setMessages((prevMessages) => [...prevMessages, modelMessage]);
    } catch (err) {
      const errorMessage = 'Sorry, I encountered an error. Please try again.';
      setError(errorMessage);
      setMessages((prevMessages) => [...prevMessages, { role: MessageRole.MODEL, text: errorMessage }]);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex font-sans">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      <div className="flex-1 flex flex-col h-screen">
        <Header activeView={activeView} />
        <main className="flex-1 p-6 overflow-y-auto bg-slate-900/70">
          {activeView === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-800/50 p-6 rounded-2xl border border-white/10 flex items-center gap-4">
                  <ClockIcon />
                  <div>
                    <div className="text-3xl font-bold">{pendingTasks}</div>
                    <div className="text-slate-400">Pending Tasks</div>
                  </div>
                </div>
                <div className="bg-slate-800/50 p-6 rounded-2xl border border-white/10 flex items-center gap-4">
                  <CheckCircleIcon />
                  <div>
                    <div className="text-3xl font-bold">{completedTasks}</div>
                    <div className="text-slate-400">Tasks Completed</div>
                  </div>
                </div>
              </div>
              <div className="w-full bg-slate-800/50 backdrop-blur-lg rounded-2xl shadow-2xl flex flex-col h-[60vh] border border-white/20">
                <header className="p-4 border-b border-white/20 text-center">
                    <h2 className="text-lg font-bold tracking-wider">AI Assistant</h2>
                </header>
                <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
                  {messages.map((msg, index) => (
                    <ChatMessage key={index} message={msg} />
                  ))}
                  {isLoading && messages.length > 0 && (
                     <div className="flex justify-start items-center space-x-3">
                        <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center bg-sky-800">
                        </div>
                        <div className="flex items-center space-x-1 ml-3">
                          <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse delay-0"></span>
                          <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse delay-200"></span>
                          <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse delay-400"></span>
                        </div>
                     </div>
                  )}
                  {error && <div className="text-red-400 text-center p-2">{error}</div>}
                  <div ref={chatEndRef} />
                </div>
                <footer className="p-4 border-t border-white/20">
                  <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Ask me anything..."
                      className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400 transition-all duration-300"
                      disabled={isLoading}
                    />
                    <button
                      type="submit"
                      disabled={isLoading || !input.trim()}
                      className="bg-sky-500 hover:bg-sky-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg p-2 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-slate-900"
                    >
                      <SendIcon />
                    </button>
                  </form>
                </footer>
              </div>
            </div>
          )}
          {activeView === 'tasks' && (
            <HomeworkList
              items={homeworkItems}
              onAddItem={handleAddHomework}
              onDeleteItem={handleDeleteHomework}
              onToggleItem={handleToggleHomework}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
