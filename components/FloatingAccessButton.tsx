"use client";
import { useLockModal } from "@/lib/lock-modal-context";
import { useAuth } from "@/lib/auth-context";

export default function FloatingAccessButton() {
  const { openModal } = useLockModal();
  const { isMember } = useAuth();

  if (isMember) return null;

  return (
    <button
      onClick={openModal}
      aria-label="View member benefits"
      className="fixed bottom-6 right-5 z-[90] h-14 w-14 rounded-full bg-[#C9A227] text-[#12151A] shadow-[0_0_20px_rgba(201,162,39,0.5)] flex items-center justify-center text-2xl hover:brightness-110 transition"
    >
      🔒
    </button>
  );
}
