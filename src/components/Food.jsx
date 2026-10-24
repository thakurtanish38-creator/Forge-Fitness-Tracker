import React,{useState,useEffect,useRef} from 'react';
import {LS,today,dAgo,FOODS,EX,SPLIT,plan,ACC,load,dayOf,sum,hasLog} from '../data';
import {Mascot,useReveal} from '../ui.jsx';
const h=React.createElement;

export default function Food({S,e,u,upd}){
 const [q,setQ]=useState(''),d=dayOf(S,e,today()),L=FOODS.filter(f=>(u.profile.diet==='veg'?f[5]:1)&&f[0].toLowerCase().includes(q.toLowerCase()));
 return h('div',{className:'view'},h('h2',null,'Food log'),h('div',{className:'grid'},
  h('div',{className:'card'},h('input',{placeholder:'Search food…',value:q,onChange:x=>setQ(x.target.value)}),L.map(f=>h('div',{key:f[0],className:'row'},h('div',null,f[0],h('div',{style:{fontSize:12,color:'var(--muted)'}},f[1]+' kcal · P'+f[2]+' C'+f[3]+' F'+f[4])),h('button',{className:'chip',onClick:()=>upd(x=>{x.food.push(f.slice(0,5))})},'+ Add')))),
  h('div',{className:'card'},h('h3',null,'Today · '+sum(d.food,1)+' kcal'),!d.food.length&&h('p',{style:{color:'var(--muted)'}},'Nothing logged yet.'),d.food.map((f,i)=>h('div',{key:i,className:'row'},h('span',null,f[0]),h('span',null,f[1]+' ',h('button',{className:'chip',onClick:()=>upd(x=>{x.food.splice(i,1)})},'✕')))))))}
