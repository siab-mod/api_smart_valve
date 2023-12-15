require("dotenv").config();
const jwt = require("jsonwebtoken");
const { verify, tanggal } = require("./helper");
const pool = require("../auth/db");

async function reqToken(req, res) {
  const { secret } = req.body;
  if (secret === process.env.SECRET_KEY) {
    try {
      const token = jwt.sign(req.body, secret, {
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
  const { token, volume, debit } = req.body;

  // cek token
  const cekToken = await verify(token);
  if (cekToken.status === false) {
    res.status(200).json({ msg: "Invalid token" });
    return;
  }

  // cek identitas
  const cekIdentitas = await pool.query(
    `SELECT * FROM identitas_smave WHERE id = $1 AND random = $2`,
    [cekToken.data.id, cekToken.data.random]
  );

  if (cekIdentitas.rowCount === 1) {
    // cek data hari ini sudah ada atau belum
    const cekData = await pool.query(
      "SELECT * FROM data_smave WHERE id_user = $1 AND random_user = $2 ORDER BY created_at DESC LIMIT 1",
      [cekToken.data.id, cekToken.data.random]
    );

    if (cekData.rowCount === 0) {
      // simpan data (data pertama akun baru)
      await pool.query(
        `INSERT INTO data_smave (volume, debit, count, created_at, updated_at, id_user, random_user) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          volume,
          debit,
          0,
          Date.now(),
          0,
          cekToken.data.id,
          cekToken.data.random,
        ]
      );
      res.status(200).json({ msg: "success" });
    } else {
      const data = cekData.rows[0];
      // cek tanggal sama dengan hari ini tidak
      if (tanggal(data.created_at) === true) {
        // update data
        await pool.query(
          `UPDATE data_smave SET volume = $1, debit = $2, count = $3, updated_at = $4 WHERE id = $5 AND id_user = $6 AND random_user = $7`,
          [
            data.volume * 1 + volume,
            debit,
            debit <= 2 ? data.count + 1 : data.count,
            Date.now(),
            data.id,
            cekToken.data.id,
            cekToken.data.random,
          ]
        );

        // cek count
        if (data.count + 1 >= 12) {
          // push notifikasi indikasi kebocoran
        }

        res.status(200).json({ msg: "success" });
      } else {
        // simpan data
        await pool.query(
          `INSERT INTO data_smave (volume, debit, count, created_at, updated_at, id_user, random_user) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            volume,
            debit,
            0,
            Date.now(),
            0,
            cekToken.data.id,
            cekToken.data.random,
          ]
        );
        res.status(200).json({ msg: "success" });
      }

      res.status(200).json();
    }
  } else {
    res.status(200).json({ msg: "Invalid token" });
  }
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
  const { token } = req.body;
  const cekToken = await verify(token);

  if (cekToken.status === false) {
    res.status(200).json({ msg: "Token expired" });
    return;
  }

  try {
    const lastData = await pool.query(
      `SELECT * FROM data_smave WHERE id_user = $1 AND random_user = $2 ORDER BY created_at DESC LIMIT 1`,
      [cekToken.data.id, cekToken.data.random]
    );

    const rata_rata = await pool.query(
      `SELECT AVG(volume) AS rata_rata
      FROM data_smave
      WHERE id_user = $1 AND random_user = $2
        AND id < (SELECT MAX(id) FROM data_smave WHERE id_user = $1 AND random_user = $2);
      `,
      [cekToken.data.id, cekToken.data.random]
    );

    const ref = await pool.query(
      `SELECT * FROM referensi_smave WHERE id_user = $1 AND random_user = $2`,
      [cekToken.data.id, cekToken.data.random]
    );

    const result = {
      volume: lastData.rows[0].volume * 1,
      debit: lastData.rows[0].debit * 1,
      last_update:
        lastData.rows[0].updated_at === 0
          ? lastData.rows[0].created_at * 1
          : lastData.rows[0].updated_at * 1,
      rata_rata: rata_rata.rows[0].rata_rata * 1,
      efisiensi:
        ((lastData.rows[0].volume * 1) / (rata_rata.rows[0].rata_rata * 1)) * 100,
      status_valve: ref.rows[0].status,
      trigger_valve: ref.rows[0].trigger,
      limitasi: ref.rows[0].limitasi
    };

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json(error);
  }
}

async function newIdentity(req, res) {
  const { nama, random, password } = req.body;
  try {
    const simpan = await pool.query(
      "INSERT INTO identitas_smave (nama, random, password) VALUES ($1, $2, $3)",
      [nama, random, password]
    );
    res.json(simpan);
  } catch (error) {
    res.json(error);
  }
}

module.exports = {
  inputData,
  reqToken,
  dashboard,
  generateId,
  newIdentity,
};
