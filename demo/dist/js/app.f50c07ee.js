(function(){"use strict";var e={3768:function(e,t,n){var r=n(9242),i=n(7327),u=(n(4633),n(7658),n(3396)),s=n(7139),o=n(4311),l=n(4870);const a=["innerHTML"],c=["value"],f=(0,u._)("br",null,null,-1);var h={__name:"App",setup(e){const t=(0,l.iH)(""),n=(0,l.iH)(""),r=((0,l.iH)(null),(0,l.iH)(0)),h="http://127.0.0.1:8400/file",p=o.Z.create({baseURL:"/serve",timeout:5e3});function d(e,t={},n={},r="post"){return p.post("/proxy",{url:e,params:t,config:n,method:r})}function v(e){return e.substring(e.lastIndexOf(".")+1)}const g=e=>{const t=document.createElement("div");return t.innerHTML=e,t.children[0]};class m{changeHandle(e){y(e.target.files[0])}render(){return this.el=g('<input type="file" accept=".*">'),this.el.addEventListener("change",this.changeHandle,!0),this.el}}class b{constructor(e,t=4e4,n=200){this.file=e,this.length=t,this.time=n,this.status="pending"}run(e){return this.status="fulfilled",new Promise(((t,n)=>{const r=b.enCode(this.file,this.length),i=this.timer((n=>{n<r.length?e(r[n],n,r.length,this.status):(i.end(),t())}));i.start()}))}timer(e){let t=0,n=!1;const r=()=>{setImmediate((()=>{n||"rejected"===this.status||(e(t++),setTimeout((()=>{r()}),this.time))}))};return{start:r,stop:()=>n=!0,end:()=>{n=!0,this.status="rejected"}}}}(0,i.Z)(b,"enCode",((e,t=500)=>{const n=new Uint8Array(e),r=Math.ceil(n.length/t),i=[];for(let u=0,s=0;u<r;u++,s+=t)i.push(String.fromCharCode(...n.slice(s,s+t)));return i}));const y=e=>{const i=e.name,u=v(i),s=new FileReader;s.onload=function(){d(h,{type:"picture",filename:i,frame:null,seq:-1,process:"start"}).then((e=>{r.value=0;let t=-1;new b(s.result).run(((e,n,u)=>{t=n,r.value=n/u,d(h,{type:"picture",filename:i,frame:e,seq:t,process:"running"})})).then((e=>{d(h,{type:"picture",filename:i,frame:null,seq:t+1,process:"finish"}).then((e=>{r.value=1,n.value=e.data,console.log(e.data)}))}))})),t.value=`\n      <b>byteLength:</b>${s.result.byteLength}<br/>\n      <b>fileName:</b>${i}<br/>\n      <b>type:</b>${u}<br/>\n    `},s.readAsArrayBuffer(e)},w=e=>{const t=(new m).render();t.click(e)};return(e,i)=>((0,u.wg)(),(0,u.iD)(u.HY,null,[(0,u._)("div",{class:"msg",innerHTML:t.value},null,8,a),(0,u._)("button",{onClick:w},"UPLOAD"),(0,u._)("div",null,(0,s.zw)(n.value),1),(0,u._)("div",null,[(0,u._)("progress",{value:r.value,max:"1"},null,8,c),f,(0,u._)("span",null,(0,s.zw)((100*r.value).toFixed(2))+"%",1)])],64))}};const p=h;var d=p;(0,r.ri)(d).mount("#app")}},t={};function n(r){var i=t[r];if(void 0!==i)return i.exports;var u=t[r]={exports:{}};return e[r](u,u.exports,n),u.exports}n.m=e,function(){var e=[];n.O=function(t,r,i,u){if(!r){var s=1/0;for(c=0;c<e.length;c++){r=e[c][0],i=e[c][1],u=e[c][2];for(var o=!0,l=0;l<r.length;l++)(!1&u||s>=u)&&Object.keys(n.O).every((function(e){return n.O[e](r[l])}))?r.splice(l--,1):(o=!1,u<s&&(s=u));if(o){e.splice(c--,1);var a=i();void 0!==a&&(t=a)}}return t}u=u||0;for(var c=e.length;c>0&&e[c-1][2]>u;c--)e[c]=e[c-1];e[c]=[r,i,u]}}(),function(){n.n=function(e){var t=e&&e.__esModule?function(){return e["default"]}:function(){return e};return n.d(t,{a:t}),t}}(),function(){n.d=function(e,t){for(var r in t)n.o(t,r)&&!n.o(e,r)&&Object.defineProperty(e,r,{enumerable:!0,get:t[r]})}}(),function(){n.g=function(){if("object"===typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(e){if("object"===typeof window)return window}}()}(),function(){n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)}}(),function(){var e={143:0};n.O.j=function(t){return 0===e[t]};var t=function(t,r){var i,u,s=r[0],o=r[1],l=r[2],a=0;if(s.some((function(t){return 0!==e[t]}))){for(i in o)n.o(o,i)&&(n.m[i]=o[i]);if(l)var c=l(n)}for(t&&t(r);a<s.length;a++)u=s[a],n.o(e,u)&&e[u]&&e[u][0](),e[u]=0;return n.O(c)},r=self["webpackChunkhugefs_front"]=self["webpackChunkhugefs_front"]||[];r.forEach(t.bind(null,0)),r.push=t.bind(null,r.push.bind(r))}();var r=n.O(void 0,[998],(function(){return n(3768)}));r=n.O(r)})();
//# sourceMappingURL=app.f50c07ee.js.map