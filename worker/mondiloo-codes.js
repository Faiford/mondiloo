/* Mondiloo · automatic Premium codes (Cloudflare Worker)
   Stripe sends the parent back to https://mondiloo.com/merci.html?session_id=cs_...
   That page asks this Worker for the code. The Worker checks with Stripe that the
   checkout session is really paid, then returns a Premium code made from the session id
   (the same session always gets the same code, so a refresh is safe).
   Secret to add in Cloudflare (Settings → Variables → Add, type "Secret"):
     STRIPE_KEY = a Stripe *restricted* key with "Checkout Sessions: Read" only. */
const SALT = "mondiloo509:";
const ABC = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const ORIGINS = ["https://mondiloo.com", "https://www.mondiloo.com"];

function fnv(str) { let h = 2166136261; for (const ch of str) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; } return h; }
function four(h) { let o = ""; for (let i = 0; i < 4; i++) { o += ABC[h % 32]; h = Math.floor(h / 32); } return o; }
function codeFor(sessionId) { const x = four(fnv("sess:" + sessionId)); return "MDL-" + x + "-" + four(fnv(SALT + x)); }

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const headers = { "Content-Type": "application/json", "Cache-Control": "no-store",
      "Access-Control-Allow-Origin": ORIGINS.includes(origin) ? origin : ORIGINS[0] };
    const reply = (obj, status = 200) => new Response(JSON.stringify(obj), { status, headers });
    if (request.method === "OPTIONS") return new Response(null, { headers });

    const id = new URL(request.url).searchParams.get("session_id") || "";
    if (!/^cs_(live|test)_[A-Za-z0-9]{10,200}$/.test(id)) return reply({ ok: false, error: "bad_session" }, 400);
    if (!env.STRIPE_KEY) return reply({ ok: false, error: "not_configured" }, 500);

    const r = await fetch("https://api.stripe.com/v1/checkout/sessions/" + encodeURIComponent(id), {
      headers: { Authorization: "Bearer " + env.STRIPE_KEY } });
    if (!r.ok) return reply({ ok: false, error: "not_found" }, 404);
    const s = await r.json();
    const paid = s.status === "complete" && (s.payment_status === "paid" || s.payment_status === "no_payment_required");
    if (!paid) return reply({ ok: false, error: "not_paid" }, 402);
    return reply({ ok: true, code: codeFor(id) });
  }
};
