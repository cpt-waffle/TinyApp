function generateRandomString() {
  let randomString = require("randomstring");
  return randomString.generate(6);
}

//All package imports (NPM)
const bodyParser = require("body-parser");
let express = require("express");
let cookieSession = require("cookie-session");
let bcrypt = require("bcrypt");
let methodOverride = require('method-override');
const PORT = 8080;
//package imports end/////


//server setup
let app = express();
//middlewear setup
app.use(methodOverride('_method'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({name: 'user_id', secret:"mysecret"}));
app.set("view engine", "ejs");

////////////////////////DB SETS////////////////////////////////
let urlDataBase = {
  "11111" :
      { "b2xVn2": "http://www.netflix.com",
        "L3eTWw": "http://www.facebook.com",
        "9sm5xK": "http://www.armorgames.com"
      },
  "22222" :
      { "Hc38Zt": "http://www.lighthouselabs.ca",
        "F0le3z": "http://www.wired.com",
        "BtCc4l": "http://www.google.com"
      }
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10)
  },
 "22222": {
    id: "22222",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10)
  },

 "11111": {
    id: "11111",
    email: "vasily.klimkin@gmail.com",
    password: bcrypt.hashSync("wubb",10)
  }
}
////////////////////////DB SETS END/////////////////////////////



////////////////////DEBUG SET/////////////////////////////////////
app.get("/", function(request,response) {
  response.end("Hello World");
});

app.get("/urls.json", function(request,response) {
  response.json(users);
});

app.get("/hello", function(request, response) {
  response.end("<html><body><b>Hello World</b></body></html>");
});

app.get("/urls/new", function(request, response) {
  if (request.session.user_id)
    response.render("urls_new");
  else
    response.redirect("/login");
});

app.get("/user_test", function(reqst, response) {
  response.render("user_test", {users});
});
///////////////////////////////////////////////////////////////////


///////////////////////POST FUNCTIONS//////////////////////////////
app.post("/register", function(request, response) {
  let email = request.body.email;
  let pass = request.body.pass;

  if (!email || email === "" && !pass || pass == "")
    response.status(400).send("Fields Cannot be Empty");
  else {

    let match = false;
    for (let i in users) {

      if (users[i].email === email)
        match = true;
    }

    if (match)
      response.status(400).send("User already exists");
    else {
      let password = bcrypt.hashSync(pass,10);
      let id = generateRandomString();
      users[id] = {id: id,
                  email: email,
                  password: password};

      urlDataBase[id] = {};

      request.session.user_id = id;
      response.redirect("/urls");
    }
  }
});

app.post("/urls", function(request, response) {
  let longURL = request.body.longURL;
  let shortURL = generateRandomString();

  urlDataBase[request.session.user_id][shortURL] = longURL;
  response.redirect(("/urls/"+shortURL));
});

app.put("/urls/:shortURL", function(request, response) {
  urlDataBase[request.session.user_id][request.params.shortURL] = request.body.tempURL;
  response.redirect("/urls");
});

app.post("/login", function(request, response) {
  let name = request.body.username;
  let pass = request.body.password;
  if (!name || name === "" && !pass || pass == "")
    response.status(400).send("Fields Cannot be Empty");
  else
  {
    for (let i in users)
    {
      if (users[i].email === name)
        if (bcrypt.compareSync(pass,users[i].password))
        {
          request.session.user_id = i;
          response.redirect("/urls");
        }
    }
    response.status(400).send("Login or password is incorrect!");
  }
});

app.delete("/urls/:shortURL", function(request, response) {
  let found = false;
  for (let i in urlDataBase[request.session.user_id])
    if (i === request.params.shortURL)
      found = true;

  if (found)
  {
    console.log(urlDataBase[request.session.user_id][request.params.shortURL]);
    delete urlDataBase[request.session.user_id][request.params.shortURL];
    response.redirect("/urls");
  }
  else
    response.status(400).send("Cannt find URL to delete :(");
});



app.post("/logout", function(request, response) {
  request.session = null;
  response.redirect("/urls");
});
////////////////////POST FUNCTIONS END/////////////////////////////

///////////////////GET FUNCTIONS///////////////////////////////////
app.get("/login", function(request, response) {
  response.render("login");
});

app.get("/u/:shortURL", function(request, response) {

  let longURL;
  for (let ids in urlDataBase)
  {
    for (let shortUrls in urlDataBase[ids])
    {
      if (shortUrls === request.params.shortURL)
        longURL = urlDataBase[ids][shortUrls];
    }
  }
  if (longURL)
    response.redirect(longURL);
  else
    response.status(400).send("Bad short URL!");
});

app.get("/urls", function(request, response) {

  let templateVars = { urls: urlDataBase[request.session.user_id],
                       user: users[request.session.user_id]};
  response.render("urls_index", templateVars);
});

app.get("/urls/:id", function(request, response) {

  let templateVars = { shortURL: request.params.id,
                        URL: urlDataBase[request.session.user_id][request.params.id],
                        user:users[request.session.user_id]};
  response.render("urls_show", templateVars);
});

app.get("/register", function(request, response) {
  response.render("register");
});
//////////////////GET FUNCTIONS END////////////////////////////////

app.listen(PORT, function() {
  console.log(`Example app listening on port ${PORT}!`);
});