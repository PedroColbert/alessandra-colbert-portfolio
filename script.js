(()=>{
'use strict';
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const header=document.getElementById('site-header');
const progress=document.getElementById('reading-progress');
const nav=document.getElementById('primary-nav');
const menu=document.getElementById('menu-toggle');
const revealNodes=[...document.querySelectorAll('.reveal')];
const depthPhotos=!reduced?[...document.querySelectorAll('button[data-photo]')].filter(el=>[3,4,5,6,7,12,13,14,15,16,17,18,19,20,21,22,23,25].includes(Number(el.dataset.photo))):[];
depthPhotos.forEach(el=>el.classList.add('parallax-tile'));
// Scroll progress and transparent header (no third-party animation library).
let ticking=false;
function onScroll(){if(ticking)return;ticking=true;requestAnimationFrame(()=>{const scroll=Math.max(0,window.scrollY);const range=Math.max(1,document.documentElement.scrollHeight-window.innerHeight);progress.style.width=`${Math.min(100,100*scroll/range)}%`;header.classList.toggle('scrolled',scroll>32);if(window.innerWidth>760){for(const tile of depthPhotos){const r=tile.getBoundingClientRect();if(r.bottom>0&&r.top<window.innerHeight){const relative=(r.top+r.height/2-window.innerHeight/2)/window.innerHeight;tile.style.setProperty('--photo-shift',`${Math.max(-17,Math.min(17,-relative*24)).toFixed(1)}px`);}}}ticking=false;});}
window.addEventListener('scroll',onScroll,{passive:true});onScroll();
if('IntersectionObserver' in window && !reduced){const revealObserver=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting){entry.target.classList.add('is-visible');revealObserver.unobserve(entry.target);}}},{threshold:.06,rootMargin:'0px 0px -20px 0px'});revealNodes.forEach(node=>revealObserver.observe(node));}else revealNodes.forEach(node=>node.classList.add('is-visible'));
// Keep the current section marked in the navigation.
const navGroups=[...document.querySelectorAll('[data-nav]')];
if('IntersectionObserver'in window){const sectionObserver=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting){const key=entry.target.dataset.nav;document.querySelectorAll('[data-nav-link]').forEach(link=>link.classList.toggle('active',link.dataset.navLink===key));}}},{rootMargin:'-25% 0px -55% 0px'});navGroups.forEach(el=>sectionObserver.observe(el));}
// Language (EN / PT): both versions are in the HTML; CSS shows one. Attributes are swapped here.
const root=document.documentElement;
const isPt=()=>root.dataset.lang==='pt';
const UI={en:{open:'Open navigation',close:'Close navigation',viewing:'Viewing ',title:'Alessandra Colbert | Pedagogical Portfolio 2026'},
          pt:{open:'Abrir menu',close:'Fechar menu',viewing:'Visualizando ',title:'Alessandra Colbert | Portfólio Pedagógico 2026'}};
