(()=>{"use strict";
const STORAGE="geo-vg1-flervalg-2-trinnvis-v1";
const ABCD=["A","B","C","D"];
const LOCAL_FEEDBACK=[{"c":"B","e":"Jordas indre kjerne er fast på grunn av det enorme trykket. Den ytre kjernen er flytende og består hovedsakelig av jern og nikkel."},{"c":"C","e":"Litosfæren omfatter både jordskorpa og den øverste, stive delen av mantelen. Den er delt i tektoniske plater."},{"c":"A","e":"Astenosfæren består stort sett av faste bergarter som deformeres svært langsomt. Derfor kan de stive platene over bevege seg."},{"c":"A","e":"Når en gammel og tung havbunnsplate synker ned i mantelen, trekker tyngdekraften også resten av platen mot subduksjonssonen. Dette kalles platetrekk."},{"c":"D","e":"Like fossiler, bergarter og fjellkjeder på kontinenter langt fra hverandre er spor etter at kontinentene en gang hang sammen i Pangea."},{"c":"B","e":"Nazcaplaten er havbunnsskorpe som synker ned under den søramerikanske platen. Det gir jordskjelv og bidrar til vulkanisme i Andesfjellene."},{"c":"B","e":"Magma stiger opp ved midthavsryggen og størkner til ny havbunn. Havbunnen skyves utover og blir eldre jo lenger den ligger fra ryggen."},{"c":"C","e":"Avstand delt på tid gir farten: 120 km = 12 000 000 cm. 12 000 000 cm / 6 000 000 år = 2 cm/år for én side."},{"c":"A","e":"Island ligger både over en hotspot og på den midtatlantiske ryggen, der platene sprer seg. Begge forhold bidrar til vulkanismen."},{"c":"B","e":"Når et kontinent strekkes, kan jordskorpa sprekke opp og blokker synke langs forkastninger. Forsenkningen kalles en riftdal."},{"c":"D","e":"Himalaya ble dannet da den indiske og den eurasiske kontinentalskorpa kolliderte. Bergarter ble foldet og presset opp til en fjellkjede."},{"c":"C","e":"Når to havbunnsplater møtes, kan én synke under den andre. Magma kan da stige opp og danne vulkanøyer i en bue."},{"c":"A","e":"Den tunge havbunnsplaten synker under kontinentet og skaper en dyphavsgrop. Smelting i mantelen over platen gir magma og vulkanske fjell på land."},{"c":"D","e":"Ved en glidegrense beveger platene seg sidelengs. Friksjonen kan låse dem slik at spenning bygger seg opp og utløser jordskjelv."},{"c":"C","e":"Fokus er stedet inne i jorda der bruddet begynner. Episenteret er punktet på jordoverflaten rett over dette stedet."},{"c":"B","e":"Seismografen registrerer rystelser som kan analyseres. Momentmagnitude (Mw) beskriver størrelsen på jordskjelvet ut fra seismisk moment."},{"c":"A","e":"En økning på én enhet på momentmagnitudeskalaen tilsvarer omtrent 32 ganger så mye frigjort energi, ikke bare dobbelt så mye."},{"c":"D","e":"En tsunami kan oppstå når havbunnen plutselig flytter store vannmasser, særlig ved vertikal forskyvning under et undersjøisk jordskjelv."},{"c":"C","e":"Skader avhenger også av blant annet byggekvalitet, løsmasser, befolkningstetthet og beredskap. Samme skjelv kan derfor få ulik virkning."},{"c":"B","e":"Havbunnsplaten beveger seg over en forholdsvis fastliggende hotspot. Nye vulkaner dannes nær hotspoten, mens eldre øyer føres bort."},{"c":"A","e":"Lettflytende basaltisk lava kan strømme langt og bygge opp en bred vulkan med slake sider. Det er typisk for skjoldvulkaner."},{"c":"C","e":"Tyktflytende magma gjør det vanskeligere for gass å slippe ut. Trykket kan bygge seg opp og gi eksplosive utbrudd i stratovulkaner."},{"c":"D","e":"En hotspot kan gi vulkanisme inne på en plate, uten subduksjon. Vulkanske øybuer dannes vanligvis når én havbunnsplate synker under en annen."},{"c":"B","e":"Granitt dannes når magma størkner langsomt dypt i jordskorpa. Det gir store krystaller, ofte av kvarts, feltspat og glimmer."},{"c":"A","e":"En gangbergart dannes når magma størkner i sprekker eller ganger under jordoverflaten, i motsetning til dag- og dypbergarter."},{"c":"C","e":"Basalt dannes ofte av lava som kjøles raskt ned ved jordoverflaten. Krystallene får derfor kort tid til å vokse og blir små."},{"c":"D","e":"Sand avsettes i lag, presses sammen og sementeres. Da blir de løse sandkornene til sedimentær bergart, altså sandstein."},{"c":"B","e":"Kalkstein kan bli til marmor når varme og trykk fører til omkrystallisering uten at bergarten smelter. Dette kalles metamorfose."},{"c":"A","e":"Gneis er en metamorf bergart. Høyt trykk og temperatur kan omdanne mineralene og gi tydelige striper eller bånd."},{"c":"D","e":"Bergartenes kretsløp er ikke én fast rekkefølge. En magmatisk bergart kan for eksempel bli metamorf direkte ved varme og trykk."},{"c":"C","e":"Den kaledonske fjellkjeden oppstod ved kontinentkollisjon. Bergarter ble foldet, skjøvet og omdannet av trykk og varme."},{"c":"B","e":"Oslofeltet ble dannet ved oppsprekking og innsynking av jordskorpa. Magmatisk aktivitet dannet flere vulkanske og intrusive bergarter."}];
const $=id=>document.getElementById(id);
const el=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e};
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
let questions=[],images={},timer;
let state={name:"",email:"",choices:{},feedback:{},index:0,stage:"quiz",receipt:null,result:null};
try{const s=JSON.parse(localStorage.getItem(STORAGE));if(s&&typeof s==="object")state={...state,...s,choices:s.choices||{},feedback:s.feedback||{}}}catch{}
function store(){state.name=$("student").value;state.email=$("email").value;
 try{localStorage.setItem(STORAGE,JSON.stringify(state));$("save-status").textContent="Lagret kl. "+new Date().toLocaleTimeString("nb-NO")}
 catch{$("save-status").textContent="Lagring mislyktes – last ned en kopi"}updateProgress()}
function schedule(){clearTimeout(timer);timer=setTimeout(store,250);$("save-status").textContent="Lagrer …"}
function updateProgress(){const count=questions.filter(q=>ABCD.includes(state.choices[q.number])).length;
 $("progress-label").textContent=count+" av "+questions.length+" besvart";
 $("bar-fill").style.width=(questions.length?100*count/questions.length:0)+"%"}
function url(){return window.QUIZ2_CONFIG?.submitUrl||""}
function validUrl(x){return /^https:\/\/script\.google\.com\/macros\/s\/.+\/exec$/.test(x)}
function getJsonp(params){return new Promise((resolve,reject)=>{
 const target=url();if(!validUrl(target)){reject(Error("Mottaker er ikke konfigurert"));return}
 const cb="quiz2_cb_"+crypto.randomUUID().replace(/-/g,"");
 const script=document.createElement("script");let finished=false;
 const finish=(err,value)=>{if(finished)return;finished=true;clearTimeout(timeout);delete window[cb];script.remove();if(err)reject(err);else resolve(value)};
 const timeout=setTimeout(()=>finish(Error("Ingen svar fra Google")),10000);
 window[cb]=data=>finish(null,data);
 script.onerror=()=>finish(Error("Nettverksfeil ved kontroll"));
 script.src=target+"?"+new URLSearchParams({...params,prefix:cb}).toString();
 document.head.append(script);
})}
function checkAnswer(number,choice){
 const item=LOCAL_FEEDBACK[number-1];
 const question=questions[number-1];
 if(!item||!question||!ABCD.includes(choice))return;
 const rightText=question.options[ABCD.indexOf(item.c)];
 const data={status:"checked",number,selected:choice,isCorrect:choice===item.c,correct:item.c,correctText:rightText,explanation:item.e};
 state.feedback[number]=data;store();renderQuestion();
 $("feedback-panel").scrollIntoView({behavior:"smooth",block:"nearest"});
}
function choose(number,choice){
 if(state.stage!=="quiz"||state.choices[number]||questions[state.index].number!==number)return;
 state.choices[number]=choice;store();renderQuestion();checkAnswer(number,choice);
}
function renderQuestion(){
 const q=questions[state.index],choice=state.choices[q.number]||"",known=state.feedback[q.number];
 const card=$("question-card");card.textContent="";
 const top=el("div","qtop");
 top.append(el("span","topic",q.topic),el("span","qnum","Spørsmål "+q.number+" av "+questions.length));
 card.append(top,el("h2","",q.question));
 if(q.image&&images[q.image]){
  const img=images[q.image],box=el("div","source"),holder=el("div"),link=el("a","",img.label);
  link.href=img.url;link.rel="noopener noreferrer";link.target="_blank";
  holder.append(link,el("p","",img.credit+" · "+img.license+" · Åpnes i ny fane"));
  box.append(el("span","symbol","↗"),holder);card.append(box);
 }
 const options=el("div","answers");options.setAttribute("role","radiogroup");options.setAttribute("aria-label","Svaralternativer for spørsmål "+q.number);
 q.options.forEach((text,i)=>{
  const c=ABCD[i],label=el("label","option"),input=el("input");
  input.type="radio";input.name="q"+q.number;input.value=c;input.checked=choice===c;input.disabled=!!choice;
  if(choice){label.classList.add("locked");
   if(c===choice)label.classList.add("selected");
   if(known&&c===known.correct)label.classList.add("right");
   if(known&&c===choice&&c!==known.correct)label.classList.add("wrong");
  }else input.addEventListener("change",()=>choose(q.number,c));
  label.append(input,el("strong","letter",c+"."),el("span","",text));options.append(label);
 });
 card.append(options);
 const panel=$("feedback-panel"),next=$("next");
 if(!choice){panel.hidden=true;next.hidden=true;return}
 panel.hidden=false;
 if(!known){panel.className="instant-feedback pending";panel.textContent="Svaret er låst. Henter forklaring …";next.hidden=true;return}
 const good=!!known.isCorrect;
 panel.className="instant-feedback "+(good?"correct":"incorrect");panel.textContent="";
 panel.append(el("h3","",good?"✓ Riktig!":"✕ Feil svar"));
 if(!good)panel.append(el("p","","Du valgte "+choice+" – "+q.options[ABCD.indexOf(choice)]));
 panel.append(el("p","","Riktig svar: "+known.correct+" – "+known.correctText));
 panel.append(el("p","why","Hvorfor: "+known.explanation));
 next.hidden=false;next.textContent=q.number===questions.length?"Gå til innlevering":"Neste spørsmål";
}
function locallyCalculated(){const right=questions.reduce((n,q)=>n+(state.choices[q.number]===LOCAL_FEEDBACK[q.number-1].c?1:0),0);$("results").hidden=false;const label=$("results").querySelector(".results-eyebrow");if(label)label.textContent="LOKALT RESULTAT – IKKE BEKREFTET LEVERT";$("score").textContent=Math.round(100*right/questions.length)+" %";$("score-detail").textContent=right+" av "+questions.length+" riktig. Dette er beregnet lokalt.";$("email-status").textContent="Innleveringen er ikke bekreftet lagret hos Google. Last ned svarene som sikkerhetskopi.";}
function renderResults(){
 const result=state.result;
 if(!result||result.status!=="ready")return;
 const score=Number(result.score),total=Number(result.total),pct=Math.round(score/total*100);
 if(!Number.isFinite(pct)||total!==questions.length)return;
 $("score").textContent=pct+" %";
 $("score-detail").textContent=score+" av "+total+" spørsmål riktig.";
 const msg={SENT:"En kopi av resultatet og forklaringene er forsøkt sendt til e-postadressen din.",
 LIMIT:"Resultatet er lagret, men e-post ble ikke sendt på grunn av utsendingsgrensen.",
 QUOTA:"Resultatet er lagret, men e-postkvoten er brukt opp.",
 FAILED:"Resultatet er lagret, men e-post kunne ikke sendes."};
 $("email-status").textContent=msg[result.emailStatus]||"Resultatet er registrert. E-poststatus er ikke bekreftet.";
 $("student").readOnly=true;$("email").readOnly=true;
}
function show(){
 $("stage-quiz").hidden=state.stage!=="quiz";
 $("delivery").hidden=state.stage!=="delivery";
 $("results").hidden=state.stage!=="done";
 updateProgress();
 if(state.stage==="quiz")renderQuestion();
 if(state.stage==="done")renderResults();
}
function next(){
 const q=questions[state.index];
 if(state.stage!=="quiz"||!state.feedback[q.number])return;
 if(state.index+1>=questions.length)state.stage="delivery";else state.index++;
 store();show();window.scrollTo({top:0,behavior:"smooth"});
}
function payload(receipt){return{
 exam:"Geografi VG1 – Flervalgsprøve 2",version:1,student:$("student").value.trim(),
 email:$("email").value.trim(),receipt,submittedAt:new Date().toISOString(),
 answers:questions.map(q=>({number:q.number,choice:state.choices[q.number]||""}))
}}
function backup(){
 store();const d={...payload(state.receipt||crypto.randomUUID()),note:"Lokal kopi, ikke mottakskvittering"};
 const blob=new Blob([JSON.stringify(d,null,2)],{type:"application/json"}),href=URL.createObjectURL(blob),a=el("a");
 a.href=href;a.download="geografi-prove2-"+new Date().toISOString().slice(0,10)+".json";a.click();
 setTimeout(()=>URL.revokeObjectURL(href),1500);
}
async function resultLookup(receipt){
 for(let i=0;i<8;i++){
  try{const result=await getJsonp({action:"result",receipt});
   if(result&&result.status==="ready")return result;
  }catch(err){}
  if(i<7)await delay(1000+i*500);
 }return null;
}
function confirmed(result,receipt){state.result=result;state.receipt=receipt;state.stage="done";store();show();$("results").scrollIntoView({behavior:"smooth"})}
async function submit(){
 store();
 if(state.stage!=="delivery")return;
 if(questions.some(q=>!ABCD.includes(state.choices[q.number])||!state.feedback[q.number])){
  $("submit-status").textContent="Noen spørsmål mangler bekreftet tilbakemelding.";return;
 }
 if(!state.name.trim()){$("submit-status").textContent="Skriv inn navnet ditt."; $("student").focus();return}
 if(!state.email.trim()||!$("email").checkValidity()||state.email.length>254){
  $("submit-status").textContent="Skriv inn en gyldig e-postadresse."; $("email").focus();return;
 }
 if(!$("agree").checked){$("submit-status").textContent="Kryss av for at du vil levere.";return}
 if(!window.QUIZ2_CONFIG?.enabled||!validUrl(url())){
  $("submit-status").textContent="Innlevering til Google Sheets er ikke aktivert ennå. Last ned svarene som sikkerhetskopi.";return;
 }
 locallyCalculated();
 const receipt=state.receipt||crypto.randomUUID();state.receipt=receipt;store();
 const button=$("submit");button.disabled=true;
 $("submit-status").textContent="Sender besvarelsen til Google Sheets …";
 try{
  await fetch(url(),{method:"POST",mode:"no-cors",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify(payload(receipt))});
  $("submit-status").textContent="Sjekker at innleveringen er registrert …";
  const result=await resultLookup(receipt);
  if(result)confirmed(result,receipt);
  else {$("submit-status").textContent="Mottak er ikke bekreftet. Prosenten nedenfor er beregnet lokalt.";locallyCalculated();}
 }catch(err){$("submit-status").textContent="Kunne ikke bekrefte innleveringen. Last ned en sikkerhetskopi.";locallyCalculated()}
 finally{button.disabled=false}
}
$("next").addEventListener("click",next);
$("submit").addEventListener("click",submit);
$("download").addEventListener("click",backup);
$("print").addEventListener("click",()=>window.print());
fetch("questions.json").then(r=>{if(!r.ok)throw Error("Spørsmål kunne ikke lastes");return r.json()}).then(data=>{
 questions=data.questions;images=data.images||{};
 if(!Array.isArray(questions)||questions.length!==32)throw Error("Feil antall spørsmål");
 state.index=Math.max(0,Math.min(31,Number(state.index)||0));
 if(!["quiz","delivery","done"].includes(state.stage))state.stage="quiz";
 $("student").value=state.name;$("email").value=state.email;
 $("student").addEventListener("input",schedule);$("email").addEventListener("input",schedule);
 show();
 if(state.stage==="quiz"&&state.choices[questions[state.index].number]&&!state.feedback[questions[state.index].number])
  checkAnswer(questions[state.index].number,state.choices[questions[state.index].number]);
 if(state.stage==="delivery"&&state.receipt)resultLookup(state.receipt).then(r=>{if(r)confirmed(r,state.receipt)});
}).catch(e=>$("question-card").textContent="Kunne ikke starte prøven: "+e.message);
})();