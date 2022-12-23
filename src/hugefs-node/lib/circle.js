const { parentPort,workerData } = require("worker_threads");
const path = require('path');
const fs = require('fs');
const {ID} = require('./util');

const addr = path.normalize(__dirname + '/../static');

const fileBuffer = [];

parentPort.on("message", (data) => {
    fileBuffer.push(data);
})

function stringToArrayBuffer(str){
    let buffer = new ArrayBuffer(str.length);
    let view = new Uint8Array(buffer)
    for (let i = 0; i < str.length; i++) {
        view[i] = str.charCodeAt(i)
    }
    return buffer;
}

function save(){
    const size = fileBuffer.length;
    // console.log(workerData.fileBuffer);
    if(size===0){
        setTimeout(() => {
            save();
        }, 1000);
        return;
    }
    const {filename,hash,frame,seq,flag} = fileBuffer.shift();
    if(flag==="w"){
        fs.writeFileSync(`${addr}/${filename}`,new DataView(stringToArrayBuffer(frame)),{ flag: 'a' });
        console.log(`size:${size},success:seq:${seq},file:${filename},hash:${hash}`);
        // fs.writeFile(`${addr}/${filename}`,new DataView(new ArrayBuffer(0)),{ flag: 'w' }, function (error){
        //     if(error){
        //         console.log(error);
        //     }else{
        //         // console.log(`${filename} create success!`);
        //     }
        //     console.log(`size:${size},success:seq:${seq},file:${filename},hash:${hash}`);
        //     save();
        // });
        save();
    }else{
        fs.writeFileSync(`${addr}/${filename}`,new DataView(stringToArrayBuffer(frame)),{ flag: 'a' });
        console.log(`size:${size},success:seq:${seq},file:${filename},hash:${hash}`);
        // fs.writeFile(`${addr}/${filename}`,new DataView(stringToArrayBuffer(frame)),{ flag: 'a' }, function (error){
        //     if(error){
        //         console.log(error);
        //     }else{
        //         // console.log(`${seq}-${hash}:${filename} merge success!`);
        //     }
        //     console.log(`size:${size},success:seq:${seq},file:${filename},hash:${hash}`);
        //     save();
        // });
        save();
    }
}

save();