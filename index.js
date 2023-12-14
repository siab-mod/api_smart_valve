const express = require("express");
const app = express();
const cors = require("cors");

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json("Halo 👋, ini server smart valve");
});

const { inputData, reqToken, dashboard } = require("./controller/controller");
app.post("/api/sv1/req-token", reqToken);
app.post("/api/sv1/input-data", inputData);
app.post("/api/sv1/dashboard", dashboard);

app.listen(8080, () => {
  console.log("server running on port 8080");
});
