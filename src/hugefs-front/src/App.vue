<template>
  <div class="box">
    <div class="left">
      <div class="msg" v-html="respond"></div>
      <button @click="upload">UPLOAD</button>
      <div>{{detail}}</div>
      <div>
        <progress :value="pgsValue" max="1"></progress><br/>
        <span>{{ (pgsValue*100).toFixed(2) }}%</span>
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

const BASE = `http://127.0.0.1:8401`;
const URL = `${BASE}/file`;
const STATIC = `${BASE}/static/`;

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

class FileUpper{
  constructor(file,length=10000,time=50){
    this.file = file;
    this.length = length;
    this.time = time;
    this.status = "pending";
  }
  static enCode = (body,len=500)=>{
    const uint8 = new Uint8Array(body);
    const total = Math.ceil(uint8.length/len);
    const fragment = [];
    for(let i=0,j=0;i<total;i++,j+=len){
      fragment.push(String.fromCharCode(...uint8.slice(j,j+len)));
    }
    return fragment;
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
      let seq = -1;
      new FileUpper(reader.result).run((v,i,s)=>{
        seq = i;
        pgsValue.value = i/s;
        proxy(URL,{
          type:"picture",
          filename:file,
          frame:v,
          hash,
          seq,
          process:"running"
        })
        // .then(v=>console.log(v.data));
      }).then(v=>{
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
    respond.value = `
      <b>byteLength:</b>${reader.result.byteLength}<br/>
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
}

.right{
  height: 100%;
  flex: 1;
}
</style>
