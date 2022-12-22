const { parentPort,workerData } = require("worker_threads");
const fs = require('fs');
const core = function(data,parentPort){
    console.log(1231231)
    setInterval(() => {
        console.log(data)
    }, 1000);
    parentPort.postMessage(2333);
}
parentPort.on("message", (data) => {
    core({data,workerData},parentPort);
})    
