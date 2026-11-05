const RE=/NG-[A-Za-z0-9]{8}/g;
function authorized(request,env){const h=request.headers.get('Authorization')||'';return !!env.ADMIN_TOKEN&&h===`Bearer ${env.ADMIN_TOKEN}`}
export async function onRequestPost({request,env}){
 if(!authorized(request,env))return Response.json({error:'غير مصرح. تحقق من رمز الإدارة.'},{status:401});
 let body;try{body=await request.json()}catch{return Response.json({error:'ملف غير صالح'},{status:400})}
 const text=String(body.text||'');if(text.length>2_000_000)return Response.json({error:'حجم الملف أكبر من المسموح (2MB)'},{status:413});
 const found=text.match(RE)||[];const unique=[...new Set(found.map(x=>x.toUpperCase()))].filter(x=>x!=='NG-VBXWIMUM');let inserted=0;
 for(let i=0;i<unique.length;i+=50){const batch=unique.slice(i,i+50);const stmts=batch.map(code=>env.DB.prepare("INSERT OR IGNORE INTO keys (code,source) VALUES (?,'seed')").bind(code));const res=await env.DB.batch(stmts);inserted+=res.reduce((n,r)=>n+(r.meta?.changes||0),0)}
 return Response.json({ok:true,found:found.length,inserted,skipped:found.length-inserted});
}
