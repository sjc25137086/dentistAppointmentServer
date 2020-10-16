const jwt  = require('jsonwebtoken');
// let secret = 'jianggelanjiu'
// function createToken(phone){
//     let payload = {'phone':phone}
//     return jwt.sign(payload,secret)
// }
// function verifyToken(token){
//     let payload = jwt.verify(token,secret);
//     return payload.phone
// }

// console.log(createToken(13312956951))
// console.log(verifyToken(createToken({'phone':'13312956951'})))

module.exports = { 
    secret : 'jianggelanjiu', 
    createToken : function createToken(phone){
         let payload = {'phone':phone}
         return jwt.sign(payload,this.secret)
    },
    verifyToken:    function verifyToken(token){
         let payload = jwt.verify(token,this.secret);
         return payload.phone
    }
}