const t=key=>UI[isPt()?'pt':'en'][key];
const swapNodes=[...document.querySelectorAll('[data-alt-pt],[data-aria-pt]')];
swapNodes.forEach(el=>{if(el.hasAttribute('data-alt-pt'))el.dataset.altEn=el.getAttribute('alt');if(el.hasAttribute('data-aria-pt'))el.dataset.ariaEn=el.getAttribute('aria-label');});
const langButtons=[...document.querySelectorAll('[data-set-lang]')];
function setLang(lang,save){
  root.dataset.lang=lang;root.lang=lang==='pt'?'pt-BR':'en';document.title=UI[lang].title;
  swapNodes.forEach(el=>{
    if(el.hasAttribute('data-alt-pt'))el.setAttribute('alt',lang==='pt'?el.dataset.altPt:el.dataset.altEn);
    if(el.hasAttribute('data-aria-pt'))el.setAttribute('aria-label',lang==='pt'?el.dataset.ariaPt:el.dataset.ariaEn);
  });
  langButtons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.setLang===lang)));
  menu.setAttribute('aria-label',nav.classList.contains('open')?t('close'):t('open'));
  if(save){try{localStorage.setItem('ac-lang',lang);}catch(e){}}
}
langButtons.forEach(b=>b.addEventListener('click',()=>setLang(b.dataset.setLang,true)));
// Light / dark theme (sun and moon). The head script already applied the saved or system choice.
const themeBtn=document.getElementById('theme-toggle');
const themeMeta=document.querySelector('meta[name="theme-color"]');
function applyTheme(theme,save){
  root.classList.add('theme-switching');root.dataset.theme=theme;void getComputedStyle(root).color;
  themeMeta&&themeMeta.setAttribute('content',theme==='dark'?'#171114':'#fcf5f5');
  themeBtn.setAttribute('aria-pressed',String(theme==='dark'));
  if(save){try{localStorage.setItem('ac-theme',theme);}catch(e){}}
  requestAnimationFrame(()=>requestAnimationFrame(()=>root.classList.remove('theme-switching')));
}
themeBtn.setAttribute('aria-pressed',String(root.dataset.theme==='dark'));
themeMeta&&themeMeta.setAttribute('content',root.dataset.theme==='dark'?'#171114':'#fcf5f5');
themeBtn.addEventListener('click',()=>applyTheme(root.dataset.theme==='dark'?'light':'dark',true));
matchMedia('(prefers-color-scheme: dark)').addEventListener('change',e=>{let saved=null;try{saved=localStorage.getItem('ac-theme');}catch(err){}if(!saved)applyTheme(e.matches?'dark':'light',false);});
function closeMenu(){nav.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label',t('open'));}
menu.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?t('close'):t('open'));});
setLang(isPt()?'pt':'en',false);
nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
window.addEventListener('resize',()=>{if(window.innerWidth>760)closeMenu();},{passive:true});
// Cinematic section navigation: a visual portal hides an instant jump (not a visible page scroll).
const portal=document.getElementById('scene-transition');
const portalTitle=document.getElementById('scene-transition-title');
const portalOverline=document.getElementById('scene-transition-overline');
const portalChapter=document.getElementById('scene-transition-chapter');
const navigationStatus=document.getElementById('scene-navigation-status');
const portalChapters={
  home:{title:'The Beginning',overline:'INTRODUCTION',chapter:'00 / 05'},
  about:{title:'About Me',overline:'THE EDUCATOR',chapter:'01 / 05'},
  philosophy:{title:'Teaching Philosophy',overline:'THE APPROACH',chapter:'01 / 05'},
  'hands-on':{title:'Hands-On Autonomy',overline:'PROJECT ONE',chapter:'01 / 05'},
  numeracy:{title:'Strategic Minds',overline:'PROJECT TWO',chapter:'02 / 05'},
  makers:{title:'Little Makers',overline:'PROJECT THREE',chapter:'03 / 05'},
  watercolor:{title:'Watercolor',overline:'PROJECT FOUR',chapter:'04 / 05'},
  phonics:{title:'Sound to Script',overline:'PROJECT FIVE',chapter:'05 / 05'},
  contact:{title:'Get in Touch',overline:'THANK YOU',chapter:'2026'}
};
const portalChaptersPt={
  home:{title:'O começo',overline:'INTRODUÇÃO'},
  about:{title:'Sobre mim',overline:'A EDUCADORA'},
  philosophy:{title:'Filosofia de ensino',overline:'A ABORDAGEM'},
  'hands-on':{title:'Autonomia na prática',overline:'PROJETO UM'},
  numeracy:{title:'Mentes estratégicas',overline:'PROJETO DOIS'},
  makers:{title:'Pequenos inventores',overline:'PROJETO TRÊS'},
  watercolor:{title:'Aquarela',overline:'PROJETO QUATRO'},
  phonics:{title:'Do som à escrita',overline:'PROJETO CINCO'},
  contact:{title:'Vamos conversar',overline:'OBRIGADA'}
};
let portalBusy=false;
// Use the fixed header as the scroll offset; change scroll position while entirely hidden by the portal.
function jumpToSection(node){
  document.documentElement.classList.add('scene-jump');
  const destination=node.id==='home'?0:Math.max(0,window.scrollY+node.getBoundingClientRect().top-header.getBoundingClientRect().height-14);
  window.scrollTo({top:destination,behavior:'instant'});
  // Restore normal behavior on a later frame, once the jump has painted behind the transition.
  requestAnimationFrame(()=>requestAnimationFrame(()=>document.documentElement.classList.remove('scene-jump')));
}
function waitForPortalAnimation(fallbackMs){
  return new Promise(resolve=>{
    let finished=false;
    const finish=()=>{if(finished)return;finished=true;portal.removeEventListener('animationend',listener);clearTimeout(fallback);resolve();};
    const listener=e=>{if(e.target===portal)finish();};
    const fallback=setTimeout(finish,fallbackMs);
    portal.addEventListener('animationend',listener);
  });
}
async function visitChapter(hash,{recordHistory=true}={}){
  const id=(hash||'#home').replace(/^#/,'')||'home';
  const destination=document.getElementById(id);
  if(!destination||portalBusy)return;
  closeMenu();
  const base=portalChapters[id]||{title:id,overline:'DISCOVER',chapter:'2026'};
  const chapter=isPt()&&portalChaptersPt[id]?{...base,...portalChaptersPt[id]}:base;
  const updateLocation=()=>{
    if(recordHistory&&window.location.hash!=='#'+id)history.pushState({chapter:id},'','#'+id);
    jumpToSection(destination);
  };
  if(reduced){updateLocation();navigationStatus.textContent=t('viewing')+chapter.title;return;}
  portalBusy=true;
  portalTitle.textContent=chapter.title;
  portalOverline.textContent=chapter.overline;
  portalChapter.textContent=chapter.chapter;
  portal.classList.remove('is-entering','is-leaving');
  // Force a fresh animation if the visitor navigates repeatedly between chapters.
  void portal.offsetWidth;
  portal.classList.add('is-entering');
  try{
    await waitForPortalAnimation(1000);
    updateLocation();
    // Let the destination's position and images paint under the closed portal.
    await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
    portal.classList.replace('is-entering','is-leaving');
    await waitForPortalAnimation(1150);
    navigationStatus.textContent=t('viewing')+chapter.title;
  }finally{
    portal.classList.remove('is-entering','is-leaving');
    portalBusy=false;
  }
}
// Intercept internal section links only; external URLs, email, and image viewers retain their normal actions.
document.querySelectorAll('a[href^="#"]').forEach(link=>{
  if(link.classList.contains('skip-link'))return;
  link.addEventListener('click',e=>{
    if(e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
    const hash=link.getAttribute('href');
    if(!hash||hash==='#'||!document.getElementById(hash.slice(1)))return;
    e.preventDefault();
    visitChapter(hash);
  });
});
window.addEventListener('popstate',()=>{visitChapter(window.location.hash||'#home',{recordHistory:false});});

// Full-screen 25-image PDF gallery, followed by 5 additional watercolor detail photos.
const allTiles=[...document.querySelectorAll('button[data-photo]')].sort((a,b)=>Number(a.dataset.photo)-Number(b.dataset.photo));
// Read src/alt at view time so the caption follows the language; index by position, not by photo number.
const gallery=allTiles.map(tile=>({src:tile.querySelector('img').getAttribute('src'),img:tile.querySelector('img')}));
const dialog=document.getElementById('photo-lightbox'),preview=document.getElementById('lightbox-image'),caption=document.getElementById('lightbox-caption'),counter=document.getElementById('lightbox-count');
let active=0,wasFocused=null;
function setImage(index){active=(index+gallery.length)%gallery.length;preview.src=gallery[active].src;preview.alt=gallery[active].img.alt;caption.textContent=gallery[active].img.alt;counter.textContent=`${String(active+1).padStart(2,'0')} / ${String(gallery.length).padStart(2,'0')}`;}
function openImage(index){wasFocused=document.activeElement;setImage(index);if(typeof dialog.showModal==='function')dialog.showModal();else dialog.setAttribute('open','');document.body.classList.add('no-scroll');document.getElementById('lightbox-close').focus();}
function closeImage(){if(dialog.open&&typeof dialog.close==='function')dialog.close();else dialog.removeAttribute('open');document.body.classList.remove('no-scroll');if(wasFocused?.focus)wasFocused.focus();}
allTiles.forEach((tile,i)=>tile.addEventListener('click',()=>openImage(i)));
// Carousel slides point at a photo number (data-lightbox-index + 1); open that photo wherever it sits now.
document.querySelectorAll('.carousel-photo-trigger').forEach((tile)=>tile.addEventListener('click',()=>{const n=Number(tile.dataset.lightboxIndex)+1;const i=allTiles.findIndex(t=>Number(t.dataset.photo)===n);openImage(i<0?0:i);}));
document.getElementById('lightbox-close').addEventListener('click',closeImage);
document.getElementById('lightbox-prev').addEventListener('click',()=>setImage(active-1));
document.getElementById('lightbox-next').addEventListener('click',()=>setImage(active+1));
dialog.addEventListener('click',e=>{if(e.target===dialog)closeImage();});
dialog.addEventListener('close',()=>{document.body.classList.remove('no-scroll');if(wasFocused?.focus)wasFocused.focus();});
window.addEventListener('keydown',e=>{if(!dialog.open)return;if(e.key==='ArrowLeft'){e.preventDefault();setImage(active-1);}else if(e.key==='ArrowRight'){e.preventDefault();setImage(active+1);}else if(e.key==='Escape')closeImage();});
})();
