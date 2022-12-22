<template>
  <div class="box">
    <div class="left">
      <div class="msg" v-html="respond"></div>
      <button @click="upload">UPLOAD</button>
      <div>{{detail}}</div>
      <div>
        <progress :value="pgsValue" max="1"></progress><br/>
        <span>{{ (pgsValue*100).toFixed(2) }}%</span><br/>
        <span>瞬时速率：{{ speed.toFixed(2) }} MB/s</span><br/>
        <span>平均速率：{{ speedbar.toFixed(2) }} MB/s</span><br/>
        <span>时间：{{ runtime.toFixed(2) }} s</span><br/>
        <span>覆盖率：{{cover}}/{{ mlimit }} </span><br/>
      </div>
    </div>
    <iframe
      class="right"
      :title="frame.title"
      :src="frame.src"
    ></iframe>
  </div>
  
</template>

<script setup>

import axios from 'axios';
import { ref, render } from 'vue';

const respond = ref("");
const detail = ref("");
const pgsValue = ref(0.0);
const frame = ref({
  title:"",
  src:""
});
const runtime = ref(0);
const speed = ref(0);
const speedbar = ref(0);

console.log(process.env.NODE_ENV);

const BASE = (process.env.NODE_ENV==="development")?`http://127.0.0.1:8401`:(process.env.NODE_ENV==="test")?`http://127.0.0.1:8400`:`http://101.34.27.96:8400`;
const URL = `${BASE}/file`;
const STATIC = `${BASE}/static/`;

const cover = ref("");
const mlimit = ref("");

console.log(BASE);

const hashMaker = ()=>Date.now().toString(36)+Math.random().toString(36).substr(2,9);

const serve = axios.create({
  baseURL: "/serve",
  timeout: 30000
});

function proxy(url,params={},config={},method="post"){
  return serve.post("/proxy",{
      url,params,config,method
  });
}


function getExtension(name){
    return name.substring(name.lastIndexOf(".")+1)
}

const createElementByStr = str=>{
  const box = document.createElement("div");
  box.innerHTML = str;
  return box.children[0];
}

class Reader{
  changeHandle(e){
    // console.log(e.target.files[0]);
    readFile(e.target.files[0]);
  }
  render(){
    this.el = createElementByStr(`<input type="file"/>`);
    this.el.addEventListener('change',this.changeHandle,true);
    return this.el;
  }
}

const defLen = 80000;
const LIMIT = 100;

class FileUpper{
  constructor(file,length=40000,time=50){
    this.file = file;
    this.length = length;
    this.time = time;
    this.status = "pending";
  }
  static enCode = (body,len=defLen)=>{
    const uint8 = new Uint8Array(body);
    const total = Math.ceil(uint8.length/len);
    const fragment = [];
    for(let i=0,j=0;i<total;i++,j+=len){
      fragment.push( tring.fromCharCode(...uint8.slice(j,j+len)) );
    }
    return fragment;
  }
  static enCode2 = (body,len=defLen)=>{
    const uint8 = new Uint8Array(body);
    const total = Math.ceil(uint8.length/2/len);
    // console.log("t",uint8.length,len);
    console.log(uint8.length,total);
    return {
      uint8,total
    }
  }
  static encode = (uint8,j=0,len=defLen)=>{
    return String.fromCharCode(...uint8.slice(j,j+len))
  }
  run(runable){
    this.status = "fulfilled";
    return new Promise((resolve,reject)=>{
      const fragment = FileUpper.enCode(this.file,this.length);
      const timer = this.timer((i)=>{
        if(i<fragment.length){
          runable(fragment[i],i,fragment.length,this.status);
        }else{
          timer.end();
          resolve();
        }
      });
      timer.start();
    });
  }
  submit(post){
    let limit = 1;
    this.status = "fulfilled";
    return new Promise((resolve,reject)=>{
      const {uint8,total} = FileUpper.enCode2(this.file,this.length);
      const sum = total;
      console.log(total);
      let count = 0;
      let runtime = 0;
      let j = 0;
      const send = ()=>{
        if(runtime>=limit)return;
        if(count>=sum){
          resolve();
          return;
        }
        const fragment = FileUpper.encode(uint8,j);
        post(fragment,count,sum,this.status).then(v=>{
          runtime--;
          cover.value = runtime;
          if(limit<LIMIT)limit++;
          mlimit.value = limit;
          send();
        }).catch(err=>{
          runtime--;
          cover.value = runtime;
          if(limit<LIMIT)limit++;
          mlimit.value = limit;
          send();
        });
        count++;j+=defLen;
        runtime++;
        // cover.value = runtime;
        if(count<sum){
          // setImmediate(send);
          cover.value = runtime;
          send();
        }else{
          resolve();
        }
      }
      send();
    });
  }
  timer(runable){
    let i = 0;
    let disable = false;
    const start = ()=>{
      setImmediate(()=>{
        if(disable){

        }else{
          if(this.status==="rejected"){

          }else{
            runable(i++);
            setTimeout(() => {
              start();
            },this.time);
            // start();
          }
        }
      });
    }
    return {
      start,
      stop:()=>disable=true,
      end:()=>{disable=true;this.status="rejected";}
    }
  }
}


