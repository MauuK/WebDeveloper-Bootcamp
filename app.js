var express = require("express");
var app = express();
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
methodOverride = require('method-override');
//mongoose.connect("mongodb://3100/info_app");

app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs'); 
app.use(express.static("public"));
app.use(methodOverride('_method'));

mongoose.connect('mongodb://localhost:27017/alteredinfo_app').then(() => {
console.log("Connected to Database");
}).catch((err) => {
    console.log("Not Connected to Database ERROR! ", err);
});

 var infoSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String
});

var Info = mongoose.model("Info",infoSchema);


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

 app.get("/locations/new", function(req,res)
 {
    res.render("newform");
 });

 app.post("/locations", function(req,res)
 {
     var formData = req.body.info;
     Info.create(formData, function(err, newInfo)
     {
         console.log("post data");
         console.log(newInfo);
         if(err){
             console.log("something went wrong");
         }
         else{
            res.redirect("/locations");
         }

     })
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
 app.get("/locations/:id/edit", function(req, res){
    Info.findById(req.params.id, function(err, info){
        if(err){
            console.log(err);
            res.redirect("/")
        } else {
            res.render("edit", {info: info});
        }
    });
 });

 app.put("/locations/:id", function(req, res){
    Info.findByIdAndUpdate(req.params.id, req.body.info, function(err, infoupdated){
        if(err){
            console.log(err);
        } else {
          var showUrl = "/locations/" + infoupdated._id;
          res.redirect(showUrl);
        }
    });
 });

 app.delete("/locations/:id", function(req,res)
 {
   Info.findById(req.params.id, function(err,infodelete)
   {
       if(err)
       {
           console.log("something went wrong");
       }
       infodelete.remove();
       res.redirect("/locations");
   })
 });

let port = 3100;
app.listen(port, function () {
    console.log("helooo:" + port);
});


