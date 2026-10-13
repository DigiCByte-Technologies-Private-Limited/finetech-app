import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/useAuth';
import { userCards, userLoans, userPolicies, creditScore } from '../data/userProducts';
import { formatCurrency } from '../utils/format';

/**
 * FinPulse AI Financial Chat Assistant.
 * Interactive chat assistant answering user queries about their accounts,
 * cards, loans, insurance, credit score, and financial calculations.
 */
let msgCounter = 100;
function createMessageId() {
  msgCounter += 1;
  return `msg-${msgCounter}`;
}

function getCurrentTimeString() {
  const d = new Date();
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function FinChatModal({ isOpen, onClose }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: `Hello ${user?.firstName || 'there'}! I am your FinPulse Financial Assistant. How can I assist you with your cards, loans, insurance, or credit score today?`,
      time: 'Just now'
    }
  ]);

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, messages]);

  // Quick Action Prompts
  const quickPrompts = [
    'What is my credit score?',
    'When is my credit card bill due?',
    'Show my active loans',
    'What insurance policies do I have?',
    'How can I lower my FOIR?'
  ];

  // Smart Query Response Generator
  const generateBotResponse = (query) => {
    const q = query.toLowerCase();

    if (q.includes('credit score') || q.includes('score')) {
      return `Your current credit score is ${creditScore} (Excellent). You are in prime standing, which qualifies you for pre-approved loans at preferential interest rates from partner banks like HDFC, ICICI, and SBI.`;
    }

    if (q.includes('card') || q.includes('due') || q.includes('bill')) {
      const cardInfo = userCards
        .map(
          (c) =>
            `• ${c.network} (•••• ${c.last4}): Total Due ${formatCurrency(
              c.totalDue
            )}, Due on ${c.dueDate}`
        )
        .join('\n');
      return `Here is your current credit card due summary:\n${cardInfo}\n\nTip: Always pay before the due date to maintain your 740+ credit score!`;
    }

    if (q.includes('loan') || q.includes('emi')) {
      const loanInfo = userLoans
        .map(
          (l) =>
            `• ${l.type.toUpperCase()}: Outstanding ${formatCurrency(
              l.outstanding
            )}, Monthly EMI ${formatCurrency(l.emi)} (${l.paidMonths}/${
              l.tenureMonths
            } EMIs paid)`
        )
        .join('\n');
      const totalEmi = userLoans.reduce((acc, l) => acc + l.emi, 0);
      return `You have ${userLoans.length} active loans with a combined monthly EMI of ${formatCurrency(
        totalEmi
      )}:\n${loanInfo}`;
    }

    if (q.includes('insurance') || q.includes('policy') || q.includes('policies')) {
      const polInfo = userPolicies
        .map(
          (p) =>
            `• ${p.type} (${p.insurer}): Sum Insured ${formatCurrency(
              p.sumInsured
            )}, Annual Premium ${formatCurrency(p.premium)}, Expires: ${
              p.expiryDate
            }`
        )
        .join('\n');
      return `Here are your registered policies:\n${polInfo}\n\nYou can compare new health, term, and motor plans in the Insurance marketplace!`;
    }

    if (q.includes('foir') || q.includes('reduce') || q.includes('lower')) {
      return `FOIR (Fixed Obligation to Income Ratio) measures your monthly debt burden against your income. To lower your FOIR:\n1. Pay off high-interest personal loans or credit card balances first.\n2. Extend loan tenures where permissible to lower individual monthly EMIs.\n3. Keep your overall debt commitments below 40% of net monthly income.`;
    }

    if (q.includes('hello') || q.includes('hi') || q.includes('hey')) {
      return `Hi there! I am here to help you manage your finances. You can ask about your cards, loans, insurance, or apply for new credit facilities.`;
    }

    return `I can help you monitor your finances! You can ask about your Credit Score, Credit Cards, Active Loans & EMIs, Insurance Policies, or tips to optimize your FOIR.`;
  };

  const handleSendMessage = (textToSend = null) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    const userMessage = {
      id: createMessageId(),
      sender: 'user',
      text,
      time: getCurrentTimeString()
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      const botResponseText = generateBotResponse(text);
      const botMessage = {
        id: createMessageId(),
        sender: 'bot',
        text: botResponseText,
        time: getCurrentTimeString()
      };
      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 600);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="chat-title"
    >
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg h-[600px] max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Chat Header */}
        <div className="p-4 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-lg text-white">
              <i className="fa-solid fa-robot"></i>
            </div>
            <div>
              <h2 id="chat-title" className="text-sm font-bold tracking-tight">
                FinPulse Financial Assistant
              </h2>
              <p className="text-[11px] text-indigo-100 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Active & ready to assist</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close Chat"
          >
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        {/* Chat Messages List */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-2.5 ${
                msg.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.sender === 'bot' && (
                <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-xs shrink-0 mt-0.5 shadow-2xs">
                  <i className="fa-solid fa-shield-halved"></i>
                </div>
              )}

              <div
                className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-xs shadow-2xs whitespace-pre-line leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-xs font-medium'
                    : 'bg-white border border-slate-200/90 text-slate-800 rounded-tl-xs font-normal'
                }`}
              >
                <p>{msg.text}</p>
                <span
                  className={`text-[9px] block text-right mt-1 ${
                    msg.sender === 'user' ? 'text-indigo-200' : 'text-slate-400'
                  }`}
                >
                  {msg.time}
                </span>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-slate-400 text-xs pl-9">
              <i className="fa-solid fa-spinner animate-spin text-indigo-600 text-xs"></i>
              <span>FinPulse Assistant is typing...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-3 py-2 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(prompt)}
              className="text-[11px] font-semibold text-slate-600 hover:text-indigo-700 bg-slate-100 hover:bg-indigo-50 px-2.5 py-1 rounded-full whitespace-nowrap transition-colors cursor-pointer border border-slate-200/70 shrink-0"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Box */}
        <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about cards, loans, EMI, credit score..."
            className="flex-1 px-4 py-2.5 text-xs font-medium rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          />
          <button
            type="button"
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim()}
            className="p-2.5 w-10 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white flex items-center justify-center transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
            aria-label="Send message"
          >
            <i className="fa-solid fa-paper-plane text-xs"></i>
          </button>
        </div>
      </div>
    </div>
  );
}
