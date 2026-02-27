(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))n(o);new MutationObserver(o=>{for(const c of o)if(c.type==="childList")for(const a of c.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&n(a)}).observe(document,{childList:!0,subtree:!0});function s(o){const c={};return o.integrity&&(c.integrity=o.integrity),o.referrerPolicy&&(c.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?c.credentials="include":o.crossOrigin==="anonymous"?c.credentials="omit":c.credentials="same-origin",c}function n(o){if(o.ep)return;o.ep=!0;const c=s(o);fetch(o.href,c)}})();const C="/api";async function u(t,e={}){try{const s=await fetch(`${C}${t}`,{headers:{"Content-Type":"application/json",...e.headers},...e});if(!s.ok){const n=await s.json().catch(()=>({error:"Request failed"}));throw new Error(n.error||`HTTP ${s.status}`)}return await s.json()}catch(s){throw console.error("API Error:",s),s}}const y={async create(t,e=null){return u("/sessions",{method:"POST",body:JSON.stringify({club_mode:t,iron_type:e})})},async getActive(){return u("/sessions/status/active")},async getById(t){return u(`/sessions/${t}`)},async end(t,e=null){return u(`/sessions/${t}/end`,{method:"PUT",body:JSON.stringify({notes:e})})},async getHistory(t=50,e=null){const s=new URLSearchParams({limit:t});return e&&s.append("club_mode",e),u(`/sessions?${s}`)},async delete(t){return u(`/sessions/${t}`,{method:"DELETE"})}},L={async record(t,e,s){return u("/shots",{method:"POST",body:JSON.stringify({session_id:t,shot_type:e,shot_category:s})})},async getBySession(t){return u(`/shots/session/${t}`)},async delete(t){return u(`/shots/${t}`,{method:"DELETE"})}};class P{constructor(){this.sessionId=null,this.clubMode=null,this.ironType=null,this.shots=[],this.lastShotId=null}async startSession(e,s=null){try{const n=await y.create(e,s);return this.sessionId=n.id,this.clubMode=e,this.ironType=s,this.shots=[],this.lastShotId=null,this.saveToLocalStorage(),n}catch(n){throw console.error("Failed to start session:",n),n}}async recordShot(e,s){try{const n=await L.record(this.sessionId,e,s);return this.shots.push({id:n.id,shot_type:e,shot_category:s,timestamp:new Date().toISOString()}),this.lastShotId=n.id,this.saveToLocalStorage(),n}catch(n){throw console.error("Failed to record shot:",n),n}}async undoLastShot(){if(!this.lastShotId)throw new Error("No shot to undo");try{const e=await L.delete(this.lastShotId);return this.shots=this.shots.filter(s=>s.id!==this.lastShotId),this.shots.length>0?this.lastShotId=this.shots[this.shots.length-1].id:this.lastShotId=null,this.saveToLocalStorage(),e}catch(e){throw console.error("Failed to undo shot:",e),e}}async endSession(e=null){try{const s=await y.end(this.sessionId,e);return this.clearLocalStorage(),s}catch(s){throw console.error("Failed to end session:",s),s}}calculateLiveStats(){const e={pure_count:0,hook_count:0,leak_left_count:0,slight_right_count:0,slice_count:0,top_count:0,chunk_count:0,hosel_count:0,make_count:0,miss_count:0,hammered_count:0,speed_make_count:0,gimme_count:0,babied_count:0,on_target_count:0,left_count:0,right_count:0,short_count:0,long_count:0,pure_percentage:0,total_shots:this.shots.length,recent_shots:[]};if(this.shots.forEach(s=>{switch(s.shot_type.toLowerCase()){case"pure":e.pure_count++;break;case"hook":e.hook_count++;break;case"leak_left":e.leak_left_count++;break;case"slight_right":e.slight_right_count++;break;case"slice":e.slice_count++;break;case"top":e.top_count++;break;case"chunk":e.chunk_count++;break;case"hosel":e.hosel_count++;break;case"make":e.make_count++;break;case"miss":e.miss_count++;break;case"hammered":e.hammered_count++;break;case"speed_make":e.speed_make_count++;break;case"gimme":e.gimme_count++;break;case"babied":e.babied_count++;break;case"on_target":e.on_target_count++;break;case"left":e.left_count++;break;case"right":e.right_count++;break;case"short":e.short_count++;break;case"long":e.long_count++;break}}),this.shots.length>0){const s=e.pure_count+e.on_target_count+e.speed_make_count+e.gimme_count;e.pure_percentage=Math.round(s/this.shots.length*100*10)/10}return e.recent_shots=this.shots.slice(-5).reverse().map(s=>({type:s.shot_type,category:s.shot_category})),e}getClubDisplay(){return this.clubMode==="iron"&&this.ironType?`${this.ironType.toUpperCase()}`:this.clubMode.charAt(0).toUpperCase()+this.clubMode.slice(1)}saveToLocalStorage(){const e={sessionId:this.sessionId,clubMode:this.clubMode,ironType:this.ironType,shots:this.shots,lastShotId:this.lastShotId};localStorage.setItem("activeSession",JSON.stringify(e))}loadFromLocalStorage(){const e=localStorage.getItem("activeSession");if(e){const s=JSON.parse(e);return this.sessionId=s.sessionId,this.clubMode=s.clubMode,this.ironType=s.ironType,this.shots=s.shots||[],this.lastShotId=s.lastShotId,!0}return!1}clearLocalStorage(){localStorage.removeItem("activeSession")}hasActiveSession(){return this.sessionId!==null}}function h(t){document.querySelectorAll(".screen").forEach(s=>{s.classList.remove("active")});const e=document.getElementById(t);e&&e.classList.add("active")}function I(t){const e=document.getElementById(t);e&&e.classList.add("active")}function p(t){const e=document.getElementById(t);e&&e.classList.remove("active")}function g(t,e){const s=document.getElementById("club-display"),n=document.getElementById("shot-counter");s&&(s.textContent=t),n&&(n.textContent=e===1?"1 shot":`${e} shots`)}function f(t){const e=document.getElementById("pure-percentage");e&&(e.textContent=`${t.pure_percentage}%`);const s=document.getElementById("recent-shots-list");s&&(t.recent_shots.length===0?s.innerHTML='<span class="empty-state">No shots yet</span>':s.innerHTML=t.recent_shots.map(n=>`<span class="recent-shot-badge ${n.type}">${n.type}</span>`).join(""))}function $(t,e=null,s=null){const n=document.getElementById("contact-section"),o=document.getElementById("accuracy-section"),c=document.getElementById("putter-makemiss-section"),a=document.getElementById("putter-speed-section"),i=document.getElementById("stat-label");t==="putter"?e==="speed"?i.textContent="Make/Gimme %":i.textContent="Make %":s==="accuracy"?i.textContent="On-Target %":i.textContent="Pure %",t==="putter"?(n.classList.add("hidden"),o.classList.add("hidden"),e==="speed"?(c.classList.add("hidden"),a.classList.remove("hidden")):(c.classList.remove("hidden"),a.classList.add("hidden"))):(c.classList.add("hidden"),a.classList.add("hidden"),s==="accuracy"?(n.classList.add("hidden"),o.classList.remove("hidden")):(n.classList.remove("hidden"),o.classList.add("hidden")))}function _(t){const e=document.getElementById("undo-btn");e&&(e.disabled=!t)}function M(t){t.classList.add("flash"),setTimeout(()=>{t.classList.remove("flash")},300)}function A(t,e,s=null,n=null){const o=document.getElementById("summary-total");o&&(o.textContent=t.total_shots);const c=document.getElementById("summary-pure-pct");if(c)if(e==="putter")if(n==="speed"){const i=(t.speed_make_count||0)+(t.gimme_count||0),d=t.total_shots||1,S=Math.round(i/d*100);c.textContent=`${i}/${d}`,c.parentElement.querySelector("span:last-child").textContent=`Goal (${S}%)`}else{const i=t.make_count||0,d=i+(t.miss_count||0),S=d>0?Math.round(i/d*100):0;c.textContent=`${S}%`,c.parentElement.querySelector("span:last-child").textContent="Make %"}else s==="accuracy"?(c.textContent=`${t.pure_percentage||0}%`,c.parentElement.querySelector("span:last-child").textContent="On Target"):(c.textContent=`${t.pure_percentage||0}%`,c.parentElement.querySelector("span:last-child").textContent="Pure");const a=document.getElementById("summary-stats");a&&(a.innerHTML=B(t,e,s,n))}function B(t,e,s=null,n=null){if(e==="putter")return n==="speed"?`
        <div class="stat-group">
          <h4>Speed Control</h4>
          ${l("Make",t.speed_make_count||0,t.total_shots,"#22c55e")}
          ${l("Gimme Range",t.gimme_count||0,t.total_shots,"#3b82f6")}
          ${l("Babied It",t.babied_count||0,t.total_shots,"#f97316")}
          ${l("Hammered It",t.hammered_count||0,t.total_shots,"#ef4444")}
        </div>
      `:`
        <div class="stat-group">
          <h4>Putting</h4>
          ${l("Make",t.make_count||0,t.total_shots,"#22c55e")}
          ${l("Miss",t.miss_count||0,t.total_shots,"#ef4444")}
        </div>
      `;const o=(t.top_count||0)+(t.chunk_count||0)+(t.hosel_count||0),c=o>0?`
    <div class="stat-group">
      <h4>Mishits</h4>
      ${l("Top",t.top_count||0,o,"#ef4444")}
      ${l("Chunk",t.chunk_count||0,o,"#ef4444")}
      ${l("Hosel",t.hosel_count||0,o,"#ef4444")}
    </div>
  `:"";if(s==="accuracy"){const i=(t.on_target_count||0)+(t.left_count||0)+(t.right_count||0)+(t.short_count||0)+(t.long_count||0);return`
      <div class="stat-group">
        <h4>Target Accuracy</h4>
        ${l("On Target",t.on_target_count||0,i,"#22c55e")}
        ${l("Left",t.left_count||0,i,"#3b82f6")}
        ${l("Right",t.right_count||0,i,"#3b82f6")}
        ${l("Short",t.short_count||0,i,"#f97316")}
        ${l("Long",t.long_count||0,i,"#f97316")}
      </div>
      ${c}
    `}const a=(t.hook_count||0)+(t.leak_left_count||0)+(t.pure_count||0)+(t.slight_right_count||0)+(t.slice_count||0);return`
    <div class="stat-group">
      <h4>Ball Flight</h4>
      ${l("Hook",t.hook_count||0,a,"#ef4444")}
      ${l("Leak Left",t.leak_left_count||0,a,"#f97316")}
      ${l("Pure",t.pure_count||0,a,"#22c55e")}
      ${l("Slight Right",t.slight_right_count||0,a,"#3b82f6")}
      ${l("Slice",t.slice_count||0,a,"#a855f7")}
    </div>
    ${c}
  `}function l(t,e,s,n){const o=s>0?e/s*100:0;return`
    <div class="stat-bar">
      <span class="stat-bar-label">${t}</span>
      <div class="stat-bar-container">
        <div class="stat-bar-fill" style="width: ${o}%; background: ${n};"></div>
      </div>
      <span class="stat-bar-value">${e}</span>
    </div>
  `}function F(t){const e=document.getElementById("history-list");if(e){if(t.length===0){e.innerHTML='<div class="empty-state">No practice sessions yet</div>';return}e.innerHTML=t.map(s=>{const o=new Date(s.started_at).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}),c=s.club_mode==="iron"&&s.iron_type?`${s.iron_type.toUpperCase()}`:s.club_mode.charAt(0).toUpperCase()+s.club_mode.slice(1),a=s.pure_percentage!==null?s.pure_percentage:0;return`
      <div class="history-item" data-session-id="${s.id}">
        <div class="history-item-header">
          <span class="history-club">${c}</span>
          <span class="history-date">${o}</span>
        </div>
        <div class="history-stats">
          <div class="history-stat">
            <span class="history-stat-value">${s.total_shots}</span>
            <span class="history-stat-label">Shots</span>
          </div>
          <div class="history-stat">
            <span class="history-stat-value">${a}%</span>
            <span class="history-stat-label">Pure</span>
          </div>
        </div>
      </div>
    `}).join("")}}function H(t){const e=document.getElementById("session-detail-content");if(!e)return;const n=new Date(t.started_at).toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric",hour:"numeric",minute:"2-digit"}),o=t.club_mode==="iron"&&t.iron_type?`${t.iron_type.toUpperCase()}`:t.club_mode.charAt(0).toUpperCase()+t.club_mode.slice(1);e.innerHTML=`
    <h2>${o} Session</h2>
    <p class="session-date">${n}</p>
    <div class="summary-highlight">
      <div class="total-shots">
        <span>${t.total_shots}</span>
        <span>Total Shots</span>
      </div>
      <div class="pure-stat">
        <span>${t.stats?.pure_percentage||0}%</span>
        <span>Pure</span>
      </div>
    </div>
    ${t.stats?`
      <div class="summary-stats">
        ${B(t.stats,t.club_mode)}
      </div>
    `:""}
    ${t.notes?`
      <div class="session-notes">
        <h4>Notes</h4>
        <p>${t.notes}</p>
      </div>
    `:""}
  `}let T="all";async function D(){await w(T),O()}async function w(t="all"){try{const e=await y.getHistory(50,t==="all"?null:t);F(e)}catch(e){console.error("Failed to load history:",e);const s=document.getElementById("history-list");s&&(s.innerHTML='<div class="empty-state">Failed to load history</div>')}}function O(){const t=document.querySelectorAll(".filter-btn");t.forEach(o=>{o.addEventListener("click",async c=>{const a=c.target.dataset.filter;T=a,t.forEach(i=>i.classList.remove("active")),c.target.classList.add("active"),await w(a)})});const e=document.getElementById("history-list");e&&e.addEventListener("click",async o=>{const c=o.target.closest(".history-item");if(c){const a=c.dataset.sessionId;await q(a)}});const s=document.querySelector("#session-detail-modal .modal-close");s&&s.addEventListener("click",()=>{p("session-detail-modal")});const n=document.getElementById("session-detail-modal");n&&n.addEventListener("click",o=>{o.target===n&&p("session-detail-modal")})}async function q(t){try{const e=await y.getById(t);H(e),I("session-detail-modal")}catch(e){console.error("Failed to load session detail:",e),alert("Failed to load session details")}}const r=new P;let k=null,b=null,m=null;function E(){x(),N(),U(),j(),W()}function x(){document.querySelectorAll(".category-btn").forEach(o=>{o.addEventListener("click",c=>{const a=c.currentTarget.dataset.category;h(`${a}-screen`)})}),document.querySelectorAll(".club-btn").forEach(o=>{o.addEventListener("click",c=>{const a=c.currentTarget.dataset.club,i=c.currentTarget.dataset.mode,d=c.currentTarget.dataset.practiceMode;a==="iron"?(m=d,I("iron-modal")):a==="putter"?(b=i,v(a,null,i)):(m=d,v(a,null,null,d))})});const s=document.querySelector(".history-nav-btn");s&&s.addEventListener("click",()=>{h("history-screen"),D()}),document.querySelectorAll(".back-btn").forEach(o=>{o.addEventListener("click",c=>{const a=c.currentTarget.dataset.back;h(a||"home-screen")})})}function N(){document.querySelectorAll(".iron-type-btn").forEach(s=>{s.addEventListener("click",n=>{const o=n.target.dataset.iron;p("iron-modal"),v("iron",o,null,m)})});const e=document.querySelector(".modal-cancel");e&&e.addEventListener("click",()=>{p("iron-modal"),m=null})}function U(){const t=document.querySelector(".practice-container");t&&t.addEventListener("click",async n=>{const o=n.target.closest(".shot-btn");if(o&&!o.disabled){const c=o.dataset.shot,a=o.dataset.category;c&&a&&(M(o),await J(c,a))}});const e=document.getElementById("undo-btn");e&&e.addEventListener("click",async()=>{await R()});const s=document.getElementById("end-session-btn");s&&s.addEventListener("click",()=>{G()})}function j(){const t=document.getElementById("save-session-btn");t&&t.addEventListener("click",async()=>{await K()});const e=document.getElementById("discard-session-btn");e&&e.addEventListener("click",()=>{confirm("Are you sure you want to discard this session?")&&(r.clearLocalStorage(),h("home-screen"))})}async function v(t,e=null,s=null,n=null){try{await r.startSession(t,e),s&&(b=s),n&&(m=n),$(t,s,n);let o=r.getClubDisplay();t==="putter"&&s?o=s==="makemiss"?"Putter - Make/Miss":"Putter - Speed Control":n&&(o=`${r.getClubDisplay()} - ${n==="contact"?"Contact":"Accuracy"}`),g(o,0),f(r.calculateLiveStats()),_(!1),h("practice-screen")}catch(o){console.error("Failed to start session:",o),alert("Failed to start practice session. Please try again.")}}async function J(t,e){try{const s=await r.recordShot(t,e),n=r.calculateLiveStats();g(r.getClubDisplay(),r.shots.length),f(n),_(!0)}catch(s){console.error("Failed to record shot:",s),alert("Failed to record shot. Please try again.")}}async function R(){try{await r.undoLastShot();const t=r.calculateLiveStats();g(r.getClubDisplay(),r.shots.length),f(t),_(r.shots.length>0)}catch(t){console.error("Failed to undo shot:",t),alert("Failed to undo shot. Please try again.")}}function G(){if(r.shots.length===0){confirm("No shots recorded. Abandon this session and return home?")&&(r.clearLocalStorage(),h("home-screen"));return}k={...r.calculateLiveStats(),total_shots:r.shots.length},A(k,r.clubMode,m,b),h("summary-screen")}async function K(){try{const t=document.getElementById("session-notes")?.value||null;await r.endSession(t),alert("Session saved successfully!"),h("home-screen");const e=document.getElementById("session-notes");e&&(e.value="")}catch(t){console.error("Failed to save session:",t),alert("Failed to save session. Please try again.")}}async function W(){r.loadFromLocalStorage()&&(confirm("You have an active practice session. Would you like to resume?")?($(r.clubMode),g(r.getClubDisplay(),r.shots.length),f(r.calculateLiveStats()),_(r.shots.length>0),h("practice-screen")):r.clearLocalStorage())}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",E):E();
