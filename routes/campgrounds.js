var express = require("express");
var router  = express.Router(); 
var Campground = require("../models/campground");
var middleware = require("../middleware");

//INDEX- show all campgrounds
router.get("/", function(req, res){
    // Get all campgrounds from db
    Campground.find({}, function(err,campgrounds){
       if(err || !campgrounds){
         console.log(err);
         req.flash("error","Sorry, that campground does not exit");
       }else{
         //campgrounds.ejs is a file
         res.render("campgrounds/index", {campgrounds : campgrounds, currentUser : req.user});
       }
    })
});

//CREATE -add new campground to DB
router.post("/", middleware.isLoggedIn, function(req,res){
   var name = req.body.name;
   var price = req.body.price;
   var image = req.body.image;
   var description = req.body.description;
   var author = {
   	   id : req.user._id,
   	   username : req.user.username
   }
   var newCampground = {
   	name : name,
    price : price,
   	image : image,
    description : description,
    author : author
   }
   //create a new campground and save to db
   Campground.create(newCampground, function(err, newlyCreated){
      if(err){
         console.log(err);
      }else{
        res.redirect("/campgrounds");
      }
   });
});
//NEW -show form to create new campground
router.get("/new", middleware.isLoggedIn, function(req,res){
   res.render("campgrounds/new");
});

//SHOW - shows more info about one campground
router.get("/:id",function(req,res){
   // find the campground with provided ID
   Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
      if(err){
        console.log(err);
      }else{
        console.log(foundCampground);
        // render show template with that campground
        res.render("campgrounds/show", {campground: foundCampground});
      }
   });
});

//Edit Campground Route
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req,res){
	Campground.findById(req.params.id, function(err, foundCampground){
      if(err){
	     res.redirect("/campgrounds")
      }else{
         res.render("campgrounds/edit", {campground: foundCampground});
        }
	  });
});
//Update campground route
router.put("/:id", middleware.checkCampgroundOwnership,function(req,res){
	//find and update the correct campground
	Campground.findByIdAndUpdate(req.params.id, req.body.campground,function(err,updatedCampground){
		if(err){
			res.redirect("/campgrounds");
		}else{
			res.redirect("/campgrounds/" + req.params.id);
		}
	})
})

//Destroy campground route
router.delete("/:id",middleware.checkCampgroundOwnership,async(req, res) => {
  try {
    let foundCampground = await Campground.findById(req.params.id);
    await foundCampground.remove();
    res.redirect("/campgrounds");
  } catch (error) {
    console.log(error.message);
    res.redirect("/campgrounds");
  }
});





module.exports = router;