const readFile = (e)=>{
  const file = e.name;
  const type = getExtension(file);
  const reader = new FileReader();
  const hash = hashMaker();
  frame.value.title = `${file}-${hash}`;
  const start = Date.now();
  reader.onload=function(){
    proxy(URL,{
      type:"picture",
      filename:file,
      frame:null,
      hash,
      seq:-1,
      process:"start"
    }).then(v=>{
      
      // console.log(v.data);
      pgsValue.value = 0.0;
      speed.value = 0.0;
      let seq = -1;


      // new FileUpper(reader.result).run((v,i,s)=>{
      //   seq = i;
      //   pgsValue.value = i/s;
      //   proxy(URL,{
      //     type:"picture",
      //     filename:file,
      //     frame:v,
      //     hash,
      //     seq,
      //     process:"running"
      //   })
      //   // .then(v=>console.log(v.data));
      // }).then(v=>{
      //   proxy(URL,{
      //     type:"picture",
      //     filename:file,
      //     frame:null,
      //     hash,
      //     seq:seq+1,
      //     process:"finish"
      //   })
      //   .then(v=>{
      //     pgsValue.value = 1.0;
      //     detail.value = v.data;
      //     console.log(v.data)
      //     frame.value.src = v.data.url;
      //   });
      // });
      let last = Date.now();
      let lastCount = 0;
      const byteLength = reader.result.byteLength;
      let test = [];
      new FileUpper(reader.result).submit((v,i,s)=>{
        return new Promise(resolve=>{
          seq = i;
          pgsValue.value = i/s;
          let nowCount = i;
          runtime.value = (Date.now()-start)/1000;
          let dt = (Date.now() - last)/1000;
          if(dt>1||i+1==s){
            // console.log(nowCount-lastCount);
            speed.value = (nowCount-lastCount)*defLen/1024/1024/dt;
            speedbar.value = pgsValue.value*byteLength/1024/1024/runtime.value;
            // console.log(speed.value);
            last = Date.now();
            lastCount = nowCount;
          }
          if(v.length==0){
            // console.log(i);
            test.push(i);
            resolve();
          }else{
            proxy(URL,{
              type:"picture",
              filename:file,
              frame:v,
              hash,
              seq,
              process:"running"
            }).then(v=>{
              resolve();
            }).catch(err=>{
              resolve();
            })
          }
        })
      })
      .then(v=>{
        console.log(test);
        proxy(URL,{
          type:"picture",
          filename:file,
          frame:null,
          hash,
          seq:seq+1,
          process:"finish"
        })
        .then(v=>{
          pgsValue.value = 1.0;
          detail.value = v.data;
          console.log(v.data)
          frame.value.src = v.data.url;
        });
      });

    });
    
    // const c = encode(reader.result);
    // console.log(c.length);
    // StringFragment(c,10000).map(v=>{
    //   console.log(v.length)
    // });
    // const d = unEncode(c);
    // console.log(d);
    // console.log(d.byteLength);
    console.log(reader.result.byteLength);
    respond.value = `
      <b>size:</b>${(reader.result.byteLength/1024/1024).toFixed(2)}MB<br/>
      <b>fileName:</b>${file}<br/>
      <b>type:</b>${type}<br/>
    `;
  }
  // reader.readAsText(e);//readAsArrayBuffer
  reader.readAsArrayBuffer(e);//readAsText
}

const upload = (e)=>{
  const reader = new Reader().render();
  reader.click(e);
}

</script>

<style>
html,body{
  width: 100%;
  height: 100%;
  padding: 0;
  margin: 0;
  overflow: hidden;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

button{
  margin-bottom: 1rem;
  padding: 1rem;
  border: 1px solid gray;
  border-radius: 1rem;
  background-color: #8CB6C0;
}
button:hover{
  background-color: #99dced;
}
button:active{
  background-color: #3fcfcf;
}

.msg{
  width: 80%;
  height: 200px;

  overflow-y: auto;
  overflow-x: hidden;
}

::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: rgb(239, 239, 239);
  border-radius: 2px;
}
::-webkit-scrollbar-thumb {
  background: #40a0ff49;
  border-radius: 10px;
}
::-webkit-scrollbar-thumb:hover {
  background: #40a0ff;
}

.box{
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.left{
  height: 100%;
  width: 200px;
  overflow: hidden;
  word-wrap: break-word;
  word-break: normal;
}

.right{
  height: 100%;
  flex: 1;
}
</style>
