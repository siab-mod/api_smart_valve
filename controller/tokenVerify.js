const secret = process.env.SECRET_KEY;
const jwt = require("jsonwebtoken");

function verify(token) {
  let result = {};

  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      result = {
        status: false,
      };
    } else {
      // cek db identity
      result = {
        nama_db: decoded,
        status: true,
      };
    }
  });

  return result;
}

module.exports = verify;
