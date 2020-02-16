const express = require("express");
const app = express();
const speakeasy = require("speakeasy");
const qrcode = require("qrcode");
const cors = require("cors");
const socketio = require("socket.io");
const port = 8000;
let user = {
  secretbase32: null
};
let auth = false;
app.use(cors());
app.use(express.json());

const expressServer = app.listen(port, () => {
  console.log("app running on", port);
});
const io = socketio(expressServer);

app.get("/", (req, res) => {
  const secret = speakeasy.generateSecret();
  user.secretbase32 = secret.base32;
  qrcode.toDataURL(secret.otpauth_url, (err, data_url) => {
    res.json({ url: data_url });
  });
});

app.post("/", (req, res) => {
  console.log(user.secretbase32);
  console.log(req.body.user.userPin);
  const secretbase32 = user.secretbase32;
  const userToken = req.body.user.userPin;
  const verfied = speakeasy.totp.verify({
    secret: secretbase32,
    encoding: "base32",
    token: userToken
  });
  if (verfied) auth = true;
  res.json({ auth: verfied });
});
