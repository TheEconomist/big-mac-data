const COLORS = ['#e8452f', '#2274d4', '#e4a72a', '#25866f'];
const DEFAULTS = ['ARG', 'CHE', 'JPN', 'GBR'];
const FLAGS = {ARG:'🇦🇷',CHE:'🇨🇭',JPN:'🇯🇵',GBR:'🇬🇧',USA:'🇺🇸',CAN:'🇨🇦',AUS:'🇦🇺',BRA:'🇧🇷',CHN:'🇨🇳',IND:'🇮🇳',MEX:'🇲🇽',ZAF:'🇿🇦',SWE:'🇸🇪',NOR:'🇳🇴',DNK:'🇩🇰',POL:'🇵🇱',TUR:'🇹🇷',KOR:'🇰🇷'};
const state = { rows: [], countries: [], dates: [], selected: [...DEFAULTS], base: 'USD', type: 'raw', dateIndex: 0 };
const $ = id => document.getElementById(id);

function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/); const headers = lines.shift().split(',');
  return lines.map(line => { const cells=[]; let value='', quoted=false; for(let i=0;i<line.length;i++){const c=line[i];if(c==='"'){if(quoted&&line[i+1]==='"'){value+='"';i++;}else {quoted=!quoted;}}else if(c===','&&!quoted){cells.push(value);value='';}else {value+=c;}}cells.push(value);return Object.fromEntries(headers.map((h,i)=>[h,cells[i]])); });
}
function prettyDate(raw, short=false){const d=new Date(raw+'T00:00:00Z');return new Intl.DateTimeFormat('en-US',short?{month:'short',year:'numeric',timeZone:'UTC'}:{month:'long',year:'numeric',timeZone:'UTC'}).format(d);}
function valueFor(row){const v=row[`${state.base}_${state.type}`];return v===''?null:Number(v)*100;}
function countryRows(code){return state.rows.filter(r=>r.iso_a3===code).sort((a,b)=>a.date.localeCompare(b.date));}

