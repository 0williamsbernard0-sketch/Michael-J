"use client";

import { useState } from "react";
import Nav from "@/components/Nav";
import LockGate from "@/components/LockGate";
import { useAuth } from "@/lib/auth-context";

const AREAS = ["Film", "Media Production", "Arts", "Entertainment / Performance", "Other"];

export default function FellowshipPage() {
  return (
    <div className="min-h-screen bg-[#12151A] text-[#F1ECDF] font-body">
      <Nav />
      <main className="pt-28 pb-20 px-5 sm:px-10 max-w-3xl mx-auto">
        <p className="font-mono text-xs tracking-[0.3em] text-[#1F6F6B] mb-3">
          GIVING BACK
        </p>
        <h1 className="font-display text-3xl sm:text-4xl mb-4">
          MBJ Signature Society Fellowship
        </h1>
        <p className="text-sm text-[#B8B2A2] leading-relaxed mb-10 max-w-xl">
          Founded through MBJ&rsquo;s production company, the Fellowship
          provides paid internships, mentorship, and career opportunities for
          underrepresented young people pursuing careers in media, film,
          arts, and entertainment.
        </p>

        <div className="rounded-lg border border-white/10 bg-[#161A20] p-6 mb-10">
          <h2 className="font-display text-xl mb-3">Financial Aid Proposals</h2>
          <p className="text-sm text-[#B8B2A2] leading-relaxed">
            If you&rsquo;re pursuing a career in film, media, arts, or
            entertainment and need financial support, you can submit a
            proposal below. Tell us who you are, what you&rsquo;re working
            toward, and why the support matters — the Fellowship team
            reviews every submission and follows up directly.
          </p>
        </div>

        <LockGate
          title="Members Only"
          description="Proposal submissions are open to MBJ Society members. Join to apply."
          minHeight="min-h-[420px]"
        >
          <ProposalForm />
        </LockGate>
      </main>
    </div>
  );
}

function ProposalForm() {
  const { memberName, memberEmail } = useAuth();
  const [form, setForm] = useState({
    fullName: memberName ?? "",
    email: memberEmail ?? "",
    phone: "",
    area: AREAS[0],
    amountRequested: "",
    reason: "",
  });
  const [status, setStatus] = useState<"idle" | "submitting" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const update = (key: keyof typeof form, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!form.fullName || !form.email || !form.reason) {
      setErrorMsg("Please fill in your name, email, and reason for your request.");
      return;
    }
    if (form.reason.trim().length < 50) {
      setErrorMsg("Please share a bit more detail (at least 50 characters) so the team has enough context to review your proposal.");
      return;
    }

    setStatus("submitting");
    try {
      const res = await fetch("/api/fellowship-proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Submission failed");
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  };

  if (status === "sent") {
    return (
      <div className="rounded-lg border border-[#1F6F6B]/50 bg-[#161A20] p-8 text-center">
        <div className="text-3xl mb-3">✓</div>
        <h3 className="font-display text-xl mb-2">Proposal Received</h3>
        <p className="text-sm text-[#B8B2A2] max-w-sm mx-auto">
          Thank you for sharing your story. The Fellowship team reviews
          submissions on a rolling basis and will reach out at the email you
          provided if there&rsquo;s a fit.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-white/10 bg-[#161A20] p-6 space-y-5">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-[#B8B2A2] mb-1.5">Full name</label>
          <input
            type="text"
            value={form.fullName}
            onChange={(e) => update("fullName", e.target.value)}
            className="w-full rounded-md bg-[#12151A] border border-white/10 px-4 py-3 text-sm outline-none focus:border-[#C9A227]"
          />
        </div>
        <div>
          <label className="block text-xs text-[#B8B2A2] mb-1.5">Email address</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            className="w-full rounded-md bg-[#12151A] border border-white/10 px-4 py-3 text-sm outline-none focus:border-[#C9A227]"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-[#B8B2A2] mb-1.5">Phone (optional)</label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            className="w-full rounded-md bg-[#12151A] border border-white/10 px-4 py-3 text-sm outline-none focus:border-[#C9A227]"
          />
        </div>
        <div>
          <label className="block text-xs text-[#B8B2A2] mb-1.5">Area of focus</label>
          <select
            value={form.area}
            onChange={(e) => update("area", e.target.value)}
            className="w-full rounded-md bg-[#12151A] border border-white/10 px-4 py-3 text-sm outline-none focus:border-[#C9A227]"
          >
            {AREAS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs text-[#B8B2A2] mb-1.5">
          Amount requested (optional — an estimate is fine)
        </label>
        <input
          type="text"
          value={form.amountRequested}
          onChange={(e) => update("amountRequested", e.target.value)}
          placeholder="e.g. $500"
          className="w-full rounded-md bg-[#12151A] border border-white/10 px-4 py-3 text-sm outline-none focus:border-[#C9A227]"
        />
      </div>

      <div>
        <label className="block text-xs text-[#B8B2A2] mb-1.5">
          Tell us about your situation and what the support is for
        </label>
        <textarea
          value={form.reason}
          onChange={(e) => update("reason", e.target.value)}
          rows={6}
          placeholder="What are you working toward, what's standing in the way, and how would this support help?"
          className="w-full rounded-md bg-[#12151A] border border-white/10 px-4 py-3 text-sm outline-none focus:border-[#C9A227] resize-none"
        />
        <p className="text-[11px] text-[#B8B2A2] mt-1">
          {form.reason.trim().length} characters (minimum 50)
        </p>
      </div>

      {errorMsg && <p className="text-sm text-[#E0716B]">{errorMsg}</p>}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full rounded-md bg-[#C9A227] text-[#12151A] font-semibold py-3 text-sm hover:brightness-110 transition disabled:opacity-60"
      >
        {status === "submitting" ? "Submitting…" : "Submit Proposal"}
      </button>
      {status === "error" && (
        <p className="text-sm text-[#E0716B] text-center">
          Something went wrong sending your proposal. Please try again.
        </p>
      )}
    </form>
  );
}

