"use client";
import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/Button';
import { MessageCircle, X, Minimize2, Send, Loader2 } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export function ChatBox() {
  const [messages, setMessages] = useState([
    { role: 'system', content: 'Bạn chỉ hỗ trợ các câu hỏi về học ngôn ngữ. Nếu câu hỏi không liên quan đến ngôn ngữ, hãy trả lời "Xin lỗi, tôi chỉ hỗ trợ học ngôn ngữ."' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    setLoading(true);
    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    
    try {
      const res = await fetch(`${API_URL}/chatgpt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages })
      });
      const data = await res.json();
      setMessages([...newMessages, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      setMessages([...newMessages, { role: 'assistant', content: 'Lỗi kết nối API.' }]);
    }
    setLoading(false);
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    setIsMinimized(false);
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={toggleChat}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 flex items-center justify-center group"
          aria-label="Open chat"
        >
          <MessageCircle className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse"></span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className={`fixed bottom-6 right-6 z-50 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${
            isMinimized ? 'w-80 h-14' : 'w-96 h-[600px]'
          }`}
          style={{ maxWidth: 'calc(100vw - 3rem)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Trợ lý học ngôn ngữ</h3>
                <p className="text-xs text-white/80">Luôn sẵn sàng hỗ trợ bạn</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleMinimize}
                className="w-8 h-8 hover:bg-white/20 rounded-lg transition-colors duration-200 flex items-center justify-center"
                aria-label="Minimize"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
              <button
                onClick={toggleChat}
                className="w-8 h-8 hover:bg-white/20 rounded-lg transition-colors duration-200 flex items-center justify-center"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Chat Messages */}
          {!isMinimized && (
            <>
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-gray-50 dark:bg-gray-950">
                {messages.filter(m => m.role !== 'system').length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-center px-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
                      <MessageCircle className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Xin chào! 👋
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Tôi là trợ lý học ngôn ngữ của bạn. Hãy đặt câu hỏi để bắt đầu!
                    </p>
                  </div>
                )}
                
                {messages.filter(m => m.role !== 'system').map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2.5 shadow-sm ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-br-none'
                          : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-none border border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                        {msg.content}
                      </p>
                    </div>
                  </div>
                ))}
                
                {loading && (
                  <div className="flex justify-start animate-fadeIn">
                    <div className="max-w-[80%] rounded-2xl rounded-bl-none px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Đang suy nghĩ...
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={chatEndRef} />
              </div>

              {/* Input Form */}
              <form
                className="flex gap-2 p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
                onSubmit={e => {
                  e.preventDefault();
                  sendMessage();
                }}
              >
                <input
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Nhập câu hỏi về ngôn ngữ..."
                  disabled={loading}
                />
                <Button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="px-4 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </Button>
              </form>
            </>
          )}
        </div>
      )}

      {/* Custom CSS for animations */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        /* Custom scrollbar */
        .overflow-y-auto::-webkit-scrollbar {
          width: 6px;
        }

        .overflow-y-auto::-webkit-scrollbar-track {
          background: transparent;
        }

        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.5);
          border-radius: 3px;
        }

        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: rgba(156, 163, 175, 0.7);
        }

        /* Dark mode scrollbar */
        .dark .overflow-y-auto::-webkit-scrollbar-thumb {
          background: rgba(75, 85, 99, 0.5);
        }

        .dark .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: rgba(75, 85, 99, 0.7);
        }
      `}</style>
    </>
  );
}