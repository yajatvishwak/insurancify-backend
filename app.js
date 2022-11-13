const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

const app = express();
app.use(morgan("dev"));
app.use(express.json());
app.use(cors());
// database
const Database = require("better-sqlite3");
const db = new Database("insurance.db", { verbose: console.log });

app.get("/", (req, res) => {
  res.send({ code: "heyy!" });
});

app.post("/signup", async (req, res) => {
  const { username, password, name } = req.body;
  console.log({ username, password, name });
  // check if username exists
  const usernameExists = db
    .prepare("SELECT uid from users where username=@username")
    .get({ username });
  if (usernameExists && usernameExists.uid) {
    return res.send({ code: "err", message: "Username exists" });
  }

  const insert = db.prepare(
    "INSERT INTO users (username, name, password) VALUES (@username , @name, @password)"
  );
  let info = insert.run({ username, name, password });
  console.log(info);
  if (info) {
    res.send({ isCreated: true, code: "suc", uid: info.lastInsertRowid });
  } else {
    res.send({ isCreated: false, code: "err" });
  }
});
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const select = db.prepare(
    "SELECT username, password,uid, name from users where username=@username"
  );
  let info = select.get({ username });
  if (info) {
    if (info.username === username && info.password === password) {
      return res.send({
        loggedin: true,
        uid: info.uid,
        code: "suc",
        name: info.name,
      });
    }
  }
  return res.send({ loggedin: false, code: "err" });
});

app.post("/editprofile", (req, res) => {
  const { username, password, name, uid } = req.body;
  // check if username exists
  const usernameExists = db.prepare(
    "SELECT uid from users where username=@username"
  );
  if (usernameExists && username.uid) {
    return res.send({ code: "err", message: "Username exists" });
  }

  const update = db
    .prepare(
      "UPDATE users SET username=@username, password=@password, name=@name WHERE uid=@uid"
    )
    .run({ username, name, password, uid });
  if (update) {
    return res.send({ code: "success", message: "Saved" });
  } else {
    res.send({ code: "err", message: "could not update" });
  }
});

app.post("/addinsurance", (req, res) => {
  const { uid, title, desc, category } = req.body;
  const insert = db.prepare(
    "INSERT INTO listings (uid, title, desc, category, status) VALUES (@uid , @title, @desc, @category, 'pending')"
  );
  let info = insert.run({ uid, title, desc, category });
  if (info) {
    res.send({ isCreated: true, code: "suc" });
  } else {
    res.send({ isCreated: false, code: "err" });
  }
});

app.post("/getdeetsforhomepage", (req, res) => {
  const { uid } = req.body;
  const select = db
    .prepare(
      "SELECT name, lid, title, category, status from listings, users where listings.uid = users.uid and users.uid=@uid"
    )
    .all({ uid });
  res.send({ code: "suc", items: select });
});

app.post("/accept", (req, res) => {
  const { lid } = req.body;
  const update = db.prepare(
    "UPDATE listings SET status='accepted' where lid=@lid"
  );
  update.run({ lid });
  res.send({ code: "suc" });
});

app.post("/reject", (req, res) => {
  const { lid } = req.body;
  const update = db.prepare(
    "UPDATE listings SET status='rejected' where lid=@lid"
  );
  update.run({ lid });
  res.send({ code: "suc" });
});

app.get("/getvals", (req, res) => {
  const select = db
    .prepare(
      "SELECT name, lid, title, desc, category, status from listings, users where listings.uid = users.uid"
    )
    .all();
  res.send(select);
});

app.listen(5000, () => {
  console.log("Server online at 5000");
});
