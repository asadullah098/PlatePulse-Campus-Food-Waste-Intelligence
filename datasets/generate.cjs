// Reproducible synthetic test fixtures for the PlatePulse application.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const {parseCSV, aggregate} = require('../analytics');
const out = __dirname;
let seed = 20261021;
const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
const venues = ['North Commons','The Green Bowl','Hostel Kitchen','Central Canteen','Library Café'];
const meals = ['Breakfast','Lunch','Dinner'];
const header = 'date,venue,meal,served_kg,waste_kg';
const rows = [];
for (let day=1;day<=30;day++) {
  const date = `2026-10-${String(day).padStart(2,'0')}`;
  const weekday = new Date(date+'T12:00:00Z').getUTCDay();
  const demand = (weekday===0||weekday===6?0.83:1.08)*(1+0.10*Math.sin(day*0.65));
  for(let v=0;v<5;v++) for(let m=0;m<3;m++) for(let i=0;i<80;i++) {
    const served = +((0.32+random()*0.32)*[1.06,0.9,1.18,1.12,0.72][v]*[0.77,1.24,1.03][m]*demand).toFixed(3);
    let rate = [0.15,0.065,0.25,0.18,0.09][v]+[0.015,0.025,0.04][m]+(random()-0.5)*0.055;
    if(day>=21) rate*=0.72; // Simulated smaller-batch intervention.
    if(day===18) rate+=0.28; // Simulated attendance shock, campus-wide.
    if(day===26&&v===2&&m===2) rate+=0.35; // Local dinner planning failure.
    rows.push([date,venues[v],meals[m],served.toFixed(3),(served*rate).toFixed(3)].join(','));
  }
}
const write=(name,lines)=>fs.writeFileSync(path.join(out,name),header+'\n'+lines.join('\n')+'\n','utf8');
write('presentation-data.csv',rows);
write('quick-check.csv',[
  '2026-10-01,Central Canteen,Lunch,10,2',
  '2026-10-02,Central Canteen,Lunch,20,3',
  '2026-10-02,Hostel Kitchen,Dinner,30,9',
  '2026-10-03,Hostel Kitchen,Dinner,40,6'
]);
write('valid-boundaries.csv',[
  '2026-10-01,Zero Waste Venue,Breakfast,1,0',
  '2026-10-02,Full Waste Venue,Dinner,1,1',
  '2026-10-03,Small Portion Venue,Lunch,0.001,0.001'
]);
write('invalid-waste.csv',['2026-10-01,Central Canteen,Lunch,0.5,0.8']);
const data=parseCSV(fs.readFileSync(path.join(out,'presentation-data.csv'),'utf8'));
const a=aggregate(data);
assert.equal(data.length,36000);
assert.equal(a.venues[0].name,'Hostel Kitchen');
assert.ok(a.anomalies.some(r=>r.name==='2026-10-18'));
const hostel=aggregate(data,{venue:'Hostel Kitchen',meal:'Dinner'});
assert.ok(hostel.anomalies.some(r=>r.name==='2026-10-26'));
const quick=aggregate(parseCSV(fs.readFileSync(path.join(out,'quick-check.csv'),'utf8')));
assert.equal(quick.served,100);assert.equal(quick.waste,20);assert.equal(quick.rate,20);assert.equal(quick.forecast,230/6);
assert.equal(parseCSV(fs.readFileSync(path.join(out,'valid-boundaries.csv'),'utf8')).length,3);
assert.throws(()=>parseCSV(fs.readFileSync(path.join(out,'invalid-waste.csv'),'utf8')));
const summary = {
  source:'Synthetic test data; not real campus observations',rows:a.count,dateRange:a.dateRange,
  servedKg:a.served,wasteKg:a.waste,wasteRatePercent:a.rate,nextDayForecastKg:a.forecast,
  wasteRanking:a.venues.map(v=>({venue:v.name,wasteKg:v.waste,wasteRatePercent:v.waste/v.served*100})),
  anomalyDates:a.anomalies.map(r=>r.name),hostelDinnerAnomalyDates:hostel.anomalies.map(r=>r.name),
  savingsAt20PercentKg:a.waste*0.2,
  first20DaysWasteRate:aggregate(data.filter(r=>r.date<='2026-10-20')).rate,
  last10DaysWasteRate:aggregate(data.filter(r=>r.date>='2026-10-21')).rate
};
fs.writeFileSync(path.join(out,'expected-results.json'),JSON.stringify(summary,null,2)+'\n');
console.log(JSON.stringify(summary,null,2));
console.log('Verified all four datasets against the application parser and analytics.');
