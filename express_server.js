function generateRandomString() {
  let randomString = require("randomstring");
  return randomString.generate(6);
}

const bodyParser = require("body-parser");
let express = require("express");
let cookieParser = require("cookie-parser");
let app = express();

let PORT = 8080;

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.set("view engine", "ejs");

let urlDataBase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "L3eTWw": "http://www.wired.com",
  "9sm5xK": "http://www.google.com",
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
  },

 "L3eTWw": {
    id: "L3eTWw",
    email: "vasily.klimkin@gmail.com",
    password: "wubb"
  }
}


//console.log(generateRandomString());

////////////////////DEBUG SET/////////////////////////////////////
app.get("/", function(request,response) {
  response.end("Hello World");
});

app.get("/urls.json", function(request,response) {
  response.json(urlDataBase);
});

app.get("/hello", function(request, response) {
  response.end("<html><body><b>Hello World</b></body></html>");
});

app.get("/urls/new", function(request, response) {
  response.render("urls_new");
});
///////////////////////////////////////////////////////////////////


app.get("/user_test", function(reqst, response) {
  response.render("user_test", {users});
});

///////////////////////POST FUNCTIONS//////////////////////////////
app.post("/register", function(request, response) {
  let email = request.body.email;
  let password = request.body.pass;

  if (!email || email === "" && !password || password == "")
  {
    response.sendStatus(400);
  }
  else
  {
    let match = false;
    for (let i in users)
    {
      if (users[i].email === email)
        match = true;
    }

    if (match)
      response.sendStatus(400);

    let id = generateRandomString();
    console.log(`${email}     ${password}`);
    users[id] = {id: id,
                email: email,
                password: password};

    response.cookie("user_id", id);
    response.redirect("/urls");
  }
});


app.post("/urls", function(request, response) {
  //console.log(request.body);  // debug statement to see POST parameters
  let longURL = request.body.longURL;
  let shortURL = generateRandomString();

  //console.log(request.body);
  urlDataBase[shortURL] = longURL;
  //console.log(urlDataBase);
  response.redirect(("/urls/"+shortURL));
  //response.send("Ok");         // Respond with 'Ok' (we will replace this)
});

app.post("/urls/:shortURL", function(request, response) {
  urlDataBase[request.params.shortURL] = request.body.tempURL;
  response.redirect("/urls");
});

app.post("/login", function(request, response) {
  let name = request.body.username;
  let pass = request.body.password;
  console.log()
  if (!name || name === "" && !pass || pass == "")
  {
    response.status(400).send("Fields Cannot be Empty");
  }
  else
  {
    for (let i in users)
    {
      if (users[i].email === name)
        if (users[i].password === pass)
        {
          response.cookie('user_id', i);
          response.redirect("/urls");
        }
    }
    response.status(400).send("Login or password is incorrect!");



  }
  // console.log(name);

  // response.cookie('user_id', name);
  // response.redirect("/urls");
});

app.post("/urls/:shortURL/delete", function(request, response) {
  //console.log(request.params.shortURL);
  let found = false;
  for (let i in urlDataBase)
    if (i === request.params.shortURL)
      found = true;

  if (found)
  {
    delete urlDataBase[request.params.shortURL];
    response.redirect("/urls");
  }
  else
    response.end("Cannot Find URL");
});



app.post("/logout", function(request, response) {
  response.clearCookie("user_id", request.cookies["user_id"]);
  response.redirect("/urls");
});
////////////////////POST FUNCTIONS END/////////////////////////////


///////////////////GET FUNCTIONS///////////////////////////////////
app.get("/login", function(request, response) {
  response.render("login");
});

app.get("/u/:shortURL", function(request, response) {

  let longURL = urlDataBase[request.params.shortURL];
  //console.log(longURL);
  response.redirect(longURL);
});

app.get("/urls", function(request, response) {

  console.log(users[request.cookies["user_id"]]);

  let templateVars = { urls: urlDataBase,
                       user: users[request.cookies["user_id"]] };
  //console.log(templateVars);

  //console.log("IM HERE" + templateVars);
  console.log(templateVars);
  response.render("urls_index", templateVars);
});

app.get("/urls/:id", function(request, response) {

  let templateVars = { shortURL: request.params.id,
                        URL: urlDataBase[request.params.id],
                        user:users[request.cookies["user_id"]]};
  response.render("urls_show", templateVars);
});

app.get("/register", function(request, response) {
  //response.end("REGISTER PAGE TEST");
  response.render("register");
});
//////////////////GET FUNCTIONS END////////////////////////////////


app.listen(PORT, function() {
  console.log(`Example app listening on port ${PORT}!`);
});