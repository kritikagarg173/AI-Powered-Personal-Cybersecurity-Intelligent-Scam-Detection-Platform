import { useState } from "react";
import {
  Bot,
  Send,
  ShieldCheck,
  Sparkles,
  Link2,
  PhoneCall,
  MessageSquareWarning,
  Trash2,
  LockKeyhole,
  UserRound,
  CheckCircle2,
  AlertTriangle,
  Zap,
} from "lucide-react";

function AIAssistant() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "ai",
      text: "Hello! I'm your Cyber Guardian. I can help you identify suspicious links, calls, messages and online scams.",
      time: "Now",
    },
  ]);

  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);

  const quickActions = [
    {
      title: "Check a suspicious link",
      icon: Link2,
      prompt: "How can I check if a link is safe?",
    },
    {
      title: "Analyze a phone call",
      icon: PhoneCall,
      prompt: "How can I identify a suspicious phone call?",
    },
    {
      title: "Identify a scam message",
      icon: MessageSquareWarning,
      prompt: "How can I tell if a message is a scam?",
    },
  ];

  const generateResponse = (text) => {
    const lower = text.toLowerCase();

    if (
      lower.includes("link") ||
      lower.includes("url") ||
      lower.includes("website")
    ) {
      return "Before opening a suspicious link, check the domain carefully, look for spelling mistakes and avoid links asking for passwords, OTPs or banking information. You can also use Cyber Shield's Link Scanner for a security check.";
    }

    if (
      lower.includes("call") ||
      lower.includes("caller") ||
      lower.includes("phone")
    ) {
      return "If a caller asks for an OTP, PIN, password, banking details or urgent payment, treat it as suspicious. Never share sensitive information over a call. Use Caller Verification to investigate unknown callers.";
    }

    if (
      lower.includes("message") ||
      lower.includes("sms") ||
      lower.includes("scam")
    ) {
      return "Common scam messages create urgency, promise rewards or ask you to click a link and provide sensitive information. Don't click unknown links and verify the sender independently.";
    }

    if (
      lower.includes("password") ||
      lower.includes("otp") ||
      lower.includes("bank")
    ) {
      return "Never share passwords, OTPs, PINs or banking credentials with anyone. Legitimate organizations should not ask you to reveal confidential authentication codes.";
    }

    if (
      lower.includes("safe") ||
      lower.includes("security") ||
      lower.includes("protect")
    ) {
      return "Your best protection is to keep security controls enabled, verify unknown callers, scan suspicious links and avoid sharing sensitive information. Your Cyber Shield protection layers are currently active.";
    }

    return "I can help you with suspicious links, phone calls, scam messages, account security and online safety. Tell me what happened and I'll help you assess the risk.";
  };

  const sendMessage = (messageText = input) => {
    const trimmed = messageText.trim();

    if (!trimmed || typing) return;

    const userMessage = {
      id: Date.now(),
      sender: "user",
      text: trimmed,
      time: "Now",
    };

    setMessages((current) => [...current, userMessage]);
    setInput("");
    setTyping(true);

    setTimeout(() => {
      const aiMessage = {
        id: Date.now() + 1,
        sender: "ai",
        text: generateResponse(trimmed),
        time: "Now",
      };

      setMessages((current) => [...current, aiMessage]);
      setTyping(false);
    }, 1200);
  };

  const clearChat = () => {
    setMessages([
      {
        id: Date.now(),
        sender: "ai",
        text: "Conversation cleared. How can I help protect you today?",
        time: "Now",
      },
    ]);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">

      {/* HEADER */}
      <section className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
              <Bot size={19} />
            </div>

            <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-blue-600">
              <Sparkles size={11} />
              AI Powered
            </span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
            AI Cyber Guardian
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Your intelligent assistant for detecting and understanding
            digital threats.
          </p>
        </div>

        <button
          onClick={clearChat}
          className="flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
        >
          <Trash2 size={14} />
          Clear Chat
        </button>
      </section>

      {/* AI STATUS */}
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-blue-800 to-slate-900 p-6 text-white shadow-xl">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">

          <div className="flex items-center gap-4">
            <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
              <Bot size={28} />

              <span className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-blue-800 bg-green-400" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold">
                  Cyber Guardian AI
                </h2>

                <span className="rounded-full bg-white/10 px-2 py-1 text-[8px] font-bold text-blue-100">
                  ACTIVE
                </span>
              </div>

              <p className="mt-1 text-[10px] text-blue-200">
                AI threat assistance is ready.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <div className="rounded-xl bg-white/10 px-4 py-3">
              <p className="text-[9px] text-blue-200">
                Threat Detection
              </p>

              <p className="mt-1 text-xs font-bold">
                Active
              </p>
            </div>

            <div className="rounded-xl bg-white/10 px-4 py-3">
              <p className="text-[9px] text-blue-200">
                AI Status
              </p>

              <p className="mt-1 text-xs font-bold">
                Online
              </p>
            </div>

            <div className="hidden rounded-xl bg-white/10 px-4 py-3 sm:block">
              <p className="text-[9px] text-blue-200">
                Risk Level
              </p>

              <p className="mt-1 text-xs font-bold text-green-300">
                Low
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* MAIN CHAT AREA */}
      <section className="grid gap-5 lg:grid-cols-[1fr_300px]">

        {/* CHAT */}
        <div className="flex min-h-[600px] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

          {/* CHAT HEADER */}
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                <ShieldCheck size={18} />
              </div>

              <div>
                <p className="text-xs font-bold text-slate-800">
                  Security Assistant
                </p>

                <div className="mt-0.5 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500" />

                  <span className="text-[9px] font-medium text-slate-400">
                    Online
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-[9px] font-semibold text-slate-400">
              <LockKeyhole size={12} />
              Secure session
            </div>
          </div>

          {/* MESSAGES */}
          <div className="flex-1 space-y-5 overflow-y-auto bg-slate-50/60 p-5">

            {messages.map((message) => {
              const isUser = message.sender === "user";

              return (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    isUser ? "justify-end" : "justify-start"
                  }`}
                >

                  {!isUser && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-700 text-white shadow-sm">
                      <Bot size={16} />
                    </div>
                  )}

                  <div
                    className={`max-w-[80%] ${
                      isUser ? "items-end" : "items-start"
                    }`}
                  >
                    <div
                      className={`rounded-2xl px-4 py-3 text-xs leading-5 shadow-sm ${
                        isUser
                          ? "rounded-br-md bg-blue-700 text-white"
                          : "rounded-bl-md border border-slate-200 bg-white text-slate-600"
                      }`}
                    >
                      {message.text}
                    </div>

                    <p
                      className={`mt-1.5 text-[8px] text-slate-400 ${
                        isUser ? "text-right" : ""
                      }`}
                    >
                      {message.time}
                    </p>
                  </div>

                  {isUser && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-200 text-slate-600">
                      <UserRound size={15} />
                    </div>
                  )}

                </div>
              );
            })}

            {/* TYPING */}
            {typing && (
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-700 text-white">
                  <Bot size={16} />
                </div>

                <div className="rounded-2xl rounded-bl-md border border-slate-200 bg-white px-4 py-3">
                  <div className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:150ms]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* INPUT */}
          <div className="border-t border-slate-100 bg-white p-4">

            <div className="flex items-end gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2 transition focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-50">

              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                rows={1}
                placeholder="Ask Cyber Guardian about a suspicious activity..."
                className="max-h-28 min-h-[42px] flex-1 resize-none bg-transparent px-3 py-2.5 text-xs text-slate-700 outline-none placeholder:text-slate-400"
              />

              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || typing}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-700 text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Send size={16} />
              </button>

            </div>

            <p className="mt-2 text-center text-[8px] text-slate-400">
              Cyber Guardian provides security guidance. Never share passwords,
              OTPs or sensitive financial information.
            </p>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <aside className="space-y-4">

          {/* QUICK ACTIONS */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <Zap size={16} className="text-blue-700" />

              <h2 className="text-xs font-bold text-slate-900">
                Quick Security Actions
              </h2>
            </div>

            <div className="mt-4 space-y-2">
              {quickActions.map((action) => {
                const Icon = action.icon;

                return (
                  <button
                    key={action.title}
                    onClick={() => sendMessage(action.prompt)}
                    className="flex w-full items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3 text-left transition hover:border-blue-100 hover:bg-blue-50"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-blue-700 shadow-sm">
                      <Icon size={15} />
                    </div>

                    <span className="text-[10px] font-semibold leading-4 text-slate-600">
                      {action.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* THREAT STATUS */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-slate-900">
                Current Threat Level
              </h2>

              <ShieldCheck
                size={17}
                className="text-green-600"
              />
            </div>

            <div className="mt-5 flex items-center gap-3 rounded-2xl bg-green-50 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2
                  size={19}
                  className="text-green-600"
                />
              </div>

              <div>
                <p className="text-sm font-bold text-green-700">
                  Low Risk
                </p>

                <p className="mt-1 text-[9px] text-green-600">
                  No active threats detected.
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-start gap-2 rounded-xl bg-amber-50 p-3">
              <AlertTriangle
                size={14}
                className="mt-0.5 shrink-0 text-amber-600"
              />

              <p className="text-[9px] leading-4 text-amber-700">
                Stay cautious with unknown links, callers and unexpected
                payment requests.
              </p>
            </div>
          </div>

          {/* AI CAPABILITIES */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xs font-bold text-slate-900">
              AI Capabilities
            </h2>

            <div className="mt-4 space-y-3">

              {[
                "Scam Detection",
                "Link Risk Analysis",
                "Caller Analysis",
                "Security Guidance",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2"
                >
                  <CheckCircle2
                    size={13}
                    className="text-green-500"
                  />

                  <span className="text-[10px] font-medium text-slate-500">
                    {item}
                  </span>
                </div>
              ))}

            </div>
          </div>

        </aside>
      </section>

      {/* FOOTER */}
      <div className="flex items-center justify-center gap-2 pb-4 text-[10px] text-slate-400">
        <ShieldCheck size={12} />
        AI Cyber Guardian • Intelligent digital safety assistance
      </div>

    </div>
  );
}

export default AIAssistant;