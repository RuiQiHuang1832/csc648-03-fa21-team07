const express = require("express");
const mysql = require("mysql");
const path = require("path");
const port = 3001;
const app = express();
require("dotenv").config();
const url = require("url");
const bcrypt = require('bcrypt');
const multer = require('multer');
const redis = require('redis')
const session = require('express-session');


let RedisStore = require('connect-redis')(session)
let redisClient = redis.createClient() //Create Default Client

app.set('trust proxy',1); 

app.use(express.static('public')); //Serving express files 
app.use(express.json()); 
app.use(session({
    store: new RedisStore({client: redisClient}),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false, 
    cookie: {
        secure: false,
        httpOnly: false,
        maxAge: parseInt(process.env.SESSION_MAXAGE)
    }
}))


//Deciding where to store the files uploaded to tutor Application 
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join(__dirname,'/public'))
    },
    filename: function (req, file, cb) {
      if(file.fieldname == 'photo'){
        cb(null, req.body.email.split('@')[0] + '.jpg');
      }
      else if(file.fieldname == 'resume'){
        cb(null, req.body.email.split('@')[0] + '.pdf');
      }
      
    }
  })
  
  const upload = multer({ storage: storage, 
                            onFileUploadStart: function(file) {
                                console.log(file.originalname + ' is starting...'); //This doesn't really work -- don't really need it 
                            } })







//Creating a Connection
var connection = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  port: process.env.DATABASE_PORT,
  database: "sfsuAppDB",
});

//Connecting to the Database
connection.connect(function (error) {
  if (error) {
    throw error;
  }
  console.log("MySql is Connected");
});

//creating a get route for the Search Query -- Needs fixing -- Mention number of rows found i.e. total found! 
app.get("/onSubmit", function (req, res) {
  const queryObject = url.parse(req.url, true).query; //Getting Parameters
  console.log(queryObject); //Console Logging the Parameters

  const category = queryObject.param1;
  console.log(category);
  const search = queryObject.param2;
  console.log(search);
  var sql;

  if (search.length == 0) {
    sql = `SELECT * FROM tutor INNER JOIN courses ON tutor.tutorID=courses.tutor`;
  } else if (category == 1) {
    sql = `SELECT * FROM tutor WHERE firstName LIKE "${search}%" OR lastName LIKE "${search}%" OR courseTeaching LIKE "${search}%"`;
  } else if (category == 2) {
    sql = `SELECT * FROM courses WHERE courseName LIKE "${search}%"`;
  } else {
    sql = `SELECT tutor.tutorID, tutor.email, tutor.firstName, tutor.lastName, tutor.courseTeaching, tutor.imageReference, courses.courseID, courses.courseDescription 
        FROM tutor INNER JOIN courses ON tutor.tutorID=courses.tutor
        WHERE firstName LIKE '${search}%' OR lastName LIKE '${search}%' OR courseTeaching LIKE '${search}%' OR courseDescription LIKE '${search}%';  `;
  }

  connection.query(sql, (error, results, fields) => {
    if (error) throw error;
    console.log(results);
    res.json(results);
  });
});

//get request to see if user is a tutor -- Is not working yet...IN progress
app.get('/isTutor', (req,res) => {
  const queryObj = url.parse(req.url, true).query;
  console.log(queryObj.email);
  const usrEmail = queryObj.email; 
  console.log(usrEmail); 
  //console.log("Session Username: ", req.session.username);
  //console.log("Session isAuth: ", req.session.isAuth); 
  if(req.session.isAuth) {
      const sql = `SELECT tutorFlag FROM user WHERE email='${usrEmail}'`;
      connection.query(sql, (error, results, fields) => {
          if(error) console.log("Error in isTutor: ", error);
          else { 
            if(results.length < 1) {
              res.json({
                status: 'User Not Applied To Be Tutor'
              })
            } else {
              if(results[0].tutorFlag == 1) {
                res.json({
                  isTutor: 1
                })
              } else {
                res.json({
                  isTutor: 0
                })
              }
            }
          }
      })
  } else {
    res.json({
      status: 'User Not Logged In'
    })
  }
});  

app.get('/testSession', (req,res) => {
  console.log("/testSession Username: ", req.session.username);
  console.log("/testSession isAuth: ", req.session.isAuth); 
})

