function authorized(request,env){const h=request.headers.get('Authorization')||'';return !!env.ADMIN_TOKEN&&h===`Bearer ${env.ADMIN_TOKEN}`}
export async function onRequestGet({request,env}){
 if(!authorized(request,env))return Response.json({error:'غير مصرح'}, {status:401});
 const {results=[]}=await env.DB.prepare('SELECT code,source,created_at FROM keys ORDER BY CASE WHEN code = ? THEN 0 ELSE 1 END,created_at,id').bind('NG-Vbxwimum').all();
 return Response.json({keys:results});
}
