const secret = process.env.SECRET_KEY;
const jwt = require("jsonwebtoken");

// cek token
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
        data: decoded,
        status: true,
      };
    }
  });

  return result;
}

// konversi epoch
function tanggal(epoch) {
  function parseEpoch(x) {
    const date = new Date(x); // * 1 untuk merubah string to int
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return { day, month, year };
  }

  const waktuData = parseEpoch(epoch * 1);
  const waktuSaatIni = parseEpoch(Date.now());

  const cek =
    waktuData.day === waktuSaatIni.day &&
    waktuData.month === waktuSaatIni.month &&
    waktuData.year === waktuSaatIni.year;

  return cek
}

module.exports = { verify, tanggal };
