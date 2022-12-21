const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const ecstatic = require('ecstatic');
const history = require('connect-history-api-fallback');
const {proxy} = require('./lib/net');
const {errorSysInit} = require('./lib/error');

const port = 8401;
// const port = 8401;

errorSysInit(process);

const app = express();

app.all('*', function (req, res, next){
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'POST,GET');
    next();
});

app.use( bodyParser.urlencoded({extended: true}) )
app.use(bodyParser.json())
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

app.post(/file/,async function(req,res){
    const {type,filename,frame,seq,process} = req.body;
    switch(process){
        case "start":
        case "running":
        default:
            res.status(200).json({ack:seq+1,process});
            return;
        case "finish":
            res.status(200).json({ack:seq+1,process,url:"http://127.0.0.1:xxxx"});
            return;
    }
    
});

http.createServer(app).listen(port,function () {
    console.log(`应用实例，访问地址为 http://localhost:${port}`);
});

