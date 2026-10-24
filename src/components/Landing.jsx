import React,{useState,useEffect,useRef} from 'react';
import {LS,today,dAgo,FOODS,EX,SPLIT,plan,ACC,load,dayOf,sum,hasLog} from '../data';
import {Mascot,useReveal} from '../ui.jsx';
const h=React.createElement;

export default function Landing({go}){
 const [sy,setSy]=useState(0),[p,setP]=useState(0),sr=useRef();useReveal();
 useEffect(()=>{const f=()=>{setSy(scrollY);const r=sr.current;if(r){const b=r.getBoundingClientRect();setP(Math.max(0,Math.min(.999,-b.top/(b.height-innerHeight))))}};f();addEventListener('scroll',f,{passive:true});return()=>removeEventListener('scroll',f)},[]);
 const word='FORGE YOUR DAILY BEST'.split(' '),steps=[['01','Log every meal','Pick a food, see calories and macros land in your ring instantly.'],['02','Track every rep','Gym, cardio or sports — drill down to the exact exercise.'],['03','Watch the streak grow','Daily streaks, badges and a monthly grade keep you honest.']];
 const i=Math.floor(p*3);
 return h('div',null,
  h('div',{className:'top'},h('div',{className:'wrap'},h('div',{className:'logo'},h(Mascot,{s:30}),'FORGE'),h('div',{style:{display:'flex',gap:8}},h('button',{className:'btn g',onClick:()=>go('login')},'Log in'),h('button',{className:'btn',onClick:()=>go('signup')},'Sign up')))),
  h('section',{className:'hero'},
   h('div',{className:'orb',style:{width:380,height:380,left:'-8%',top:'10%',transform:`translateY(${sy*.25}px)`}}),
   h('div',{className:'orb',style:{width:300,height:300,right:'-5%',bottom:'5%',transform:`translateY(${-sy*.18}px)`}}),
   h('div',{className:'wrap',style:{position:'relative'}},h(Mascot,{s:110}),
    h('h1',null,word.map((w,wi)=>h('div',{key:wi,className:wi===2?'ac':''},[...w].map((c,ci)=>h('span',{key:ci,style:{animationDelay:(wi*.25+ci*.04)+'s'}},c))))),
    h('p',{style:{color:'var(--muted)',fontSize:19,maxWidth:520,margin:'22px auto',animation:'rise 1s .9s var(--ease) both'}},'The calorie and workout log that makes showing up daily feel like a game.'),
    h('button',{className:'btn',style:{fontSize:17,padding:'15px 32px'},onClick:()=>go('signup')},'Start free →'))),
  h('div',{className:'marq'},h('div',null,[0,1].map(k=>h('span',{key:k},['EAT','LIFT','LOG','REPEAT'].map(t=>h(React.Fragment,{key:t},t,h('i',null,' '),'◆',h('i',null,' '))))))),
  h('section',{className:'story',ref:sr},h('div',{className:'stick'},h('div',{className:'wrap',style:{textAlign:'center'}},
   h('div',{className:'big',key:i,style:{animation:'rise .6s var(--ease) both'}},steps[i][0]),
   h('h2',{key:'t'+i,style:{animation:'rise .6s .1s var(--ease) both'}},steps[i][1]),
   h('p',{style:{color:'var(--muted)',maxWidth:440,margin:'0 auto 22px'}},steps[i][2]),
   h('div',{className:'bar',style:{maxWidth:300,margin:'0 auto'}},h('i',{style:{width:(p*100)+'%'}}))))),
  h('section',{className:'wrap',style:{padding:'60px 20px'}},h('h2',{className:'rv'},'Everything you need. Nothing you don’t.'),
   h('div',{className:'feat'},[['🍛','Food log','Indian-friendly foods, veg / non-veg filter, live macros.'],['🏋️','Workout log','Gym, cardio and sports with per-exercise detail.'],['💧','Water tracker','Tap a glass, hit eight a day.'],['📈','Progress','Weight chart, streaks, badges and a monthly grade.']].map((f,k)=>h('div',{key:k,className:'card rv',style:{transitionDelay:k*.08+'s'}},h('div',{style:{fontSize:34}},f[0]),h('h3',null,f[1]),h('p',{style:{color:'var(--muted)',margin:0}},f[2]))))),
  h('section',{className:'wrap',style:{textAlign:'center',padding:'80px 20px 100px'}},h('h2',{className:'rv',style:{fontSize:'clamp(36px,8vw,90px)'}},'Your first rep starts now.'),h('button',{className:'btn rv',style:{fontSize:17,padding:'15px 32px'},onClick:()=>go('signup')},'Create account')))}
