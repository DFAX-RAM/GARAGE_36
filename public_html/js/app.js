const $ = (id) => document.getElementById(id);
const STORAGE = "garage36_demo_v1";
const RATE_DEFAULTS = {AUTO:10,MOTO:5,CAMIONETA:15};
let data;
let toastTimer;

function seedData(){
  const clients=[
    {id:1,name:"Carlos Méndez",phone:"5551-2040",email:"carlos@email.com"},
    {id:2,name:"María Fernanda López",phone:"5552-3180",email:"maria@email.com"},
    {id:3,name:"José Ramírez",phone:"5553-4190",email:"jose@email.com"},
    {id:4,name:"Andrea Castillo",phone:"5554-5270",email:"andrea@email.com"},
    {id:5,name:"Luis Herrera",phone:"5555-6320",email:"luis@email.com"}
  ];
  const vehicles=[
    {id:1,plate:"P-123ABC",brand:"Toyota Corolla",type:"AUTO",clientId:1},
    {id:2,plate:"M-456DEF",brand:"Honda Navi",type:"MOTO",clientId:2},
    {id:3,plate:"P-789GHI",brand:"Mazda CX-5",type:"CAMIONETA",clientId:3},
    {id:4,plate:"P-321JKL",brand:"Honda Civic",type:"AUTO",clientId:4},
    {id:5,plate:"M-654MNO",brand:"Yamaha FZ",type:"MOTO",clientId:5}
  ];
  const now=Date.now();
  return {clients,vehicles,rates:{...RATE_DEFAULTS},stays:[
    {id:1,vehicleId:1,clientId:1,space:"A-01",start:now-95*60000,status:"ACTIVE"},
    {id:2,vehicleId:2,clientId:2,space:"M-01",start:now-42*60000,status:"ACTIVE"},
    {id:3,vehicleId:3,clientId:3,space:"B-03",start:now-160*60000,status:"ACTIVE"}
  ],payments:[],nextId:10,receiptNo:1};
}
function loadData(){try{const saved=localStorage.getItem(STORAGE);data=saved?JSON.parse(saved):seedData();}catch(e){data=seedData();}saveData();}
function saveData(){localStorage.setItem(STORAGE,JSON.stringify(data));}
function money(n){return "Q "+Number(n||0).toFixed(2);}
function dateTime(ts){return new Date(ts).toLocaleString("es-GT",{dateStyle:"short",timeStyle:"short"});}
function elapsed(start){const m=Math.max(1,Math.ceil((Date.now()-start)/60000));return Math.max(1,Math.ceil(m/60));}
function clientName(id){return data.clients.find(c=>c.id===id)?.name||"Cliente eliminado";}
function vehicle(id){return data.vehicles.find(v=>v.id===id);}
function showToast(msg){$("toast").textContent=msg;$("toast").classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>$("toast").classList.remove("show"),2600);}
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function spaces(){let a=[];for(let i=1;i<=15;i++)a.push({id:`A-${String(i).padStart(2,"0")}`,zone:"A"});for(let i=1;i<=15;i++)a.push({id:`B-${String(i).padStart(2,"0")}`,zone:"B"});for(let i=1;i<=10;i++)a.push({id:`M-${String(i).padStart(2,"0")}`,zone:"M"});return a;}
function activeForSpace(space){return data.stays.find(s=>s.status==="ACTIVE"&&s.space===space);}
function setPage(name){document.querySelectorAll(".page").forEach(p=>p.classList.add("hidden"));$(name+"Page").classList.remove("hidden");document.querySelectorAll(".nav-link").forEach(b=>b.classList.toggle("active",b.dataset.page===name));const titles={dashboard:"Resumen general",parking:"Estacionamiento",clients:"Clientes",vehicles:"Vehículos",payments:"Pagos e historial",rates:"Tarifas"};$("pageTitle").textContent=titles[name];renderPage(name);}
function renderPage(name){if(name==="dashboard")renderDashboard();if(name==="parking")renderParking();if(name==="clients")renderClients();if(name==="vehicles")renderVehicles();if(name==="payments")renderPayments();if(name==="rates")renderRates();}
function renderDashboard(){
 const occupied=data.stays.filter(s=>s.status==="ACTIVE").length, total=40, free=total-occupied, today=new Date().toDateString();
 const collected=data.payments.filter(p=>new Date(p.date).toDateString()===today).reduce((a,p)=>a+p.total,0);
 $("statsGrid").innerHTML=[
  ["ESPACIOS TOTALES",total,"Capacidad instalada","▦"],["ESPACIOS OCUPADOS",occupied,`${Math.round(occupied/total*100)}% de ocupación`,"▣"],["ESPACIOS DISPONIBLES",free,"Listos para recibir vehículos","＋"],["INGRESOS DE HOY",money(collected),"Cobros registrados","Ｑ"]
 ].map(x=>`<article class="stat-card"><div class="stat-label">${x[0]}</div><div class="stat-value">${x[1]}</div><div class="stat-foot">${x[2]}</div></article>`).join("");
 $("miniParking").innerHTML=spaces().map(s=>`<div class="mini-slot ${activeForSpace(s.id)?"busy":""}" title="${s.id}">${s.id}</div>`).join("");
 const events=[...data.payments.map(p=>({date:p.date,text:`Cobro ${p.receipt}`,sub:`${p.plate} · ${money(p.total)}`,icon:"Ｑ"})),...data.stays.filter(s=>s.status==="ACTIVE").map(s=>({date:s.start,text:"Vehículo estacionado",sub:`${vehicle(s.vehicleId)?.plate||"—"} · Espacio ${s.space}`,icon:"↘"}))].sort((a,b)=>b.date-a.date).slice(0,5);
 $("recentActivity").innerHTML=events.length?events.map(e=>`<div class="activity-item"><div class="activity-icon">${e.icon}</div><div><b>${esc(e.text)}</b><small>${esc(e.sub)} · ${dateTime(e.date)}</small></div></div>`).join(""):`<div class="empty">Todavía no hay movimientos.</div>`;
}
function renderParking(){
 const active=data.stays.filter(s=>s.status==="ACTIVE"),free=40-active.length;
 $("parkingSummary").innerHTML=`<div class="summary-chip"><b>40</b><span>ESPACIOS TOTALES</span></div><div class="summary-chip"><b>${active.length}</b><span>OCUPADOS</span></div><div class="summary-chip"><b>${free}</b><span>DISPONIBLES</span></div>`;
 let html="";["A","B","M"].forEach((z,i)=>{html+=`<div class="zone-title">${["ZONA A · AUTOMÓVILES","ZONA B · AUTOMÓVILES","ZONA M · MOTOCICLETAS"][i]}</div>`;spaces().filter(s=>s.zone===z).forEach(s=>{const stay=activeForSpace(s.id),v=stay&&vehicle(stay.vehicleId);html+=`<div class="slot ${stay?"busy":""}" ${stay?`title="${esc(v?.plate||"Ocupado")}"`:`data-space="${s.id}" title="Registrar entrada en ${s.id}"`}><b>${s.id}</b><small>${stay?esc(v?.plate||"OCUPADO"):"LIBRE"}</small></div>`;});});
 $("parkingGrid").innerHTML=html;
 $("activeStays").innerHTML=active.length?active.map(s=>{const v=vehicle(s.vehicleId);return `<tr><td><span class="plate">${esc(v?.plate||"—")}</span></td><td>${esc(clientName(s.clientId))}</td><td><b>${s.space}</b></td><td>${dateTime(s.start)}</td><td>${elapsed(s.start)} h</td><td><button class="table-action" data-exit="${s.id}">Cobrar y dar salida →</button></td></tr>`}).join(""):`<tr><td colspan="6" class="empty">No hay vehículos estacionados.</td></tr>`;
}
function renderClients(){
 const q=($("clientSearch").value||"").toLowerCase(),list=data.clients.filter(c=>(c.name+c.phone+c.email).toLowerCase().includes(q));
 $("clientCount").textContent=`${list.length} cliente(s)`;
 $("clientsTable").innerHTML=list.length?list.map(c=>`<tr><td><b>${esc(c.name)}</b></td><td>${esc(c.phone)}</td><td>${esc(c.email)}</td><td>${data.vehicles.filter(v=>v.clientId===c.id).length}</td><td><button class="table-action" data-edit-client="${c.id}">Editar</button><button class="table-action" data-delete-client="${c.id}">Eliminar</button></td></tr>`).join(""):`<tr><td colspan="5" class="empty">No se encontraron clientes.</td></tr>`;
}
function renderVehicles(){
 const q=($("vehicleSearch").value||"").toLowerCase(),list=data.vehicles.filter(v=>(v.plate+v.brand+clientName(v.clientId)).toLowerCase().includes(q));
 $("vehiclesTable").innerHTML=list.length?list.map(v=>`<tr><td><span class="plate">${esc(v.plate)}</span></td><td>${esc(v.brand)}</td><td><span class="tag">${v.type}</span></td><td>${esc(clientName(v.clientId))}</td><td><button class="table-action" data-edit-vehicle="${v.id}">Editar</button><button class="table-action" data-delete-vehicle="${v.id}">Eliminar</button></td></tr>`).join(""):`<tr><td colspan="5" class="empty">No se encontraron vehículos.</td></tr>`;
}
function renderPayments(){
 const q=($("paymentSearch").value||"").toLowerCase(),f=$("paymentFilter").value;
 const list=[...data.payments].filter(p=>(p.plate+p.client+p.receipt).toLowerCase().includes(q)&&(f==="all"||p.method===f)).sort((a,b)=>b.date-a.date);
 const total=data.payments.reduce((a,p)=>a+p.total,0);$("totalCollected").textContent=`TOTAL HISTÓRICO ${money(total)}`;
 $("paymentsTable").innerHTML=list.length?list.map(p=>`<tr><td><b>${p.receipt}</b></td><td>${dateTime(p.date)}</td><td>${esc(p.client)}</td><td><span class="plate">${esc(p.plate)}</span></td><td>${p.hours}</td><td><span class="tag">${p.method}</span></td><td><b>${money(p.total)}</b></td><td><button class="table-action" data-receipt="${p.id}">Ver recibo</button></td></tr>`).join(""):`<tr><td colspan="8" class="empty">Todavía no hay pagos registrados.</td></tr>`;
}
function renderRates(){
 $("ratesGrid").innerHTML=[["AUTO","🚗","Automóvil"],["MOTO","🏍️","Motocicleta"],["CAMIONETA","🚙","Camioneta"]].map(([key,icon,label])=>`<article class="rate-card"><div class="rate-icon">${icon}</div><h3>${label}</h3><p>Tarifa por hora iniciada</p><label>PRECIO EN QUETZALES<input type="number" min="1" step=".5" id="rate-${key}" value="${data.rates[key]}"></label></article>`).join("");
}
function openModal(title,body,eyebrow="GARAGE 36 / REGISTRO"){ $("modalTitle").textContent=title;$("modalEyebrow").textContent=eyebrow;$("modalBody").innerHTML=body;$("modal").classList.remove("hidden");}
function closeModal(){$("modal").classList.add("hidden");}
function optionsClients(selected){return data.clients.map(c=>`<option value="${c.id}" ${c.id===selected?"selected":""}>${esc(c.name)}</option>`).join("");}
function openClientForm(id=null){
 const c=data.clients.find(x=>x.id===id)||{name:"",phone:"",email:""};
 openModal(id?"Editar cliente":"Nuevo cliente",`<form id="clientForm"><div class="form-grid"><label class="full-field">Nombre completo<input name="name" required value="${esc(c.name)}" placeholder="Ej. Ana López"></label><label>Teléfono<input name="phone" required value="${esc(c.phone)}" placeholder="5555-5555"></label><label>Correo electrónico<input name="email" type="email" required value="${esc(c.email)}" placeholder="correo@email.com"></label></div><div class="form-actions"><button type="button" class="btn secondary" data-close>Cancelar</button><button class="btn primary">Guardar cliente</button></div></form>`);
 $("clientForm").onsubmit=e=>{e.preventDefault();const f=new FormData(e.target),obj={name:f.get("name").trim(),phone:f.get("phone").trim(),email:f.get("email").trim()};if(id)Object.assign(data.clients.find(x=>x.id===id),obj);else{obj.id=Date.now();data.clients.push(obj);}saveData();closeModal();renderClients();showToast("Cliente guardado correctamente.");};
}
function openVehicleForm(id=null){
 const v=data.vehicles.find(x=>x.id===id)||{plate:"",brand:"",type:"AUTO",clientId:data.clients[0]?.id};
 if(!data.clients.length){showToast("Primero registra un cliente.");return;}
 openModal(id?"Editar vehículo":"Nuevo vehículo",`<form id="vehicleForm"><div class="form-grid"><label>Placa<input name="plate" required value="${esc(v.plate)}" placeholder="P-123ABC"></label><label>Marca y modelo<input name="brand" required value="${esc(v.brand)}" placeholder="Toyota Corolla"></label><label>Tipo<select name="type"><option ${v.type==="AUTO"?"selected":""}>AUTO</option><option ${v.type==="MOTO"?"selected":""}>MOTO</option><option ${v.type==="CAMIONETA"?"selected":""}>CAMIONETA</option></select></label><label>Propietario<select name="clientId">${optionsClients(v.clientId)}</select></label></div><div class="form-actions"><button type="button" class="btn secondary" data-close>Cancelar</button><button class="btn primary">Guardar vehículo</button></div></form>`);
 $("vehicleForm").onsubmit=e=>{e.preventDefault();const f=new FormData(e.target),plate=f.get("plate").trim().toUpperCase();if(data.vehicles.some(x=>x.plate===plate&&x.id!==id)){showToast("Ya existe un vehículo con esa placa.");return;}const obj={plate,brand:f.get("brand").trim(),type:f.get("type"),clientId:Number(f.get("clientId"))};if(id)Object.assign(data.vehicles.find(x=>x.id===id),obj);else{obj.id=Date.now();data.vehicles.push(obj);}saveData();closeModal();renderVehicles();showToast("Vehículo guardado correctamente.");};
}
function openEntryForm(space=""){
 const available=data.vehicles.filter(v=>!data.stays.some(s=>s.status==="ACTIVE"&&s.vehicleId===v.id));
 const free=spaces().filter(s=>!activeForSpace(s.id));
 if(!available.length){showToast("No hay vehículos disponibles. Registra uno primero.");return;}
 if(!free.length){showToast("No hay espacios disponibles.");return;}
 const vehicleOpts=available.map(v=>`<option value="${v.id}">${esc(v.plate)} · ${esc(v.brand)} (${esc(clientName(v.clientId))})</option>`).join("");
 const spaceOpts=free.map(s=>`<option value="${s.id}" ${s.id===space?"selected":""}>${s.id}</option>`).join("");
 openModal("Registrar entrada",`<form id="entryForm"><div class="form-grid"><label class="full-field">Vehículo<select name="vehicleId">${vehicleOpts}</select></label><label class="full-field">Espacio disponible<select name="space">${spaceOpts}</select></label></div><div class="detail-box">La fecha y hora de entrada se registrarán automáticamente.</div><div class="form-actions"><button type="button" class="btn secondary" data-close>Cancelar</button><button class="btn primary">Confirmar entrada</button></div></form>`);
 $("entryForm").onsubmit=e=>{e.preventDefault();const f=new FormData(e.target),v=vehicle(Number(f.get("vehicleId"))),sp=f.get("space");if(activeForSpace(sp)||data.stays.some(s=>s.status==="ACTIVE"&&s.vehicleId===v.id)){showToast("El vehículo o espacio ya tiene una estancia activa.");return;}data.stays.push({id:Date.now(),vehicleId:v.id,clientId:v.clientId,space:sp,start:Date.now(),status:"ACTIVE"});saveData();closeModal();renderParking();showToast("Entrada registrada. ¡Bienvenido!");};
}
function closeStay(id){
 const s=data.stays.find(x=>x.id===id),v=vehicle(s.vehicleId);if(!s||!v)return;
 const hours=elapsed(s.start),rate=data.rates[v.type]||10,total=hours*rate;
 openModal("Finalizar estancia y cobrar",`<div class="detail-box"><div class="detail-row"><span>Cliente</span><b>${esc(clientName(s.clientId))}</b></div><div class="detail-row"><span>Vehículo</span><b>${esc(v.plate)} · ${esc(v.brand)}</b></div><div class="detail-row"><span>Espacio</span><b>${s.space}</b></div><div class="detail-row"><span>Tiempo estacionado</span><b>${hours} hora(s)</b></div><div class="detail-row"><span>Tarifa por hora</span><b>${money(rate)}</b></div><div class="detail-row"><span>Total a pagar</span><strong>${money(total)}</strong></div></div><form id="checkoutForm"><label class="form-grid">Método de pago<select name="method"><option>EFECTIVO</option><option>TARJETA</option><option>TRANSFERENCIA</option></select></label><div class="form-actions"><button type="button" class="btn secondary" data-close>Cancelar</button><button class="btn primary">Cobrar Q ${total.toFixed(2)} y dar salida</button></div></form>`);
 $("checkoutForm").onsubmit=e=>{e.preventDefault();const method=new FormData(e.target).get("method"),now=Date.now(),receipt=`G36-${String(data.receiptNo++).padStart(6,"0")}`;s.status="FINISHED";s.end=now;const p={id:Date.now(),stayId:s.id,receipt,date:now,client:clientName(s.clientId),plate:v.plate,brand:v.brand,space:s.space,start:s.start,end:now,hours,rate,total,method};data.payments.push(p);saveData();closeModal();renderParking();showToast("Cobro registrado correctamente.");openReceipt(p.id);};
}
function openReceipt(id){
 const p=data.payments.find(x=>x.id===id);if(!p)return;
 openModal("Comprobante de pago",`<div id="receiptContent" class="receipt"><h2>GARAGE 36</h2><p>COMPROBANTE DE ESTACIONAMIENTO<br>Guatemala, Guatemala</p><hr><div class="receipt-line"><span>Comprobante</span><b>${p.receipt}</b></div><div class="receipt-line"><span>Fecha</span><b>${dateTime(p.date)}</b></div><hr><div class="receipt-line"><span>Cliente</span><b>${esc(p.client)}</b></div><div class="receipt-line"><span>Vehículo</span><b>${esc(p.brand)}</b></div><div class="receipt-line"><span>Placa</span><b>${esc(p.plate)}</b></div><div class="receipt-line"><span>Espacio</span><b>${p.space}</b></div><div class="receipt-line"><span>Tiempo</span><b>${p.hours} hora(s)</b></div><div class="receipt-line"><span>Tarifa por hora</span><b>${money(p.rate)}</b></div><div class="receipt-line"><span>Método de pago</span><b>${p.method}</b></div><hr><div class="receipt-line receipt-total"><span>TOTAL</span><b>${money(p.total)}</b></div><hr><p>Gracias por confiar en GARAGE 36.<br>¡Buen viaje!</p><small>Documento de demostración; no es factura fiscal.</small></div><button class="btn primary print-btn" id="printReceipt">Imprimir comprobante</button>`);
 $("printReceipt").onclick=()=>{const content=$("receiptContent").innerHTML,w=window.open("","_blank","width=500,height=700");w.document.write(`<html><head><title>${p.receipt}</title><style>body{font-family:Arial;padding:25px}.receipt{max-width:400px;margin:auto}.receipt h2{text-align:center;color:#751f2b}.receipt p{text-align:center;line-height:1.5}.receipt hr{border:0;border-top:1px dashed #999;margin:18px 0}.receipt-line{display:flex;justify-content:space-between;padding:7px 0;font-size:13px}.receipt-total{font-size:20px;font-weight:bold}small{font-size:10px}</style></head><body><div class="receipt">${content}</div><script>window.onload=()=>window.print()<\/script></body></html>`);w.document.close();};
}
function bindEvents(){
 $("loginForm").onsubmit=e=>{e.preventDefault();if($("loginUser").value.trim()==="admin"&&$("loginPass").value==="2026"){$("loginScreen").classList.add("hidden");$("app").classList.remove("hidden");sessionStorage.setItem("garage36_login","1");renderDashboard();}else $("loginError").textContent="Usuario o contraseña incorrectos.";};
 $("logoutBtn").onclick=()=>{sessionStorage.removeItem("garage36_login");$("app").classList.add("hidden");$("loginScreen").classList.remove("hidden");$("loginPass").value="";};
 $("mainNav").onclick=e=>{const b=e.target.closest("[data-page]");if(b)setPage(b.dataset.page);};
 document.body.addEventListener("click",e=>{const go=e.target.closest("[data-go]");if(go)setPage(go.dataset.go);const close=e.target.closest("[data-close]");if(close)closeModal();const exit=e.target.closest("[data-exit]");if(exit)closeStay(Number(exit.dataset.exit));const slot=e.target.closest("[data-space]");if(slot)openEntryForm(slot.dataset.space);
  const ec=e.target.closest("[data-edit-client]");if(ec)openClientForm(Number(ec.dataset.editClient));
  const dc=e.target.closest("[data-delete-client]");if(dc){const id=Number(dc.dataset.deleteClient);if(data.vehicles.some(v=>v.clientId===id)){showToast("No puedes eliminar un cliente que tiene vehículos.");return;}if(confirm("¿Eliminar este cliente?")){data.clients=data.clients.filter(c=>c.id!==id);saveData();renderClients();showToast("Cliente eliminado.");}}
  const ev=e.target.closest("[data-edit-vehicle]");if(ev)openVehicleForm(Number(ev.dataset.editVehicle));
  const dv=e.target.closest("[data-delete-vehicle]");if(dv){const id=Number(dv.dataset.deleteVehicle);if(data.stays.some(s=>s.vehicleId===id&&s.status==="ACTIVE")){showToast("No puedes eliminar un vehículo estacionado.");return;}if(confirm("¿Eliminar este vehículo?")){data.vehicles=data.vehicles.filter(v=>v.id!==id);saveData();renderVehicles();showToast("Vehículo eliminado.");}}
  const rec=e.target.closest("[data-receipt]");if(rec)openReceipt(Number(rec.dataset.receipt));
 });
 $("addClientBtn").onclick=()=>openClientForm();$("addVehicleBtn").onclick=()=>openVehicleForm();$("newEntryBtn").onclick=()=>openEntryForm();
 $("clientSearch").oninput=renderClients;$("vehicleSearch").oninput=renderVehicles;$("paymentSearch").oninput=renderPayments;$("paymentFilter").onchange=renderPayments;
 $("saveRatesBtn").onclick=()=>{["AUTO","MOTO","CAMIONETA"].forEach(k=>{const n=Number($("rate-"+k).value);if(n>0)data.rates[k]=n;});saveData();showToast("Tarifas actualizadas.");};
 $("resetData").onclick=()=>{if(confirm("Esto restaurará los datos de demostración y eliminará los cambios guardados. ¿Continuar?")){data=seedData();saveData();setPage("dashboard");showToast("Datos de ejemplo restaurados.");}};
}
function init(){
 loadData();bindEvents();$("todayChip").textContent=new Date().toLocaleDateString("es-GT",{weekday:"short",day:"2-digit",month:"short",year:"numeric"}).toUpperCase();
 if(sessionStorage.getItem("garage36_login")==="1"){$("loginScreen").classList.add("hidden");$("app").classList.remove("hidden");}
 renderDashboard();
}
init();