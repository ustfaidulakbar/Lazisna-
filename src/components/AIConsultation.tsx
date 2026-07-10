import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, Calculator } from "lucide-react";
import Markdown from "react-markdown";
import ZakatCalculator from "./ZakatCalculator";

interface Message {
  id: string;
  role: "user" | "model";
  content: string;
}

interface AIConsultationProps {
  onPayZakat?: (amount: number, category: "Zakat" | "Infaq") => void;
  initialTab?: "chat" | "kalkulator";
}

export default function AIConsultation({ onPayZakat, initialTab = "chat" }: AIConsultationProps) {
  const [subTab, setSubTab] = useState<"chat" | "kalkulator">(initialTab);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "model",
      content: "Assalamu'alaikum sahabat Lazisna. Saya adalah Ustadz Lazisna AI. Ada yang bisa saya bantu hari ini mengenai Zakat, Infaq, Wakaf, atau kalkulasi syariah lainnya?"
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (subTab === "chat") {
      scrollToBottom();
    }
  }, [messages, subTab]);

  // Sync initialTab when changed from outside
  useEffect(() => {
    setSubTab(initialTab);
  }, [initialTab]);

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
      let data;
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

      if (apiKey) {
        // Fallback for static hosting (RumahWeb)
        const contents = [
          ...messages.slice(1).map(m => ({ 
            role: m.role === "model" ? "model" : "user", 
            parts: [{ text: m.content }] 
          })),
          { role: "user", parts: [{ text: userMessage.content }] }
        ];

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents })
        });

        if (!response.ok) throw new Error("Gagal mengambil respon dari Gemini API");
        
        const result = await response.json();
        data = { text: result.candidates?.[0]?.content?.parts?.[0]?.text || "Maaf, saya tidak mengerti." };
      } else {
        // Standard API Route for local dev
        const response = await fetch("/api/gemini/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: userMessage.content,
            history: messages.slice(1).map(m => ({ role: m.role, content: m.content }))
          })
        });

        if (!response.ok) throw new Error("Gagal mengambil respon");
        data = await response.json();
      }
      
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
      <div className="bg-emerald-600 px-5 py-5 rounded-b-[2rem] text-white shrink-0 relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-10 -translate-y-10" />
        <h2 className="text-xl font-bold font-sans tracking-tight flex items-center gap-2 relative z-10">
          <Bot className="w-6 h-6" /> Konsultasi Syari'ah AI
        </h2>
        <p className="text-emerald-50 text-xs mt-1 relative z-10">Tanya Jawab seputar ZISWAF dan Hukum Agama</p>
      </div>

      {/* Sub-tab Selector */}
      <div className="mx-4 mt-3 bg-slate-100 p-1 rounded-xl flex border border-slate-200/50 shadow-inner shrink-0">
        <button
          onClick={() => setSubTab("chat")}
          className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg flex items-center justify-center gap-1 transition-all ${
            subTab === "chat"
              ? "bg-white text-emerald-700 shadow-sm"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Bot className="w-4 h-4" />
          <span>Tanya Ustadz AI</span>
        </button>
        <button
          onClick={() => setSubTab("kalkulator")}
          className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg flex items-center justify-center gap-1 transition-all ${
            subTab === "kalkulator"
              ? "bg-white text-emerald-700 shadow-sm"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>Kalkulator Zakat</span>
        </button>
      </div>

      {subTab === "chat" ? (
        <>
          {/* Chat Interface */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-slate-200 text-slate-600' : 'bg-emerald-100 text-emerald-600'}`}>
                  {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div className={`p-3 rounded-xl text-xs leading-relaxed shadow-2xs ${
                  msg.role === 'user' 
                    ? 'bg-slate-800 text-white rounded-tr-none' 
                    : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none'
                }`}>
                  {msg.role === 'user' ? (
                    <p>{msg.content}</p>
                  ) : (
                    <div className="prose prose-xs prose-emerald max-w-none prose-p:leading-relaxed prose-p:my-1 prose-strong:text-slate-800 prose-ul:my-1">
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
                <div className="p-3 rounded-xl text-xs bg-white border border-slate-100 text-slate-700 rounded-tl-none flex items-center gap-2 shadow-2xs">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-500" /> Sedang mengetik...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 bg-white border-t border-slate-100">
            <form onSubmit={handleSend} className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Tulis pertanyaan Anda di sini..."
                disabled={isLoading}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-full pl-4 pr-10 py-2.5 text-xs focus:outline-none focus:border-emerald-500 focus:bg-white transition-all disabled:opacity-50 shadow-2xs"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="absolute right-1 w-8 h-8 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full flex items-center justify-center transition-all disabled:opacity-50 active:scale-95 shadow-sm"
              >
                <Send className="w-3.5 h-3.5 -ml-0.5" />
              </button>
            </form>
          </div>
        </>
      ) : (
        /* Zakat Calculator Interface */
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <ZakatCalculator 
            onPayZakat={(amount, cat) => {
              if (onPayZakat) {
                onPayZakat(amount, cat);
              }
            }}
          />
        </div>
      )}
    </div>
  );
}
