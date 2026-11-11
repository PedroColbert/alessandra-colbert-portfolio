(()=>{
'use strict';
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const header=document.getElementById('site-header');
const progress=document.getElementById('reading-progress');
const nav=document.getElementById('primary-nav');
const menu=document.getElementById('menu-toggle');
const revealNodes=[...document.querySelectorAll('.reveal')];
const depthPhotos=!reduced?[...document.querySelectorAll('button[data-photo]')].filter(el=>[3,4,5,6,7,12,13,14,15,16,17,18,19,20,21,22,23,24,25].includes(Number(el.dataset.photo))):[];
depthPhotos.forEach(el=>el.classList.add('parallax-tile'));
// Scroll progress and transparent header (no third-party animation library).
let ticking=false;
function onScroll(){if(ticking)return;ticking=true;requestAnimationFrame(()=>{const scroll=Math.max(0,window.scrollY);const range=Math.max(1,document.documentElement.scrollHeight-window.innerHeight);progress.style.width=`${Math.min(100,100*scroll/range)}%`;header.classList.toggle('scrolled',scroll>32);if(window.innerWidth>760){for(const tile of depthPhotos){const r=tile.getBoundingClientRect();if(r.bottom>0&&r.top<window.innerHeight){const relative=(r.top+r.height/2-window.innerHeight/2)/window.innerHeight;tile.style.setProperty('--photo-shift',`${Math.max(-17,Math.min(17,-relative*24)).toFixed(1)}px`);}}}ticking=false;});}
window.addEventListener('scroll',onScroll,{passive:true});onScroll();
if('IntersectionObserver' in window && !reduced){const revealObserver=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting){entry.target.classList.add('is-visible');revealObserver.unobserve(entry.target);}}},{threshold:.06,rootMargin:'0px 0px -20px 0px'});revealNodes.forEach(node=>revealObserver.observe(node));}else revealNodes.forEach(node=>node.classList.add('is-visible'));
// Keep the current section marked in the navigation.
const navGroups=[...document.querySelectorAll('[data-nav]')];
if('IntersectionObserver'in window){const sectionObserver=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting){const key=entry.target.dataset.nav;document.querySelectorAll('[data-nav-link]').forEach(link=>link.classList.toggle('active',link.dataset.navLink===key));}}},{rootMargin:'-25% 0px -55% 0px'});navGroups.forEach(el=>sectionObserver.observe(el));}
function closeMenu(){nav.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Open navigation');}
menu.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Close navigation':'Open navigation');});
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
  const chapter=portalChapters[id]||{title:id,overline:'DISCOVER',chapter:'2026'};
  const updateLocation=()=>{
    if(recordHistory&&window.location.hash!=='#'+id)history.pushState({chapter:id},'','#'+id);
    jumpToSection(destination);
  };
  if(reduced){updateLocation();navigationStatus.textContent='Viewing '+chapter.title;return;}
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
    navigationStatus.textContent='Viewing '+chapter.title;
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
const gallery=allTiles.map(tile=>({src:tile.querySelector('img').getAttribute('src'),alt:tile.querySelector('img').alt}));
const dialog=document.getElementById('photo-lightbox'),preview=document.getElementById('lightbox-image'),caption=document.getElementById('lightbox-caption'),counter=document.getElementById('lightbox-count');
let active=0,wasFocused=null;
function setImage(index){active=(index+gallery.length)%gallery.length;preview.src=gallery[active].src;preview.alt=gallery[active].alt;caption.textContent=gallery[active].alt;counter.textContent=`${String(active+1).padStart(2,'0')} / ${String(gallery.length).padStart(2,'0')}`;}
function openImage(index){wasFocused=document.activeElement;setImage(index);if(typeof dialog.showModal==='function')dialog.showModal();else dialog.setAttribute('open','');document.body.classList.add('no-scroll');document.getElementById('lightbox-close').focus();}
function closeImage(){if(dialog.open&&typeof dialog.close==='function')dialog.close();else dialog.removeAttribute('open');document.body.classList.remove('no-scroll');if(wasFocused?.focus)wasFocused.focus();}
allTiles.forEach((tile)=>tile.addEventListener('click',()=>openImage(Number(tile.dataset.photo)-1)));
document.querySelectorAll('.carousel-photo-trigger').forEach((tile)=>tile.addEventListener('click',()=>openImage(Number(tile.dataset.lightboxIndex))));
document.getElementById('lightbox-close').addEventListener('click',closeImage);
document.getElementById('lightbox-prev').addEventListener('click',()=>setImage(active-1));
document.getElementById('lightbox-next').addEventListener('click',()=>setImage(active+1));
dialog.addEventListener('click',e=>{if(e.target===dialog)closeImage();});
dialog.addEventListener('close',()=>{document.body.classList.remove('no-scroll');if(wasFocused?.focus)wasFocused.focus();});
window.addEventListener('keydown',e=>{if(!dialog.open)return;if(e.key==='ArrowLeft'){e.preventDefault();setImage(active-1);}else if(e.key==='ArrowRight'){e.preventDefault();setImage(active+1);}else if(e.key==='Escape')closeImage();});
})();
