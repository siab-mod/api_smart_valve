require("dotenv").config();
const jwt = require("jsonwebtoken");
const verify = require("./tokenVerify");
// const pool = require("../auth/db");

async function reqToken(req, res) {
  const { secret, id } = req.body;
  const user = {
    id: id,
  };
  if (secret === process.env.SECRET_KEY) {
    try {
      const token = jwt.sign(user, secret, {
        expiresIn: "5m",
        noTimestamp: true,
      });
      res.status(200).json({ token: token });
    } catch (err) {
      console.log(err);
    }
  } else {
    res.status(200).json({ msg: "kunci beda" });
  }
}

async function inputData(req, res) {
  // Mendapatkan SECRET_KEY yang diharapkan dari environment variable (env)

  const { token, volume, debit } = req.body;

  // cek token
  const cek = await verify(token);
  res.json(cek);
}

function generateId(req, res) {
  function generateRandomString(length) {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters.charAt(randomIndex);
    }
    return result;
  }

  // Contoh penggunaan untuk menghasilkan string acak dengan panjang 8 karakter
  const randomString = generateRandomString(8);
  res.json({ random: randomString });
}

async function dashboard(req, res) {
  res.send("aha");
}

// async function newIdentity(req, res) {
//   // const { nama, random } = req.body;
//   // try {
//   // const simpan = await pool.query(
//   //   "INSERT INTO identitas_smave (nama, random) VALUE ($1, $2)",
//   //   [nama, random],
//   // );
//   // } catch (error) {
//   //   res.json(error);
//   // }
//   res.send("simpan");
// }

function aa(req, res) {
  res.send("aha");
}

module.exports = {
  inputData,
  reqToken,
  dashboard,
  generateId,
  newIdentity,
  aa,
};
