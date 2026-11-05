const CODE_RE=/^NG-[A-Za-z0-9]{8}$/;
async function hashIp(ip){const bytes=new TextEncoder().encode(ip);const digest=await crypto.subtle.digest('SHA-256',bytes);return [...new Uint8Array(digest)].map(b=>b.toString(16).padStart(2,'0')).join('')}
export async function onRequestGet({env}){
  const {results=[]}=await env.DB.prepare('SELECT code, source, created_at FROM keys ORDER BY CASE WHEN code = ? THEN 0 ELSE 1 END, created_at ASC, id ASC').bind('NG-Vbxwimum').all();
  return Response.json({keys:results});
}
export async function onRequestPost({request,env}){
  let body;try{body=await request.json()}catch{return Response.json({error:'بيانات غير صالحة'}, {status:400})}
  const code=String(body.code||'').trim();
  if(!CODE_RE.test(code))return Response.json({error:'صيغة المفتاح غير صحيحة'}, {status:400});
  if(code.toLowerCase()==='ng-vbxwimum')return Response.json({error:'هذا المفتاح الأساسي موجود بالفعل'}, {status:409});
  const ip=request.headers.get('CF-Connecting-IP')||'unknown';const ipHash=await hashIp(ip);
  const windowStart=new Date(Date.now()-60*60*1000).toISOString();
  const recent=await env.DB.prepare('SELECT COUNT(*) AS n FROM contribution_limits WHERE ip_hash=? AND created_at>?').bind(ipHash,windowStart).first();
  if((recent?.n||0)>=10)return Response.json({error:'وصلت للحد المؤقت: 10 مشاركات في الساعة من نفس الاتصال.'},{status:429});
  try{
    await env.DB.prepare("INSERT INTO keys (code,source) VALUES (?,'community')").bind(code).run();
    await env.DB.prepare('INSERT INTO contribution_limits (ip_hash) VALUES (?)').bind(ipHash).run();
    return Response.json({ok:true,duplicate:false},{status:201});
  }catch(e){if(String(e).toLowerCase().includes('unique'))return Response.json({ok:true,duplicate:true},{status:200});return Response.json({error:'حدث خطأ أثناء حفظ المفتاح'},{status:500})}
}
