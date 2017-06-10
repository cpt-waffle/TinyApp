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

///////////////////////POST FUNCTIONS//////////////////////////////

//Registers the user in the userdatabase as long as all parameters were
//entered and the username( or actually email) does not exist in DB
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

//gets the full URL from the form, generates random string
//then pops it in the DB
app.post("/urls", function(request, response) {
  if (request.session.user_id) {
    let longURL = request.body.longURL;
    let shortURL = generateRandomString();

    urlDataBase[request.session.user_id][shortURL] = longURL;
    response.redirect(("/urls/"+shortURL));
  }
  else
    response.status(400).send("You cant post if you arent logged in");
});

//updates one of the short URLs value that was selected by user
app.put("/urls/:shortURL", function(request, response) {
  urlDataBase[request.session.user_id][request.params.shortURL] = request.body.tempURL;
  response.redirect("/urls");
});

//tries to log you in, and if succesful lets you
//go to /urls otherwise status code 400 and appropriate
//error message
app.post("/login", function(request, response) {
  let name = request.body.username;
  let pass = request.body.password;
  if (!name || name === "" && !pass || pass == "")
    response.status(400).send("Fields Cannot be Empty");
  else
  {
    let found = false;
    for (let i in users)
    {
      if (users[i].email === name)
        if (bcrypt.compareSync(pass,users[i].password))
        {
          found = true;
          request.session.user_id = i;
          response.redirect("/urls");
        }
    }
    if (!found)
      response.status(400).send("Login or password is incorrect!");
  }
});

//deletes the url that was selected by the user on URL page
//Put a protection against curl where you can try to delete without having
//the apporopriate cookie (USED TO BE A POST METHOD (REST))
app.delete("/urls/:shortURL", function(request, response) {
  let found = false;

  if (request.session.user_id) {
    for (let i in urlDataBase[request.session.user_id])
      if (i === request.params.shortURL)
        found = true;

    if (found)
    {
      delete urlDataBase[request.session.user_id][request.params.shortURL];
      response.redirect("/urls");
    }
    else
      response.status(400).send("Cannt find URL to delete :(");
  }
  else
    response.status(400).send("You cant delete if you are not logged in");
});

//logs you out
app.post("/logout", function(request, response) {
  request.session = null;
  response.redirect("/urls");
});
////////////////////POST FUNCTIONS END/////////////////////////////

///////////////////GET FUNCTIONS///////////////////////////////////
app.get("/urls/new", function(request, response) {
  if (request.session.user_id)
    response.render("urls_new");
  else
    response.redirect("/login");
});

//obligatory redirect specified by assignment standard :)
app.get("/", function(request,response) {
  if (request.session.user_id)
    response.redirect("/urls");
  else
    response.redirect("/login");
});


app.get("/login", function(request, response) {
  response.render("login");
});

//when short url is put in browser with that type of adress,
//i,e (localhost:8080)
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
    response.status(400).send("This Short url does not exist");
});

//if logged in print out all the URLS only aded by the logged in user
//other than that dont show the anon anything
app.get("/urls", function(request, response) {

  let templateVars = { urls: urlDataBase[request.session.user_id],
                       user: users[request.session.user_id]};
  response.render("urls_index", templateVars);
});

//show the one URL that user selected to edit/update
app.get("/urls/:id", function(request, response) {

  if (request.session.user_id) {

    let templateVars = { shortURL: request.params.id,
                        URL: urlDataBase[request.session.user_id][request.params.id],
                        user:users[request.session.user_id]};
    response.render("urls_show", templateVars);
  }
  else
  {
    response.status(400).send("You cannot do this if you are not logged in");
  }
});

//go to registeration if not logged in but if logged go to urls
app.get("/register", function(request, response) {
    if (!request.session.user_id)
      response.render("register");
    else
      response.redirect("/urls");
});
//////////////////GET FUNCTIONS END////////////////////////////////


//server Start
app.listen(PORT, function() {
  console.log(`Example app listening on port ${PORT}!`);
});