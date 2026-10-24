import React,{useState,useEffect,useRef} from 'react';
import {LS,today,dAgo,FOODS,EX,SPLIT,plan,ACC,load,dayOf,sum,hasLog} from '../data';
import {Mascot,useReveal} from '../ui.jsx';
const h=React.createElement;

export default function Work({S,e,upd}){
 const [c,setC]=useState('Gym'),[x,setX]=useState(null),[a,setA]=useState(3),[b,setB]=useState(10),d=dayOf(S,e,today()),gym=c==='Gym';
 const add=()=>{const k=Math.round(gym?x[1]*a*b:x[1]*a);upd(z=>{z.work.push([x[0],k,gym?a+'×'+b:a+' min'])});setX(null)};
 return h('div',{className:'view'},h('h2',null,'Workout log'),h('div',{className:'grid'},
  h('div',{className:'card'},h('div',{style:{display:'flex',gap:8,marginBottom:14}},Object.keys(EX).map(k=>h('button',{key:k,className:'chip'+(c===k?' on':''),onClick:()=>{setC(k);setX(null);setA(gym?30:3)}},k))),
   h('div',{style:{display:'flex',flexWrap:'wrap',gap:8}},EX[c].map(t=>h('button',{key:t[0],className:'chip'+(x&&x[0]===t[0]?' on':''),onClick:()=>{setX(t);setA(c==='Gym'?3:30)}},t[0]))),
   x&&h('div',{style:{marginTop:16,animation:'rise .4s var(--ease) both'}},h('label',null,gym?'Sets':'Minutes'),h('input',{type:'number',value:a,onChange:z=>setA(+z.target.value)}),gym&&h('div',null,h('label',null,'Reps per set'),h('input',{type:'number',value:b,onChange:z=>setB(+z.target.value)})),h('button',{className:'btn',style:{marginTop:14},onClick:add},'Log '+x[0]))),
  h('div',{className:'card'},h('h3',null,'Today · '+Math.round(sum(d.work,1))+' kcal burned'),!d.work.length&&h('p',{style:{color:'var(--muted)'}},'No workouts yet.'),d.work.map((w,i)=>h('div',{key:i,className:'row'},h('span',null,w[0]+' · '+w[2]),h('span',null,w[1]+' ',h('button',{className:'chip',onClick:()=>upd(z=>{z.work.splice(i,1)})},'✕')))))))}
