"use client";

import { useState } from "react";
import Nav from "@/components/Nav";

export default function SupportPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !subject || !message) {
      setErrorMsg("Please fill in every field.");
      return;
    }
    setStatus("loading");
    setErrorMsg(null);
    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error ?? "Something went wrong sending your message.");
        setStatus("error");
        return;
      }
      setStatus("sent");
    } catch {
      setErrorMsg("Network error — please try again.");
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-[#12151A] text-[#F1ECDF] font-body">
      <Nav />
      <main className="pt-28 sm:pt-32 pb-20 px-5 sm:px-10 max-w-2xl mx-auto">
        <p className="font-body text-[11px] font-semibold uppercase tracking-[0.4em] text-[#1F6F6B] mb-4">
          We&rsquo;re Here to Help
        </p>
        <h1 className="font-display font-semibold text-3xl sm:text-4xl mb-3">Support</h1>
        <p className="text-sm text-[#B8B2A2] mb-10 max-w-md leading-relaxed">
          Payment issue, account access, or a general question — send us a
          message and the team will follow up by email.
        </p>

        {status === "sent" ? (
          <div className="rounded-lg border border-[#C9A227]/40 bg-[#161A20] p-8 text-center">
            <p className="font-body text-[11px] font-semibold uppercase tracking-[0.35em] text-[#C9A227] mb-3">
              Message Sent
            </p>
            <h3 className="font-display font-semibold text-xl mb-3">We&rsquo;ve got it</h3>
            <p className="text-sm text-[#B8B2A2]">
              Thanks for reaching out — we&rsquo;ll get back to you at {email} shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-[#B8B2A2] mb-1.5">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-md bg-[#161A20] border border-white/10 px-4 py-3 text-sm outline-none focus:border-[#C9A227]"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-xs text-[#B8B2A2] mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-md bg-[#161A20] border border-white/10 px-4 py-3 text-sm outline-none focus:border-[#C9A227]"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-[#B8B2A2] mb-1.5">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full rounded-md bg-[#161A20] border border-white/10 px-4 py-3 text-sm outline-none focus:border-[#C9A227]"
                placeholder="What's this about?"
              />
            </div>

            <div>
              <label className="block text-xs text-[#B8B2A2] mb-1.5">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                className="w-full rounded-md bg-[#161A20] border border-white/10 px-4 py-3 text-sm outline-none focus:border-[#C9A227] resize-none"
                placeholder="Tell us what's going on..."
              />
            </div>

            {errorMsg && <p className="text-sm text-[#E0716B]">{errorMsg}</p>}

            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full rounded-md bg-[#C9A227] text-[#12151A] font-semibold uppercase tracking-wider text-xs py-3.5 hover:brightness-110 transition disabled:opacity-60"
            >
              {status === "loading" ? "Sending…" : "Send Message"}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
