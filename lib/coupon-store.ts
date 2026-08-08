import { getSupabaseAdmin } from "@/lib/supabase";
import { LIVESTREAM_COST } from "@/lib/coupon-constants";
import { getContentCost } from "@/lib/content-pricing";

interface SignupRow {
  id: string;
  status: string;
  expires_at: string | null;
  coupon_balance: number;
}

async function getActiveSignup(email: string): Promise<SignupRow | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("signups")
    .select("id, status, expires_at, coupon_balance")
    .ilike("email", email)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  return data as SignupRow;
}

function isMembershipActive(row: SignupRow | null): boolean {
  if (!row || row.status !== "approved" || !row.expires_at) return false;
  return new Date(row.expires_at).getTime() > Date.now();
}

export async function getWalletStatus(email: string) {
  const supabase = getSupabaseAdmin();
  const signup = await getActiveSignup(email);
  const active = isMembershipActive(signup);

  const [{ data: unlocks }, { data: liveAccess }] = await Promise.all([
    supabase.from("content_unlocks").select("content_type, content_id").eq("email", email),
    supabase.from("livestream_access").select("session_id").eq("email", email),
  ]);

  return {
    balance: signup?.coupon_balance ?? 0,
    membershipActive: active,
    expiresAt: signup?.expires_at ?? null,
    unlockedContent: (unlocks ?? []).map((u) => `${u.content_type}:${u.content_id}`),
    unlockedLivestreams: (liveAccess ?? []).map((a) => a.session_id),
  };
}

/** Adds coupons after a finished NOWPayments coupon purchase. */
export async function creditCoupons(email: string, amount: number) {
  const signup = await getActiveSignup(email);
  if (!signup) {
    console.error("creditCoupons: no signup row for", email);
    return false;
  }
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("signups")
    .update({ coupon_balance: (signup.coupon_balance ?? 0) + amount })
    .eq("id", signup.id);

  if (error) {
    console.error("creditCoupons failed:", error);
    return false;
  }
  return true;
}

/** Unlocks a single content item. Cost is looked up server-side via
 *  getContentCost() — never trusted from the client — so per-item
 *  pricing overrides (e.g. a 5-coupon video) can't be tampered with. */
export async function unlockContentItem(email: string, contentType: string, contentId: string) {
  const supabase = getSupabaseAdmin();
  const signup = await getActiveSignup(email);
  const cost = getContentCost(contentId);

  if (!isMembershipActive(signup)) {
    return { ok: false as const, error: "Membership is not active." };
  }

  const { data: existing } = await supabase
    .from("content_unlocks")
    .select("id")
    .eq("email", email)
    .eq("content_type", contentType)
    .eq("content_id", contentId)
    .maybeSingle();
  if (existing) return { ok: true as const };

  if ((signup!.coupon_balance ?? 0) < cost) {
    return { ok: false as const, error: "Not enough coupons." };
  }

  const { error: deductError } = await supabase
    .from("signups")
    .update({ coupon_balance: signup!.coupon_balance - cost })
    .eq("id", signup!.id);
  if (deductError) return { ok: false as const, error: "Couldn't deduct coupons." };

  const { error: insertError } = await supabase
    .from("content_unlocks")
    .insert({ email, content_type: contentType, content_id: contentId });
  if (insertError) {
    await supabase.from("signups").update({ coupon_balance: signup!.coupon_balance }).eq("id", signup!.id);
    return { ok: false as const, error: "Couldn't save unlock." };
  }

  return { ok: true as const };
}

/** Unlocks livestream participation for 50 coupons per session. */
export async function unlockLivestreamAccess(email: string, sessionId: string) {
  const supabase = getSupabaseAdmin();
  const signup = await getActiveSignup(email);

  if (!isMembershipActive(signup)) {
    return { ok: false as const, error: "Membership is not active." };
  }

  const { data: existing } = await supabase
    .from("livestream_access")
    .select("id")
    .eq("email", email)
    .eq("session_id", sessionId)
    .maybeSingle();
  if (existing) return { ok: true as const };

  if ((signup!.coupon_balance ?? 0) < LIVESTREAM_COST) {
    return { ok: false as const, error: "Not enough coupons." };
  }

  const { error: deductError } = await supabase
    .from("signups")
    .update({ coupon_balance: signup!.coupon_balance - LIVESTREAM_COST })
    .eq("id", signup!.id);
  if (deductError) return { ok: false as const, error: "Couldn't deduct coupons." };

  const { error: insertError } = await supabase
    .from("livestream_access")
    .insert({ email, session_id: sessionId });
  if (insertError) {
    await supabase.from("signups").update({ coupon_balance: signup!.coupon_balance }).eq("id", signup!.id);
    return { ok: false as const, error: "Couldn't save access." };
  }

  return { ok: true as const };
}
