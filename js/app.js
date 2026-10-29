/* Prototipo académico de simuladores financieros. No constituye una herramienta oficial de Banco FIE. */
(() => {
  "use strict";
  const $ = id => document.getElementById(id);
  const money = n => new Intl.NumberFormat("es-BO",{style:"currency",currency:"BOB",minimumFractionDigits:2,maximumFractionDigits:2}).format(Number.isFinite(n)?n:0).replace("BOB","Bs");
  const number = n => new Intl.NumberFormat("es-BO",{maximumFractionDigits:2}).format(Number.isFinite(n)?n:0);
  const round = n => Math.round((n + Number.EPSILON) * 100) / 100;
  const isoToday = () => { const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; };
  const addMonths = (date, months) => { const d=new Date(`${date}T12:00:00`); const day=d.getDate(); d.setDate(1); d.setMonth(d.getMonth()+months); const last=new Date(d.getFullYear(),d.getMonth()+1,0).getDate(); d.setDate(Math.min(day,last)); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; };
  const prettyDate = s => s ? new Intl.DateTimeFormat("es-BO",{year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date(`${s}T12:00:00`)) : "—";
  const safeText = s => String(s ?? "").replace(/[&<>"']/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  let latestPlan = null, latestCapacity = null, planDonut = null, balanceChart = null, capacityChart = null, scenarioChart = null;
  const savedKey = "fieDemoSavedV1", settingsKey = "fieDemoSettingsV1";
  const defaults = {rate:18,limit:30,name:"Parámetros demostrativos",source:"Valores ficticios para demostración académica; no son tarifas oficiales."};
  const loadJSON = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
  let settings = loadJSON(settingsKey, defaults);
  function toast(message){ const el=$("toast"); el.textContent=message; el.classList.add("show"); clearTimeout(toast.timer); toast.timer=setTimeout(()=>el.classList.remove("show"),2600); }
  function go(view){ document.querySelectorAll(".view").forEach(el=>el.classList.toggle("active",el.id===`view-${view}`)); document.querySelectorAll(".nav-btn").forEach(el=>el.classList.toggle("active",el.dataset.view===view)); $("mainNav").classList.remove("open"); $("menuToggle").setAttribute("aria-expanded","false"); window.scrollTo({top:0,behavior:"smooth"}); if(view==="saved") renderSaved(); if(view==="settings") fillSettings(); }
  document.querySelectorAll("[data-view]").forEach(b=>b.addEventListener("click",()=>go(b.dataset.view)));
  document.querySelectorAll("[data-go]").forEach(b=>b.addEventListener("click",()=>go(b.dataset.go)));
  $("menuToggle").addEventListener("click",()=>{const n=$("mainNav").classList.toggle("open");$("menuToggle").setAttribute("aria-expanded",String(n));});
  $("year").textContent=new Date().getFullYear();
  $("startDate").value=isoToday(); $("firstDueDate").value=addMonths(isoToday(),1);
  $("startDate").addEventListener("change",()=>{ if($("firstDueDate").value < $("startDate").value) $("firstDueDate").value=addMonths($("startDate").value,1); });
  $("method").addEventListener("change",()=> $("balloonField").classList.toggle("hidden",$("method").value!=="balloon"));
  $("profile").addEventListener("change",()=>{const biz=$("profile").value==="business";$("incomeLabel").firstChild.textContent=biz?"Ingresos mensuales del negocio (Bs)":"Ingresos mensuales netos (Bs)";$("expenseLabel").firstChild.textContent=biz?"Costos y gastos operativos mensuales (Bs)":"Gastos mensuales del hogar (Bs)";});
  function val(id){return Number($(id).value);}
  function validNonNegative(ids, errorEl){for(const id of ids){const el=$(id),v=Number(el.value);if(el.value.trim()===""||!Number.isFinite(v)||v<Number(el.min||0)|| (el.max!==""&&v>Number(el.max))){errorEl.textContent=`Revisa el campo "${el.closest("label")?.childNodes[0]?.textContent?.trim()||id}": introduce un valor válido dentro del rango permitido.`;el.focus();return false;}}errorEl.textContent="";return true;}
  function annuityPayment(balance, rate, n){if(n<=0)return 0;if(Math.abs(rate)<1e-12)return balance/n;const pow=Math.pow(1+rate,n);return balance*rate*pow/(pow-1);}
  function computePlan(input){
    const {principal,annualRate,treRate=0,months,frequency,method,startDate,firstDueDate,feePerPayment,upfrontCosts,balloonPercent,extraAmount,extraAt,extraMode,desgravamenRate=0,desgravamenBase="balance",cesantiaRate=0,cesantiaBase="balance",otherInsurance=0}=input;
    const effectiveAnnualRate=annualRate+treRate;
    const periods=Math.ceil(months/frequency), periodRate=effectiveAnnualRate/100*frequency/12;
    const rows=[];let balance=principal, interestTotal=0, capitalTotal=0, feeTotal=0, extraTotal=0, insuranceTotal=0, desgravamenTotal=0, cesantiaTotal=0, otherInsuranceTotal=0, paymentBase=0, extraApplied=false;
    const balloon=method==="balloon"?principal*balloonPercent/100:0;
    const amortizable=method==="balloon"?principal-balloon:principal;
    paymentBase=method==="french"?annuityPayment(principal,periodRate,periods):method==="german"?amortizable/periods:method==="balloon"?annuityPayment(amortizable,periodRate,periods):0;
    for(let i=1;i<=periods;i++){
      if(balance<0.005) balance=0;
      const opening=balance;
      const interest=round(opening*periodRate);
      let capital=0, financialPayment=0;
      if(method==="french"){
        financialPayment=round(annuityPayment(principal,periodRate,periods));
        capital=round(Math.min(opening,financialPayment-interest));
        if(i===periods) capital=opening;
        financialPayment=round(capital+interest);
      } else if(method==="german"){
        capital=round(Math.min(opening,amortizable/periods));
        if(i===periods) capital=opening;
        financialPayment=round(capital+interest);
      } else if(method==="american"){
        capital=i===periods?opening:0;
        financialPayment=round(capital+interest);
      } else {
        const targetBalloon=Math.min(balloon,principal);
        const capitalTarget=i===periods?opening:Math.min(opening, amortizable/periods);
        capital=round(capitalTarget);
        if(i===periods) capital=opening;
        financialPayment=round(capital+interest);
      }
      let extra=0;
      if(extraAmount>0 && i===Math.min(extraAt,periods) && !extraApplied){
        extra=Math.min(extraAmount,Math.max(0,opening-capital));
        extraApplied=true;
      }
      let closing=round(Math.max(0,opening-capital-extra));
      // A balloon is a planned final principal balance: amortize the non-balloon portion, then settle remaining balance.
      const fee=round(feePerPayment);
      const desgravamenBasis=desgravamenBase==="principal"?principal:opening;
      const cesantiaBasis=cesantiaBase==="principal"?principal:opening;
      const desgravamen=round(desgravamenBasis*desgravamenRate/1000*frequency);
      const cesantia=round(cesantiaBasis*cesantiaRate/1000*frequency);
      const otherIns=round(otherInsurance);
      const insurance=round(desgravamen+cesantia+otherIns);
      const total=round(financialPayment+fee+insurance);
      rows.push({period:i,date:addMonths(firstDueDate,(i-1)*frequency),opening,capital,interest,fee,desgravamen,cesantia,otherInsurance:otherIns,insurance,total,extra,closing});
      balance=closing; interestTotal+=interest;capitalTotal+=capital;feeTotal+=fee;extraTotal+=extra;insuranceTotal+=insurance;desgravamenTotal+=desgravamen;cesantiaTotal+=cesantia;otherInsuranceTotal+=otherIns;
      if(balance<=0.005 && i<periods && method!=="american" && method!=="balloon") break;
      // Abono simplificado: no recalcula la cuota base; reduce el saldo y puede liquidar antes.
      if(extra>0 && balance<=0.005) break;
    }
    // Para francés/alemán/balloon el saldo final se ajusta por redondeo; si queda residual, se incorpora a la última cuota.
    if(rows.length && balance>0.005 && method!=="american"){
      const last=rows[rows.length-1]; last.capital=round(last.capital+balance);last.total=round(last.total+balance);last.closing=0;capitalTotal+=balance;balance=0;
    }
    const paid=round(rows.reduce((s,r)=>s+r.total+r.extra,0)+upfrontCosts);
    const totalInterest=round(interestTotal);
    return {input,rows,periodRate,effectiveAnnualRate,periods:rows.length,paymentBase:round(paymentBase),capitalTotal:round(capitalTotal),interestTotal:totalInterest,feeTotal:round(feeTotal),insuranceTotal:round(insuranceTotal),desgravamenTotal:round(desgravamenTotal),cesantiaTotal:round(cesantiaTotal),otherInsuranceTotal:round(otherInsuranceTotal),extraTotal:round(extraTotal),upfrontCosts,paid,totalCost:round(paid-principal),finalBalance:balance,method};
  }
  function readPlan(){
    return {label:$("planLabel").value.trim()||"Simulación de plan de pagos",principal:val("principal"),annualRate:val("annualRate"),treRate:val("treRate"),months:val("months"),frequency:val("frequency"),method:$("method").value,startDate:$("startDate").value,firstDueDate:$("firstDueDate").value,feePerPayment:val("feePerPayment"),upfrontCosts:val("upfrontCosts"),balloonPercent:val("balloonPercent"),extraAmount:val("extraAmount"),extraAt:val("extraAt"),extraMode:$("extraMode").value,desgravamenRate:val("desgravamenRate"),desgravamenBase:$("desgravamenBase").value,cesantiaRate:val("cesantiaRate"),cesantiaBase:$("cesantiaBase").value,otherInsurance:val("otherInsurance")};
  }
  const methodName = m=>({french:"Francés",german:"Alemán",american:"Americano",balloon:"Balloon"}[m]||m);
  function metric(label,value,sub=""){return `<div class="metric-card"><span class="metric-label">${label}</span><strong>${value}</strong><small>${sub}</small></div>`;}
  function renderPlan(result){
    latestPlan=result;$("planResults").classList.remove("hidden");$("planResultTitle").textContent=result.input.label;$("planResultSub").textContent=`Sistema ${methodName(result.method)} · ${result.input.months} meses solicitados · frecuencia ${result.input.frequency===1?"mensual":`cada ${result.input.frequency} meses`}`;
    $("planMetrics").innerHTML=metric("Primera cuota",money((result.rows[0]?.total||0)+(result.rows[0]?.extra||0)),"Incluye cargo y seguros configurados")+metric("Tasa anual usada",`${number(result.effectiveAnnualRate)}%`,`Tasa base ${number(result.input.annualRate)}% + TRe ${number(result.input.treRate||0)}%`)+metric("Intereses estimados",money(result.interestTotal),"Según tasa y saldo de cada período")+metric("Seguros estimados",money(result.insuranceTotal||0),"Desgravamen, cesantía y otros")+metric("Costo total estimado",money(result.totalCost),"Incluye cargos, seguros y costos iniciales")+metric("Número de pagos",number(result.rows.length),"Pagos generados");
    $("scheduleCount").textContent=`${result.rows.length} PAGOS`;
    $("scheduleTable").querySelector("tbody").innerHTML=result.rows.map(r=>`<tr><td>${r.period}</td><td>${prettyDate(r.date)}</td><td>${money(r.opening)}</td><td>${money(r.capital)}</td><td>${money(r.interest)}</td><td>${money(r.fee)}</td><td>${money(r.desgravamen||0)}</td><td>${money(r.cesantia||0)}</td><td>${money(r.otherInsurance||0)}</td><td>${money(r.total)}</td><td>${money(r.extra)}</td><td>${money(r.closing)}</td></tr>`).join("");
    const chartColors=["#2d4b9b","#e3007b","#b9c8e8","#f5b4d7"];
    if(typeof Chart!=="undefined"){
      if(planDonut)planDonut.destroy();planDonut=new Chart($("planDonut"),{type:"doughnut",data:{labels:["Capital amortizado","Intereses","Cargos","Seguros"],datasets:[{data:[result.capitalTotal,result.interestTotal,result.feeTotal,result.insuranceTotal||0],backgroundColor:chartColors,borderWidth:0}]},options:{responsive:true,plugins:{legend:{position:"bottom"}}}});
      if(balanceChart)balanceChart.destroy();balanceChart=new Chart($("balanceChart"),{type:"line",data:{labels:["Inicio",...result.rows.map(r=>`Pago ${r.period}`)],datasets:[{label:"Saldo pendiente (Bs)",data:[result.input.principal,...result.rows.map(r=>r.closing)],borderColor:"#2d4b9b",backgroundColor:"#2d4b9b18",fill:true,tension:.2,pointRadius:0}]},options:{responsive:true,plugins:{legend:{display:false}},scales:{y:{beginAtZero:true}}}});
    }
    $("planResults").scrollIntoView({behavior:"smooth",block:"start"});
  }
  $("planForm").addEventListener("submit",e=>{e.preventDefault();if(!validNonNegative(["principal","annualRate","months","feePerPayment","upfrontCosts","extraAmount","extraAt","treRate","desgravamenRate","cesantiaRate","otherInsurance"],$("planError")))return;const x=readPlan();if(!x.startDate||!x.firstDueDate||x.firstDueDate<x.startDate){$("planError").textContent="La fecha del primer vencimiento debe ser igual o posterior al desembolso.";return;}if(!Number.isInteger(x.months)||x.months<1||!Number.isInteger(x.extraAt)){ $("planError").textContent="El plazo y el número de cuota deben ser números enteros.";return;}if(x.months>600){$("planError").textContent="El plazo máximo de este prototipo es 600 meses.";return;}renderPlan(computePlan(x));});
  $("planReset").addEventListener("click",()=>{ $("planForm").reset();$("planLabel").value="";$("principal").value=30000;$("annualRate").value=settings.rate;$("months").value=24;$("frequency").value=1;$("startDate").value=isoToday();$("firstDueDate").value=addMonths(isoToday(),1);$("feePerPayment").value=0;$("upfrontCosts").value=0;$("extraAmount").value=0;$("extraAt").value=6;$("balloonPercent").value=30;$("planError").textContent="";$("planResults").classList.add("hidden");latestPlan=null;$("balloonField").classList.toggle("hidden",$("method").value!=="balloon");});
  function downloadFile(name,content,type){const blob=new Blob([content],{type});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);}
  function excelCell(v){return String(v??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");}
  function downloadBrandedExcel(filename,title,subtitle,metricsHtml,tableElement){
    const metrics=metricsHtml?`<table class="metrics"><tr>${Array.from(metricsHtml.querySelectorAll(".metric-card")).map(m=>`<td><span>${excelCell(m.querySelector(".metric-label")?.textContent)}</span><br><b>${excelCell(m.querySelector("strong")?.textContent)}</b><br><small>${excelCell(m.querySelector("small")?.textContent)}</small></td>`).join("")}</tr></table>`:"";
    const table=tableElement?tableElement.outerHTML.replace('<table id="scheduleTable"','<table').replace('<table id="capacityTable"','<table'):"";
    const html=`<!doctype html><html><head><meta charset="utf-8"><style>body{font-family:Arial,sans-serif;color:#25232a}table{border-collapse:collapse;width:100%;mso-displayed-decimal-separator:"."}td,th{border:1px solid #d9dce8;padding:7px;text-align:right}th{background:#2D4B9B;color:white;font-weight:bold}td:first-child,th:first-child{text-align:left}.brand{border:0;width:auto;margin-bottom:8px}.brand td{border:0;padding:0}.brandname{font-size:25pt;font-weight:bold;letter-spacing:-1px}.magenta{color:#E3007B}.blue{color:#2D4B9B}.strap{font-size:10pt;color:#666}.ribbon{font-size:25pt;color:#E3007B}.metrics td{background:#f8f3f8;text-align:left;border:1px solid #e8dce7;min-width:150px}.metrics span,.metrics small{color:#666;font-size:9pt}.metrics b{font-size:14pt;color:#2D4B9B}.note{font-size:9pt;color:#666;margin:12px 0}</style></head><body><table class="brand"><tr><td><span class="ribbon">◢</span></td><td><div class="brandname"><span class="magenta">Banco</span><span class="blue">Fie</span></div><div class="strap">SIMULADORES FINANCIEROS · TARIJA, BOLIVIA</div></td></tr></table><h2 style="color:#2D4B9B">${excelCell(title)}</h2><p>${excelCell(subtitle)}</p><p class="note">Prototipo académico independiente. Reporte orientativo; no es un documento oficial de Banco FIE.</p>${metrics}<br>${table}</body></html>`;
    downloadFile(filename,html,"application/vnd.ms-excel;charset=utf-8");
  }
  $("downloadPlanCsv").addEventListener("click",()=>{if(!latestPlan){toast("Primero genera el plan de pagos.");return;}downloadBrandedExcel("BancoFIE_plan_pagos.xls","Cronograma del plan de pagos",`${latestPlan.input.label} · Sistema ${methodName(latestPlan.method)} · Tasa anual usada ${number(latestPlan.effectiveAnnualRate)}%`,$("planMetrics"),$("scheduleTable"));toast("Reporte Excel preparado.");});
  $("downloadCapacityExcel").addEventListener("click",()=>{if(!latestCapacity){toast("Primero evalúa la capacidad de pagos.");return;}downloadBrandedExcel("BancoFIE_capacidad_pagos.xls","Análisis de capacidad de pagos",`${latestCapacity.input.label} · Perfil ${latestCapacity.input.profile==="business"?"Comerciante o empresa":"Persona o familia"}`,$("capacityMetrics"),$("capacityTable"));toast("Reporte Excel preparado.");});
  $("printPlan").addEventListener("click",()=>{if(!latestPlan)return;go("plan");$("planResults").classList.remove("hidden");window.print();});
  function saveItem(item){const list=loadJSON(savedKey,[]);list.unshift({...item,id:Date.now(),savedAt:new Date().toISOString()});localStorage.setItem(savedKey,JSON.stringify(list.slice(0,50)));toast("Simulación guardada en este navegador.");}
  $("comparePlan").addEventListener("click",()=>{if(!latestPlan){$("planForm").requestSubmit();if(!latestPlan)return;}saveItem({type:"plan",label:latestPlan.input.label,summary:`${methodName(latestPlan.method)} · ${money(latestPlan.input.principal)} · Intereses ${money(latestPlan.interestTotal)}`,data:latestPlan});});
  $("sendToCapacity").addEventListener("click",()=>{if(!latestPlan)return;$("proposedPayment").value=round(latestPlan.rows[0]?.total||0);$("capacityLabel").value=`Capacidad para: ${latestPlan.input.label}`;go("capacity");$("capacityForm").requestSubmit();toast("Cuota transferida al simulador de capacidad.");});
  $("capacityFromPlan").addEventListener("click",()=>{if(!latestPlan){toast("Primero calcula un plan de pagos o introduce la cuota manualmente.");return;}$("proposedPayment").value=round(latestPlan.rows[0]?.total||0);$("capacityLabel").value=`Capacidad para: ${latestPlan.input.label}`;toast("Cuota del plan incorporada. Pulsa Evaluar para actualizar resultados.");});
  function readCapacity(){return {label:$("capacityLabel").value.trim()||"Simulación de capacidad de pagos",profile:$("profile").value,income:val("income"),expenses:val("expenses"),existingDebts:val("existingDebts"),payment:val("proposedPayment"),incomeDrop:val("incomeDrop"),expenseRise:val("expenseRise"),safetyMargin:val("safetyMargin"),paymentLimit:val("paymentLimit")};}
  function computeCapacity(x){
    const available= x.income-x.expenses-x.existingDebts;
    const margin=available-x.payment;
    const paymentRatio=x.income>0?x.payment/x.income*100:null;
    const allDebtRatio=x.income>0?(x.payment+x.existingDebts)/x.income*100:null;
    const conservativeIncome=x.income*(1-x.incomeDrop/100);
    const conservativeExpenses=x.expenses*(1+x.expenseRise/100);
    const conservativeAvailable=conservativeIncome-conservativeExpenses-x.existingDebts;
    const conservativeMargin=conservativeAvailable-x.payment;
    const safeAvailable=Math.max(0,available*(1-x.safetyMargin/100));
    const ratioBasedMax=x.income*x.paymentLimit/100-x.existingDebts;
    const maximum=Math.max(0,Math.min(safeAvailable,ratioBasedMax));
    let status,reason;
    if(available<0||margin<0||conservativeMargin<0){status="bad";reason="El escenario presenta déficit o margen insuficiente bajo los supuestos ingresados. Revisa gastos, deudas y cuota.";}
    else if(paymentRatio!==null&&paymentRatio>x.paymentLimit){status="warn";reason="La cuota supera el límite orientativo cuota/ingresos configurado. Ese límite es un supuesto de simulación, no una política oficial.";}
    else if(conservativeMargin<margin*.5){status="warn";reason="El margen se reduce de forma importante en el escenario conservador. Conviene revisar la estabilidad de los ingresos y los gastos.";}
    else {status="good";reason="La cuota cabe en el margen calculado para los datos declarados. Esto no garantiza aprobación ni asequibilidad real.";}
    return {...x,available,margin,paymentRatio,allDebtRatio,conservativeIncome,conservativeExpenses,conservativeAvailable,conservativeMargin,maximum,status,reason};
  }
  function renderCapacity(r){
    latestCapacity=r;$("capacityResults").classList.remove("hidden");$("capacityResultTitle").textContent=r.label;$("capacityResultSub").textContent=`Perfil: ${r.profile==="person"?"persona o familia":"comerciante o empresa"} · Cálculo mensual`;
    $("capacityStatus").className=`status-banner ${r.status}`;$("capacityStatus").innerHTML=`<strong>${r.status==="good"?"Margen disponible en escenario base":r.status==="warn"?"Revisión recomendada":"Atención: margen insuficiente"}</strong><p>${safeText(r.reason)}</p>`;
    $("capacityMetrics").innerHTML=metric("Disponible antes de nueva cuota",money(r.available),"Ingresos − gastos − deudas actuales")+metric("Margen después de nueva cuota",money(r.margin),"Disponible − nueva cuota")+metric("Cuota / ingresos",r.paymentRatio===null?"No calculable":`${number(r.paymentRatio)}%`,"Indicador orientativo")+metric("Cuota máxima orientativa",money(r.maximum),"Según límite y reserva configurados");
    const rows=[
      ["Ingresos mensuales",money(r.income),"Importe declarado por el usuario."],
      ["Gastos mensuales",money(r.expenses),"Hogar o costos/gastos operativos."],
      ["Cuotas de otras deudas",money(r.existingDebts),"Obligaciones mensuales existentes."],
      ["Nueva cuota",money(r.payment),"Cuota que se está evaluando."],
      ["Excedente antes de nueva cuota",money(r.available),"Ingresos menos gastos y otras deudas."],
      ["Margen después de nueva cuota",money(r.margin),"Excedente menos nueva cuota."],
      ["Relación cuota/ingresos",r.paymentRatio===null?"No calculable":`${number(r.paymentRatio)}%`,"Nueva cuota ÷ ingresos × 100."],
      ["Relación de cuotas/ingresos",r.allDebtRatio===null?"No calculable":`${number(r.allDebtRatio)}%`,"Nueva cuota más otras deudas, dividido entre ingresos."],
      ["Margen en escenario conservador",money(r.conservativeMargin),"Ingresos reducidos y gastos aumentados según parámetros."],
      ["Cuota máxima orientativa",money(r.maximum),"Menor entre margen con reserva y límite de cuota configurado."]
    ];
    $("capacityTable").querySelector("tbody").innerHTML=rows.map(row=>`<tr><td>${safeText(row[0])}</td><td>${safeText(row[1])}</td><td>${safeText(row[2])}</td></tr>`).join("");
    if(typeof Chart!=="undefined"){
      if(capacityChart)capacityChart.destroy();capacityChart=new Chart($("capacityChart"),{type:"bar",data:{labels:["Ingresos","Gastos","Otras deudas","Nueva cuota","Margen final"],datasets:[{label:"Bs/mes",data:[r.income,r.expenses,r.existingDebts,r.payment,Math.max(0,r.margin)],backgroundColor:["#2d4b9b","#b9c8e8","#8c9fc9","#e3007b","#4b8e70"],borderRadius:5}]},options:{responsive:true,plugins:{legend:{display:false}},scales:{y:{beginAtZero:true}}}});
      if(scenarioChart)scenarioChart.destroy();scenarioChart=new Chart($("scenarioChart"),{type:"bar",data:{labels:["Escenario base","Escenario conservador"],datasets:[{label:"Margen después de cuota (Bs)",data:[r.margin,r.conservativeMargin],backgroundColor:["#2d4b9b",r.conservativeMargin<0?"#b33b45":"#e3007b"],borderRadius:6}]},options:{responsive:true,plugins:{legend:{display:false}},scales:{y:{beginAtZero:false}}}});
    }
    $("capacityResults").scrollIntoView({behavior:"smooth",block:"start"});
  }
  $("capacityForm").addEventListener("submit",e=>{e.preventDefault();if(!validNonNegative(["income","expenses","existingDebts","proposedPayment","incomeDrop","expenseRise","safetyMargin","paymentLimit"],$("capacityError")))return;const x=readCapacity();if(x.incomeDrop>100||x.expenseRise>300||x.safetyMargin>90||x.paymentLimit>100){$("capacityError").textContent="Uno o más porcentajes superan el rango permitido.";return;}renderCapacity(computeCapacity(x));});
  $("capacityReset").addEventListener("click",()=>{$("capacityForm").reset();$("capacityLabel").value="";$("income").value=5000;$("expenses").value=2500;$("existingDebts").value=500;$("proposedPayment").value=800;$("incomeDrop").value=10;$("expenseRise").value=10;$("safetyMargin").value=10;$("paymentLimit").value=settings.limit;$("capacityError").textContent="";$("capacityResults").classList.add("hidden");latestCapacity=null;});
  $("capacityToPlan").addEventListener("click",()=>{if(!latestCapacity)return;$("principal").value=Math.max(1,Math.round(latestCapacity.maximum*12));$("annualRate").value=settings.rate;$("months").value=24;$("method").value="french";$("balloonField").classList.add("hidden");go("plan");toast("Se preparó un escenario inicial. Ajusta monto, plazo y tasa antes de calcular.");});
  $("printCapacity").addEventListener("click",()=>{if(!latestCapacity)return;go("capacity");$("capacityResults").classList.remove("hidden");window.print();});
  $("capacityForm").addEventListener("input",()=>{$("capacityError").textContent="";});
  function renderSaved(){
    const list=loadJSON(savedKey,[]),host=$("savedList");
    if(!list.length){host.innerHTML='<div class="empty-state"><strong>No hay simulaciones guardadas todavía</strong>Calcula un plan de pagos o un análisis de capacidad y usa “Guardar para comparar”.</div>';return;}
    host.innerHTML=list.map(item=>`<article class="saved-item"><div><strong>${safeText(item.label||"Simulación")}</strong><p>${safeText(item.type==="plan"?"Plan de pagos":"Capacidad de pagos")} · ${safeText(item.summary||"")} · ${new Date(item.savedAt).toLocaleString("es-BO")}</p></div><div class="saved-actions"><button class="btn secondary" data-open-saved="${item.id}">Ver datos</button><button class="btn danger-outline" data-delete-saved="${item.id}">Eliminar</button></div></article>`).join("");
    host.querySelectorAll("[data-delete-saved]").forEach(b=>b.addEventListener("click",()=>{localStorage.setItem(savedKey,JSON.stringify(loadJSON(savedKey,[]).filter(x=>x.id!==Number(b.dataset.deleteSaved))));renderSaved();toast("Simulación eliminada.");}));
    host.querySelectorAll("[data-open-saved]").forEach(b=>b.addEventListener("click",()=>{const item=loadJSON(savedKey,[]).find(x=>x.id===Number(b.dataset.openSaved));if(!item)return;if(item.type==="plan"){renderPlan(item.data);go("plan");}else{renderCapacity(item.data);go("capacity");}}));
  }
  $("clearSaved").addEventListener("click",()=>{if(confirm("¿Borrar todas las simulaciones guardadas en este navegador?")){localStorage.removeItem(savedKey);renderSaved();toast("Historial borrado.");}});
  function fillSettings(){$("defaultRate").value=settings.rate;$("defaultLimit").value=settings.limit;$("parameterName").value=settings.name;$("parameterSource").value=settings.source;}
  $("settingsForm").addEventListener("submit",e=>{e.preventDefault();const rate=val("defaultRate"),limit=val("defaultLimit");if(!Number.isFinite(rate)||rate<0||rate>200||!Number.isFinite(limit)||limit<1||limit>100){$("settingsMessage").textContent="Revisa los valores permitidos.";return;}settings={rate,limit,name:$("parameterName").value.trim()||"Parámetros personalizados",source:$("parameterSource").value.trim()||"Sin fuente indicada; tratar como valor de prueba."};localStorage.setItem(settingsKey,JSON.stringify(settings));$("settingsMessage").textContent="Parámetros guardados en este navegador.";toast("Configuración guardada.");});
  $("resetSettings").addEventListener("click",()=>{settings={...defaults};localStorage.setItem(settingsKey,JSON.stringify(settings));fillSettings();$("settingsMessage").textContent="Se restauraron los valores demostrativos.";});
  fillSettings();
  // Add a small print header only when browser print is requested; active module controls what prints.
})();
