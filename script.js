/* Piglin Confideration — общий скрипт: летающие огоньки, скролл-реявл, тилт карточек */
(function(){
"use strict";

/* ---------- Летающие огоньки (canvas) ---------- */
function initEmbers(){
var canvas=document.getElementById('embers');
if(!canvas)return;
var ctx=canvas.getContext('2d');
var W,H,particles=[];
var COLORS=['255,196,145','255,150,90','120,150,255','255,120,80'];
var COUNT=42;

function resize(){
W=canvas.width=window.innerWidth;
H=canvas.height=window.innerHeight;
}
window.addEventListener('resize',resize);
resize();

function Particle(reset){
this.reset(reset);
}
Particle.prototype.reset=function(initial){
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
if(this.y<-20)this.reset(false);
};
Particle.prototype.draw=function(){
ctx.beginPath();
var grad=ctx.createRadialGradient(this.x,this.y,0,this.x,this.y,this.r*4);
grad.addColorStop(0,'rgba('+this.color+','+this.curAlpha+')');
grad.addColorStop(1,'rgba('+this.color+',0)');
ctx.fillStyle=grad;
ctx.arc(this.x,this.y,this.r*4,0,Math.PI*2);
ctx.fill();
ctx.beginPath();
ctx.fillStyle='rgba('+this.color+','+Math.min(1,this.curAlpha+0.25)+')';
ctx.arc(this.x,this.y,this.r,0,Math.PI*2);
ctx.fill();
};

for(var i=0;i<COUNT;i++)particles.push(new Particle(true));

var reduceMotion=window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function loop(){
ctx.clearRect(0,0,W,H);
for(var i=0;i<particles.length;i++){
particles[i].update();
particles[i].draw();
}
requestAnimationFrame(loop);
}
if(!reduceMotion)requestAnimationFrame(loop);
else{
for(var i=0;i<particles.length;i++){particles[i].draw();}
}
}

/* ---------- Скролл-появление секций ---------- */
function initReveal(){
var items=document.querySelectorAll('.reveal');
if(!items.length)return;
if(!('IntersectionObserver' in window)){
items.forEach(function(el){el.classList.add('in');});
return;
}
var io=new IntersectionObserver(function(entries){
entries.forEach(function(entry){
if(entry.isIntersecting){
entry.target.classList.add('in');
io.unobserve(entry.target);
}
});
},{threshold:0.12,rootMargin:'0px 0px -40px 0px'});
items.forEach(function(el){io.observe(el);});
}

/* ---------- Тилт-эффект для карточек ---------- */
function initTilt(){
var cards=document.querySelectorAll('[data-tilt]');
cards.forEach(function(card){
var rect;
function onMove(e){
rect=card.getBoundingClientRect();
var px=(e.clientX-rect.left)/rect.width;
var py=(e.clientY-rect.top)/rect.height;
var rx=(py-0.5)*-8;
var ry=(px-0.5)*10;
card.style.transform='perspective(700px) rotateX('+rx+'deg) rotateY('+ry+'deg) translateY(-4px)';
var glowX=px*100,glowY=py*100;
card.style.setProperty('--mx',glowX+'%');
card.style.setProperty('--my',glowY+'%');
}
function onLeave(){
card.style.transform='';
}
card.addEventListener('mousemove',onMove);
card.addEventListener('mouseleave',onLeave);
});
}

/* ---------- Копирование discord-ссылки (если есть кнопка copy-invite) ---------- */
function initCopyInvite(){
var btn=document.getElementById('copyInvite');
if(!btn)return;
btn.addEventListener('click',function(){
var link=btn.getAttribute('data-link')||'';
var done=function(){
var old=btn.querySelector('.discord-cta-text b')?null:null;
btn.classList.add('copied');
setTimeout(function(){btn.classList.remove('copied');},1500);
};
if(navigator.clipboard){
navigator.clipboard.writeText(link).then(done).catch(done);
}else{
done();
}
});
}

/* ---------- Плавный active-подсвет навигации при скролле (для index) ---------- */
function initNavScrollSpy(){
var links=document.querySelectorAll('.nav-link[href^="#"]');
if(!links.length)return;
window.addEventListener('scroll',function(){},{passive:true});
}

document.addEventListener('DOMContentLoaded',function(){
initEmbers();
initReveal();
initTilt();
initCopyInvite();
initNavScrollSpy();
});
})();
