'use strict';
// Shinobi Arena relay: authoritative simulation remains on the room creator's client.
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {WebSocketServer}=require('ws'),QRCode=require('qrcode');
const ROOT=path.resolve(__dirname,'app/src/main/assets'),PORT=Number(process.env.PORT||10000);
const BUILD='shinobi-lan-1-gen10-vfx520-fix1',rooms=new Map(),alphabet='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.svg':'image/svg+xml','.wav':'audio/wav','.json':'application/json; charset=utf-8','.webmanifest':'application/manifest+json'};
const token=()=>crypto.randomBytes(32).toString('hex');
const safeOrigin=(origin,host)=>{if(!origin)return true;try{const u=new URL(origin);return u.host===host||((u.hostname==='127.0.0.1'||u.hostname==='localhost')&&u.protocol==='http:')}catch{return false}};
function cors(req){const origin=req.headers.origin;return origin&&safeOrigin(origin,req.headers.host)?{'access-control-allow-origin':origin,'access-control-allow-methods':'GET, POST, OPTIONS','access-control-allow-headers':'Content-Type','vary':'Origin'}:{}}
function reply(req,res,status,obj){const data=Buffer.from(JSON.stringify(obj));res.writeHead(status,{'content-type':'application/json; charset=utf-8','content-length':data.length,'cache-control':'no-store','x-content-type-options':'nosniff',...cors(req)});res.end(data)}
function send(ws,obj){if(ws?.readyState===1)try{ws.send(JSON.stringify(obj))}catch{}}
function newCode(){let c;do{c=Array.from({length:6},()=>alphabet[crypto.randomInt(alphabet.length)]).join('')}while(rooms.has(c));return c}
function roleOf(r,key){return key&&key===r.tokens.host?'host':key&&key===r.tokens.guest?'guest':null}
function info(r){return {type:'room',code:r.code,mode:r.mode,connected:{host:!!r.peers.host,guest:!!r.peers.guest},ready:{host:!!r.ready.host,guest:!!r.ready.guest},started:!!r.state}}
function announce(r){send(r.peers.host,info(r));send(r.peers.guest,info(r))}
function clean(){for(const [c,r]of rooms)if(!r.peers.host&&!r.peers.guest&&Date.now()-r.updated>7200000)rooms.delete(c)}
const server=http.createServer(async(req,res)=>{
  const u=new URL(req.url,'http://localhost'),route=u.pathname;
  if(req.method==='OPTIONS'){if(!safeOrigin(req.headers.origin,req.headers.host))return reply(req,res,403,{error:'Origin denied'});res.writeHead(204,cors(req));return res.end()}
  if(route==='/health')return reply(req,res,200,{ok:true,game:'shinobi',build:BUILD,rooms:rooms.size});
  if(route==='/api/addresses')return reply(req,res,200,{addresses:[],internet_url:'https://'+req.headers.host});
  if(route==='/qr'){const value=u.searchParams.get('text')||'';if(value.length>300)return reply(req,res,400,{error:'URL too long'});try{const svg=await QRCode.toString(value,{type:'svg',margin:2,errorCorrectionLevel:'M'});res.writeHead(200,{'content-type':'image/svg+xml','content-length':Buffer.byteLength(svg),'cache-control':'no-store',...cors(req)});return res.end(svg)}catch{return reply(req,res,400,{error:'Invalid QR'})}}
  if(route==='/api/create'||route==='/api/join'){
    if(req.method!=='POST')return reply(req,res,405,{error:'POST required'});
    if(!safeOrigin(req.headers.origin,req.headers.host))return reply(req,res,403,{error:'Origin denied'});
    let data;try{let body='';for await(const chunk of req){body+=chunk;if(body.length>4000)throw Error('Large body')}data=JSON.parse(body);if(!data||typeof data!=='object')throw Error('Invalid body')}catch{return reply(req,res,400,{error:'Invalid request'})}
    if(data.build!==BUILD)return reply(req,res,409,{error:'Обнови игру: версии клиента и сервера различаются.'});
    clean();
    if(route==='/api/create'){
      if(rooms.size>=100)return reply(req,res,503,{error:'Слишком много комнат'});
      const code=newCode(),r={code,mode:data.mode==='coop'?'coop':'pvp',tokens:{host:token(),guest:null},peers:{host:null,guest:null},ready:{},seq:{host:0,guest:0},state:null,checkpoint:null,turn:'host',counter:null,busy:false,revision:0,updated:Date.now()};rooms.set(code,r);
      return reply(req,res,200,{code,role:'host',token:r.tokens.host,mode:r.mode,build:BUILD})
    }
    const code=String(data.code||'').toUpperCase(),r=rooms.get(code);
    if(!r)return reply(req,res,404,{error:'Комната не найдена.'});
    let role=roleOf(r,data.token);
    if(!role){if(r.tokens.guest)return reply(req,res,409,{error:'В комнате уже два игрока.'});r.tokens.guest=token();role='guest'}
    r.updated=Date.now();return reply(req,res,200,{code,role,token:r.tokens[role],mode:r.mode,build:BUILD})
  }
  if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405);return res.end()}
  let rel;try{rel=decodeURIComponent(route)}catch{res.writeHead(400);return res.end()}
  if(rel==='/')rel='/index.html';
  const file=path.resolve(ROOT,'.'+rel),ext=path.extname(file).toLowerCase();
  if(!file.startsWith(ROOT+path.sep)||!mime[ext]){res.writeHead(404);return res.end()}
  fs.stat(file,(err,st)=>{if(err||!st.isFile()){res.writeHead(404);return res.end('Not found')}
    res.writeHead(200,{'content-type':mime[ext],'content-length':st.size,'cache-control':(ext==='.html'||ext==='.js')?'no-cache':'public, max-age=86400','x-content-type-options':'nosniff'});
    if(req.method==='HEAD')res.end();else fs.createReadStream(file).pipe(res)})
});
const wss=new WebSocketServer({noServer:true,maxPayload:800000});
server.on('upgrade',(req,socket,head)=>{
  const u=new URL(req.url,'http://localhost'),r=rooms.get(u.searchParams.get('room')),key=u.searchParams.get('token');
  if(u.pathname!=='/ws'||!r||!safeOrigin(req.headers.origin,req.headers.host)){socket.destroy();return}
  const role=roleOf(r,key);if(!role){socket.destroy();return}
  wss.handleUpgrade(req,socket,head,ws=>{
    const previous=r.peers[role];r.peers[role]=ws;r.updated=Date.now();
    if(previous)previous.close(4000,'Reconnected');
    send(ws,{type:'hello',role,code:r.code,nextSeq:r.seq[role]+1,revision:r.revision,build:BUILD,mode:r.mode});
    if(role==='host'&&r.checkpoint)send(ws,{type:'restore',checkpoint:r.checkpoint,revision:r.revision});
    if(role==='guest'&&r.state)send(ws,{type:'state',state:r.state,revision:r.revision});
    if(role==='host'&&r.ready.host&&r.ready.guest&&!r.state)send(ws,{type:'squads',host:r.ready.host,guest:r.ready.guest});
    announce(r);
    ws.on('message',raw=>{
      let d;try{d=JSON.parse(raw.toString())}catch{return}
      if(!d||typeof d!=='object')return;r.updated=Date.now();
      if(d.type==='ready'){
        if(r.state)return send(ws,{type:'error',message:'Бой уже начат'});
        if(!Array.isArray(d.roster)||d.roster.length<1||d.roster.length>6||JSON.stringify(d.roster).length>24000)return send(ws,{type:'error',message:'Неверный отряд'});
        r.ready[role]=d.roster;announce(r);
        if(r.ready.host&&r.ready.guest)send(r.peers.host,{type:'squads',host:r.ready.host,guest:r.ready.guest})
      }else if(d.type==='state'&&role==='host'){
        if(!d.state||typeof d.state!=='object'||!d.checkpoint||typeof d.checkpoint!=='object'||!Number.isInteger(d.revision)||d.revision<r.revision)return;
        if(!['host','guest'].includes(d.turn)||![null,'host','guest'].includes(d.counter))return;
        r.state=d.state;r.checkpoint=d.checkpoint;r.turn=d.turn;r.counter=d.counter;r.busy=!!d.busy;r.revision=d.revision;
        send(r.peers.guest,{type:'state',state:r.state,revision:r.revision})
      }else if(d.type==='command'){
        const seq=d.seq,command=d.command;
        if(!Number.isSafeInteger(seq)||seq<=r.seq[role])return send(ws,{type:'rejected',seq,message:'Повторная команда'});
        r.seq[role]=seq;
        if(!r.peers.host||!r.peers.guest)return send(ws,{type:'rejected',seq,message:'Второй игрок отключён'});
        if(!command||typeof command!=='object'||JSON.stringify(command).length>4000)return send(ws,{type:'rejected',seq,message:'Неверная команда'});
        if(!r.state||r.busy||role!==(r.counter||r.turn)||d.revision!==r.revision)return send(ws,{type:'rejected',seq,message:'Не твой ход или состояние изменилось'});
        r.busy=true;send(r.peers.host,{type:'command',role,seq,revision:r.revision,command})
      }else if(d.type==='ack'&&role==='host'){
        if(['host','guest'].includes(d.role))send(r.peers[d.role],{type:'ack',seq:d.seq,ok:!!d.ok,message:String(d.message||'').slice(0,200)})
      }else if(d.type==='reset'&&role==='host'){
        r.state=null;r.checkpoint=null;r.ready={};r.turn='host';r.counter=null;r.busy=false;r.revision++;
        send(r.peers.host,{type:'reset',revision:r.revision});send(r.peers.guest,{type:'reset',revision:r.revision});announce(r)
      }else if(d.type==='ping')send(ws,{type:'pong'})
    });
    ws.on('close',()=>{if(r.peers[role]===ws){r.peers[role]=null;announce(r)}});
  })
});
setInterval(clean,60000).unref();
server.listen(PORT,'0.0.0.0',()=>console.log('Shinobi Arena online host listening on',PORT));
