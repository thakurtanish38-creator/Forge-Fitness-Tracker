import React,{useState,useEffect,useRef} from 'react';
import {LS,today,dAgo,FOODS,EX,SPLIT,plan,ACC,load,dayOf,sum,hasLog} from '../data';
import {Mascot,useReveal} from '../ui.jsx';
const h=React.createElement;

function Ring({v,max,label}){const C=339.3,o=C*(1-Math.min(1,v/max));return h('svg',{viewBox:'0 0 140 140',width:170,height:170},h('circle',{cx:70,cy:70,r:54,fill:'none',stroke:'var(--line)',strokeWidth:12}),h('circle',{cx:70,cy:70,r:54,fill:'none',stroke:'var(--accent)',strokeWidth:12,strokeLinecap:'round',strokeDasharray:C,strokeDashoffset:o,transform:'rotate(-90 70 70)',style:{transition:'stroke-dashoffset 1s var(--ease)'}}),h('text',{x:70,y:68,textAnchor:'middle',fill:'var(--fg)',fontSize:26,fontWeight:700},Math.max(0,Math.round(max-v))),h('text',{x:70,y:88,textAnchor:'middle',fill:'var(--muted)',fontSize:11},label))}
const Macro=({n,v,m})=>h('div',{style:{marginBottom:12}},h('div',{className:'row',style:{border:0,padding:'0 0 5px'}},h('span',null,n),h('span',{style:{color:'var(--muted)'}},Math.round(v)+' / '+m+' g')),h('div',{className:'bar'},h('i',{style:{width:Math.min(100,v/m*100)+'%'}})));

export default function Dashboard({S,e,u,P,upd}){
 const [ld,setLd]=useState(true);useEffect(()=>{const t=setTimeout(()=>setLd(false),550);return()=>clearTimeout(t)},[]);
 const d=dayOf(S,e,today());if(ld)return h('div',{className:'grid view'},[0,1,2].map(i=>h('div',{key:i,className:'sk'})));
 const eat=sum(d.food,1),burn=Math.round(sum(d.work,1)),wk=[6,5,4,3,2,1,0].map(n=>({k:dAgo(n),v:sum(dayOf(S,e,dAgo(n)).food,1)})),mx=Math.max(P.k,...wk.map(x=>x.v));
 return h('div',{className:'view'},h('h2',null,'Hey '+u.name.split(' ')[0]+' 👋'),h('div',{className:'grid'},
  h('div',{className:'card',style:{textAlign:'center'}},h(Ring,{v:eat-burn,max:P.k,label:'kcal left'}),h('div',{style:{color:'var(--muted)'}},eat+' eaten · '+burn+' burned · goal '+P.k)),
  h('div',{className:'card'},h('h3',null,'Macros'),h(Macro,{n:'Protein',v:sum(d.food,2),m:P.p}),h(Macro,{n:'Carbs',v:sum(d.food,3),m:P.c}),h(Macro,{n:'Fat',v:sum(d.food,4),m:P.f})),
  h('div',{className:'card'},h('h3',null,'💧 Water · '+d.water+'/8'),h('div',{className:'cups'},Array.from({length:8},(_,i)=>h('div',{key:i,className:'cup'+(i<d.water?' f':''),onClick:()=>upd(x=>{x.water=x.water===i+1?i:i+1})}))),h('p',{style:{color:'var(--muted)'}},'Today’s focus: ',h('b',{style:{color:'var(--fg)'}},SPLIT[new Date().getDay()%SPLIT.length]))),
  h('div',{className:'card'},h('h3',null,'This week'),h('svg',{viewBox:'0 0 280 110',width:'100%'},wk.map((x,i)=>h('rect',{key:i,x:i*40+6,y:100-x.v/mx*90,width:26,height:Math.max(3,x.v/mx*90),rx:6,fill:'var(--accent)',opacity:x.k===today()?1:.45,style:{transition:'all .8s var(--ease)'}}))))))}