function buildPicker(){
  const popular=['ARG','AUS','BRA','CAN','CHE','CHN','GBR','JPN','MEX','SWE'];
  $('countrySelect').innerHTML=popular.filter(c=>state.countries.some(x=>x.code===c)).map(c=>{const x=state.countries.find(x=>x.code===c);return `<button class="chip ${state.selected.includes(c)?'active':''}" data-code="${c}">${x.name}</button>`;}).join('');
  $('countrySelect').querySelectorAll('button').forEach(btn=>btn.onclick=()=>{const code=btn.dataset.code;if(state.selected.includes(code)){if(state.selected.length===1){return;}state.selected=state.selected.filter(c=>c!==code);}else{if(state.selected.length>=4){state.selected.shift();}state.selected.push(code);}buildPicker();render();});
}
function drawChart(){
  const svg=$('chart'), W=svg.clientWidth||1000,H=svg.clientHeight||360,m={t:12,r:18,b:26,l:45},iw=W-m.l-m.r,ih=H-m.t-m.b;
  const series=state.selected.map(code=>({code,rows:countryRows(code).filter(r=>valueFor(r) !== null)}));
  const vals=series.flatMap(s=>s.rows.map(valueFor)); let lo=Math.min(-20,...vals),hi=Math.max(20,...vals); lo=Math.floor((lo-8)/25)*25;hi=Math.ceil((hi+8)/25)*25;
  const x=d=>m.l+(state.dates.indexOf(d)/(state.dates.length-1))*iw, y=v=>m.t+(hi-v)/(hi-lo)*ih;
  let html=''; const steps=5;
  for(let i=0;i<=steps;i++){const v=lo+(hi-lo)*i/steps;html+=`<line class="grid-line ${Math.abs(v)<.01?'zero-line':''}" x1="${m.l}" y1="${y(v)}" x2="${W-m.r}" y2="${y(v)}"/><text class="axis-text" x="${m.l-8}" y="${y(v)+3}" text-anchor="end">${Math.round(v)}%</text>`;}
  state.dates.filter((_,i)=>i%Math.ceil(state.dates.length/6)===0).forEach(d=>html+=`<text class="axis-text" x="${x(d)}" y="${H-4}" text-anchor="middle">${d.slice(0,4)}</text>`);
  series.forEach((s,i)=>{const pts=s.rows.map(r=>[x(r.date),y(valueFor(r)),r]);const path=pts.map((p,j)=>`${j?'L':'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');html+=`<path class="data-line" stroke="${COLORS[i]}" d="${path}"/>`;const current=s.rows.filter(r=>r.date<=state.dates[state.dateIndex]).at(-1);if(current){html+=`<circle class="data-dot" fill="${COLORS[i]}" cx="${x(current.date)}" cy="${y(valueFor(current))}" r="4"/>`;}});
  svg.setAttribute('viewBox',`0 0 ${W} ${H}`);svg.innerHTML=html;
  svg.onmousemove=e=>{const rect=svg.getBoundingClientRect(),mx=(e.clientX-rect.left)/rect.width*W,idx=Math.max(0,Math.min(state.dates.length-1,Math.round((mx-m.l)/iw*(state.dates.length-1)))),date=state.dates[idx];const bits=state.selected.map((c,i)=>{const r=countryRows(c).filter(x=>x.date<=date&&valueFor(x) !== null).at(-1);return r?`<span style="color:${COLORS[i]}">●</span> ${r.name}: <b>${valueFor(r).toFixed(1)}%</b>`:'';}).filter(Boolean);const tip=$('tooltip');tip.innerHTML=`${prettyDate(date)}<br>${bits.join('<br>')}`;tip.hidden=false;tip.style.left=Math.min(rect.width-170,e.clientX-rect.left+12)+'px';tip.style.top=Math.max(4,e.clientY-rect.top-45)+'px';};svg.onmouseleave=()=>{$('tooltip').hidden=true;};
}
function render(){
  $('baseLabel').textContent=state.base;$('snapshotBase').textContent=$('baseSelect').selectedOptions[0].text.split(' · ')[0].toLowerCase();
  $('legend').innerHTML=state.selected.map((code,i)=>`<span><i style="background:${COLORS[i]}"></i>${state.countries.find(c=>c.code===code)?.name||code}</span>`).join('');
  const date=state.dates[state.dateIndex];$('snapshotDate').textContent=prettyDate(date);
  $('cards').innerHTML=state.selected.map(code=>{const rows=countryRows(code),r=rows.filter(x=>x.date<=date&&valueFor(x) !== null).at(-1),v=r?valueFor(r):null;return `<article class="card"><div class="card-top"><span>${r?.name||code}</span><span class="flag">${FLAGS[code]||'●'}</span></div><div class="value ${v>=0?'positive':'negative'}">${v === null?'—':`${v>0?'+':''}${v.toFixed(1)}%`}</div><small>${v === null?'NO DATA':v>=0?'OVERVALUED':'UNDERVALUED'} · ${state.base}</small></article>`;}).join('');
  drawChart();
}
async function init(){
 try{const res=await fetch('output-data/big-mac-full-index.csv');if(!res.ok){throw Error(res.statusText);}state.rows=parseCSV(await res.text());state.dates=[...new Set(state.rows.map(r=>r.date))].sort();state.countries=[...new Map(state.rows.map(r=>[r.iso_a3,{code:r.iso_a3,name:r.name}])).values()].sort((a,b)=>a.name.localeCompare(b.name));state.dateIndex=state.dates.length-1;
 $('dateSlider').max=state.dates.length-1;$('dateSlider').value=state.dateIndex;$('startDate').textContent=prettyDate(state.dates[0],true).toUpperCase();$('endDate').textContent=prettyDate(state.dates.at(-1),true).toUpperCase();$('latestDate').textContent=prettyDate(state.dates.at(-1)).toUpperCase();
 buildPicker();render();}catch(e){document.querySelector('.dashboard').innerHTML='<p class="error">The data could not be loaded. Run a local web server (for example, <b>python3 -m http.server</b>) and refresh.</p>';console.error(e);}}
$('baseSelect').onchange=e=>{state.base=e.target.value;render();};document.querySelectorAll('.segmented button').forEach(b=>b.onclick=()=>{document.querySelector('.segmented .active').classList.remove('active');b.classList.add('active');state.type=b.dataset.type;render();});$('dateSlider').oninput=e=>{state.dateIndex=Number(e.target.value);render();};window.addEventListener('resize',()=>{if(state.rows.length){drawChart();}});init();
