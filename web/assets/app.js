const state = {
  admin: null,
  year: 2569,
  sex: "B",
};

const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
const fmt = new Intl.NumberFormat("th-TH", { maximumFractionDigits: 1 });

function hashInt(text){
  let h=2166136261;
  for(const ch of String(text)){ h ^= ch.charCodeAt(0); h = Math.imul(h,16777619); }
  return Math.abs(h>>>0);
}
function demo(code, key, min, max, decimals=1){
  const n = hashInt(code+"|"+key+"|"+state.year+"|"+state.sex) % 10000;
  const v = min + (n/9999)*(max-min);
  return Number(v.toFixed(decimals));
}
function yearsSeries(code,key,min,max){
  return [2565,2566,2567,2568,2569].map((y,i)=>{
    const base=demo(code,key,min,max,2);
    const wobble=((hashInt(code+key+y)%100)-50)/300;
    return {year:y,value:Number((base+(i-4)*0.16+wobble).toFixed(2))};
  });
}
function forecastSeries(code){
  const obs=yearsSeries(code,"e0",73.8,79.4);
  const last=obs[obs.length-1].value;
  const slope=(obs[4].value-obs[0].value)/4;
  const fut=[1,2,3,4,5].map(h=>({year:2569+h,value:Number((last+slope*h).toFixed(2)),forecast:true}));
  return [...obs,...fut];
}
function sparkline(points){
  const w=540,h=130,p=10;
  const vals=points.map(x=>x.value), min=Math.min(...vals), max=Math.max(...vals);
  const x=i=>p+i*(w-2*p)/(points.length-1||1);
  const y=v=>h-p-(v-min)/(max-min||1)*(h-2*p);
  const line=points.map((d,i)=>`${i?'L':'M'} ${x(i)} ${y(d.value)}`).join(" ");
  const area=`${line} L ${x(points.length-1)} ${h-p} L ${x(0)} ${h-p} Z`;
  return `<svg class="spark" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">
    <line class="spark-grid" x1="0" x2="${w}" y1="${h/2}" y2="${h/2}"/>
    <path class="spark-area" d="${area}"/><path class="spark-line" d="${line}"/>
    ${points.map((d,i)=>`<circle class="spark-dot" cx="${x(i)}" cy="${y(d.value)}" r="3.5"/>`).join("")}
  </svg>`;
}
function kpi(label,value,meta=""){
  return `<div class="card kpi-card"><div class="kpi-accent"></div><div class="kpi-label">${label}</div><div class="kpi-value">${value}</div><div class="kpi-meta">${meta}</div></div>`;
}
function sectionHead(title,desc="",right=""){
  return `<div class="section-head"><div><h2>${title}</h2><p>${desc}</p></div><div>${right}</div></div>`;
}
function provinceByCode(code){return state.admin.provinces.find(p=>p.code===String(code))}
function districtByCode(code){
  for(const p of state.admin.provinces){
    const d=p.districts.find(x=>x.code===String(code));
    if(d) return {province:p,district:d};
  }
  return null;
}
function provinceSelect(current){
  return `<select id="provincePicker">
    ${state.admin.provinces.map(p=>`<option value="${p.code}" ${p.code===current?'selected':''}>${p.name_th}</option>`).join("")}
  </select>`;
}
function setTitle(t){ $("#pageTitle").textContent=t; }

