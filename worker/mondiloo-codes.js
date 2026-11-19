/* Mondiloo · Premium codes (Cloudflare Worker) — v2
   1. GET  ?session_id=cs_...           → after a Stripe payment, returns the Premium code (merci.html)
   2. POST /activate {code, dev}         → checks the code is real and the subscription is active,
                                           and registers the device (max MAX_DEVICES per code)
   3. POST /release  {code, dev}         → frees this device (parent pressed "remove Premium")
   4. POST /recover  {email, last4}      → lost code: payment email + last 4 card digits → code

   Cloudflare settings for this Worker:
     Secret   STRIPE_KEY    Stripe restricted key, READ access to: Checkout Sessions,
                            Subscriptions, PaymentMethods
     KV       CODES         a KV namespace (Storage → KV → create "mondiloo-codes"),
                            bound to this Worker with the variable name CODES
     Text     MANUAL_CODES  (optional) codes given by hand, with their device limit:
                            "MDL-GPLY-QTEY:100,MDL-XXXX-YYYY:3"
     Text     MAX_DEVICES   (optional) default 3
*/
const SALT = "mondiloo509:";
const ABC = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const ORIGINS = ["https://mondiloo.com", "https://www.mondiloo.com"];
const OK_STATUS = ["active", "trialing", "past_due"];
const DEVICE_IDLE_DAYS = 60;          // a device not seen for 60 days frees its place
const STATUS_TTL = 12 * 3600 * 1000;  // re-ask Stripe about a subscription at most every 12 h

function fnv(str) { let h = 2166136261; for (const ch of str) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; } return h; }
function four(h) { let o = ""; for (let i = 0; i < 4; i++) { o += ABC[h % 32]; h = Math.floor(h / 32); } return o; }
function codeFor(sessionId) { const x = four(fnv("sess:" + sessionId)); return "MDL-" + x + "-" + four(fnv(SALT + x)); }
function codeOk(c) { const m = /^MDL-([A-Z0-9]{4})-([A-Z0-9]{4})$/.exec(c || ""); return !!m && four(fnv(SALT + m[1])) === m[2]; }
const clean = c => String(c || "").trim().toUpperCase();

async function stripe(env, path) {
  const r = await fetch("https://api.stripe.com/v1/" + path, { headers: { Authorization: "Bearer " + env.STRIPE_KEY } });
  if (!r.ok) throw new Error("stripe " + r.status);
  return r.json();
}
const subId = s => (s && s.subscription && typeof s.subscription === "object") ? s.subscription.id : (s && s.subscription) || "";
const paid = s => s.status === "complete" && (s.payment_status === "paid" || s.payment_status === "no_payment_required");

async function getRec(env, code) { const v = await env.CODES.get("c:" + code); return v ? JSON.parse(v) : null; }
const putRec = (env, code, rec) => env.CODES.put("c:" + code, JSON.stringify(rec));

async function remember(env, s) {            // store code → session/subscription
  const code = codeFor(s.id);
  const old = await getRec(env, code);
  const rec = old || { s: s.id, sub: subId(s), dev: [] };
  rec.s = s.id; rec.sub = subId(s) || rec.sub || "";
  if (s.subscription && typeof s.subscription === "object") { rec.st = s.subscription.status; rec.at = Date.now(); }
  if (!old || old.sub !== rec.sub || rec.at) await putRec(env, code, rec);
  return [code, rec];
}

function manual(env, code) {
  for (const part of String(env.MANUAL_CODES || "").split(",")) {
    const [c, n] = part.trim().split(":");
    if (clean(c) === code) return { manual: true, max: Math.max(1, +n || 3), dev: [] };
  }
  return null;
}

async function backfill(env, want) {        // codes made before KV existed: scan paid sessions once
  if (await env.CODES.get("backfilled")) return null;
  let after = "", found = null;
  for (let page = 0; page < 10; page++) {
    const j = await stripe(env, "checkout/sessions?status=complete&limit=100" + (after ? "&starting_after=" + after : ""));
    for (const s of j.data) if (paid(s)) { const [c, rec] = await remember(env, s); if (c === want) found = rec; }
    if (!j.has_more || !j.data.length) break;
    after = j.data[j.data.length - 1].id;
  }
  await env.CODES.put("backfilled", "1");
  return found;
}

async function resolve(env, code) {
  let rec = await getRec(env, code);
  const m = manual(env, code);
  if (m) { if (!rec) { rec = m; await putRec(env, code, rec); } rec.manual = true; rec.max = m.max; return rec; }
  if (!rec) rec = await backfill(env, code);
  return rec;
}

