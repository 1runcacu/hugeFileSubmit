const http = require('http');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const ecstatic = require('ecstatic');
const history = require('connect-history-api-fallback');
const {proxy} = require('./lib/net');
const {errorSysInit} = require('./lib/error');
const fs = require('fs');
// const Thread = require('./lib/thread');
const { Worker } = require("worker_threads");

const port = (process.env.NODE_ENV=="test")?8401:8400;
const HOST = (process.env.NODE_ENV=="production")?`http://101.34.27.96`:`http://localhost`;
const BASE = `${HOST}:${port}`;
const URL = `${BASE}/file`;
const STATIC = `${BASE}/static`;

// const port = 8401;
const addr = path.normalize(__dirname + '/static');

const circle = new Worker(path.normalize(__dirname + '/lib/circle.js'));
circle.on("message",function(data){
    console.log(data);
});

errorSysInit(process);

const app = express();

app.all('*', function (req, res, next){
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'POST,GET');
    next();
});

app.use('/static', express.static('./static'))
// app.use( bodyParser.urlencoded({extended: true}) )
// app.use(bodyParser.json())
app.use(bodyParser.json({limit:'200mb'}));
app.use(bodyParser.urlencoded({ limit:'200mb', extended: true }));

app.use(history());
app.use(ecstatic({ root: __dirname + '/dist',cache:'no-cache',weakEtags:true }));

app.post(/proxy/,async function(req,res){
    const {url,params,config,method} = req.body;
    // console.log("proxy:",url,params);
    proxy(url,params,config,method).then(v=>{
        res.status(200).json(v.data);
    }).catch(err=>{
        console.log(err);
        res.status(404).json({});
    })
});

function stringToArrayBuffer(str){
    let buffer = new ArrayBuffer(str.length);
    let view = new Uint8Array(buffer)
    for (let i = 0; i < str.length; i++) {
        view[i] = str.charCodeAt(i)
    }
    return buffer;
}

const map = {};

app.post(/file/,async function(req,res){
    const {type,filename,frame,hash,seq,process} = req.body;
    switch(process){
        default:
        case "running":
            circle.postMessage({
                filename,hash,frame,seq,flag:'a'
            });
            res.status(200).json({ack:seq+1,process});
            return;
        case "start":
            circle.postMessage({
                filename,hash,frame,seq,flag:'w'
            });
            res.status(200).json({ack:seq+1,process});
            return;
        case "finish":
            // delete map[hash];
            res.status(200).json({ack:seq+1,process,url:`${STATIC}/${filename}`});
            return;
    }
    
});

http.createServer(app).listen(port,function () {
    console.log(`应用实例，访问地址为 http://localhost:${port}`);
});

