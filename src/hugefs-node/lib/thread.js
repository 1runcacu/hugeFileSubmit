const { Worker } = require("worker_threads");
const path = require('path');
const fs = require('fs');
const {ID} = require('./util');

const ADDR = path.normalize(__dirname + '/../core');

function Thread(code){
    var rsv;
    console.log(ID)
    const PID = "lbyp57y3zjq80jti"||ID();
    const NAME = `${PID}.js`;
    const CODE = 
`const { parentPort } = require("worker_threads");
const core = ${code.toString()}
parentPort.on("message", (data) => {
    core(data,parentPort);
    // parentPort.postMessage(result);
        
    // });
})    
`;
    const URL = path.normalize(ADDR + '/' + NAME);
    fs.writeFileSync(URL,CODE,{flag:'w'});
    const worker = new Worker(URL);
    worker.on("message", (result) => {
        console.log(result);
    });
    return (data)=>{
        console.log("r:",data);
        return new Promise((resolve)=>{
            rsv = resolve;
            console.log(123123,data);
            worker.postMessage({data});
        });
    }
}

let number = 30;

const worker = new Worker(path.normalize(ADDR + '/' + "worker.js"), {workerData: {num: number}});

// worker.on("message", result => {
//     console.log(result);
// });

// worker.on("error", error => {
//     console.log(error);
// });

// worker.on("exit", exitCode => {
//     console.log(`It exited with code ${exitCode}`);
// })

// worker.postMessage(123);

module.exports = Thread;