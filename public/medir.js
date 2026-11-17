// prettier-ignore
(function(){var n=navigator,d=document,w=window,h=history,id=Math.random().toString(36).slice(2,12),q=[],r,ay,seg,vis,prof,pri=1;
if(n.doNotTrack=="1"||w.doNotTrack=="1"||n.globalPrivacyControl)return;
function ev(e){if(!r||ay&&e.t!="vista"&&!(e.t=="toque"&&/^llamar/.test(e.zona))||/^\/cita\//.test(r)&&e.t!="vista")return;q.push(e)}
function env(){if(r&&q.length)n.sendBeacon("/api/medir",JSON.stringify({r:r,v:id,e:q.splice(0,30)}));q=[]}
function sum(){if(vis)seg+=(Date.now()-vis)/1e3;vis=0}
function per(){sum();ev({t:"permanencia",rango:seg<10?"0-10":seg<30?"10-30":seg<60?"30-60":seg<180?"1-3min":"3+min"});seg=0}
function fin(){if(!r)return;per();env();r=0}
function ini(){var p=location.pathname.replace(/^\/(cita|crear-clave)\/[^/]+/,"/$1/[token]").replace(/^\/eventos\/[^/]+/,"/eventos/[slug]");
if(/^\/(ingresar|crear-clave|recuperar-clave|panel)(\/|$)/.test(p))return;
r=p;ay=p=="/ayuda-inmediata";seg=prof=0;vis=d.hidden?0:Date.now();
var f=d.referrer,o=!pri||f.indexOf(location.origin)==0?"interno":!f?"directo":/google|bing|duckduckgo|yahoo/.test(f)?"buscador":/facebook|instagram|twitter|t\.co|tiktok|linkedin/.test(f)?"red":"otro",x=w.innerWidth;
ev({t:"vista",pantalla:x<768?"movil":x<1024?"tableta":"escritorio",origen:o});
if(pri){var v=performance.getEntriesByType("navigation")[0];if(v&&v.loadEventEnd>0)ev({t:"rendimiento",ms:v.loadEventEnd|0})}
pri=0}
w.capMedir=ev;
d.addEventListener("click",function(e){var z=e.target.closest&&e.target.closest("[data-zona]");if(z)ev({t:"toque",zona:z.getAttribute("data-zona")})},true);
d.addEventListener("scroll",function(){var e=d.documentElement,p=(w.scrollY+w.innerHeight)/e.scrollHeight*100,k=p>=99?100:p>=75?75:p>=50?50:p>=25?25:0;if(k>prof){prof=k;ev({t:"desplazamiento",profundidad:k})}},{passive:true});
d.addEventListener("visibilitychange",function(){if(d.hidden){per();env()}else vis=Date.now()});
var ps=h.pushState;h.pushState=function(){fin();ps.apply(h,arguments);ini()};
w.addEventListener("popstate",function(){fin();ini()});
ini()})();
