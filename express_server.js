const express = require("express");
const cookieSession = require("cookie-session");
const bodyParser = require("body-parser");
const app = express();
const PORT = 8080; // default port 8080
const bcrypt = require('bcrypt');
const { lookUpUserByEmail } = require('./helpers');


app.use(cookieSession({
  name: 'session',
  keys: ['minty'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");


const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

let users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

app.get("/", (req, res) => {
  res.send('Hello!');
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
})

app.post("/urls", (req, res) => {  
  let newID = generateRandomString();
  urlDatabase[newID] = { longURL: req.body.longURL, userID: req.session.userId.id};
  let templateVars = { username: req.session.userId, shortURL: newID, longURL: req.body.longURL };
  res.render("urls_show", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = { username: req.session.userId, urls: urlDatabase };
  res.render("urls_new", templateVars);
});

app.post("/urls/new", (req, res) => {
  let templateVars = { username: req.session.userId, urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  let index = req.params.shortURL;
  let templateVars = { username: req.session.userId, shortURL: index, longURL: urlDatabase[index] };
  res.render("urls_show", templateVars);
});

app.get("/urls", (req, res) => {
  let templateVars = { username: users[req.session.userId], urls: filteredDatabase(req.session.userId.id) };
  res.render("urls_index", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.post('/urls/logout', (req, res) => {
  // res.clearCookie('userId');
  req.session = null;
  res.redirect("/login");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls"); 
});

app.get('/register', (req, res) => {
  let templateVars = { username: req.session.userId};
  res.render("register", templateVars);
});

app.post('/register', (req, res) => {
  const id = generateRandomString();
  const email = req.body['email'];
  const password = req.body['password'];
  const hashedPassword = bcrypt.hashSync(password, 10);
  
  if (email === '' || password === ''){
    res.sendStatus(400);
  } else{
  users[id] = {id, email, hashedPassword};
  req.session.userId = users[id];
  res.redirect("/urls");
  }

})

app.get('/login', (req, res) => {
  let templateVars = { username: req.session.userId };
  res.render("login", templateVars);
});

app.post('/login', (req, res) => {
  const email = req.body['email'];
  const password = req.body['password'];
  if (!lookUpUserByEmail(email, users)){
    res.sendStatus(403);
  } else if (!bcrypt.compareSync(password, lookUpUserByEmail(email, users).hashedPassword)) {
    res.sendStatus(403);
  } else {
  req.session.userId = lookUpUserByEmail(email, users).email;
  res.redirect("/urls");
  }

})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

function generateRandomString() {
  let result           = '';
  const characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < 6; i++ ) {
     result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;

}


const filteredDatabase = function(user){
  const urlArr = Object.keys(urlDatabase);
  let filteredDatabase = {};

  for (let shortURL of urlArr) {
    if (urlDatabase[shortURL].userID === user){
      filteredDatabase[shortURL] = urlDatabase[shortURL].longURL;
    }
  }
return filteredDatabase;

}