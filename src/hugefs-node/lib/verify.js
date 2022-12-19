const jwt = require('jsonwebtoken');
const {tokenSecrit} = require('../config');

const Token = {
  encrypt:function(data,time=60*60*1000){
    return jwt.sign(data, tokenSecrit, {expiresIn:time})
  },
  decrypt:function(token){
    try {
      let data = jwt.verify(token, tokenSecrit);
      return {
        token:true,
        data
      };
    } catch (e) {
      return {
        token:false,
        data:e
      }
    }
  }
}

module.exports = Token;