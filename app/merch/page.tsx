"use client";

import { useState, useMemo } from "react";
import Nav from "@/components/Nav";

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  desc: string;
}

const PRODUCTS: Product[] = [
  {
    id: "tee-classic",
    name: "Classic Logo Tee",
    price: 35,
    image: "/images/merch/tee-classic.jpeg",
    desc: "Heavyweight cotton, embroidered crest.",
  },
  {
    id: "hoodie-society",
    name: "Society Hoodie",
    price: 68,
    image: "/images/merch/hoodie-society.jpeg",
    desc: "Midweight fleece, front pouch pocket.",
  },
  {
    id: "cap-crest",
    name: "Crest Cap",
    price: 28,
    image: "/images/merch/cap-crest.jpeg",
    desc: "Structured six-panel, adjustable strap.",
  },
  {
    id: "mug-signature",
    name: "Signature Mug",
    price: 18,
    image: "/images/merch/mug-signature.jpeg",
    desc: "12oz ceramic, matte finish.",
  },
  {
    id: "tote-canvas",
    name: "Canvas Tote",
    price: 22,
    image: "/images/merch/tote-canvas.jpeg",
    desc: "Heavy canvas, screen-printed wordmark.",
  },
  {
    id: "pin-set",
    name: "Enamel Pin Set",
    price: 15,
    image: "/images/merch/pin-set.jpeg",
    desc: "Set of 3, gold-plated hardware.",
  },
];

type Cart = Record<string, number>; // productId -> quantity

export default function MerchPage() {
  const [cart, setCart] = useState<Cart>({});
  const [checkoutState, setCheckoutState] = useState<"idle" | "loading" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [showCheckout, setShowCheckout] = useState(false);

  const addToCart = (id: string) => {
    setCart((c) => ({ ...c, [id]: (c[id] ?? 0) + 1 }));
  };

  const changeQty = (id: string, delta: number) => {
    setCart((c) => {
      const next = { ...c };
      const qty = (next[id] ?? 0) + delta;
      if (qty <= 0) {
        delete next[id];
      } else {
        next[id] = qty;
      }
      return next;
    });
  };

  const cartItems = useMemo(
    () =>
      Object.entries(cart)
        .map(([id, qty]) => {
          const product = PRODUCTS.find((p) => p.id === id);
          return product ? { product, qty } : null;
        })
        .filter((x): x is { product: Product; qty: number } => x !== null),
    [cart]
  );

  const cartCount = cartItems.reduce((sum, { qty }) => sum + qty, 0);
  const cartTotal = cartItems.reduce((sum, { product, qty }) => sum + product.price * qty, 0);

  const handleCheckout = async () => {
    if (!email) {
      setErrorMsg("Enter an email so we can send your order confirmation.");
      return;
    }
    setCheckoutState("loading");
    setErrorMsg(null);
    try {
      const res = await fetch("/api/merch-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          items: cartItems.map(({ product, qty }) => ({
            id: product.id,
            name: product.name,
            price: product.price,
            qty,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error ?? "Something went wrong creating your order.");
        setCheckoutState("error");
        return;
      }
      if (data.invoice_url) {
        window.location.href = data.invoice_url;
      }
    } catch {
      setErrorMsg("Network error — please try again.");
      setCheckoutState("error");
    }
  };

  return (
    <div className="min-h-screen bg-[#12151A] text-[#F1ECDF] font-body">
      <Nav />
      <main className="pt-28 pb-32 px-5 sm:px-10 max-w-5xl mx-auto">
        <h1 className="font-display text-3xl sm:text-4xl mb-2">Merch</h1>
        <p className="text-sm text-[#B8B2A2] mb-10">
          Official MBJ Society gear. Open to everyone — members and guests alike.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {PRODUCTS.map((product) => (
            <div
              key={product.id}
              className="rounded-md border border-white/10 bg-[#1A1E24] overflow-hidden flex flex-col"
            >
              <div className="aspect-square bg-[#0C0E12] flex items-center justify-center">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
              <div className="p-3 flex flex-col gap-1 flex-1">
                <h3 className="text-sm font-semibold">{product.name}</h3>
                <p className="text-xs text-[#B8B2A2] flex-1">{product.desc}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm font-mono">${product.price}</span>
                  <button
                    onClick={() => addToCart(product.id)}
                    className="rounded-md bg-[#C9A227] text-[#12151A] font-semibold px-3 py-1.5 text-xs hover:brightness-110 transition"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Cart bar */}
      {cartCount > 0 && !showCheckout && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#1A1E24] border-t border-white/10 px-5 sm:px-10 py-4 flex items-center justify-between">
          <span className="text-sm">
            {cartCount} item{cartCount > 1 ? "s" : ""} — ${cartTotal}
          </span>
          <button
            onClick={() => setShowCheckout(true)}
            className="rounded-md bg-[#C9A227] text-[#12151A] font-semibold px-5 py-2.5 text-sm hover:brightness-110 transition"
          >
            View Cart
          </button>
        </div>
      )}

      {/* Checkout panel */}
      {showCheckout && (
        <div className="fixed inset-0 z-50 bg-[#0C0E12]/95 flex flex-col px-5 sm:px-10 pt-24 pb-10 overflow-y-auto">
          <button
            className="absolute top-5 right-5 text-2xl"
            onClick={() => setShowCheckout(false)}
            aria-label="Close cart"
          >
            ✕
          </button>
          <h2 className="font-display text-2xl mb-6">Your Cart</h2>

          {cartItems.length === 0 ? (
            <p className="text-sm text-[#B8B2A2]">Your cart is empty.</p>
          ) : (
            <div className="flex flex-col gap-4 max-w-lg">
              {cartItems.map(({ product, qty }) => (
                <div key={product.id} className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <p className="text-sm font-semibold">{product.name}</p>
                    <p className="text-xs text-[#B8B2A2]">${product.price} each</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => changeQty(product.id, -1)}
                      className="w-7 h-7 rounded-md border border-white/20 text-sm"
                    >
                      −
                    </button>
                    <span className="text-sm font-mono w-4 text-center">{qty}</span>
                    <button
                      onClick={() => changeQty(product.id, 1)}
                      className="w-7 h-7 rounded-md border border-white/20 text-sm"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}

              <div className="flex items-center justify-between pt-2">
                <span className="text-sm">Total</span>
                <span className="font-mono text-lg">${cartTotal}</span>
              </div>

              <div className="mt-4">
                <label className="text-xs text-[#B8B2A2] mb-1 block">Email for order confirmation</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-md bg-[#1A1E24] border border-white/10 px-3 py-2.5 text-sm outline-none focus:border-[#C9A227]"
                />
              </div>

              {errorMsg && <p className="text-xs text-red-400 mt-1">{errorMsg}</p>}

              <button
                onClick={handleCheckout}
                disabled={checkoutState === "loading"}
                className="mt-4 rounded-md bg-[#C9A227] text-[#12151A] font-semibold px-5 py-3 text-sm hover:brightness-110 transition disabled:opacity-60"
              >
                {checkoutState === "loading" ? "Creating order…" : `Checkout — $${cartTotal}`}
              </button>
              <p className="text-[10px] text-[#B8B2A2] mt-2">
                Payment is processed securely via NOWPayments. You'll be redirected to complete payment.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