function renderOverview(){
  setTitle("ภาพรวมเขตสุขภาพที่ 1");
  const regionE0=demo("01","e0",75.2,78.2,2);
  const deathRate=demo("01","deathrate",620,900,1);
  const rcode=demo("01","rcode",4.5,12.5,1);
  const coverage=demo("01","coverage",94,99.8,1);

  $("#app").innerHTML = `
    <div class="grid kpi">
      ${kpi("อายุคาดเฉลี่ยเมื่อแรกเกิด (e₀)",regionE0+" ปี","คำนวณจาก Life Table · demo")}
      ${kpi("อัตราตายทุกสาเหตุ",fmt.format(deathRate),"/100,000 ประชากร · demo")}
      ${kpi("R00–R99",rcode+"%","คุณภาพสาเหตุการตาย · demo")}
      ${kpi("ความครบถ้วนชุดข้อมูล",coverage+"%","8 จังหวัด · demo")}
    </div>

    ${sectionHead("8 จังหวัดภาคเหนือตอนบน","คลิกจังหวัดเพื่อ drill-down ถึงระดับอำเภอ",`<span class="badge">${state.admin.totals.districts} อำเภอ</span>`)}
    <div class="province-grid">
      ${state.admin.provinces.map(p=>`
        <a class="province-card" href="#/province/${p.code}">
          <strong>${p.name_th}</strong><small>${p.name_en}</small>
          <div class="metric"><span>${p.district_count} อำเภอ</span><span>e₀ ${demo(p.code,"e0",73.8,79.4,2)} ปี</span></div>
        </a>`).join("")}
    </div>

    ${sectionHead("แนวโน้ม e₀ ระดับเขต","ตัวอย่างหน้าจอสำหรับ trend monitoring")}
    <div class="grid two">
      <div class="card"><h3>e₀ พ.ศ. 2565–2569</h3>${sparkline(yearsSeries("01","e0",75.2,78.2))}</div>
      <div class="card">
        <h3>หลักการอ่าน Dashboard</h3>
        <div class="callout">ตัวเลขต้นแบบนี้เป็น <b>synthetic/demo values</b> เพื่อทดสอบ UX เท่านั้น เมื่อเชื่อม production ETL ทุก card/table ต้องส่งคืน <b>dataset_version + algorithm_version + generated_at</b> เพื่อ audit ย้อนกลับได้</div>
      </div>
    </div>
  `;
}

function renderBenchmark(){
  setTitle("เปรียบเทียบ 8 จังหวัด");
  const rows=state.admin.provinces.map(p=>({
    ...p,
    e0:demo(p.code,"e0",73.8,79.4,2),
    death:demo(p.code,"deathrate",610,960,1),
    r:demo(p.code,"rcode",3.8,15.5,1),
    yll:demo(p.code,"yll",4200,9100,0)
  })).sort((a,b)=>b.e0-a.e0);

  $("#app").innerHTML=`
    <div class="callout warn">Benchmark จะเปิดใช้งานจริงเฉพาะปี/จังหวัดที่ผ่าน data-quality gate เดียวกัน เพื่อหลีกเลี่ยงการเปรียบเทียบคนละ source cutoff หรือคนละ definition</div>
    ${sectionHead("Regional Benchmark","e₀, mortality, YLL และ R-code ในมาตรฐานข้อมูลเดียวกัน")}
    <div class="table-wrap"><table>
      <thead><tr><th>จังหวัด</th><th>อำเภอ</th><th>e₀ (ปี)</th><th>อัตราตาย/100k</th><th>YLL rate</th><th>R00–R99</th><th></th></tr></thead>
      <tbody>${rows.map(p=>`<tr><td><b>${p.name_th}</b></td><td>${p.district_count}</td><td>${p.e0}</td><td>${p.death}</td><td>${fmt.format(p.yll)}</td><td>${p.r}%</td><td><a class="metric-link" href="#/province/${p.code}">ดูจังหวัด →</a></td></tr>`).join("")}</tbody>
    </table></div>
    ${sectionHead("e₀ เปรียบเทียบ","แสดงแบบ bar เพื่อเห็น distribution ไม่ใช้สี traffic-light ตัดสินจังหวัด")}
    <div class="card bar-list">
      ${rows.map(p=>`<div class="bar-row"><span>${p.name_th}</span><div class="bar-track"><div class="bar-fill" style="width:${Math.max(8,(p.e0-72)*12)}%"></div></div><b class="right">${p.e0}</b></div>`).join("")}
    </div>
  `;
}

