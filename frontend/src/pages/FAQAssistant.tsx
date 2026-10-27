import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { assistantApi, faqsApi } from '@/services/api';
import { Card, Button, Input, Spinner, Badge } from '@/components/ui';
import { HelpCircle, Send, Bot, User, AlertTriangle, ShieldCheck, ExternalLink } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Link } from 'react-router-dom';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  source?: string;
  time: Date;
}

export default function FAQAssistant() {
  const { t, language } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'assistant',
      text: language === 'ta'
        ? 'வணக்கம்! நான் CareSync தகவல் உதவியாளர். மருத்துவமனை துறைகள், நடைமுறைகள் அல்லது ஆவணங்கள் பற்றி என்னிடம் கேட்கலாம்.'
        : 'Hello! I am the CareSync Hospital Information Assistant. You can ask me about hospital departments, what documents to bring, how to request mobility assistance, and more.',
      source: 'faq',
      time: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const { data: publishedFaqs } = useQuery({
    queryKey: ['faqs'],
    queryFn: () => faqsApi.list(),
  });

  const sendMutation = useMutation({
    mutationFn: (msg: string) => assistantApi.message(msg, language),
    onSuccess: (data) => {
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          sender: 'assistant',
          text: data.answer,
          source: data.source,
          time: new Date(),
        },
      ]);
    },
    onError: () => {
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          sender: 'assistant',
          text: 'I encountered an error retrieving this answer. Please visit the Patient Assistance Desk or submit a request.',
          source: 'fallback',
          time: new Date(),
        },
      ]);
    },
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sendMutation.isPending) return;

    const userMsg = input.trim();
    setInput('');
    setMessages((prev) => [
      ...prev,
      {
        id: Math.random().toString(),
        sender: 'user',
        text: userMsg,
        time: new Date(),
      },
    ]);

    sendMutation.mutate(userMsg);
  };

  const handleQuickQuestion = (q: string) => {
    setInput(q);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sendMutation.isPending]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-text-primary">{t('assistantTitle')}</h1>
        <p className="text-text-secondary mt-1">{t('assistantSubtitle')}</p>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 text-xs text-yellow-800 flex items-start gap-3">
        <AlertTriangle className="w-4 h-4 flex-shrink-0 text-yellow-700 mt-0.5" />
        <div>
          <p className="font-semibold text-yellow-900 mb-0.5">Automated Information Service</p>
          <p>{t('assistantDisclaimer')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chat Interface */}
        <div className="lg:col-span-2">
          <Card className="flex flex-col h-[580px] p-0 overflow-hidden">
            {/* Chat Messages */}
            <div className="flex-1 p-5 overflow-y-auto space-y-4">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex items-start gap-3 ${m.sender === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                      m.sender === 'user' ? 'bg-navy-500 text-white' : 'bg-teal-500 text-white'
                    }`}
                  >
                    {m.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  <div className={`max-w-[80%] space-y-1`}>
                    <div
                      className={`p-4 rounded-2xl text-sm leading-relaxed ${
                        m.sender === 'user'
                          ? 'bg-navy-500 text-white rounded-tr-none'
                          : 'bg-gray-100 text-text-primary rounded-tl-none border border-gray-200'
                      }`}
                    >
                      {m.text}
                    </div>

                    {m.source && (
                      <span className="text-[10px] text-text-secondary uppercase tracking-wider block px-1">
                        Source: {m.source}
                      </span>
                    )}
                  </div>
                </div>
              ))}

              {sendMutation.isPending && (
                <div className="flex items-center gap-2 text-xs text-text-secondary italic pl-11">
                  <Spinner size="sm" />
                  <span>{t('assistantThinking')}</span>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSend} className="p-3 border-t border-gray-100 bg-gray-50 flex gap-2">
              <Input
                placeholder={t('typeMessage')}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="bg-white"
              />
              <Button type="submit" variant="primary" disabled={sendMutation.isPending || !input.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </Card>
        </div>

        {/* Right Column: Approved FAQs */}
        <div className="space-y-4">
          <Card>
            <h2 className="text-lg font-bold text-text-primary mb-3">Suggested Questions</h2>
            <div className="space-y-2">
              {publishedFaqs?.slice(0, 5).map((f) => {
                const question = language === 'ta' && f.question_ta ? f.question_ta : f.question_en;
                return (
                  <button
                    key={f.id}
                    onClick={() => handleQuickQuestion(question)}
                    className="w-full text-left text-xs p-2.5 rounded-xl border border-gray-100 hover:border-teal-300 hover:bg-teal-50/50 transition-colors text-text-primary font-medium"
                  >
                    💬 {question}
                  </button>
                );
              })}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 space-y-2">
              <p className="text-xs text-text-secondary font-medium">Need immediate human help?</p>
              <Link to="/request-assistance" className="block">
                <Button variant="outline" size="sm" className="w-full">
                  Request Human Assistance
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
