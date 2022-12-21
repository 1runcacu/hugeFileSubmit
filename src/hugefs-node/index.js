const http = require('http');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const ecstatic = require('ecstatic');
const history = require('connect-history-api-fallback');
const {proxy} = require('./lib/net');
const {errorSysInit} = require('./lib/error');
const fs = require('fs');

const port = (process.env.NODE_ENV=="test")?8401:8400;
const HOST = (process.env.NODE_ENV=="production")?`http://101.34.27.96`:`http://localhost`;
const BASE = `${HOST}:${port}`;
const URL = `${BASE}/file`;
const STATIC = `${BASE}/static`;
// const port = 8401;
const addr = path.normalize(__dirname + '/static');

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

app.post(/file/,async function(req,res){
    const {type,filename,frame,hash,seq,process} = req.body;
    switch(process){
        default:
        case "running":
            res.status(200).json({ack:seq+1,process});
            fs.writeFile(`${addr}/${filename}`,new DataView(stringToArrayBuffer(frame)),{ flag: 'a' }, function (error){
                if(error){
                    console.log(error);
                }else{
                    // console.log(`${seq}-${hash}:${filename} merge success!`);
                }
            });
            return;
        case "start":
            fs.writeFile(`${addr}/${filename}`,new DataView(new ArrayBuffer(0)),{ flag: 'w' }, function (error){
                if(error){
                    console.log(error);
                }else{
                    console.log(`${filename} create success!`);
                }
            });
            res.status(200).json({ack:seq+1,process});
            return;
        case "finish":
            res.status(200).json({ack:seq+1,process,url:`${STATIC}/${filename}`});
            return;
    }
    
});

http.createServer(app).listen(port,function () {
    console.log(`应用实例，访问地址为 http://localhost:${port}`);
});