function renderProvince(code){
  const p=provinceByCode(code)||state.admin.provinces[0];
  setTitle("จังหวัด"+p.name_th);
  const rows=p.districts.map(d=>({
    ...d,
    e0:demo(d.code,"e0",72.8,80.0,2),
    death:demo(d.code,"deathrate",560,1050,1),
    r:demo(d.code,"rcode",2.5,18.0,1),
    complete:demo(d.code,"complete",90,100,1)
  }));

  $("#app").innerHTML=`
    <div class="toolbar"><span class="badge">เลือกจังหวัด</span>${provinceSelect(p.code)}<span class="badge">${p.district_count} อำเภอ · ${p.subdistrict_count} ตำบล</span></div>
    <div class="grid kpi">
      ${kpi("e₀ จังหวัด",demo(p.code,"e0",73.8,79.4,2)+" ปี","demo")}
      ${kpi("อัตราตาย",fmt.format(demo(p.code,"deathrate",610,960,1)),"/100,000 · demo")}
      ${kpi("R00–R99",demo(p.code,"rcode",3.8,15.5,1)+"%","demo")}
      ${kpi("จำนวนอำเภอ",p.district_count,"ครอบคลุมใน prototype")}
    </div>
    ${sectionHead("Drill-down รายอำเภอ","ทุกอำเภอมี route ของตัวเองและพร้อมเชื่อม fact table")}
    <div class="table-wrap"><table>
      <thead><tr><th>อำเภอ</th><th>e₀</th><th>อัตราตาย/100k</th><th>R00–R99</th><th>Completeness</th><th>ตำบล</th><th></th></tr></thead>
      <tbody>${rows.map(d=>`<tr><td><b>${d.name_th}</b><br><span class="muted small">${d.name_en}</span></td><td>${d.e0}</td><td>${d.death}</td><td>${d.r}%</td><td>${d.complete}%</td><td>${d.subdistricts}</td><td><a class="metric-link" href="#/district/${d.code}">ดูอำเภอ →</a></td></tr>`).join("")}</tbody>
    </table></div>
  `;
  $("#provincePicker").addEventListener("change",e=>location.hash="#/province/"+e.target.value);
}

function renderDistrict(code){
  const found=districtByCode(code);
  if(!found){ location.hash="#/overview"; return; }
  const {province:p,district:d}=found;
  setTitle("อำเภอ"+d.name_th+" · "+p.name_th);
  const causes=[
    ["I21","โรคหัวใจขาดเลือด"],["I63","โรคหลอดเลือดสมอง"],["C34","มะเร็งปอด"],["J18","ปอดอักเสบ"],["N18","ไตเรื้อรัง"]
  ].map((x,i)=>({code:x[0],name:x[1],death:Math.round(demo(d.code,x[0],5,44,0)-i)})).sort((a,b)=>b.death-a.death);

  $("#app").innerHTML=`
    <div class="toolbar"><a class="badge" href="#/province/${p.code}">← ${p.name_th}</a><span class="badge">${d.code}</span><span class="badge">${d.subdistricts} ตำบล</span></div>
    <div class="district-hero">
      <div>
        <div class="grid kpi">
          ${kpi("e₀",demo(d.code,"e0",72.8,80.0,2)+" ปี","demo")}
          ${kpi("Mortality",fmt.format(demo(d.code,"deathrate",560,1050,1)),"/100k · demo")}
          ${kpi("R-code",demo(d.code,"rcode",2.5,18,1)+"%","demo")}
          ${kpi("Data completeness",demo(d.code,"complete",90,100,1)+"%","demo")}
        </div>
      </div>
      <div class="card">
        <h3>Administrative profile</h3>
        <p><b>${d.name_th}</b> · ${d.name_en}</p>
        <p class="small muted">DOPA code: ${d.code}<br>ตำบล: ${d.subdistricts}<br>หมู่บ้านใน geography seed: ${d.villages}<br>Centroid: ${d.lat.toFixed(3)}, ${d.lon.toFixed(3)}</p>
      </div>
    </div>
    ${sectionHead("แนวโน้มอายุคาดเฉลี่ย","District view")}
    <div class="grid two">
      <div class="card">${sparkline(yearsSeries(d.code,"e0",72.8,80.0))}</div>
      <div class="card"><h3>Top causes · demo</h3><div class="bar-list">${causes.map(c=>`<div class="bar-row"><span>${c.name}</span><div class="bar-track"><div class="bar-fill" style="width:${Math.min(100,c.death*2.2)}%"></div></div><b class="right">${c.death}</b></div>`).join("")}</div></div>
    </div>
    ${sectionHead("Life Table preview","หน้าจอ production จะเห็น nMx → nqx → lx → Lx → Tx → ex")}
    <div class="table-wrap"><table><thead><tr><th>Age</th><th>nMx</th><th>nax</th><th>nqx</th><th>lx</th><th>ex</th></tr></thead><tbody>
      ${["0","1-4","5-9","20-24","40-44","60-64","80-84","85+"].map((a,i)=>`<tr><td>${a}</td><td>${(0.001+Math.pow(i,2)*0.0012).toFixed(5)}</td><td>${a==="0"?"0.1":a==="1-4"?"0.4":"0.5"}</td><td>${Math.min(.999,0.005+Math.pow(i,2)*.009).toFixed(4)}</td><td>${Math.max(0,100000-i*i*1450).toLocaleString()}</td><td>${Math.max(1,demo(d.code,"e0",72.8,80,2)-i*9.5).toFixed(2)}</td></tr>`).join("")}
    </tbody></table></div>
  `;
}

