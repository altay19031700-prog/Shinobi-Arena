'use strict';
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {WebSocketServer}=require('ws');
const ROOT=path.join(__dirname,'app','src','main','assets');
const PORT=Number(process.env.PORT||10000);
const rooms=new Map(), chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.wav':'audio/wav','.json':'application/json; charset=utf-8','.webmanifest':'application/manifest+json'};
const json=(res,status,data)=>{const b=Buffer.from(JSON.stringify(data));res.writeHead(status,{'content-type':'application/json; charset=utf-8','content-length':b.length,'cache-control':'no-store','x-content-type-options':'nosniff'});res.end(b)};
const random=n=>crypto.randomBytes(n).toString('hex');
function newCode(){let code;do{code=Array.from({length:6},()=>chars[crypto.randomInt(chars.length)]).join('')}while(rooms.has(code));return code}
function roomInfo(r){return {type:'room',code:r.code,mode:r.mode,connected:{host:!!r.host,guest:!!r.guest},ready:{host:!!r.ready.host,guest:!!r.ready.guest},started:r.started,revision:r.revision}}
function send(ws,msg){if(ws&&ws.readyState===1)ws.send(JSON.stringify(msg))}
function announce(r){send(r.host,roomInfo(r));send(r.guest,roomInfo(r))}
function originOK(req){const o=req.headers.origin;if(!o)return true;try{return new URL(o).host===req.headers.host}catch{return false}}
const server=http.createServer(async(req,res)=>{
  const url=new URL(req.url,'http://localhost');const route=url.pathname;
  if(route==='/health')return json(res,200,{ok:true,service:'shinobi-browser',rooms:rooms.size});
  if(route==='/api/create'||route==='/api/join'){
    if(req.method!=='POST')return json(res,405,{error:'POST required'});
    if(!originOK(req))return json(res,403,{error:'Origin rejected'});
    let body='';try{for await(const chunk of req){body+=chunk;if(body.length>4096)throw Error('too large')}const d=JSON.parse(body);
      if(route==='/api/create'){if(rooms.size>=100)return json(res,503,{error:'Too many rooms'});const code=newCode();const r={code,mode:d.mode==='coop'?'coop':'pvp',tokens:{host:random(24),guest:null},host:null,guest:null,ready:{},started:false,revision:0,updated:Date.now()};rooms.set(code,r);return json(res,200,{code,role:'host',token:r.tokens.host,mode:r.mode})}
      const code=String(d.code||'').toUpperCase(),r=rooms.get(code);if(!r)return json(res,404,{error:'Room not found'});
      let role=d.token===r.tokens.host?'host':d.token===r.tokens.guest&&r.tokens.guest?'guest':null;
      if(!role){if(r.tokens.guest)return json(res,409,{error:'Room full'});r.tokens.guest=random(24);role='guest'}
      r.updated=Date.now();return json(res,200,{code,role,token:r.tokens[role],mode:r.mode})
    }catch(e){return json(res,400,{error:'Invalid request'})}
  }
  if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405);return res.end()}
  let rel;try{rel=decodeURIComponent(route)}catch{res.writeHead(400);return res.end()}
  if(rel==='/')rel='/index.html';
  const file=path.resolve(ROOT,'.'+rel);
  if(!file.startsWith(ROOT+path.sep)){res.writeHead(403);return res.end()}
  const ext=path.extname(file).toLowerCase();if(!mime[ext]){res.writeHead(404);return res.end()}
  fs.stat(file,(err,st)=>{if(err||!st.isFile()){res.writeHead(404);return res.end('Not found')}
    res.writeHead(200,{'content-type':mime[ext],'content-length':st.size,'cache-control':ext==='.html'?'no-cache':'public, max-age=86400','x-content-type-options':'nosniff'});
    if(req.method==='HEAD')res.end();else fs.createReadStream(file).pipe(res)
  })
});
const wss=new WebSocketServer({noServer:true,maxPayload:800000});
server.on('upgrade',(req,socket,head)=>{
  const url=new URL(req.url,'http://localhost');const r=rooms.get(url.searchParams.get('room'));const token=url.searchParams.get('token');
  if(url.pathname!=='/ws'||!r||!originOK(req)){socket.destroy();return}
  const role=token===r.tokens.host?'host':token===r.tokens.guest&&r.tokens.guest?'guest':null;
  if(!role){socket.destroy();return}
  wss.handleUpgrade(req,socket,head,ws=>{
    if(r[role])r[role].close(4000,'Reconnected');
    r[role]=ws;r.updated=Date.now();send(ws,{type:'hello',role,code:r.code,revision:r.revision});
    announce(r);
    ws.on('message',raw=>{let d;try{d=JSON.parse(raw.toString())}catch{return}
      if(!d||typeof d.type!=='string')return;r.updated=Date.now();
      if(d.type==='ready'){if(!r.started&&Array.isArray(d.roster)&&d.roster.length<=6){r.ready[role]=d.roster;announce(r);if(r.ready.host&&r.ready.guest)send(r.host,{type:'squads',host:r.ready.host,guest:r.ready.guest})}}
      else if(d.type==='state'&&role==='host'){if(d.state&&typeof d.state==='object'){r.started=true;r.revision++;send(r.guest,{type:'state',state:d.state,revision:r.revision})}}
      else if(d.type==='command'){if(r.started)send(r.host,{type:'command',role,command:d.command,revision:r.revision,seq:d.seq})}
      else if(d.type==='ack'&&role==='host'){send(r[d.role],{type:'ack',seq:d.seq,ok:!!d.ok,message:d.message})}
      else if(d.type==='reset'&&role==='host'){r.started=false;r.ready={};r.revision++;announce(r);send(r.guest,{type:'reset',revision:r.revision})}
      else if(d.type==='ping')send(ws,{type:'pong'});
    });
    ws.on('close',()=>{if(r[role]===ws){r[role]=null;announce(r)}});
  })
});
setInterval(()=>{for(const [code,r] of rooms){if(!r.host&&!r.guest&&Date.now()-r.updated>7200000)rooms.delete(code)}},60000).unref();
server.listen(PORT,'0.0.0.0',()=>console.log('Shinobi browser host listening on',PORT));
