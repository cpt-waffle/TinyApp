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
  "9sm5xK": "http://www.google.com"
};

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



///////////////////////POST FUNCTIONS//////////////////////////////
app.post("/register", function(request, response) {
  response.end("REGISTER POST");
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
  console.log(name);
  response.cookie('username', name);
  response.redirect("/urls");
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
  response.clearCookie("username", request.cookies["username"]);
  response.redirect("/urls");
});
////////////////////POST FUNCTIONS END/////////////////////////////


///////////////////GET FUNCTIONS///////////////////////////////////
app.get("/u/:shortURL", function(request, response) {

  let longURL = urlDataBase[request.params.shortURL];
  //console.log(longURL);
  response.redirect(longURL);
});

app.get("/urls", function(request, response) {
  let templateVars = { urls: urlDataBase,
                       username: request.cookies["username"] };
  console.log(templateVars);
  response.render("urls_index", templateVars);
});

app.get("/urls/:id", function(request, response) {

  let templateVars = { shortURL: request.params.id,
                        URL: urlDataBase[request.params.id],
                        username:request.cookies["username"]};
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