function renderLifeExpectancy(){
  setTitle("Life Expectancy · e₀ / eₓ");
  const rows=state.admin.provinces.map(p=>({p,e0:demo(p.code,"e0",73.8,79.4,2)})).sort((a,b)=>b.e0-a.e0);
  $("#app").innerHTML=`
    <div class="grid kpi">
      ${kpi("e₀ เขตสุขภาพที่ 1",demo("01","e0",75.2,78.2,2)+" ปี","period life expectancy · demo")}
      ${kpi("ชาย",demo("01","e0M",72.8,76.5,2)+" ปี","demo")}
      ${kpi("หญิง",demo("01","e0F",78.2,82.3,2)+" ปี","demo")}
      ${kpi("Algorithm","life-v1.1","nax 0.1 / 0.4 / 0.5")}
    </div>
    ${sectionHead("Provincial e₀","Both-sex ต้อง pool deaths + population ก่อนคำนวณใหม่")}
    <div class="card bar-list">${rows.map(x=>`<div class="bar-row"><span><a class="metric-link" href="#/province/${x.p.code}">${x.p.name_th}</a></span><div class="bar-track"><div class="bar-fill" style="width:${Math.max(10,(x.e0-72)*13)}%"></div></div><b class="right">${x.e0}</b></div>`).join("")}</div>
    ${sectionHead("Formula chain")}
    <div class="formula">nMx = nDx / nPx
nqx = n·nMx / [1 + n(1-nax)·nMx]
ndx = lx·nqx
nLx = n·[l(x+n) + nax·ndx]
Tx = Σ L(y), y≥x
ex = Tx / lx
e₀ = T₀ / l₀</div>
  `;
}

function renderMortality(){
  setTitle("Mortality & YLL");
  const causes=[
    ["I21","โรคหัวใจขาดเลือด"],["I63","โรคหลอดเลือดสมอง"],["C34","มะเร็งปอด"],["N18","โรคไตเรื้อรัง"],["J18","ปอดอักเสบ"],["E11","เบาหวาน"],["C22","มะเร็งตับ"],["A41","Sepsis"],["J44","COPD"],["R99","Ill-defined"]
  ].map((c,i)=>({code:c[0],name:c[1],deaths:Math.round(demo("01",c[0],120,900,0)-i*15),yll:Math.round(demo("01","yll"+c[0],1800,12500,0))})).sort((a,b)=>b.deaths-a.deaths);
  $("#app").innerHTML=`
    <div class="grid kpi">
      ${kpi("Deaths",fmt.format(demo("01","deaths",19000,26000,0)),"region total · demo")}
      ${kpi("Crude mortality",fmt.format(demo("01","deathrate",620,900,1)),"/100k · demo")}
      ${kpi("Total YLL",fmt.format(demo("01","totalyll",120000,230000,0)),"years · demo")}
      ${kpi("R00–R99",demo("01","rcode",4.5,12.5,1)+"%","quality signal · demo")}
    </div>
    ${sectionHead("Top causes of death","ICD-10 grouping ต้อง versioned")}
    <div class="table-wrap"><table><thead><tr><th>#</th><th>ICD-10</th><th>สาเหตุ</th><th>Deaths</th><th>YLL</th></tr></thead><tbody>
      ${causes.map((c,i)=>`<tr><td>${i+1}</td><td><b>${c.code}</b></td><td>${c.name}</td><td>${fmt.format(c.deaths)}</td><td>${fmt.format(c.yll)}</td></tr>`).join("")}
    </tbody></table></div>
  `;
}

