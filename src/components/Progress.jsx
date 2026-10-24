import React,{useState,useEffect,useRef} from 'react';
import {LS,today,dAgo,FOODS,EX,SPLIT,plan,ACC,load,dayOf,sum,hasLog} from '../data';
import {Mascot,useReveal} from '../ui.jsx';
const h=React.createElement;

export default function Progress({S,e,u,set}){
 const [w,setW]=useState(''),W=S.weights[e]||[];let st=0;for(let n=0;n<365;n++){if(hasLog(dayOf(S,e,dAgo(n))))st++;else if(n>0)break;else continue}
 const now=new Date(),dm=now.getDate();let act=0;for(let n=0;n<dm;n++)if(hasLog(dayOf(S,e,dAgo(n))))act++;const pc=act/dm*100,g=pc>=80?'Elite':pc>=60?'Gold':pc>=40?'Silver':'Bronze';
 const all=Object.values(S.logs[e]||{}),B=[['🔥','3-day streak',st>=3],['🏆','7-day streak',st>=7],['🍽️','First meal',all.some(x=>x.food.length)],['💧','8 glasses',all.some(x=>x.water>=8)],['🏋️','5 workouts',all.reduce((s,x)=>s+x.work.length,0)>=5]];
 const pts=W.slice(-10),lo=Math.min(...pts.map(x=>x[1]),u.profile.goal)-1,hi=Math.max(...pts.map(x=>x[1]),u.profile.goal)+1;
 return h('div',{className:'view'},h('h2',null,'Progress'),h('div',{className:'grid'},
  h('div',{className:'card'},h('h3',null,'Streak & grade'),h('div',{style:{fontSize:56,fontWeight:700}},'🔥 '+st),h('p',{style:{color:'var(--muted)'}},'days in a row'),h('div',{className:'bar'},h('i',{style:{width:pc+'%'}})),h('p',null,'This month: ',h('b',{className:'ac'},g),' · '+act+'/'+dm+' active days')),
  h('div',{className:'card'},h('h3',null,'Badges'),h('div',{style:{display:'flex',flexWrap:'wrap',gap:14}},B.map(b=>h('div',{key:b[1],className:'bd'+(b[2]?' on':''),style:{textAlign:'center',width:78}},h('div',{style:{fontSize:34}},b[0]),h('div',{style:{fontSize:12}},b[1]))))),
  h('div',{className:'card'},h('h3',null,'Weight · goal '+u.profile.goal+' kg'),h('div',{style:{display:'flex',gap:8}},h('input',{type:'number',placeholder:'kg',value:w,onChange:x=>setW(x.target.value)}),h('button',{className:'btn',onClick:()=>{if(w){set(s=>{(s.weights[e]=s.weights[e]||[]).push([today(),+w]);return s});setW('')}}},'Add')),
   pts.length>1?h('svg',{viewBox:'0 0 280 110',width:'100%',style:{marginTop:12}},h('polyline',{fill:'none',stroke:'var(--accent)',strokeWidth:3,strokeLinejoin:'round',points:pts.map((p,i)=>(10+i*260/(pts.length-1))+','+(100-(p[1]-lo)/(hi-lo)*90)).join(' ')})):h('p',{style:{color:'var(--muted)'}},'Log two weigh-ins to see your line.'))))}
