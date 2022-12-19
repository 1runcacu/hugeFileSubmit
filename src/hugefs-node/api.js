const {INSERT,DELETE,QUERY,GAIN,UPDATE} = require("./lib/sql");

const {oauth2} = require("./config");
const {decode} = require("./lib/util");
const {axios} = require("./lib/net");
const Token = require("./lib/verify");


function getTokenFromService(code){
    return new Promise(resolve=>{
        axios.post(oauth2.accessTokenUri,{
            client_id:oauth2.clientId,
            client_secret:oauth2.client_secret,
            redirect_uri:oauth2.redirect_uri,
            grant_type:oauth2.grant_type,
            code
        },{
            headers:{
                "Content-type":"application/x-www-form-urlencoded"
            }
        }).then(v=>{
            resolve(v);
        }).catch(err=>{
            resolve();
        });
    });
}

function getUserInfo(access_token){
    return new Promise(resolve=>{
        axios.create({
            headers:{
                "Accept": "application/json, text/plain, */*",
                "Accept-Encoding": "gzip, deflate",
                "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6",
                'Authorization': access_token,
                "Referer":"http://www.localhost.com:8889/",
            }
        }).get(oauth2.resUri,{ }).then(v=>{
            resolve(v);
        }).catch(err=>{
            resolve();
        });
    });
}

async function login(code){
    const {data} = await getTokenFromService(code);
    if(data){
        const {access_token,token_type} = data||{};
        if(!access_token)return {};
        const pack = await getUserInfo(`${token_type} ${access_token}`);
        const info = pack.data[0]||{};
        if(!info)return {};
        return regist({access_token,...decode(access_token.split('.')[1]),...info});
    }
    return {};
}

function regist(pack={}){
    const {
        sub,Authorities,exp,access_token,
        userInfo:{name,phoneNumber}
    } = pack;
    const data = {
        user_id:sub,name,phoneNumber,more:"",
        Authorities:Authorities.join(','),deadline:exp
    };
    GAIN(`replace into inf_user(user_id,name,phoneNumber,token,Authorities,deadline) values("${sub}","${name}","${phoneNumber}","${access_token}","${data.Authorities}","${exp}")`);
    // GAIN(`replace into inf_login(user_id,token,Authorities,deadline) values("${sub}","${access_token}","${Authorities.join(',')}","${exp}")`);
    return {token:Token.encrypt(data)};
}

function verify(token){
    const {data} = Token.decrypt(token);
    // console.log(data.exp*1000,Date.now(),data.exp*1000>=Date.now());
    if(data.exp&&data.exp*1000>=Date.now())return true;
    return false;
}

async function query(authorization,body){
    const result = {status:403};
    if(authorization&&verify(authorization)){
        const {tableName} = body;
        let value = [];
        switch(tableName){
            case "inf_user":
            case "inf_asset_classfication":
                value = await QUERY(tableName); 
                break;
            case "inf_asset":
                value = await GAIN(`SELECT a.*,b.name as class,b.unit,c.name as recorder FROM inf_asset as a JOIN inf_asset_classfication 
                as b on a.asset_id=b.id JOIN inf_user as c on a.entry_id=c.user_id`);
                break;
            default:value = [];
        }
        return {status:200,value};
    }else{
        return result;
    }
}

async function source(authorization,body){
    const result  = {status:403};
    if(authorization&&verify(authorization)){
        const {tableName} = body;
        let value = {};
        switch(tableName){
            case "inf_asset":
                value = {
                    Users:await GAIN(`SELECT user_id,name FROM inf_user`),
                    Class:await GAIN(`SELECT id,name FROM inf_asset_classfication`)
                }
                break;
            default:value = {};
        }
        return {status:200,value};
    }else{
        return result;
    }
}

// GAIN(`select a.id,a.account,user.name,a.content,b.state,b.time,b.reason from ref_purchase 
//                 as a join inf_state as b on a.id=b.id join inf_account as act on a.account=act.account join 
//                 inf_staff as user on act.user_id=user.id`);

async function insert(authorization,body){
    const result  = {status:403};
    if(authorization&&verify(authorization)){
        const {tableName,key,keyValue,value} = body;
        const result = await INSERT(tableName,value);
        return {status:200,value:result};
    }else{
        return result;
    }
}

async function update(authorization,body){
    const result  = {status:403};
    if(authorization&&verify(authorization)){
        const {tableName,key,keyValue,value} = body;
        let result;
        switch(tableName){
            case "inf_asset_classfication":
                result = await UPDATE(tableName,"?",`${key}="${keyValue}"`,value);
                break;
        }
        return {status:200,value:result};
    }else{
        return result;
    }
}

async function remove(authorization,body){
    const result  = {status:403};
    if(authorization&&verify(authorization)){
        const {tableName,key,keyValue,value} = body;
        let result;
        switch(tableName){
            case "inf_asset_classfication":
                result = await DELETE(tableName,`${key}="${keyValue}"`);
                break;
        }
        return {status:200,value:result};
    }else{
        return result;
    }
}


module.exports = {
    login,verify,
    query,source,insert,update,remove
};