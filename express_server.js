function generateRandomString() {
  let randomString = require("randomstring");
  return randomString.generate(6);
}


let express = require("express");
let app = express();
let PORT = 8080;
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

var urlDataBase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

console.log(generateRandomString());

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

app.post("/urls", (req, res) => {
  console.log(req.body);  // debug statement to see POST parameters
  response.send("Ok");         // Respond with 'Ok' (we will replace this)
});


app.get("/urls", function(request, response) {
  let templateVars = { urls: urlDataBase };
  let test = "THIS IS A TEST";
  response.render("urls_index", templateVars);
});

app.get("/urls/:id", function(request, response) {

  let templateVars = { shortURL: request.params.id,
                        URL: urlDataBase[request.params.id]};
  response.render("urls_show", templateVars);
});



app.listen(PORT, function() {
  console.log(`Example app listening on port ${PORT}!`);
});