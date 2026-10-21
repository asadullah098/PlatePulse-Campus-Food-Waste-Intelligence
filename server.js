const http=require('node:http');const fs=require('node:fs');const path=require('node:path');const {generate,aggregate,parseCSV}=require('./analytics');
let rows=generate(),source='Synthetic dataset';
const server=http.createServer(async(req,res)=>{
  const url=new URL(req.url,'http://localhost');
  const json=(data,status=200)=>{res.writeHead(status,{'Content-Type':'application/json'});res.end(JSON.stringify(data));};
  try{
    if(url.pathname==='/api/analytics'){const days=Number(url.searchParams.get('days')||30);return json({...aggregate(rows,{days:[7,14,30].includes(days)?days:30,venue:url.searchParams.get('venue')||'All venues',meal:url.searchParams.get('meal')||'All meals'}),source});}
    if(req.method==='POST'&&url.pathname==='/api/import'){let body='';for await(const chunk of req){body+=chunk;if(Buffer.byteLength(body)>15e6)return json({error:'Maximum CSV size is 15 MB.'},413);}const parsed=parseCSV(body);rows=parsed;source='Imported CSV';return json({count:rows.length});}
    if(req.method==='POST'&&url.pathname==='/api/reset'){rows=generate();source='Synthetic dataset';return json({ok:true});}
    if(url.pathname==='/api/export'){res.writeHead(200,{'Content-Type':'text/csv','Content-Disposition':'attachment; filename="platepulse-data.csv"'});res.write('date,venue,meal,served_kg,waste_kg\n');for(let i=0;i<rows.length;i+=2000)res.write(rows.slice(i,i+2000).map(r=>[r.date,r.venue,r.meal,r.served_kg,r.waste_kg].join(',')).join('\n')+'\n');return res.end();}
    const files={'/':'index.html','/app.js':'app.js','/styles.css':'styles.css'};const file=files[url.pathname];if(!file){res.writeHead(404);return res.end('Not found');}res.writeHead(200,{'Content-Type':file.endsWith('.css')?'text/css':file.endsWith('.js')?'text/javascript':'text/html'});res.end(fs.readFileSync(path.join(__dirname,'public',file)));
  }catch(e){json({error:e.message},400);}
});server.listen(process.env.PORT||3000,'127.0.0.1',()=>console.log('PlatePulse running at http://localhost:'+(process.env.PORT||3000)));
