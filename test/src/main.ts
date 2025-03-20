import express from "express";
const app = express();

app.post("/", express.text(), function (req, res) {
  console.log(req.headers);
  console.log(req.body);
  res.status(200).send("ok");
});

app.listen(3000);
