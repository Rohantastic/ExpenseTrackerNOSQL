const path = require('path');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv').config();
const UserModel = require('../models/User');
const ForgotPasswordModel = require('../models/ForgotPasswordRequests');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const uuid = require('uuid');

function generateAccessToken(id, ispremiumuser, name) {
    return jwt.sign({ userId: id, ispremiumuser, name }, process.env.JWT_TOKEN); // Secret key
}

exports.signUpCredentials = (req, res) => {
    const string = path.join(__dirname, '../', '/views/signup.html');
    console.log('get controller');
    res.sendFile(string);
};

exports.postCredentials = async (req, res) => {
    const { name, email, password } = req.body;

    if (name.length <= 0 || email === undefined || password === undefined) {
        throw new Error("Error in length");
    } else {
        try {
            const existingUser = await UserModel.findOne({ email: email });

            if (existingUser) {
                return res.status(401).json({ error: 'User already exists' });
            } else {
                try {
                    bcrypt.hash(password, 10, async (err, hash) => {
                        const newUser = new UserModel({ name, email, password: hash });
                        const isDataCreated = await newUser.save();
                        if (isDataCreated) {
                            return res.status(201).json({ success: true });
                        } else {
                            throw new Error("User cannot be created");
                        }
                    });
                } catch (err) {
                    return res.status(500).json({ error: "error in signing up" });
                }
            }
        } catch (error) {
            return res.status(500).json({ error: "error in catch of signing up" });
        }
    }
};

// Login the credentials

exports.loginCredentials = (req, res, next) => {
    const string = path.join(__dirname, '../', '/views/login.html');
    res.sendFile(string);
};

// When the user logs in to the login page
exports.userLogIn = async (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    try {
        const user = await UserModel.findOne({ email: email });

        const userEmail = user.email;
        if (userEmail !== email) {
            return res.status(401).json({ error: "user not found" });
        } else {
            bcrypt.compare(password, user.password, (err, result) => {
                if (result) {
                    res.status(200).json({ message: "successfully found the password in bcrypt", token: generateAccessToken(user._id, user.ispremiumuser, user.name) });
                } else {
                    res.status(401).json({ error: "password doesn't match", success: false });
                }
            });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "User Not Found", success: false });
    }
};

// Forgot password page for the user
exports.forgotPassword = (req, res, next) => {
    const string = path.join(__dirname, '../', '/views/forgotPassword.html');
    res.sendFile(string);
};

// Forgot password functionality
exports.forgotPasswordVerification = async (req, res, next) => {
    const email = req.body.email;
    try {
        const user = await UserModel.findOne({ email: email });

        if (user) {
            console.log('>>seeing if I am able to send the response');
            return res.status(200).json({ success: true });
        } else {
            res.status(401).json({ error: "User is unauthorized" });
        }
    } catch (err) {
        console.log(err);
        res.status(500);
    }
};

// Calling the SMTP to send mail to the user for password reset link
exports.resettingPassword = async (req, res, next) => {
    const emailOfUser = req.body.email;
    try {
        const uid = uuid.v4();

        var transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: process.env.NODEMAILER_USER_EMAIL,
                pass: process.env.NODEMAILER_USER_PASSWORD
            }
        });

        try {
            const responseOfForgotPasswordModel = await ForgotPasswordModel.create({ id: uid, active: true });
            if (responseOfForgotPasswordModel) {
                UserModel.findOne({ email: emailOfUser }).then(async (response) => {
                    try {
                        await ForgotPasswordModel.update({ userId: response._id }, { id: uid });
                    } catch (err) {
                        console.log(err);
                    }
                });
            }
        } catch (err) {
            console.log(err);
        }

        var mailOptions = {
            from: 'rohan.expensetracker@gmail.com',
            to: emailOfUser,
            subject: "Password Reset Link of Expense Tracker",
            text: `Your OTP for ${emailOfUser}:`,
            html: `<a href="http://localhost:3000/user/password/resetpasswordform/${uid}">Reset password</a>`
        };

        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.log(err);
            } else {
                console.log("Mail Sent Successfully.");
                return res.status(200).json({ success: true });
            }
        });
    } catch (err) {
        console.log(err);
    }
}

exports.resetPasswordForm = async (req, res, next) => {
    const id = req.params.id;
    try {
        const response = await ForgotPasswordModel.findOne({ id: id }); //checking if user exists or not
        if (response) {
            const updationOfactive = await ForgotPasswordModel.updateOne({ id: id }, { active: false }); //updating the boolean value of active to falseee
            if (updationOfactive) {
                return res.status(200).send(`
          <html>
            <script>
              console.log("Passing the form to updatePassword");
            </script>

            <form action="/user/password/updatepassword/${id}" method="post">
              <label for="newpassword">Enter New password</label>
              <input name="newpassword" type="password" required></input>
              <button>reset password</button>
            </form>
          </html>`);
            }
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Error in resetPasswordForm" });
    }
};



exports.updatePassword = async (req, res, next) => {
    const newpassword = req.body.newpassword;
    const id = req.params.id;
    try {
        const responseOfUpdatePassword = await ForgotPasswordModel.findOne({ id: id });
        console.log('>>>>>responseOfUpdatePassword id: ', responseOfUpdatePassword);
        if (responseOfUpdatePassword) {
            const ResponseOfUserModel = await UserModel.findOne({ _id: responseOfUpdatePassword.userId });
            const saltRounds = 10;
            bcrypt.genSalt(saltRounds, async (err, salt) => {
                if (err) {
                    console.log(err);
                    throw new Error(err);
                } else {
                    bcrypt.hash(newpassword, salt, async (err, hash) => {
                        if (err) {
                            console.log(err);
                        } else {
                            const updatingPassword = await UserModel.updateOne({ _id: responseOfUpdatePassword.userId }, { password: hash });
                            if (updatingPassword) {
                                return res.status(201).json({ message: 'Successfully update the new password' });
                            }
                        }
                    });
                }
            });
        }
    } catch (err) {
        console.log(err);
    }
};




