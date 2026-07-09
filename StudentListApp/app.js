const express = require('express'); 
const mysql = require('mysql2'); 
const multer = require('multer');
const app = express(); 

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/images'); // Specify the destination folder for uploaded images
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // Use a unique filename for the uploaded image
  }
});
const upload = multer({ storage: storage });

// Create MySQL connection 
const connection = mysql.createConnection({     
    host: 'localhost',     
    user: 'root',     
    password: 'RP738964$',     
    database: 'c237_studentlistapp' 
}); 
 
connection.connect((err) => 
{   if (err) { 
    console.error('Error connecting to MySQL:', err);
return; 
    } 
    console.log('Connected to MySQL database'); 
}); 
 
// Set up view engine 
app.set('view engine', 'ejs'); 
//  enable static files 
app.use(express.static('public')); 
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));
// Define routes
app.get('/', (req, res) => {
    const sql = 'SELECT * FROM student';
  // Fetch data from MySQL
    connection.query( sql , (error, results) => {
        if (error) {
            console.error('Database query error:', error.message);
            return res.send('Error Retrieving students'); 
        }
        // Render HTML page with data
        res.render('index', { student: results });
    });
});

app.get('/student/:id', (req, res) => {
  // Extract the student ID from the request parameters   
    const student_id = req.params.id;
    const sql = 'SELECT * FROM student WHERE student_id = ?';
  // Fetch data from MySQL based on the student ID   
    connection.query( sql , [student_id], (error, results) => {
        if (error) {
            console.error('Database query error:', error.message);       
            return res.send('Error Retrieving student by ID'); 
    }
    // Check if any student with the given ID was found
        if (results.length > 0) {
      // Render HTML page with the student data
            res.render('student', { student: results[0] });
        } else {
      // If no student with the given ID was found
            res.send('Student not found');
        }
    });
});

app.get('/addStudent', (req, res) => {
  res.render('addStudent'); 
});

app.post('/addStudent', upload.single('image'), (req, res) => {
  // Extract student data from the request body   
    const { name, contact, dob } = req.body;  
    let image;
    if (req.file) {
      image = req.file.filename; // Get the filename of the uploaded image
    } else {
      image = null; // No image uploaded
    }
    const sql = 'INSERT INTO student (name, contact, dob, image) VALUES (?, ?, ?, ?)';
  // Insert the new student into the database
    connection.query( sql , [name, contact, dob, image], (error, results) => {     
        if (error) {
      // Handle any error that occurs during the database operation       
            console.error("Error adding student:", error);       
            res.send('Error adding student');
        } else {
      // Send a success response       
        res.redirect('/');
        }
  }); 
});

// Route to edit a student by ID
app.get('/editStudent/:id', (req,res) => {
  const student_id = req.params.id;
  const sql = 'SELECT * FROM student WHERE student_id = ?';
  // Fetch data from MySQL based on the student ID   
  connection.query( sql , [student_id], (error, results) => {     
    if (error) {
      console.error('Database query error:', error.message);       
      return res.send('Error retrieving student by ID'); 
    }
    // Check if any student with the given ID was found     
    if (results.length > 0) {
      // Render HTML page with the student data
      res.render('editStudent', { student: results[0] });
    } else {
      // If no student with the given ID was found, render a 404 page or handle it accordingly       
      res.send('Student not found');
    }
  }); 
});

app.post('/editStudent/:id', upload.single('image'), (req, res) => {
  const student_id = req.params.id;
  // Extract student data from the request body   
  const { name, contact, dob } = req.body;
  let image = req.body.currentImage; // Get the image URL from the form input
  if (req.file) {
    image = req.file.filename; // Get the filename of the uploaded image
  }

  const sql = 'UPDATE student SET name = ? , contact = ?, dob = ?, image = ? WHERE student_id = ?';
  
  // Insert the new student into the database
  connection.query( sql , [name, contact, dob, image, student_id], (error, results) => {     
    if (error) {
      // Handle any error that occurs during the database operation       
      console.error("Error updating student:", error);       
      res.send('Error updating student');
    } else {
      // Send a success response       
      res.redirect('/');
    }
  });
});

app.get('/deleteStudent/:id', (req, res) => {
  const student_id = req.params.id;   
  const sql = 'DELETE FROM student WHERE student_id = ?';   
  connection.query( sql , [student_id], (error, results) => {     
    if (error) {
      // Handle any error that occurs during the database operation       
      console.error("Error deleting student:", error);       
      res.send('Error deleting student');
    } else {
      // Send a success response       
      res.redirect('/');
    }
  }); });


const PORT = process.env.PORT || 3000; 
app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); 
