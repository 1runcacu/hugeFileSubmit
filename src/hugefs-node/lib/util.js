const ID = ()=>Date.now().toString(36)+Math.random().toString(36).substr(2,8);


function encode(json){
    return btoa(JSON.stringify(json));
}

function decode(code){
    return JSON.parse(atob(code));
}

module.exports = {
    ID,encode,decode
};