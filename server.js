
/*********************************************************************************
WEB322 – Assignment 04
I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source (including 3rd party web sites) or distributed to other students.

Name: Gurpreet Singh
Student ID: 166395210
Date: 30June,2023
Cyclic Web App URL:  https://tired-gray-gharial.cyclic.app
GitHub Repository URL:https://github.com/gurpreet-singh0/Assignment04.git

********************************************************************************/ 


const HTTP_PORT = process.env.PORT || 8080;
var express = require("express");
const path = require("path");
const hbs = require('express-handlebars');
const exphbs = require("express-handlebars");

const multer = require("multer");

const cloudinary = require('cloudinary').v2
const streamifier = require('streamifier')
const upload = multer();
const storeService = require("./store-service.js");
var engine = require('consolidate')
var app = express();


const itemData = require("./store-service.js");
//view engine setup
app.set("view engine", "hbs"); //setting view engine as handlebars
// hbs.registerPartials(__dirname + '/views/partials');


app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname,'..', 'views', 'layouts')));

app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded


// app.engine('html', require('ejs').renderFile);
 

function onHttpStart() {
    console.log("Express http server listening on: " + HTTP_PORT);
  }

cloudinary.config({ 
    cloud_name: 'dxo71jo2c', 
    api_key: '547682771978897', 
    api_secret: '5-HCTFuXAR3t8bR6ow_69Dttr6c' ,
    secure: true
  });
  
// setup a 'route' to listen on the default url path
app.use(function(req,res,next){
  let route = req.path.substring(1);
  app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
  app.locals.viewingCategory = req.query.category;
  next();
});

app.engine('.hbs', exphbs.engine({ 
  extname: '.hbs',
  helpers: { 
    navLink:function(url,options){
      return(
    '<li class="nav-item><a' +(url == app.locals.activeRoute ? 'class="nav-link active': 'class="nav-link" ')+
    'href="'+url+'">'+options.fn(this)+"</a></li>"
      )},
    
    equal:function (lvalue, rvalue, options) {
        if (arguments.length < 3)
            throw new Error("Handlebars Helper equal needs 2 parameters");
        if (lvalue != rvalue) {
            return options.inverse(this);
        } else {
            return options.fn(this);
        }
    }
  }
}));

app.get('/', function (req, res) {
  res.render('main');
});

app.get('/about', function (req, res) {
  res.render("about")
});



app.get('/items/add', function (req, res) {
  res.render("addItem")
});

app.post('/items/add', upload.single('featureImage'), (req, res) => {
  if(req.file){
    let streamUpload = (req) => {
        return new Promise((resolve, reject) => {
            let stream = cloudinary.uploader.upload_stream(
                (error, result) => {
                    if (result) {
                        resolve(result);
                    } else {
                        reject(error);
                    }
                }
            );

            streamifier.createReadStream(req.file.buffer).pipe(stream);
        });
    };

    async function upload(req) {
        let result = await streamUpload(req);
        console.log(result);
        return result;
    }

    upload(req).then((uploaded)=>{
        processItem(uploaded.url);
    });
}else{
    processItem("");
}
 
function processItem(imageUrl){
    req.body.featureImage = imageUrl;
    storeService.addItem(req.body).then((item) => {
        // Redirect to the items page
        res.redirect('/items');
    });
} 

});



app.get("/shop", async (req, res) => {
  // Declare an object to store properties for the view
  let viewData = {};

  try {
    // declare empty array to hold "post" objects
    let items = [];

    // if there's a "category" query, filter the returned posts by category
    if (req.query.category) {
      // Obtain the published "posts" by category
      items = await storeService.getPublishedItemsByCategory(req.query.category);
    } else {
      // Obtain the published "items"
      items = await storeService.getPublishedItems();
    }

    // sort the published items by postDate
    items.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));

    // get the latest post from the front of the list (element 0)
    let post = items[0];

    // store the "items" and "post" data in the viewData object (to be passed to the view)
    viewData.items = items;
    viewData.item = item;
  } catch (err) {
    viewData.message = "no results";
  }

  try {
    // Obtain the full list of "categories"
    let categories = await storeService.getCategories();

    // store the "categories" data in the viewData object (to be passed to the view)
    viewData.categories = categories;
  } catch (err) {
    viewData.categoriesMessage = "no results";
  }// render the "shop" view with all of the data (viewData)
  res.render("shop", { data: viewData });
});

app.get('/shop/:id', async (req, res) => {

  // Declare an object to store properties for the view
  let viewData = {};

  try{

      // declare empty array to hold "item" objects
      let items = [];

      // if there's a "category" query, filter the returned posts by category
      if(req.query.category){
          // Obtain the published "posts" by category
          items = await storeService.getPublishedItemsByCategory(req.query.category);
      }else{
          // Obtain the published "posts"
          items = await storeService.getPublishedItems();
      }

      // sort the published items by postDate
      items.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));

      // store the "items" and "item" data in the viewData object (to be passed to the view)
      viewData.items = items;

  }catch(err){
      viewData.message = "no results";
  }

  try{
      // Obtain the item by "id"
      viewData.item = await storeService.getItemById(req.params.id);
  }catch(err){
      viewData.message = "no results"; 
  }

  try{
      // Obtain the full list of "categories"
      let categories = await storeService.getCategories();

      // store the "categories" data in the viewData object (to be passed to the view)
      viewData.categories = categories;
  }catch(err){
      viewData.categoriesMessage = "no results"
  }

  // render the "shop" view with all of the data (viewData)
  res.render("shop", {data: viewData})
});


app.get("/categories", (req, res) => {
  storeService.getCategories()
      .then((categories) => res.render("categories",{categoryData:categories}))
      .catch((err) => {
        console.log(err);
        res.render("categories", {message: "no results"});
      });
  });

  app.get("/items", (req, res) => {
    storeService.getItems()
        .then((items) => res.render("item",{itemData: items}))
        .catch((err) => {
          console.log(err);
          res.render("item", {message: "no results"});

        });
    });
    


app.get("*", (req, res) => {
  res
    .status(404)
    .json({ status: "error", message: "Page Not Found" });
});


app.listen(HTTP_PORT, onHttpStart);

