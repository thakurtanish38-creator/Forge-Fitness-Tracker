import React,{useState,useEffect,useRef} from 'react';
import {LS,today,dAgo,FOODS,EX,SPLIT,plan,ACC,load,dayOf,sum,hasLog} from '../data';
import {Mascot,useReveal} from '../ui.jsx';
const h=React.createElement;

export default function Setup({u,save}){
 const [f,setF]=useState({weight:'',goal:'',type:'fit',diet:'veg',days:4});
 const T=[['aesthetic','✨','Aesthetic','Lean & defined'],['bulky','💪','Bulky','Size & strength'],['fit','⚡','Fit','Healthy & strong']];
 return h('div',{className:'auth'},h('div',{className:'card',style:{maxWidth:520}},h('h2',null,'Your goal, '+u.name.split(' ')[0]),
  h('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}},h('div',null,h('label',null,'Bodyweight (kg)'),h('input',{type:'number',value:f.weight,onChange:x=>setF({...f,weight:x.target.value})})),h('div',null,h('label',null,'Goal weight (kg)'),h('input',{type:'number',value:f.goal,onChange:x=>setF({...f,goal:x.target.value})}))),
  h('label',null,'Physique'),h('div',{style:{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}},T.map(t=>h('div',{key:t[0],className:'card ptype'+(f.type===t[0]?' on':''),style:{padding:12},onClick:()=>setF({...f,type:t[0]})},h('div',{style:{fontSize:26}},t[1]),h('b',null,t[2]),h('div',{style:{fontSize:11,color:'var(--muted)'}},t[3])))),
  h('label',null,'Diet'),h('div',{style:{display:'flex',gap:8}},[['veg','Vegetarian'],['non','Non-veg']].map(d=>h('button',{key:d[0],className:'chip'+(f.diet===d[0]?' on':''),onClick:()=>setF({...f,diet:d[0]})},d[1]))),
  h('label',null,'Gym days per week: '+f.days),h('input',{type:'range',min:2,max:7,value:f.days,onChange:x=>setF({...f,days:+x.target.value})}),
  h('button',{className:'btn',style:{width:'100%',marginTop:18},disabled:!f.weight,onClick:()=>f.weight&&save({...f,weight:+f.weight,goal:+f.goal||+f.weight})},'Build my plan →')))}
