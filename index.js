const express = require("express");
const app = express();
const cors = require("cors");

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json("Halo 👋, ini server smart valve");
});

const { inputData, reqToken } = require("./controller/controller");
app.get("/cek", inputData);

app.listen(8080, () => {
  console.log("server running on port 8080");
});
