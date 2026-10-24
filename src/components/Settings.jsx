import React,{useState,useEffect,useRef} from 'react';
import {LS,today,dAgo,FOODS,EX,SPLIT,plan,ACC,load,dayOf,sum,hasLog} from '../data';
import {Mascot,useReveal} from '../ui.jsx';
const h=React.createElement;

export default function Settings({S,e,u,set,out}){
 const [o,setO]=useState(''),[n,setN]=useState(''),[m,setM]=useState('');
 return h('div',{className:'view'},h('h2',null,'Settings'),h('div',{className:'grid'},
  h('div',{className:'card'},h('h3',null,'Appearance'),h('div',{style:{display:'flex',gap:8,marginBottom:14}},['light','dark'].map(t=>h('button',{key:t,className:'chip'+(S.theme===t?' on':''),onClick:()=>set(s=>{s.theme=t;return s})},t==='light'?'☀️ Light':'🌙 Dark'))),h('label',null,'Accent colour'),h('div',{style:{display:'flex',gap:10}},ACC.map(c=>h('div',{key:c,className:'sw',style:{background:c,outlineColor:S.accent===c?c:'var(--line)'},onClick:()=>set(s=>{s.accent=c;return s})})))),
  h('div',{className:'card'},h('h3',null,'Change password'),h('input',{type:'password',placeholder:'Current',value:o,onChange:x=>setO(x.target.value)}),h('div',{style:{height:8}}),h('input',{type:'password',placeholder:'New (6+ chars)',value:n,onChange:x=>setN(x.target.value)}),h('button',{className:'btn',style:{marginTop:12},onClick:()=>{if(u.pw!==o)return setM('Current password is wrong.');if(n.length<6)return setM('Too short.');set(s=>{s.users[e].pw=n;return s});setO('');setN('');setM('Updated ✓')}},'Update'),h('div',{className:'err'},m)),
  h('div',{className:'card'},h('h3',null,'Your goal'),h('button',{className:'btn g',onClick:()=>set(s=>{s.users[e].profile=null;return s})},'Edit goal & plan'),h('div',{style:{height:10}}),h('button',{className:'btn g',onClick:out},'Log out'))))}
