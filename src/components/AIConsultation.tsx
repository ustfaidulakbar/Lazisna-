import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, BookOpen } from "lucide-react";
import Markdown from "react-markdown";

interface Message {
  id: string;
  role: "user" | "model";
  content: string;
}

export default function AIConsultation() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "model",
      content: "Assalamu'alaikum sahabat Lazisna. Saya adalah Ustadz Lazisna AI. Ada yang bisa saya bantu hari ini mengenai Zakat, Infaq, Wakaf, atau konsultasi keagamaan lainnya?"
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/gemini/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: userMessage.content,
          history: messages.slice(1).map(m => ({ role: m.role, content: m.content }))
        })
      });

      if (!response.ok) throw new Error("Gagal mengambil respon");

      const data = await response.json();
      
      const modelMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "model",
        content: data.text
      };

      setMessages(prev => [...prev, modelMessage]);
    } catch (error) {
      console.error(error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "model",
        content: "Mohon maaf, saat ini sedang terjadi gangguan koneksi. Silakan coba beberapa saat lagi."
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] pb-safe relative">
      <div className="bg-emerald-600 px-5 py-6 rounded-b-[2rem] text-white shrink-0 relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-10 -translate-y-10" />
        <h2 className="text-xl font-bold font-sans tracking-tight flex items-center gap-2 relative z-10">
          <Bot className="w-6 h-6" /> Konsultasi Syariah AI
        </h2>
        <p className="text-emerald-50 text-xs mt-1 relative z-10">Tanya Jawab seputar ZISWAF dan Hukum Agama</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-slate-200 text-slate-600' : 'bg-emerald-100 text-emerald-600'}`}>
              {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>
            <div className={`p-3.5 rounded-2xl text-[13px] leading-relaxed shadow-2xs ${
              msg.role === 'user' 
                ? 'bg-slate-800 text-white rounded-tr-none' 
                : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none'
            }`}>
              {msg.role === 'user' ? (
                <p>{msg.content}</p>
              ) : (
                <div className="prose prose-sm prose-emerald max-w-none prose-p:leading-relaxed prose-p:my-1 prose-strong:text-slate-800 prose-ul:my-1">
                  <Markdown>{msg.content}</Markdown>
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3 max-w-[85%]">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3.5 rounded-2xl text-[13px] bg-white border border-slate-100 text-slate-700 rounded-tl-none flex items-center gap-2 shadow-2xs">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-500" /> Sedang mengetik...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t border-slate-100">
        <form onSubmit={handleSend} className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tulis pertanyaan Anda di sini..."
            disabled={isLoading}
            className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-full pl-5 pr-12 py-3.5 text-[13px] focus:outline-none focus:border-emerald-500 focus:bg-white transition-all disabled:opacity-50 shadow-2xs"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-1.5 w-10 h-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full flex items-center justify-center transition-all disabled:opacity-50 active:scale-95 shadow-sm"
          >
            <Send className="w-4 h-4 -ml-0.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
