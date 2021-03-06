var express = require("express");
var app = express(); 

var mongojs = require("mongojs");
//var db = mongojs("employeelist", ["employeelist"]);

var db = mongojs("user1:user123@ds135797.mlab.com:35797/contactlist", ["employees"]);
//var db = mongojs("employee", ["employees"]);

var bodyParser = require("body-parser");
var fs = require("fs-extra");

var multer  = require('multer');


var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
});

var upload = multer({ storage: storage }).single('file');


app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json());

app.post('/upload', function (req, res) {
	console.log("Step-1>>", req.file);
  upload(req, res, function (err) {
    if (err) {
      // An error occurred when uploading 
	  //console.log("Error>>", err);
      return;
    }
	//console.log("SUCCESS!!");
 console.log("Step-2>>", req.file);
    // Everything went fine 
	res.json({filename: req.file.filename});
  })
})

//Fetch image and other uploads
app.get("/public/uploads/:filename", function(req, res){
	var filename = req.params.filename;
	//console.log("filename>>" + filename);
	try{
		var img = fs.readFileSync('./public/uploads/' + filename);
	} catch(e){
		//Image does not exist, send Avtaar image
		var img = fs.readFileSync('./public/uploads/avtaar.png');
	}
	res.end(img, 'binary');
});


//Search record by name
app.get("/employeelist/search/:name", function(req, res){
	var name = req.params.name;
	db.employees.find({employee_name:{$regex:name,$options:"$i"}}, function (err, docs){
		console.log(docs);
		res.json(docs);
	});
});

//Fetch employee for listing.
app.get("/employeelist", function(req, res){
	console.log("I received a GET request.");
	db.employees.find(function (err, docs){
		//console.log(docs);
		res.json(docs);
	});
}); 

//POST request for inserting new employee
app.post('/employeelist', function(req, res){
	console.log("Body>>");
	console.log(req.body);
	db.employees.insert(req.body, function (err, docs){
		if(err) {
			//console.log(err.MongoError);
			if (err.name === 'MongoError' && err.code === 11000) {
				// Duplicate username
				//return res.status(500).send({ succes: false, message: 'User already exist!' });
				//console.log("Unique EORROR!!!!!!");
				res.json({ succes: false, error:true, message: 'Email already exists.' });
			}
		}
		console.log(docs);
		res.json(docs);
	});
});

//DELETE request to delete employee record from DB
app.delete('/employeelist/:id', function(req, res){
	var id = req.params.id;
	console.log(id);
	db.employees.remove({_id:mongojs.ObjectId(id)}, function (err, docs){
		//console.log(docs);
		res.json(docs);
	});
});

//GET employee by ID for Edit.
app.get("/employeelist/:id", function(req, res){
	var id = req.params.id;
	console.log("Edit id  @server :" + id);
	db.employees.findOne({_id:mongojs.ObjectId(id)}, function (err, docs){
		//console.log(docs);
		res.json(docs);
	});
}); 

//PUT request for saving updated employee record.
app.put("/employeelist/:id", function(req, res){
	var id = req.params.id;
	console.log("Edit id  @server :" + id);
	db.employees.findAndModify(
	{
		query:{_id:mongojs.ObjectId(id)}, 
		update:{$set:{
			employee_name:req.body.employee_name, 
			employee_email:req.body.employee_email, 
			employee_conteact_no:req.body.employee_conteact_no, 
			employee_dob:req.body.employee_dob,
			employee_img:req.body.employee_img,
			}}, 
		new:true
	}, 
	function (err, docs){
		//console.log(docs);
		res.json(docs);
	}); 
});

app.listen(process.env.PORT || 3000, function(){
  console.log('listening on' + process.env.PORT);
}); 