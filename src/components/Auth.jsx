import React,{useState,useEffect,useRef} from 'react';
import {LS,today,dAgo,FOODS,EX,SPLIT,plan,ACC,load,dayOf,sum,hasLog} from '../data';
import {Mascot,useReveal} from '../ui.jsx';
const h=React.createElement;

export default function Auth({mode,setMode,S,set,go}){
 const [f,setF]=useState({name:'',email:'',pw:''}),[err,setErr]=useState(''),[sh,setSh]=useState(0),su=mode==='signup';
 const fail=m=>{setErr(m);setSh(x=>x+1)};
 const submit=()=>{const e=f.email.trim().toLowerCase();
  if(!/^\S+@\S+\.\S+$/.test(e))return fail('Enter a valid email.');if(f.pw.length<6)return fail('Password needs 6+ characters.');
  if(su){if(!f.name.trim())return fail('Tell us your name.');if(S.users[e])return fail('That email already has an account.');
   set(s=>{s.users[e]={name:f.name.trim(),pw:f.pw,profile:null};s.session=e;return s})}
  else{const u=S.users[e];if(!u||u.pw!==f.pw)return fail('Wrong email or password.');set(s=>{s.session=e;return s})}};
 const inp=(k,l,t)=>h('div',null,h('label',null,l),h('input',{type:t||'text',value:f[k],onChange:x=>setF({...f,[k]:x.target.value}),onKeyDown:x=>x.key==='Enter'&&submit()}));
 return h('div',{className:'auth'},h('div',{className:'card'},h('div',{style:{textAlign:'center'}},h(Mascot,{s:70})),
  h('div',{className:'tabs'},['login','signup'].map(m=>h('button',{key:m,className:mode===m?'on':'',onClick:()=>{setMode(m);setErr('')}},m==='login'?'Log in':'Sign up'))),
  su&&inp('name','Name'),inp('email','Email','email'),inp('pw','Password','password'),
  h('div',{className:'err '+(sh%2?'shake':''),key:sh},err),
  h('button',{className:'btn',style:{width:'100%',marginTop:8},onClick:submit},su?'Create account':'Log in'),
  h('button',{className:'btn g',style:{width:'100%',marginTop:10},onClick:()=>go('land')},'← Back')))}