function renderForecast(){
  setTitle("Lee–Carter Forecast");
  const series=forecastSeries("01");
  $("#app").innerHTML=`
    <div class="callout">Forecast pipeline ของระบบจริง: <b>age-specific mortality → Lee–Carter fit → kₜ forecast → future mₓ,t → Life Table → e₀ forecast</b> ไม่ forecast e₀ โดยตรง</div>
    <div class="grid kpi" style="margin-top:16px">
      ${kpi("Fit window","10–20 ปี","กำหนดหลัง backtest")}
      ${kpi("Zero-cell policy","CONFIG","ต้อง versioned")}
      ${kpi("Forecast horizon","5 ปี","prototype")}
      ${kpi("Model status","RESEARCH","ยังไม่ใช้ค่าทางการ")}
    </div>
    ${sectionHead("Observed + Forecast e₀","เส้นหลัง พ.ศ. 2569 เป็นตัวอย่าง")}
    <div class="card">${sparkline(series)}</div>
    ${sectionHead("Model audit panel")}
    <div class="grid three">
      <div class="card"><h3>Input</h3><p class="small muted">Deaths[x,t], Population[x,t]<br>same age dictionary<br>same geography rule</p></div>
      <div class="card"><h3>Parameters</h3><p class="small muted">aₓ · bₓ · kₜ<br>drift · innovation variance<br>model version</p></div>
      <div class="card"><h3>Validation</h3><p class="small muted">backtest error<br>sparse-cell sensitivity<br>observed vs fitted</p></div>
    </div>
  `;
}

function renderQuality(){
  setTitle("Data Quality Console");
  const rows=state.admin.provinces.map(p=>({
    p,
    complete:demo(p.code,"complete",91,100,1),
    r:demo(p.code,"rcode",3.8,15.5,1),
    zero:Math.round(demo(p.code,"zero",0,24,0)),
    status:demo(p.code,"quality",0,1,2)>.25?"PASS":"REVIEW"
  }));
  $("#app").innerHTML=`
    <div class="grid kpi">
      ${kpi("จังหวัดที่พร้อม publish",rows.filter(x=>x.status==="PASS").length+"/8","demo gate")}
      ${kpi("Completeness median",demo("01","complete",95,99.8,1)+"%","demo")}
      ${kpi("R-code median",demo("01","rcode",4.5,12.5,1)+"%","demo")}
      ${kpi("Model warning","Sparse cells","โดยเฉพาะ small-area")}
    </div>
    ${sectionHead("Publication gate","Hard fail + warning แยกกัน")}
    <div class="table-wrap"><table><thead><tr><th>จังหวัด</th><th>Completeness</th><th>R00–R99</th><th>Zero cells</th><th>Status</th></tr></thead><tbody>
      ${rows.map(x=>`<tr><td><b>${x.p.name_th}</b></td><td>${x.complete}%</td><td>${x.r}%</td><td>${x.zero}</td><td><span class="status-dot ${x.status==="PASS"?"":"warn"}"></span>${x.status}</td></tr>`).join("")}
    </tbody></table></div>
    <div class="callout warn" style="margin-top:16px">ระดับอำเภอไม่ควรแสดง forecast หรือ ranking แบบอัตโนมัติเมื่อจำนวนตายต่ำเกินเกณฑ์ ควรมี suppression / pooling / smoothing rule ที่อนุมัติโดยทีมระบาดวิทยาก่อน production</div>
  `;
}

function renderPriority(){
  setTitle("WHO-derived Priority Setting");
  const criteria=["ขนาดปัญหา","ความรุนแรง","ศักยภาพการระบาด","ผลกระทบสังคม/เศรษฐกิจ","ความเป็นไปได้ในการจัดการ","โอกาสเกิด health gain","การรับรู้ของประชาชน"];
  const diseases=["Stroke","IHD","Road traffic injury","Lung cancer","CKD"].map((d,i)=>({name:d,score:Math.round(demo(d,"score",19,33,0)-i*.4)})).sort((a,b)=>b.score-a.score);
  $("#app").innerHTML=`
    <div class="callout">คะแนนช่วยจัดโครงสร้างการตัดสินใจ แต่ <b>computed rank ไม่ใช่ final policy decision</b> — ต้องเก็บ final_consensus_rank และเหตุผลของคณะกรรมการแยกกัน</div>
    ${sectionHead("7 criteria","คะแนน 1–5 ต่อ criterion; สูงสุด 35 ต่อผู้ประเมิน")}
    <div class="grid three">${criteria.map((c,i)=>`<div class="card"><span class="badge">C${i+1}</span><h3 style="margin-top:10px">${c}</h3><p class="small muted">1 = ต่ำ / 5 = สูง ตาม rubric ที่กำหนด</p></div>`).join("")}</div>
    ${sectionHead("Priority result · demo")}
    <div class="table-wrap"><table><thead><tr><th>ลำดับคำนวณ</th><th>ปัญหาสุขภาพ</th><th>Mean score</th><th>ขั้นต่อไป</th></tr></thead><tbody>
      ${diseases.map((d,i)=>`<tr><td>${i+1}</td><td><b>${d.name}</b></td><td>${d.score}/35</td><td>Committee review</td></tr>`).join("")}
    </tbody></table></div>
  `;
}

