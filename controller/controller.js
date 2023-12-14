async function reqToken(req, res) {}

async function inputData(req, res) {
  const { token, volume, debit } = req.body;

  res.json({ msg: "masuk mas" });
}

module.exports = { inputData, reqToken };
