/* Piglin Confideration — общий скрипт: летающие огоньки, скролл-реявл, тилт карточек */
(function(){
"use strict";

/* ---------- Летающие огоньки (canvas) ---------- */
function initEmbers(){
try{
var canvas=document.getElementById('embers');
if(!canvas)return;
var ctx=canvas.getContext('2d');
if(!ctx)return;
var isCoarse=window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
var isSmall=window.innerWidth<700;
/* На слабых/мобильных устройствах сильно урезаем количество частиц,
   чтобы избежать подвисаний */
if(isCoarse||isSmall){
canvas.style.display='none';
return;
}
var W,H,particles=[];
var COLORS=['255,196,145','255,150,90','120,150,255','255,120,80'];
var COUNT=22;


function resize(){
W=canvas.width=window.innerWidth;
H=canvas.height=window.innerHeight;
}
window.addEventListener('resize',resize);
resize();

function Particle(initial){
this.setup(initial);
}
Particle.prototype.setup=function(initial){
this.x=Math.random()*W;
this.y=initial?Math.random()*H:H+20+Math.random()*60;
this.r=1+Math.random()*2.6;
this.speed=0.25+Math.random()*0.7;
this.drift=(Math.random()-0.5)*0.6;
this.color=COLORS[(Math.random()*COLORS.length)|0];
this.alpha=0.15+Math.random()*0.55;
this.flicker=Math.random()*0.02+0.005;
this.life=0;
};
Particle.prototype.update=function(){
this.y-=this.speed;
this.x+=this.drift+Math.sin(this.y*0.01)*0.4;
this.life+=this.flicker;
this.curAlpha=this.alpha*(0.6+0.4*Math.sin(this.life*6));
if(this.y<-20)this.setup(false);
};
Particle.prototype.draw=function(){
/* Дешёвая отрисовка: обычный круг + shadowBlur для свечения,
   без создания gradient-объекта на каждый кадр (важно для производительности) */
ctx.save();
ctx.shadowBlur=this.r*5;
ctx.shadowColor='rgba('+this.color+','+this.curAlpha+')';
ctx.fillStyle='rgba('+this.color+','+Math.min(1,this.curAlpha+0.25)+')';
ctx.beginPath();
ctx.arc(this.x,this.y,this.r,0,Math.PI*2);
ctx.fill();
ctx.restore();
};


for(var i=0;i<COUNT;i++)particles.push(new Particle(true));

var reduceMotion=window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function loop(){
try{
ctx.clearRect(0,0,W,H);
for(var i=0;i<particles.length;i++){
particles[i].update();
particles[i].draw();
}
}catch(e){}
requestAnimationFrame(loop);
}
if(!reduceMotion)requestAnimationFrame(loop);
}catch(e){/* никогда не ломаем страницу из-за canvas */}
}

/* ---------- Скролл-появление секций (progressive enhancement) ---------- */
function initReveal(){
try{
var items=document.querySelectorAll('.reveal');
if(!items.length)return;

/* Помечаем элементы как "pending" только когда JS точно работает —
   если что-то пойдёт не так, элементы останутся видимыми по умолчанию (CSS .reveal{opacity:1}) */
items.forEach(function(el){el.classList.add('pending');});

function showAll(){
items.forEach(function(el){el.classList.add('in');});
}

if(!('IntersectionObserver' in window)){
showAll();
return;
}

var io=new IntersectionObserver(function(entries){
entries.forEach(function(entry){
if(entry.isIntersecting){
entry.target.classList.add('in');
io.unobserve(entry.target);
}
});
},{threshold:0.1,rootMargin:'0px 0px -30px 0px'});
items.forEach(function(el){io.observe(el);});

/* Страховка: если через 2.5с что-то не сработало (например, элемент вне вьюпорта
   из-за нестандартной вёрстки) — просто показываем всё, чтобы контент не потерялся */
setTimeout(showAll,2500);
}catch(e){
var items2=document.querySelectorAll('.reveal');
items2.forEach(function(el){el.classList.remove('pending');el.classList.add('in');});
}
}

/* ---------- Тилт-эффект для карточек (только для мыши, не для тач-устройств) ---------- */
function initTilt(){
try{
/* На touch-устройствах нет mouseleave, из-за чего transform "залипал" —
   поэтому полностью отключаем эффект для coarse pointer / hover:none */
var isTouch=window.matchMedia && (window.matchMedia('(hover: none)').matches || window.matchMedia('(pointer: coarse)').matches);
if(isTouch)return;

var cards=document.querySelectorAll('[data-tilt]');
var raf=null;
cards.forEach(function(card){
var rect=null;
function onMove(e){
if(!rect)rect=card.getBoundingClientRect();
var px=(e.clientX-rect.left)/rect.width;
var py=(e.clientY-rect.top)/rect.height;
if(raf)return;
raf=requestAnimationFrame(function(){
var rx=(py-0.5)*-8;
var ry=(px-0.5)*10;
card.style.transform='perspective(700px) rotateX('+rx+'deg) rotateY('+ry+'deg) translateY(-4px)';
card.style.setProperty('--mx',(px*100)+'%');
card.style.setProperty('--my',(py*100)+'%');
raf=null;
});
}
function onEnter(){rect=card.getBoundingClientRect();}
function onLeave(){card.style.transform='';rect=null;}
card.addEventListener('mouseenter',onEnter);
card.addEventListener('mousemove',onMove);
card.addEventListener('mouseleave',onLeave);
});
}catch(e){}
}


/* ---------- Копирование discord-ссылки (если есть кнопка copy-invite) ---------- */
function initCopyInvite(){
try{
var btn=document.getElementById('copyInvite');
if(!btn)return;
btn.addEventListener('click',function(){
var link=btn.getAttribute('data-link')||'';
var done=function(){
btn.classList.add('copied');
setTimeout(function(){btn.classList.remove('copied');},1500);
};
if(navigator.clipboard){
navigator.clipboard.writeText(link).then(done).catch(done);
}else{
done();
}
});
}catch(e){}
}

/* ---------- Прогресс-бар скролла ---------- */
function initScrollProgress(){
try{
var bar=document.getElementById('scroll-progress');
if(!bar)return;
function update(){
var h=document.documentElement;
var scrollTop=h.scrollTop||document.body.scrollTop;
var height=h.scrollHeight-h.clientHeight;
var pct=height>0?(scrollTop/height)*100:0;
bar.style.width=pct+'%';
}
window.addEventListener('scroll',update,{passive:true});
window.addEventListener('resize',update);
update();
}catch(e){}
}

/* ---------- Спотлайт за курсором ---------- */
function initCursorGlow(){
try{
if(window.matchMedia && window.matchMedia('(pointer: coarse)').matches)return;
var glow=document.getElementById('cursor-glow');
if(!glow)return;
var raf=null,mx=0,my=0;
window.addEventListener('mousemove',function(e){
mx=e.clientX;my=e.clientY;
glow.style.opacity='1';
if(!raf){
raf=requestAnimationFrame(function(){
glow.style.transform='translate('+mx+'px,'+my+'px)';
raf=null;
});
}
});
document.addEventListener('mouseleave',function(){glow.style.opacity='0';});
}catch(e){}
}

/* ---------- Ripple-эффект на кнопках ---------- */
function initRipple(){
try{
var buttons=document.querySelectorAll('.btn, .nav-cta, .discord-cta');
buttons.forEach(function(btn){
btn.addEventListener('click',function(e){
var rect=btn.getBoundingClientRect();
var ripple=document.createElement('span');
var size=Math.max(rect.width,rect.height);
ripple.className='ripple';
ripple.style.width=ripple.style.height=size+'px';
ripple.style.left=(e.clientX-rect.left-size/2)+'px';
ripple.style.top=(e.clientY-rect.top-size/2)+'px';
btn.appendChild(ripple);
setTimeout(function(){ripple.remove();},650);
});
});
}catch(e){}
}

document.addEventListener('DOMContentLoaded',function(){
initEmbers();
initReveal();
initTilt();
initCopyInvite();
initScrollProgress();
initCursorGlow();
initRipple();
});
})();

