import React,{useState,useEffect,useRef} from 'react';
const h=React.createElement;
export function Mascot({s=90}){return h('svg',{width:s,height:s,viewBox:'0 0 100 100',className:'float'},
 h('rect',{x:4,y:36,width:14,height:28,rx:5,fill:'var(--accent)'}),h('rect',{x:82,y:36,width:14,height:28,rx:5,fill:'var(--accent)'}),
 h('rect',{x:14,y:26,width:72,height:48,rx:24,fill:'var(--accent)'}),
 h('circle',{cx:38,cy:48,r:6,fill:'#fff'}),h('circle',{cx:62,cy:48,r:6,fill:'#fff'}),h('circle',{cx:39,cy:49,r:3,fill:'#0b1530'}),h('circle',{cx:63,cy:49,r:3,fill:'#0b1530'}),
 h('path',{d:'M40 60q10 9 20 0',stroke:'#fff',strokeWidth:3,fill:'none',strokeLinecap:'round'}))}

export function useReveal(dep){useEffect(()=>{const o=new IntersectionObserver(es=>es.forEach(x=>x.isIntersecting&&x.target.classList.add('in')),{threshold:.15});document.querySelectorAll('.rv').forEach(n=>o.observe(n));return()=>o.disconnect()},[dep])}
