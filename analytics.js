const venues = ['North Commons', 'The Green Bowl', 'Hostel Kitchen', 'Central Canteen', 'Library Café'];
function generate(count=120000) {
  let seed=731; const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  return Array.from({length:count},(_,i)=>{
    const day=i%30, venue=venues[Math.floor(random()*5)], meal=['Breakfast','Lunch','Dinner'][Math.floor(random()*3)];
    const served=+(0.25+random()*0.5).toFixed(3);
    return {date:`2026-10-${String(day+1).padStart(2,'0')}`,venue,meal,served_kg:served,waste_kg:+(served*(0.04+random()*(venue==='Hostel Kitchen'?0.46:0.26))*(1-day/100)).toFixed(3)};
  });
}
function aggregate(rows,{days=30,venue='All venues',meal='All meals'}={}) {
  const dates=[...new Set(rows.map(r=>r.date))].sort().slice(-days);
  const allowed=new Set(dates), daily=new Map(), groups=new Map();
  let served=0,waste=0,count=0;const started=performance.now();
  for(const r of rows){
    if(!allowed.has(r.date)||(venue!=='All venues'&&r.venue!==venue)||(meal!=='All meals'&&r.meal!==meal))continue;
    served+=r.served_kg;waste+=r.waste_kg;count++;
    for(const [map,key] of [[daily,r.date],[groups,r.venue]]){const a=map.get(key)||{name:key,served:0,waste:0,count:0};a.served+=r.served_kg;a.waste+=r.waste_kg;a.count++;map.set(key,a);}
  }
  const trend=[...daily.values()].sort((a,b)=>a.name.localeCompare(b.name));
  const tail=trend.slice(-7);const forecast=tail.length?tail.reduce((s,r,i)=>s+r.served*(i+1),0)/(tail.length*(tail.length+1)/2):0;
  const rates=trend.map(r=>r.served?r.waste/r.served:0),mean=rates.reduce((a,b)=>a+b,0)/(rates.length||1),sd=Math.sqrt(rates.reduce((a,b)=>a+(b-mean)**2,0)/(rates.length||1));
  return {count,served,waste,rate:served?waste/served*100:0,forecast,processingMs:performance.now()-started,trend,venues:[...groups.values()].sort((a,b)=>b.waste-a.waste),anomalies:trend.filter((r,i)=>sd>0&&(rates[i]-mean)/sd>1.5).map(r=>({...r,zScore:(r.waste/r.served-mean)/sd})),sourceRows:rows.length,venueOptions:[...new Set(rows.map(r=>r.venue))],dateRange:dates.length?`${dates[0]} — ${dates.at(-1)}`:'No matching dates'};
}
function parseCSV(text){
  const lines=text.replace(/^\uFEFF/,'').trim().split(/\r?\n/);const header=lines.shift()?.split(',').map(s=>s.trim());
  const expected=['date','venue','meal','served_kg','waste_kg'];
  if(!expected.every(k=>header.includes(k)))throw Error('Required columns: '+expected.join(', '));
  if(!lines.length)throw Error('CSV contains no records.');
  return lines.map((line,i)=>{const parts=line.split(',');if(parts.length!==header.length)throw Error(`Row ${i+2}: use simple comma-separated fields without embedded commas.`);const r=Object.fromEntries(header.map((h,j)=>[h,parts[j]?.trim()]));r.served_kg=Number(r.served_kg);r.waste_kg=Number(r.waste_kg);if(!/^\d{4}-\d{2}-\d{2}$/.test(r.date)||!Number.isFinite(Date.parse(r.date))||new Date(r.date).toISOString().slice(0,10)!==r.date||!r.venue||!['Breakfast','Lunch','Dinner'].includes(r.meal)||!Number.isFinite(r.served_kg)||r.served_kg<=0||!Number.isFinite(r.waste_kg)||r.waste_kg<0||r.waste_kg>r.served_kg)throw Error(`Row ${i+2}: invalid date, venue, meal, or weights. Waste must be between 0 and served weight.`);return r;});
}
module.exports={generate,aggregate,parseCSV};
