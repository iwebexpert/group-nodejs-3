const express = require("express");
const hbs = require("express-handlebars");
const cookieParser = require("cookie-parser");
const path = require("path");

const newsArray = require("./data/news");
const users = require("./data/users");
const TaskModel = require("./models/taskMysql");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static("public"));

app.engine(
  "hbs",
  hbs({
    extname: "hbs",
    defaultLayout: "default",
    layoutsDir: path.join(__dirname, "views", "layouts"),
    partialsDir: path.join(__dirname, "views", "partials"),
  })
);
app.set("view engine", "hbs");

app.get("/", (req, res) => {
  res.status(200).send("Hello, express.js!");
});

app.get("/users", (req, res) => {
  if (req.test) {
    console.log(req.test);
  } else {
    console.log("Заголовок test не был передан");
  }
  // res.status(200).send('Users!')

  res.render("users", { users });
});

app.post("/users", (req, res) => {
  console.log(req.body);
  res.status(200).send("Post!");
});

app.get("/users/:username", (req, res) => {
  const { username } = req.params;
  const user = users[username];
  if (!user) {
    res.status(404).render("error");
  }
  res.render("user", { user });
});

app.get("/news", (req, res) => {
  const count = req.cookies.count ? req.cookies.count : { count: 100 };
  console.log(+count);
  let news = [];
  newsArray.forEach((elem, i) => {
    if (i < count) {
      news.push(elem);
    }
  });
  res.render("news", { news });
});

app.post("/news", (req, res) => {
  const { count } = req.body;
  res.cookie("count", count);
  res.redirect("/news");
});

app.get("/config", (req, res) => {
  res.render("config");
});

app.post("/config", (req, res) => {
  console.log(req.body);
  const { param1 } = req.body;
  console.log(+param1);
  res.redirect("/config");
});

app.get("/cookie/get", (req, res) => {
  console.log(req.cookies);
  res.send(JSON.stringify(req.cookies));
});

app.get("/cookie/set", (req, res) => {
  res.cookie("count", Math.floor(Math.random() * 10));
  res.redirect("/cookie/get");
});

//Вариант 1
// app.use((req, res) => {
//     res.status(404).render('error')
// })

//Вариант 2
app.get("*", (req, res) => {
  res.status(404).render("error");
});

app.listen(4000, () => {
  console.log("http://localhost:4000");
});