async function active(env, code, rec) {
  if (rec.manual) return true;
  if (!rec.sub) return true;                       // one-time payment, no subscription
  if (!rec.st || !rec.at || Date.now() - rec.at > STATUS_TTL) {
    try { const sub = await stripe(env, "subscriptions/" + rec.sub); rec.st = sub.status; rec.at = Date.now(); await putRec(env, code, rec); }
    catch (e) { return OK_STATUS.includes(rec.st || "active"); }   // Stripe unreachable: trust last known
  }
  return OK_STATUS.includes(rec.st);
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const headers = { "Content-Type": "application/json", "Cache-Control": "no-store",
      "Access-Control-Allow-Origin": ORIGINS.includes(origin) ? origin : ORIGINS[0],
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" };
    const reply = (obj, status = 200) => new Response(JSON.stringify(obj), { status, headers });
    if (request.method === "OPTIONS") return new Response(null, { headers });
    if (!env.STRIPE_KEY) return reply({ ok: false, error: "not_configured" }, 500);
    const url = new URL(request.url);

    try {
      /* 1. code after payment */
      if (request.method === "GET") {
        const id = url.searchParams.get("session_id") || "";
        if (!/^cs_(live|test)_[A-Za-z0-9]{10,200}$/.test(id)) return reply({ ok: false, error: "bad_session" }, 400);
        let s; try { s = await stripe(env, "checkout/sessions/" + encodeURIComponent(id)); } catch (e) { return reply({ ok: false, error: "not_found" }, 404); }
        if (!paid(s)) return reply({ ok: false, error: "not_paid" }, 402);
        if (env.CODES) await remember(env, s);
        return reply({ ok: true, code: codeFor(id) });
      }
      if (request.method !== "POST") return reply({ ok: false, error: "method" }, 405);
      if (!env.CODES) return reply({ ok: true, unchecked: true });     // KV not set up yet: don't block anyone
      let body = {}; try { body = await request.json(); } catch (e) {}

      /* 2. activate / check a device */
      if (url.pathname === "/activate" || url.pathname === "/release") {
        const code = clean(body.code), dev = String(body.dev || "").slice(0, 64);
        if (!codeOk(code) || !/^[a-z0-9-]{8,64}$/i.test(dev)) return reply({ ok: false, error: "bad_request" }, 400);
        const rec = await resolve(env, code);
        if (!rec) return reply({ ok: false, error: "unknown" });
        const now = Date.now();
        rec.dev = (rec.dev || []).filter(d => d.id !== dev ? now - d.t < DEVICE_IDLE_DAYS * 864e5 : true);
        if (url.pathname === "/release") { rec.dev = rec.dev.filter(d => d.id !== dev); await putRec(env, code, rec); return reply({ ok: true }); }
        if (!(await active(env, code, rec))) return reply({ ok: false, error: "inactive" });
        const max = rec.max || +env.MAX_DEVICES || 3;
        const mine = rec.dev.find(d => d.id === dev);
        if (mine) mine.t = now;
        else if (rec.dev.length < max) rec.dev.push({ id: dev, t: now });
        else { await putRec(env, code, rec); return reply({ ok: false, error: "limit", max }); }
        await putRec(env, code, rec);
        return reply({ ok: true, used: rec.dev.length, max });
      }

      /* 4. lost code */
      if (url.pathname === "/recover") {
        const ip = request.headers.get("CF-Connecting-IP") || "x";
        const rk = "rl:" + ip + ":" + Math.floor(Date.now() / 3600e3);
        const tries = +(await env.CODES.get(rk)) || 0;
        if (tries >= 5) return reply({ ok: false, error: "too_many" }, 429);
        await env.CODES.put(rk, String(tries + 1), { expirationTtl: 3700 });
        const email = String(body.email || "").trim().toLowerCase(), last4 = String(body.last4 || "").trim();
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || !/^\d{4}$/.test(last4)) return reply({ ok: false, error: "bad_request" }, 400);
        const j = await stripe(env, "checkout/sessions?limit=20&customer_details[email]=" + encodeURIComponent(email) +
          "&expand[]=data.subscription.default_payment_method");
        const codes = [];
        for (const s of j.data) {
          if (!paid(s) || !s.subscription || typeof s.subscription !== "object") continue;
          const pm = s.subscription.default_payment_method;
          if (!pm || !pm.card || pm.card.last4 !== last4) continue;
          const [code] = await remember(env, s);
          if (OK_STATUS.includes(s.subscription.status)) codes.push(code);
        }
        if (!codes.length) return reply({ ok: false, error: "not_found" });
        return reply({ ok: true, code: codes[0] });
      }
      return reply({ ok: false, error: "not_found" }, 404);
    } catch (e) {
      return reply({ ok: false, error: "server" }, 502);
    }
  }
};