//Creating a post route for the login verification -- Post is used to ensure security so that the login data is secure 
//Post request handler for register form
app.post('/register', (req, res) => {
  //console.log("Got body: ", req.body); 
  //console.log("Session ID: ", req.session.id); 
  const data = req.body; 
  var sql; 
  var counts; 
  const saltRounds = 10; //Number of times to implement hash on password 

  sql = `SELECT COUNT(*) AS counts FROM user WHERE email='${data.email}'`;
  connection.query(sql, async (error, results, fields) => {
      if(error) console.log("Error in SELECT COUNT in /register");
      counts = await results[0].counts; 
      //console.log(counts); Should not console log for security purposes 
      if(counts > 0) {
          res.json({
              status: 'User-Email Already Exists!' //User email is already existsing in the database  
          })
      }
      else {
          bcrypt.hash(data.password, saltRounds, (err, hash) => {
              sql = `INSERT INTO user (firstName, lastName, email, password) VALUES ('${data.firstName}', '${data.lastName}', '${data.email}', '${hash}')`;
              connection.query(sql, (error, results, fields) => {
                  if(error) console.log("Error in Insert into User /register");              
                  //console.log(results); Should not console log for security purposes
              })
          })
          req.session.username = req.body.email; 
          req.session.isAuth = true; //set session authorized
          console.log("session username is: ", req.session.username);
          console.log("Session isAuth is: ", req.session.isAuth); 
          console.log("Session ID is: ", req.session.id); 
          res.json({
              status: 'sucess' //Sends back success once registration has been instered in database. 
          });
      }

  })


})

//Post request handler for login form
app.post('/login', (req,res) => {
  const data = req.body; 
  sql = `SELECT password FROM user WHERE email = '${data.email}'`;
  connection.query(sql, (error, results, fields) => {
      if(error) console.log("Error in Select query /login");
      //console.log(results); In production we shouldnt console log to the terminal for security purposes. 
      
      if(results.length < 1) {
          res.json({
              status: 'User does not exist'
          })
      }
      else {
          bcrypt.compare(data.password, results[0].password, (err,result) => {
              //console.log(result); //Should not console log for security purposes
              if(result == true) {
                  req.session.username = req.body.email; 
                  req.session.isAuth = true; //set session authorized
                  const sql1 = `SELECT tutorFlag FROM user WHERE email='${data.email}'`
                  connection.query(sql1, (error, results1, fields1) => {
                    //console.log(results1); 
                    if(results1[0].tutorFlag == 1) {
                      res.json({
                        status: 'Authenticated!',
                        firstName: results1[0].firstName,
                        lastName: results1[0].lastName,
                        email: data.email,
                        isTutor: true
                      })
                    } else {
                      res.json({
                        firstName: results1[0].firstName,
                        lastName: results1[0].lastName,
                        email: data.email,
                        status: 'Authenticated!',
                        isTutor: false
                      })
                    }
                  }) 
              }
              else {
                  res.json({
                      status: "Passowrd Incorrect!"
                  })
              }
          })
      }
  })

})

//Post request handler for tutor application form 
app.post('/tutorapply', upload.fields([ { name: 'resume' }, { name: 'photo' } ]), (req,res) => {

  console.log("Files (Photo) is: ", req.files['photo']);
  console.log("Files (resume) is: ", req.files['resume']); 
  
  const photoName = req.body.email.split('@')[0] + '.jpg';
  sql = `INSERT INTO tutors (firstName, lastName, email, courseTeaching, major, courseDescription, imageReference, resume) VALUES ('${req.body.firstName}', '${req.body.lastName}', '${req.body.email}', '${req.body.course}', '${req.body.major}', '${req.body.description}', '/public/${photoName}', '${req.files['resume']}')`; 
  connection.query(sql, (error, results, fields) => {
      if(error) console.log("Error in Insert Query --/tutorapply route");
      console.log(results); 
      res.json({ status: 'OK' }); //The tutor has been inserted into the tutors table. 
  }) 
  //Updating Tutor Flag is done by Admin. 
  //console.log("Fields are: ", req.body);

  //res.send("Received the data"); 
})




//Creating a Listening Port
app.listen(port, () => {
  console.log("Listening on Port 3001");
}); 
