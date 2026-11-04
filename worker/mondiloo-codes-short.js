const A="ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const fnv=s=>{let h=2166136261;for(const c of s){h^=c.charCodeAt(0);h=Math.imul(h,16777619)>>>0;}return h;};
const four=h=>{let o="";for(let i=0;i<4;i++){o+=A[h%32];h=Math.floor(h/32);}return o;};
const codeFor=id=>{const x=four(fnv("sess:"+id));return "MDL-"+x+"-"+four(fnv("mondiloo509:"+x));};
export default {
  async fetch(req, env) {
    const H={"Content-Type":"application/json","Cache-Control":"no-store","Access-Control-Allow-Origin":"https://mondiloo.com"};
    const out=(o,st)=>new Response(JSON.stringify(o),{status:st||200,headers:H});
    if (req.method==="OPTIONS") return new Response(null,{headers:H});
    const id=new URL(req.url).searchParams.get("session_id")||"";
    if (!/^cs_(live|test)_[A-Za-z0-9]{10,200}$/.test(id)) return out({ok:false,error:"bad_session"},400);
    if (!env.STRIPE_KEY) return out({ok:false,error:"not_configured"},500);
    const r=await fetch("https://api.stripe.com/v1/checkout/sessions/"+id,{headers:{Authorization:"Bearer "+env.STRIPE_KEY}});
    if (!r.ok) return out({ok:false,error:"not_found"},404);
    const s=await r.json();
    if (s.status!=="complete"||!["paid","no_payment_required"].includes(s.payment_status)) return out({ok:false,error:"not_paid"},402);
    return out({ok:true,code:codeFor(id)});
  }
};
