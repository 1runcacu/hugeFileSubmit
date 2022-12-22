const {parentPort, workerData} = require("worker_threads");

parentPort.on("message",function(data){
    console.log(data);
    parentPort.postMessage({data,flag:233});
})

parentPort.postMessage(getFibonacciNumber(workerData.num))

function getFibonacciNumber(num) {
    if (num === 0) {
        return 0;
    }
    else if (num === 1) {
        return 1;
    }
    else {
        return getFibonacciNumber(num - 1) + getFibonacciNumber(num - 2);
    }
}