function renderDataFlow(){
  setTitle("Flow of Data");
  $("#app").innerHTML=`
    <div class="callout">เป้าหมายคือให้ทุกตัวเลขที่หน้าเว็บย้อนกลับได้ถึง <b>source file → import batch → dataset version → algorithm version</b></div>
    ${sectionHead("A. Ingestion / Governance")}
    <div class="card flow">
      <div class="flow-box">8 จังหวัด<br>Population / Death</div><div class="flow-arrow">→</div>
      <div class="flow-box">Upload / API</div><div class="flow-arrow">→</div>
      <div class="flow-box">SHA-256<br>Raw Archive</div><div class="flow-arrow">→</div>
      <div class="flow-box">Normalize</div><div class="flow-arrow">→</div>
      <div class="flow-box">Validate</div><div class="flow-arrow">→</div>
      <div class="flow-box">Approve</div><div class="flow-arrow">→</div>
      <div class="flow-box">Dataset Version</div>
    </div>

    ${sectionHead("B. Analytical engine")}
    <div class="card flow">
      <div class="flow-box">Population Fact</div><div class="flow-arrow">+</div>
      <div class="flow-box">Death Fact</div><div class="flow-arrow">→</div>
      <div class="flow-box">nMx</div><div class="flow-arrow">→</div>
      <div class="flow-box">Life Table</div><div class="flow-arrow">→</div>
      <div class="flow-box">e₀ / eₓ</div>
    </div>
    <div class="card flow" style="margin-top:12px">
      <div class="flow-box">Age-specific mₓ,t</div><div class="flow-arrow">→</div>
      <div class="flow-box">Lee–Carter</div><div class="flow-arrow">→</div>
      <div class="flow-box">Future mₓ,t</div><div class="flow-arrow">→</div>
      <div class="flow-box">Future Life Table</div><div class="flow-arrow">→</div>
      <div class="flow-box">Forecast e₀</div>
    </div>

    ${sectionHead("C. Publishing")}
    <div class="card flow">
      <div class="flow-box">Analytical Mart</div><div class="flow-arrow">→</div>
      <div class="flow-box">API v1</div><div class="flow-arrow">→</div>
      <div class="flow-box">Regional Dashboard</div><div class="flow-arrow">→</div>
      <div class="flow-box">Province</div><div class="flow-arrow">→</div>
      <div class="flow-box">District</div>
    </div>
  `;
}

function renderDataManagement(){
  setTitle("Data Management");
  $("#app").innerHTML=`
    <div class="grid kpi">
      ${kpi("Upload state","VALIDATED","prototype")}
      ${kpi("Dataset version","2025-R1-v0","example")}
      ${kpi("Province coverage","8 / 8","target")}
      ${kpi("Audit","ENABLED","checksum + actor")}
    </div>
    ${sectionHead("Production workflow","แยก Upload ออกจาก Publish")}
    <div class="card flow">
      <div class="flow-box">RECEIVED</div><div class="flow-arrow">→</div>
      <div class="flow-box">HASHED</div><div class="flow-arrow">→</div>
      <div class="flow-box">NORMALIZED</div><div class="flow-arrow">→</div>
      <div class="flow-box">VALIDATED</div><div class="flow-arrow">→</div>
      <div class="flow-box">RECONCILED</div><div class="flow-arrow">→</div>
      <div class="flow-box">APPROVED</div><div class="flow-arrow">→</div>
      <div class="flow-box">PUBLISHED</div>
    </div>
    ${sectionHead("Role model")}
    <div class="grid three">
      <div class="card"><h3>Province Data Manager</h3><p class="small muted">upload · correct · review validation</p></div>
      <div class="card"><h3>Region Analyst</h3><p class="small muted">reconcile · model · QA · compare</p></div>
      <div class="card"><h3>Regional Approver</h3><p class="small muted">approve/publish · method governance</p></div>
    </div>
  `;
}

