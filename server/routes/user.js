const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser')
const session = require('express-session')
const path = require('path');
require('dotenv').config({path: path.resolve(__dirname, '..', '.env')  });


const connection = mysql.createPool({
    host: process.env.MYSQL_HOST, 
    user: process.env.MYSQL_USER,
    database: process.env.MYSQL_DB,
    password: process.env.MYSQL_PWD,
    port:3306
})


router.use(cookieParser())
router.use(bodyParser.urlencoded({extended:true}))

const secure_mode = (process.env.PROD_MODE === 'true');
router.use(
    session({
      key: "userID",
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie : {
        sameSite: "lax",
        secure: secure_mode
      }
      
    })
);

router.post("/update-account", async (req, res) => {
    try {
        // New account information from forms
        const u_id = req.body.uID;
        const fName = req.body.firstname;
        const lName = req.body.lastName;
        const pwd = req.body.pwd;
        const currentPwd = req.body.currentPwd;

        // Fetch the current hashed password from the database
        let query = 'SELECT password FROM USERS WHERE user_id = ' + u_id + ';';
        connection.query(query, async function (error, results) {
            if (error) {
                console.log(error);
                res.status(500).send();
                return;
            }

            if (results.length === 0) {
                // No user found with the given ID
                res.status(500).send('User not found');
                return;
            }

            // Compare the current password with the stored password hash
            const isPasswordValid = await pwd_verify(currentPwd, results[0]);

            if (isPasswordValid) {
                // Update user if the current password is valid
                const update = await update_user(u_id, fName, lName, pwd);
                // if update is successful, update session and send response
                if(update){
                    req.session.user.fName=fName;
                    req.session.user.lName=lName;
                    res.status(200).send('Account updated successfully');
                }
            } else {
                // Current password is invalid
                res.status(409).send();
            }
        });
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
});

async function update_user(u_id, fName, lName, pwd) {
    return new Promise((resolve, reject) => {
        var query = "UPDATE USERS SET fName='" + fName + "', lName='" + lName + "'";
        
        if (pwd !== '') {
            // Hash and update the password if a new password is provided
            bcrypt.hash(pwd, 10, (hashErr, hashedPwd) => {
                if (hashErr) {
                    console.log(hashErr);
                    resolve(false); // Return false on hashing error
                } else {
                    query += ", password='" + hashedPwd + "' ";
                    query += "WHERE user_id=" + u_id + ";";
                    
                    connection.query(query, (queryErr, results) => {
                        if (queryErr) {
                            console.log(queryErr);
                            resolve(false); // Return false on query error
                        } else {
                            resolve(true); // Return true on successful update
                        }
                    });
                }
            });
        } 
        else {
            // If no password update is requested, just update name fields
            query += "WHERE user_id=" + u_id + ";";
            
            connection.query(query, (queryErr, results) => {
                if (queryErr) {
                    console.log(queryErr);
                    resolve(false); // Return false on query error
                } else {
                    resolve(true); // Return true on successful update
                }
            });
        }
    });
}

router.get("/login", (req, res) => {
    if (req.session.user) {
        //send login status and session data
        res.send({ loggedIn: true, user: req.session.user });
    } else {
        res.send({ loggedIn: false });
    }
});

router.post('/login', async (req, res) => {
    try {
        let query = "SELECT user_id, email, fName, lName, role_id, password FROM USERS WHERE email = " + "'" + req.body.email + "';"
        connection.query(query, async function (error, results) {
            if (error) throw error;
            // no account found
            if (results.length === 0) {
                res.status(409).send();
            }
            // validate password
            else {
                const isPasswordValid = await pwd_verify(req.body.pwd, results[0]);
                if (isPasswordValid) {
                    // user validated, store session data
                    req.session.user = {
                        user_id: results[0].user_id,
                        fName: results[0].fName,
                        lName: results[0].lName,
                        email: results[0].email,
                        role_id: results[0].role_id,
                        role: results[0].role
                    };
                    res.status(200).send("Success");
                } else {
                    // Password is not valid
                    res.status(409).send();
                }
            }
        });
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
});

async function pwd_verify(pwd, user) {
    return new Promise((resolve, reject) => {
        bcrypt.compare(pwd, user.password, (err, res) => {
            if (err) {
                console.log(err);
                resolve(false);
            }
            if (res) {
                resolve(true);
            } else {
                resolve(false);
            }
        });
    });
}

router.post('/logout', async(req, res) => {
    // destroy session on logout
    req.session.destroy((err) => {
        if (err) {
          res.status(500).send('Error logging out');
        } else {
          // clear client cookie if session is destroyed
          res.clearCookie('userID')
          res.status(200).send("succesfully logged out");
        }
    });
});

router.post('/register', async (req , res) => {
    //console.log(req.body);
    //res.json(req.body);
    try{
        const hashedPwd = await bcrypt.hash(req.body.pwd, 10)
        const user = {email : req.body.email, pwd : hashedPwd}
        let query = "INSERT INTO USERS VALUES(NULL, 'bill', 'k'," + "'" + user.email + "', 1, '" + user.pwd + "');"   
        connection.query(query, function (error, results, fields) {
            if (error) throw error;
            //console.log(results);
          });
    }
    catch{
        res.status(500)
    }
});

module.exports = router