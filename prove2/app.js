(()=>{"use strict";
const KEY="geo-vg1-flervalg-2", letters=["A","B","C","D"], $=id=>document.getElementById(id);
let qs=[]; let state={name:"",choices:{},receipt:null,sent:false};let saveTimer;
try{let s=JSON.parse(localStorage.getItem(KEY));if(s&&typeof s==="object")state={...state,...s,choices:s.choices||{}}}catch{}
function node(tag,className,text){let x=document.createElement(tag);if(className)x.className=className;if(text!==undefined)x.textContent=text;return x}
function save(){state.name=$("student").value;try{localStorage.setItem(KEY,JSON.stringify(state));$("save-status").textContent="Lagret lokalt kl. "+new Date().toLocaleTimeString("nb-NO")}catch{$("save-status").textContent="Lagring feilet – last ned sikkerhetskopi"}progress()}
function scheduleSave(){clearTimeout(saveTimer);$("save-status").textContent="Lagrer …";saveTimer=setTimeout(save,300)}
function progress(){const total=qs.length||32,answered=qs.filter(q=>letters.includes(state.choices[q.number])).length;$("progress-label").textContent=answered+" av "+total+" besvart";$("bar-fill").style.width=(100*answered/total)+"%";document.querySelectorAll(".navigator a").forEach(x=>x.classList.toggle("done",letters.includes(state.choices[x.dataset.number])))}
function paint(data){qs=data.questions;const pics=data.images;let lastTopic="";
qs.forEach(q=>{
if(q.topic!==lastTopic){lastTopic=q.topic;$("questions").append(node("h2","topic",q.topic))}
const nav=node("a","",String(q.number));nav.href="#q"+q.number;nav.dataset.number=q.number;$("navigator").append(nav);
const card=node("section","question");card.id="q"+q.number;
const head=node("div","qhead");const block=node("div");block.append(node("div","qnum","SPØRSMÅL "+String(q.number).padStart(2,"0")),node("h2","",q.question));
head.append(block,node("span","pill","1 poeng"));card.append(head);
if(q.image&&pics[q.image]){const s=pics[q.image], panel=node("div","source"),icon=node("span","symbol","↗"),desc=node("div"),link=node("a","",s.label);link.href=s.url;link.target="_blank";link.rel="noopener noreferrer";desc.append(link,node("p","",s.credit+" · "+s.license+" · Åpnes i ny fane"));panel.append(icon,desc);card.append(panel)}
const group=node("div","answers");group.setAttribute("role","radiogroup");group.setAttribute("aria-label","Svaralternativer spørsmål "+q.number);
q.options.forEach((txt,i)=>{const label=node("label","option"),radio=node("input");radio.type="radio";radio.name="q"+q.number;radio.value=letters[i];radio.checked=state.choices[q.number]===radio.value;radio.addEventListener("change",()=>{state.choices[q.number]=radio.value;scheduleSave();progress()});label.append(radio,node("span","letter",letters[i]+"."),node("span","",txt));group.append(label)});
card.append(group);$("questions").append(card);
});
$("student").value=state.name;$("student").addEventListener("input",scheduleSave);
if(state.sent){$("submit-status").textContent="En tidligere innsending ble forsøkt fra denne nettleseren. Kontroller Google Sheets før du gjør noe mer.";showReceipt(state.receipt)}
progress();}
function makePayload(){return{exam:"Geografi VG1 – Flervalgsprøve 2",version:1,student:$("student").value.trim(),receipt:state.receipt||crypto.randomUUID(),submittedAt:new Date().toISOString(),answers:qs.map(q=>({number:q.number,choice:state.choices[q.number]||""}))}}
function download(){save();const blob=new Blob([JSON.stringify({...makePayload(),status:"Lokal sikkerhetskopi – ikke dokumentert mottatt"},null,2)],{type:"application/json"}),url=URL.createObjectURL(blob),a=node("a");a.href=url;a.download="geografi-flervalg-2-"+new Date().toISOString().slice(0,10)+".json";a.click();setTimeout(()=>URL.revokeObjectURL(url),2000)}
function showReceipt(id){if(!id)return;let n=$("receipt");n.hidden=false;n.textContent="Lokal kvitterings-ID: "+id+". Kontroller at samme ID og elevnavn vises i Google Sheets. Dette er ikke serverbekreftelse."}
$("download").addEventListener("click",download);$("print").addEventListener("click",()=>window.print());
$("submit").addEventListener("click",async()=>{
save();
const pending=qs.filter(x=>!letters.includes(state.choices[x.number]));if(pending.length){$("submit-status").textContent="Du mangler "+pending.length+" svar. Gå til spørsmål "+pending[0].number+".";document.getElementById("q"+pending[0].number).scrollIntoView({behavior:"smooth"});return}
if(!$("student").value.trim()){$("submit-status").textContent="Skriv elevens navn før du leverer.";$("student").focus();return}
if(!$("agree").checked){$("submit-status").textContent="Huk av for at du vil levere.";return}
const cfg=window.QUIZ2_CONFIG||{},url=cfg.submitUrl||"";
if(!cfg.enabled||!/^https:\/\/script\.google\.com\/macros\/s\/.+\/exec$/.test(url)){$("submit-status").textContent="Digital levering for prøve 2 må aktiveres av administrator. Last ned svarene som sikkerhetskopi.";return}
if(state.sent){$("submit-status").textContent="Besvarelsen er allerede markert forsøkt sendt fra denne nettleseren. Kontakt administrator ved behov.";return}
const payload=makePayload();$("submit").disabled=true;$("submit-status").textContent="Sender …";
try{await fetch(url,{method:"POST",mode:"no-cors",headers:{"Content-Type":"text/plain;charset=UTF-8"},body:JSON.stringify(payload)});
state.receipt=payload.receipt;state.sent=true;save();showReceipt(state.receipt);
$("submit-status").textContent="Forespørselen er sendt. Google har ikke bekreftet mottak til nettleseren – kontroller Google Sheets med kvitterings-ID."}
catch(e){$("submit-status").textContent="Sendingen feilet. Last ned svar som sikkerhetskopi og prøv igjen."}
finally{$("submit").disabled=false}
});
fetch("questions.json").then(r=>{if(!r.ok)throw Error("Kunne ikke laste spørsmål");return r.json()}).then(data=>{$("questions").textContent="";paint(data)}).catch(e=>$("questions").textContent="Feil ved lasting: "+e.message);
})();