function renderMethodology(){
  setTitle("Methodology & Versioning");
  $("#app").innerHTML=`
    <div class="grid two">
      <div class="card"><h2>Abridged Life Table</h2><div class="formula">Age groups:
0, 1–4, 5–9 ... 80–84, 85+

nax:
0 → 0.1
1–4 → 0.4
5–84 → 0.5
85+ → open interval

q85+ = 1
L85+ = l85 / M85</div></div>
      <div class="card"><h2>Lee–Carter</h2><div class="formula">log(mₓ,t) = aₓ + bₓkₜ + εₓ,t

Σ bₓ = 1
Σ kₜ = 0

k̂[T+h] = k[T] + h·drift
m̂ₓ,T+h = exp(aₓ + bₓk̂[T+h])</div></div>
    </div>
    ${sectionHead("Method version registry")}
    <div class="table-wrap"><table><thead><tr><th>Component</th><th>Prototype version</th><th>Must version when changed</th></tr></thead><tbody>
      <tr><td>Age dictionary</td><td>age-v1</td><td>age bands / terminal interval</td></tr>
      <tr><td>Life Table</td><td>life-v1.1</td><td>nax / closure / radix</td></tr>
      <tr><td>Cause mapping</td><td>cause-v1</td><td>ICD grouping</td></tr>
      <tr><td>Lee–Carter</td><td>lc-research-v1</td><td>zero policy / fit / adjustment / CI</td></tr>
      <tr><td>Priority</td><td>priority-v1</td><td>rubric / criteria / aggregation</td></tr>
    </tbody></table></div>
  `;
}

function renderSitemap(){
  setTitle("Site Map");
  $("#app").innerHTML=`
    <div class="route-tree">HR1 Health Intelligence
├── /overview
│   ├── regional KPIs
│   ├── province cards
│   └── regional trend
├── /benchmark
│   └── 8-province comparison
├── /province/:provinceCode
│   ├── province KPIs
│   └── district table
├── /district/:districtCode
│   ├── district KPIs
│   ├── mortality
│   ├── life-table preview
│   └── data quality
├── /life-expectancy
│   ├── e₀
│   └── eₓ / life-table
├── /mortality
│   ├── annual mortality
│   ├── top causes
│   └── YLL
├── /forecast
│   └── Lee–Carter + diagnostics
├── /quality
│   ├── completeness
│   ├── R00–R99
│   └── publication gate
├── /priority
│   └── WHO-derived 7-criterion workflow
├── /data-flow
├── /data-management
│   ├── imports
│   ├── validation
│   ├── approval
│   └── dataset versions
├── /methodology
└── /sitemap</div>
    ${sectionHead("Geographic drill-down")}
    <div class="card flow">
      <div class="flow-box">เขตสุขภาพที่ 1</div><div class="flow-arrow">→</div>
      <div class="flow-box">8 จังหวัด</div><div class="flow-arrow">→</div>
      <div class="flow-box">103 อำเภอ</div><div class="flow-arrow">→</div>
      <div class="flow-box">759 ตำบล (geography seed)</div>
    </div>
  `;
}

function route(){
  const raw=(location.hash||"#/overview").replace(/^#\//,"");
  const [page,id]=raw.split("/");
  $$("#nav a").forEach(a=>a.classList.toggle("active",a.dataset.route===page || (page==="district"&&a.dataset.route==="province")));
  switch(page){
    case "overview": return renderOverview();
    case "benchmark": return renderBenchmark();
    case "province": return renderProvince(id);
    case "district": return renderDistrict(id);
    case "life-expectancy": return renderLifeExpectancy();
    case "mortality": return renderMortality();
    case "forecast": return renderForecast();
    case "quality": return renderQuality();
    case "priority": return renderPriority();
    case "data-flow": return renderDataFlow();
    case "data-management": return renderDataManagement();
    case "methodology": return renderMethodology();
    case "sitemap": return renderSitemap();
    default: location.hash="#/overview";
  }
  document.querySelector(".sidebar")?.classList.remove("open");
}

async function init(){
  state.admin = await fetch("./data/hr1-admin.json").then(r=>r.json());
  $("#yearSelect").addEventListener("change",e=>{state.year=Number(e.target.value);route()});
  $("#sexSelect").addEventListener("change",e=>{state.sex=e.target.value;route()});
  $("#menuBtn").addEventListener("click",()=>$(".sidebar").classList.toggle("open"));
  window.addEventListener("hashchange",route);
  route();
}
init().catch(err=>{
  $("#app").innerHTML=`<div class="callout warn">โหลด geography data ไม่สำเร็จ: ${err.message}</div>`;
});
