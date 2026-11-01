(()=>{"use strict";
const KEY="geo-vg1-flervalg-2";
const ABCD=["A","B","C","D"];
const $=id=>document.getElementById(id);
const make=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;};
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
let qs=[],saveTimer;
let state={name:"",email:"",choices:{},receipt:null,pendingReceipt:null,sent:false,result:null};
try{const s=JSON.parse(localStorage.getItem(KEY));if(s&&typeof s==="object")state={...state,...s,choices:s.choices||{}};}catch{}
function save(){
 state.name=$("student").value;
 state.email=$("email").value;
 try{localStorage.setItem(KEY,JSON.stringify(state));$("save-status").textContent="Lagret lokalt "+new Date().toLocaleTimeString("nb-NO");}
 catch{$("save-status").textContent="Lagring mislyktes. Last ned en kopi.";}
 progress();
}
function scheduleSave(){clearTimeout(saveTimer);$("save-status").textContent="Lagrer …";saveTimer=setTimeout(save,300);}
function progress(){
 const done=qs.filter(q=>ABCD.includes(state.choices[q.number])).length;
 $("progress-label").textContent=done+" av "+qs.length+" besvart";
 $("bar-fill").style.width=(qs.length?100*done/qs.length:0)+"%";
 document.querySelectorAll(".navigator a").forEach(a=>a.classList.toggle("done",ABCD.includes(state.choices[a.dataset.number])));
}
function preventEdits(){
 document.querySelectorAll('input[name^="q"]').forEach(input=>input.disabled=true);
 $("student").readOnly=true;$("email").readOnly=true;$("submit").disabled=true;
}
function paint(data){
 qs=data.questions;
 const images=data.images||{};
 let topic="";
 $("questions").textContent="";
 qs.forEach(q=>{
  if(q.topic!==topic){topic=q.topic;$("questions").append(make("h2","topic",topic));}
  const jump=make("a","",String(q.number));jump.href="#q"+q.number;jump.dataset.number=q.number;$("navigator").append(jump);
  const sec=make("section","question");sec.id="q"+q.number;
  const h=make("div","qhead"),block=make("div");
  block.append(make("div","qnum","SPØRSMÅL "+String(q.number).padStart(2,"0")),make("h2","",q.question));
  h.append(block,make("span","pill","1 poeng"));sec.append(h);
  if(q.image&&images[q.image]){
   const source=images[q.image],panel=make("div","source"),link=make("a","",source.label),info=make("div");
   link.href=source.url;link.target="_blank";link.rel="noopener noreferrer";
   info.append(link,make("p","",source.credit+" · "+source.license+" · Åpnes i ny fane"));
   panel.append(make("span","symbol","↗"),info);sec.append(panel);
  }
  const options=make("div","answers");options.setAttribute("role","radiogroup");options.setAttribute("aria-label","Spørsmål "+q.number);
  q.options.forEach((answer,i)=>{
   const label=make("label","option"),input=make("input");
   input.type="radio";input.name="q"+q.number;input.value=ABCD[i];input.checked=state.choices[q.number]===input.value;
   input.addEventListener("change",()=>{state.choices[q.number]=input.value;scheduleSave();progress();});
   label.append(input,make("span","letter",ABCD[i]+"."),make("span","",answer));options.append(label);
  });
  sec.append(options);$("questions").append(sec);
 });
 $("student").value=state.name||"";
 $("email").value=state.email||"";
 $("student").addEventListener("input",scheduleSave);
 $("email").addEventListener("input",scheduleSave);
 progress();
 if(state.sent&&state.result&&state.result.status==="ready"){
  renderResult(state.result);
 }else if(state.receipt||state.pendingReceipt){
  $("submit-status").textContent="Sjekker tidligere innlevering hos Google …";
  retrieveResult(state.receipt||state.pendingReceipt,4).then(result=>{
   if(result&&result.status==="ready")onConfirmed(result,state.receipt||state.pendingReceipt);
   else $("submit-status").textContent="Tidligere innsending er ennå ikke bekreftet. Kontroller Google Sheets og last ned svarene som sikkerhetskopi.";
  });
 }
}
function payload(receipt){
 return {
  exam:"Geografi VG1 – Flervalgsprøve 2",
  version:1,
  student:$("student").value.trim(),
  email:$("email").value.trim(),
  receipt:receipt,
  submittedAt:new Date().toISOString(),
  answers:qs.map(q=>({number:q.number,choice:state.choices[q.number]||""}))
 };
}
function download(){
 save();
 const p=payload(state.receipt||state.pendingReceipt||crypto.randomUUID());
 p.status="Lokal sikkerhetskopi – ikke bevis på innlevering";
 const blob=new Blob([JSON.stringify(p,null,2)],{type:"application/json"});
 const url=URL.createObjectURL(blob),a=make("a");
 a.href=url;a.download="geografiprove-2-"+new Date().toISOString().slice(0,10)+".json";a.click();
 setTimeout(()=>URL.revokeObjectURL(url),1500);
}
function jsonp(url,receipt){
 return new Promise((resolve,reject)=>{
  const prefix="quiz2_cb_"+crypto.randomUUID().replace(/-/g,"");
  const script=document.createElement("script");
  let finished=false;
  const finish=(error,value)=>{
   if(finished)return;finished=true;clearTimeout(timer);delete window[prefix];script.remove();
   if(error)reject(error);else resolve(value);
  };
  const timer=setTimeout(()=>finish(new Error("Tidsavbrudd")),8000);
  window[prefix]=value=>finish(null,value);
  script.onerror=()=>finish(new Error("Kunne ikke hente resultat"));
  script.src=url+"?action=result&receipt="+encodeURIComponent(receipt)+"&prefix="+encodeURIComponent(prefix);
  document.head.append(script);
 });
}
async function retrieveResult(receipt,maxAttempts){
 const url=window.QUIZ2_CONFIG?.submitUrl||"";
 if(!/^https:\/\/script\.google\.com\/macros\/s\/.+\/exec$/.test(url))return null;
 for(let i=0;i<maxAttempts;i++){
  try{
   const data=await jsonp(url,receipt);
   if(data&&data.status==="ready")return data;
   if(data&&data.status==="error")return data;
  }catch{}
  if(i<maxAttempts-1)await delay(1200+i*850);
 }
 return null;
}
function reviewItem(item){
 const q=qs[item.number-1],good=!!item.isCorrect;
 const card=make("article","review "+(good?"good":"bad")),head=make("div","review-header");
 head.append(make("b","","Spørsmål "+item.number),make("span","review-status",good?"✓ Riktig":"✗ Feil"));
 card.append(head,make("p","review-question",q.question));
 const selectedIndex=ABCD.indexOf(item.selected);
 const selectedText=selectedIndex>=0?q.options[selectedIndex]:"Ikke registrert";
 card.append(make("p","review-answer","Ditt svar: "+item.selected+" – "+selectedText));
 card.append(make("p","review-answer","Riktig svar: "+item.correct+" – "+item.correctText));
 card.append(make("p","review-explanation","Hvorfor: "+item.explanation));
 return card;
}
function renderResult(data){
 if(!data||data.status!=="ready"||!Array.isArray(data.feedback)||data.feedback.length!==qs.length)return;
 const section=$("results");section.hidden=false;
 $("score").textContent="";
 $("score").append(make("span","",data.score+" / "+data.total),make("small","","poeng ("+Math.round(100*data.score/data.total)+" %)"));
 const messages={
  SENT:"En kopi av resultatet og forklaringene er forsøkt sendt til e-postadressen du oppga. Sjekk innboksen og eventuelt søppelpost.",
  LIMIT:"Resultatet vises her, men e-post ble ikke sendt fordi grensen for utsendinger er nådd.",
  QUOTA:"Resultatet vises her, men e-post kunne ikke sendes fordi dagens e-postkvote er brukt.",
  FAILED:"Resultatet er lagret og vises her, men e-postsendingen feilet."
 };
 $("email-status").textContent=messages[data.emailStatus]||"Resultatet er lagret. Status for e-post er ikke bekreftet.";
 const review=$("feedback");review.textContent="";
 data.feedback.forEach(item=>review.append(reviewItem(item)));
 preventEdits();
}
function onConfirmed(data,receipt){
 state.sent=true;state.pendingReceipt=null;state.receipt=receipt;state.result=data;save();
 $("submit-status").textContent="Google Sheets har registrert innleveringen. Resultatet vises nedenfor.";
 const r=$("receipt");r.hidden=false;
 r.textContent="Bekreftet kvitterings-ID: "+receipt;
 renderResult(data);
 $("results").scrollIntoView({behavior:"smooth",block:"start"});
}
$("download").addEventListener("click",download);
$("print").addEventListener("click",()=>window.print());
$("submit").addEventListener("click",async()=>{
 save();
 if(state.sent&&state.result){renderResult(state.result);$("results").scrollIntoView({behavior:"smooth"});return;}
 const missing=qs.find(q=>!ABCD.includes(state.choices[q.number]));
 if(missing){$("submit-status").textContent="Du må svare på alle spørsmål. Mangler spørsmål "+missing.number+".";document.getElementById("q"+missing.number).scrollIntoView({behavior:"smooth"});return;}
 if(!$("student").value.trim()){$("submit-status").textContent="Skriv navnet ditt.";$("student").focus();return;}
 const email=$("email").value.trim();
 if(!email||!$("email").checkValidity()||email.length>254){$("submit-status").textContent="Oppgi en gyldig e-postadresse for å få resultatet.";$("email").focus();return;}
 if(!$("agree").checked){$("submit-status").textContent="Bekreft at du vil levere.";return;}
 const config=window.QUIZ2_CONFIG||{},url=config.submitUrl||"";
 if(!config.enabled||!/^https:\/\/script\.google\.com\/macros\/s\/.+\/exec$/.test(url)){
  $("submit-status").textContent="Innleveringen for prøve 2 er ikke aktivert av administrator. Last ned en sikkerhetskopi.";return;
 }
 const receipt=state.receipt||state.pendingReceipt||crypto.randomUUID();
 state.pendingReceipt=receipt;state.receipt=receipt;save();
 $("submit").disabled=true;$("submit-status").textContent="Sender og venter på bekreftet resultat …";
 try{
  await fetch(url,{method:"POST",mode:"no-cors",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify(payload(receipt))});
  const result=await retrieveResult(receipt,8);
  if(result&&result.status==="ready")onConfirmed(result,receipt);
  else $("submit-status").textContent="Ingen sikker bekreftelse fra Google ennå. Last ned svarene som sikkerhetskopi, og be administrator sjekke arket. Klikk på leveringsknappen igjen for å forsøke med samme kvittering.";
 }catch{
  $("submit-status").textContent="Kunne ikke bekrefte innleveringen. Svarene er lagret lokalt. Last ned sikkerhetskopi og prøv på nytt.";
 }finally{if(!state.sent)$("submit").disabled=false;}
});
fetch("questions.json").then(r=>{if(!r.ok)throw Error("Kunne ikke laste spørsmål");return r.json();})
 .then(data=>paint(data))
 .catch(e=>$("questions").textContent="Feil ved lasting: "+e.message);
})();
