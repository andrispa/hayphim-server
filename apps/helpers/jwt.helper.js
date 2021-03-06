const jwt = require("jsonwebtoken");

/**
 * private function generateToken
 * @param user 
 * @param secretSignature 
 * @param tokenLife 
 */
const generateToken = (user, secretSignature, tokenLife) => {
  return new Promise((resolve, reject) => {
    // Thực hiện ký và tạo token
    jwt.sign(
      {data: user},
      secretSignature,
      {
        algorithm: "HS256",
        expiresIn: tokenLife,
      },
      (error, token) => {
        if (error) {
          return reject(error);
        }
        resolve(token);
    });
  });
}

/**
 * This module used for verify jwt token
 * @param {*} token 
 * @param {*} secretKey 
 */
const verifyToken = (token, secretKey) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, secretKey, (error, decoded) => {
      if (error) {
        return reject(error);
      }
      resolve(decoded);
    });
  });
}

module.exports = {
  generateToken: generateToken,
  verifyToken: verifyToken,
};