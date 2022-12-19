<template>
  <div class="msg" v-html="respond"></div>
  <button @click="upload">UPLOAD</button>
  <div>{{detail}}</div>
  <button @click="submit">SUBMIT</button>
</template>

<script setup>

import axios from 'axios';
import { ref, render } from 'vue';

const respond = ref("");
const detail = ref("");
const uploadFile = ref(null);

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
    this.el = createElementByStr(`<input type="file" accept=".*">`);
    this.el.addEventListener('change',this.changeHandle,true);
    return this.el;
  }
}


const serve = axios.create({
  baseURL: "/serve",
  timeout: 5000
});

const FileLoader = ()=>{
  
}


const readFile = (e)=>{
  const file = e.name;
  const type = getExtension(file);
  const reader = new FileReader();
  reader.onload=function(){
    console.log(reader.result.byteLength);
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

const submit = ()=>{
  console.log(serve);
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

</style>
