let bcrypt = require('bcrypt');

// mã hoá password
function hashPassword(password){
    let saltRounds = parseInt(process.env.SECURITY_BCRYPT_SALT);
    let salt = bcrypt.genSaltSync(saltRounds);
    return bcrypt.hashSync(password, salt);
    
}
// kiểm tra password
function checkPassword(password, hashPassword){
    return bcrypt.compareSync(password, hashPassword); ;
}





module.exports = {
    'hashPassword': hashPassword,
    'checkPassword': checkPassword
}