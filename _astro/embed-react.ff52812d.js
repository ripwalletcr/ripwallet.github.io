import{r as p,O as y}from"./index.efcd4294.js";const O="https://app.cal.com/embed/embed.js";function g(u=O){(function(t,f,a){let i=function(e,n){e.q.push(n)},l=t.document;t.Cal=t.Cal||function(){let e=t.Cal,n=arguments;if(e.loaded||(e.ns={},e.q=e.q||[],l.head.appendChild(l.createElement("script")).src=f,e.loaded=!0),n[0]===a){const r=function(){i(r,arguments)},c=n[1];r.q=r.q||[],typeof c=="string"?(e.ns[c]=r)&&i(r,n):i(e,n);return}i(e,n)}})(window,u,"init");/*!  Copying ends here. */return window.Cal}g.toString();function w(u){const[t,f]=p.useState();return p.useEffect(()=>{f(()=>g(u))},[]),t}var v={exports:{}},s={};/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var E;function R(){if(E)return s;E=1;var u=y,t=Symbol.for("react.element"),f=Symbol.for("react.fragment"),a=Object.prototype.hasOwnProperty,i=u.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,l={key:!0,ref:!0,__self:!0,__source:!0};function e(n,r,c){var o,d={},_=null,m=null;c!==void 0&&(_=""+c),r.key!==void 0&&(_=""+r.key),r.ref!==void 0&&(m=r.ref);for(o in r)a.call(r,o)&&!l.hasOwnProperty(o)&&(d[o]=r[o]);if(n&&n.defaultProps)for(o in r=n.defaultProps,r)d[o]===void 0&&(d[o]=r[o]);return{$$typeof:t,type:n,key:_,ref:m,props:d,_owner:i.current}}return s.Fragment=f,s.jsx=e,s.jsxs=e,s}v.exports=R();var h=v.exports;const C=h.jsx,S=function(u){const{calLink:t,calOrigin:f,config:a,initConfig:i={},embedJsUrl:l,...e}=u;if(!t)throw new Error("calLink is required");const n=p.useRef(!1),r=w(l),c=p.useRef(null);return p.useEffect(()=>{if(!r||n.current||!c.current)return;n.current=!0;const o=c.current;r("init",{...i,origin:f}),r("inline",{elementOrSelector:o,calLink:t,config:a})},[r,t,a,f,i]),r?C("div",{ref:c,...e}):null},k=S;export{k as default};
