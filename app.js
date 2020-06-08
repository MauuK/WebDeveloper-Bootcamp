var express = require("express");
var app = express();
var mongoose = require("mongoose");
var flash = require("connect-flash");
var passport = require("passport");
var LocalStrategy = require("passport-local");
var passportLocalMongoose = require("passport-local-mongoose");
var User = require("./models/user")
var bodyParser = require("body-parser");
methodOverride = require('method-override');
//mongoose.connect("mongodb://3100/info_app");

app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs'); 
app.use(express.static("public"));
app.use(methodOverride('_method'));
app.use(flash());

const URI = "mongodb+srv://samruddhi123:sammy123@cluster0-pf6ye.mongodb.net/test?retryWrites=true&w=majority";

const connDB = async() => {
    await mongoose.connect(URI, {useNewUrlParser: true});
    console.log("Connected to db!")
} 

connDB();
app.use(require("express-session")({
    secret: "Rusty is the best and cutest dog in the world",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


 var infoSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    author: {
        id: {
           type: mongoose.Schema.Types.ObjectId,
           ref: "User"
        },
        username: String
     }
});

var Info = mongoose.model("Info",infoSchema);

app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
   res.locals.success = req.flash("success");
    next();
 });

app.get("/", function (req, res) {

    res.render("demo.ejs");
     
 });

 
 app.get("/locations", function(req,res)
 {
    Info.find({}, function(err,information)
    {
        console.log("get data");
        console.log(information);
        if (err)
        {
            console.log("wrong");
        }
        else{
            res.render("show",{info:information});
        }
    })
    
 });

 app.get("/locations/new",isLoggedIn, function(req,res)
 {
    res.render("newform");
 });

 app.post("/locations",isLoggedIn, function(req,res)
 {
    // get data from form and add to campgrounds array
    var name = req.body.info.title;
    var image = req.body.info.image;
    var desc = req.body.info.body;
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    var newInfo = {title: name, image: image, body: desc, author:author}
    // Create a new campground and save to DB
    Info.create(newInfo, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            //redirect back to campgrounds page
            console.log(newlyCreated);
            res.redirect("/locations");
        }
    });
 });

 app.get("/locations/:id", function(req,res)
 {
     Info.findById(req.params.id, function(err,infobyid)
     {
      if(err)
      {
          console.log("something went wrong");
      }   
      else
      {
          res.render("showbyid",{info:infobyid});
      }
     })

 });
 app.get("/locations/:id/edit", checkCampgroundOwnership,function(req, res){
    Info.findById(req.params.id, function(err, info){
        if(err){
            console.log(err);
            res.redirect("/")
        } else {
            res.render("edit", {info: info});
        }
    });
 });

 app.put("/locations/:id", checkCampgroundOwnership, function(req, res){
    Info.findByIdAndUpdate(req.params.id, req.body.info, function(err, infoupdated){
        if(err){
            console.log(""+err);
        } else {
          var showUrl = "/locations/" + infoupdated._id;
          res.redirect(showUrl);
        }
    });
 });

 app.delete("/locations/:id", checkCampgroundOwnership,function(req,res)
 {
    Info.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/locations");
        } else {
            res.redirect("/locations");
        }
     });
  });

 app.get("/register", function(req, res){
    res.render("register"); 
 });

 //handling user sign up
 app.post("/register", function(req, res){
     User.register(new User({username: req.body.username}), req.body.password, function(err, user){
         if(err){
             console.log(err);
             return res.render('register');
         }
         passport.authenticate("local")(req, res, function(){
           req.flash("success", "Signed you in!");
           res.redirect("/locations");
         });
     });
 });

 //show login form
app.get("/login", function(req, res){
    res.render("login"); 
 });
 
 //handling login logic
 app.post("/login", passport.authenticate("local", 
     {
         successRedirect: "/",
         failureRedirect: "/login"
     }), function(req, res){
 });
 
 // logout route
 app.get("/logout", function(req, res){
    req.logout();
    req.flash("success", "Logged you out!");
    res.redirect("/locations");
 });

 function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "You need to be logged in to do that");
    res.redirect("/login");
}

function checkCampgroundOwnership(req, res, next) {
    if(req.isAuthenticated()){
           Info.findById(req.params.id, function(err, foundInfo){
              if(err){
                req.flash("error", "Campground not found");
                res.redirect("back");
              }  else {
                  // does user own the post?
               if(foundInfo.author.id.equals(req.user._id)) {
                   next();
               } else {
                   req.flash("error", "You don't have permission to do that");
                   res.redirect("back");
                   console.log(" founduserid" + foundInfo.author.username);
                   console.log(" requserid" + req.user._id);
               }
              }
           });
       } else {
           req.flash("error", "You need to be logged in to do that");
           res.redirect("/login");
       }
   }


const host = '0.0.0.0';
const port = process.env.PORT || 3100;
app.listen(port, function () {
    console.log("helooo:" + port);
});


