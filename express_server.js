const express = require("express");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const app = express();
const PORT = 8080; // default port 8080


app.use(cookieParser());

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = { 
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
  //console.log(req.body);  // Log the POST request body to the console
  let newID = generateRandomString();
  {urlDatabase[newID] =  req.body.longURL};
  //console.log("urlDatabase", urlDatabase);
  let templateVars = { shortURL: newID, longURL: req.body.longURL };
  res.render("urls_show", templateVars);
  // res.send("Ok");         // Respond with 'Ok' (we will replace this)
});

app.get("/urls/new", (req, res) => {
  let templateVars = { username: req.cookies['userId'], urls: urlDatabase };
  console.log('req.cookies in urls new',req.cookies['username']);
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  let index = req.params.shortURL;
  let templateVars = { shortURL: index, longURL: urlDatabase[index] };
  res.render("urls_show", templateVars);
});

app.get("/urls", (req, res) => {
  let templateVars = { username: req.cookies['userId'], urls: urlDatabase };
  console.log('req.cookies in urls', req.cookies['userId'])
  res.render("urls_index", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars); 
});

app.post('/urls/logout', (req, res) => {
  res.clearCookie('userId');
  res.redirect("/urls");
});

app.get('/register', (req, res) => {
  let templateVars = { username: req.cookies['username'], urls: urlDatabase };
  res.render("register", templateVars);
});

app.post('/register', (req, res) => {
  const id = generateRandomString();
  const email = req.body['email'];
  const password = req.body['password'];
  if (email === '' || password === ''){
    res.sendStatus(400);
  } else{
  users[id] = {id, email, password};
  res.cookie('userId', users[id]);
  res.redirect("/urls");
  }

})

app.get('/login', (req, res) => {
  let templateVars = { username: req.cookies['username'], urls: urlDatabase };
  res.render("login", templateVars);
});

app.post('/login', (req, res) => {
  console.log(users);
  const email = req.body['email'];
  const password = req.body['password'];
  if (!lookUpUserByEmail(email)){
    console.log(lookUpUserByEmail(email));
    res.sendStatus(403);
  } else if (lookUpUserByEmail(email).password !== password) {
    console.log('2');
    res.sendStatus(403);
  } else {
    console.log('3');
  res.cookie('userId', lookUpUserByEmail(email).email);
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

function lookUpUserByEmail(emailInput){
  const obj = Object.values(users);
  console.log('obj', obj);
  for (let user in obj) {
    if (obj[user].email === emailInput) {
      console.log('obj[user].email', obj[user].email)
      return obj[user];
    } else return undefined;
  }
}