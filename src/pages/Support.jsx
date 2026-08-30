import { useState } from "react";
import {
  LifeBuoy,
  Search,
  ShieldAlert,
  MessageCircle,
  BookOpen,
  PhoneCall,
  ChevronDown,
  Send,
  CheckCircle2,
  LockKeyhole,
} from "lucide-react";

function Support() {
  const [search, setSearch] = useState("");
  const [openFaq, setOpenFaq] = useState(null);
  const [reported, setReported] = useState(false);

  const faqs = [
    {
      question: "What should I do if I receive a suspicious call?",
      answer:
        "Do not share OTPs, passwords or banking information. Use Caller Verification and report the number if the call appears suspicious.",
    },
    {
      question: "How does the Link Scanner protect me?",
      answer:
        "Link Scanner checks a URL for suspicious patterns and potential security risks before you visit it.",
    },
    {
      question: "How can I contact my trusted contacts?",
      answer:
        "Your trusted contacts can be managed from the Trusted Contacts section. They can be used as your emergency safety network.",
    },
    {
      question: "What does AI Guardian monitor?",
      answer:
        "AI Guardian analyzes supported security events such as suspicious links, calls and activity to identify potential threats.",
    },
    {
      question: "How can I improve my Safety Score?",
      answer:
        "Keep your protection controls enabled, avoid suspicious links, verify unknown callers and regularly run a security scan.",
    },
  ];

  const filteredFaqs = faqs.filter((faq) =>
    faq.question.toLowerCase().includes(search.toLowerCase())
  );

  const reportIssue = () => {
    setReported(true);

    setTimeout(() => {
      setReported(false);
    }, 3000);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">

      {/* HEADER */}
      <section>
        <div className="mb-2 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
            <LifeBuoy size={19} />
          </div>

          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-600">
            Security Assistance
          </span>
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
          Support Center
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Get help, report security issues and learn how to stay protected.
        </p>
      </section>

      {/* HERO */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-blue-800 to-slate-900 p-7 text-white shadow-xl">
        <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-blue-400/10 blur-3xl" />

        <div className="relative z-10 max-w-2xl">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
            <LifeBuoy size={22} />
          </div>

          <h2 className="mt-5 text-xl font-bold">
            How can we help protect you?
          </h2>

          <p className="mt-2 text-xs leading-5 text-blue-200">
            Search our security guides or report an issue directly to the
            Cyber Shield support system.
          </p>

          {/* SEARCH */}
          <div className="relative mt-6">
            <Search
              size={17}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search security questions..."
              className="w-full rounded-xl border border-white/10 bg-white px-11 py-3.5 text-xs text-slate-800 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-blue-300"
            />
          </div>
        </div>
      </section>

      {/* QUICK HELP */}
      <section>
        <div className="mb-4">
          <h2 className="text-sm font-bold text-slate-900">
            Quick Help
          </h2>

          <p className="mt-1 text-[10px] text-slate-400">
            Get assistance with common security tasks.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">

          <button
            onClick={reportIssue}
            className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-red-200 hover:shadow-md"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <ShieldAlert size={19} />
            </div>

            <h3 className="mt-4 text-xs font-bold text-slate-800">
              Report Security Issue
            </h3>

            <p className="mt-1 text-[10px] leading-4 text-slate-400">
              Tell us about a suspicious activity or security problem.
            </p>

            <div className="mt-4 flex items-center gap-1 text-[10px] font-bold text-red-600">
              Report issue
              <Send size={11} />
            </div>
          </button>

          <button className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <BookOpen size={19} />
            </div>

            <h3 className="mt-4 text-xs font-bold text-slate-800">
              Safety Guides
            </h3>

            <p className="mt-1 text-[10px] leading-4 text-slate-400">
              Learn how to identify scams, phishing and suspicious calls.
            </p>

            <div className="mt-4 flex items-center gap-1 text-[10px] font-bold text-blue-700">
              Explore guides
              <ChevronDown size={11} />
            </div>
          </button>

          <button className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-purple-200 hover:shadow-md">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-700">
              <MessageCircle size={19} />
            </div>

            <h3 className="mt-4 text-xs font-bold text-slate-800">
              Contact Support
            </h3>

            <p className="mt-1 text-[10px] leading-4 text-slate-400">
              Need assistance? Connect with the Cyber Shield support team.
            </p>

            <div className="mt-4 flex items-center gap-1 text-[10px] font-bold text-purple-700">
              Start conversation
              <MessageCircle size={11} />
            </div>
          </button>

        </div>
      </section>

      {/* FAQ */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Frequently Asked Questions
            </h2>

            <p className="mt-1 text-[10px] text-slate-400">
              Find answers to common security questions.
            </p>
          </div>

          <BookOpen
            size={18}
            className="text-blue-700"
          />
        </div>

        <div className="mt-5 divide-y divide-slate-100">

          {filteredFaqs.length === 0 ? (
            <div className="py-10 text-center">
              <Search
                size={24}
                className="mx-auto text-slate-300"
              />

              <p className="mt-3 text-xs font-semibold text-slate-600">
                No matching questions found
              </p>

              <p className="mt-1 text-[10px] text-slate-400">
                Try searching for another security topic.
              </p>
            </div>
          ) : (
            filteredFaqs.map((faq, index) => {
              const isOpen = openFaq === index;

              return (
                <div key={faq.question}>
                  <button
                    onClick={() =>
                      setOpenFaq(isOpen ? null : index)
                    }
                    className="flex w-full items-center justify-between gap-4 py-4 text-left"
                  >
                    <span className="text-xs font-semibold text-slate-700">
                      {faq.question}
                    </span>

                    <ChevronDown
                      size={16}
                      className={`shrink-0 text-slate-400 transition ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="pb-4 pr-8">
                      <p className="rounded-xl bg-slate-50 p-4 text-[10px] leading-5 text-slate-500">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              );
            })
          )}

        </div>
      </section>

      {/* EMERGENCY HELP */}
      <section className="rounded-3xl border border-red-100 bg-red-50 p-6">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">

          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-red-600 shadow-sm">
              <PhoneCall size={20} />
            </div>

            <div>
              <h2 className="text-sm font-bold text-red-700">
                Immediate Safety Concern?
              </h2>

              <p className="mt-1 max-w-xl text-[10px] leading-5 text-red-600">
                If you believe you are in immediate danger, contact your
                local emergency services or a trusted contact.
              </p>
            </div>
          </div>

          <button className="flex w-fit items-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-xs font-bold text-white shadow-lg shadow-red-600/20 transition hover:bg-red-700">
            <PhoneCall size={14} />
            Emergency Help
          </button>

        </div>
      </section>

      {/* REPORT SUCCESS */}
      {reported && (
        <div className="fixed bottom-6 right-6 z-[100] flex items-center gap-3 rounded-2xl bg-slate-900 px-5 py-4 text-white shadow-2xl">
          <CheckCircle2
            size={19}
            className="text-green-400"
          />

          <div>
            <p className="text-xs font-bold">
              Issue reported
            </p>

            <p className="mt-1 text-[10px] text-slate-400">
              Our support team has received your report.
            </p>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <div className="flex items-center justify-center gap-2 pb-4 text-[10px] text-slate-400">
        <LockKeyhole size={12} />
        Cyber Shield Support • Your security comes first.
      </div>

    </div>
  );
}

export default Support;