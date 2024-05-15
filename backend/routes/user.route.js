const express = require('express');
const app = express();
const userRoute = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

let Chat = require('../models/Chat');
let User = require('../models/User');
let Entrepreneur = require('../models/Entrepreneur');
let Investor = require('../models/Investor');
const UserToken = require('../models/UserToken');




app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    next();
})


// Get user
userRoute.route('/read/:id').get(async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        res.json(user);
    } catch (error) {
        next(error);
    }
});

// request
userRoute.put('/request/:senderId/:receiverId', async (req, res, next) => {
    try {
        const { senderId, receiverId } = req.params;

        const sender = await User.findById(senderId);
        const receiver = await User.findById(receiverId);
        const indexReceived = sender.request_received.indexOf(receiverId);


        if (!sender || !receiver) {
            return res.status(404).json({ error: 'Sender or receiver not found' });
        }
        if (indexReceived == -1) {
            receiver.request_received.push(senderId);
            sender.request_sent.push(receiverId);

            await receiver.save();
            await sender.save();
        } else {
            receiver.matchmakings_list.push(senderId);
            sender.matchmakings_list.push(receiverId);

            const indexSender = sender.request_received.indexOf(receiverId);
            const indexReceiver = receiver.request_sent.indexOf(senderId);
            if (indexSender !== -1) {
                sender.request_received.splice(indexSender, 1);
            }
            if (indexReceiver !== -1) {
                receiver.request_sent.splice(indexReceiver, 1);
            }

            await receiver.save();
            await sender.save();

        }
        res.status(201).json({
            receiver,
            sender
        });
    } catch (error) {
        next(error);
    }
});

// Accept 
userRoute.put('/matchmaking/:senderId/:receiverId', async (req, res, next) => {

    try {
        const { senderId, receiverId } = req.params;
        const sender = await User.findById(senderId);
        const receiver = await User.findById(receiverId);

        if (!sender || !receiver) {
            return res.status(404).json({ error: 'Sender or receiver not found' });
        }

        receiver.matchmakings_list.push(senderId);
        sender.matchmakings_list.push(receiverId);

        const indexSender = sender.request_sent.indexOf(receiverId);
        const indexReceiver = receiver.request_received.indexOf(senderId);
        if (indexReceiver == -1 || indexSender == -1) {
            return res.status(404).json({ message: 'request not found' });
        } else {
            if (indexSender !== -1) {
                sender.request_sent.splice(indexSender, 1);
            }
            if (indexReceiver !== -1) {
                receiver.request_received.splice(indexReceiver, 1);
            }
        }

        await receiver.save();
        await sender.save();

        res.status(201).json({
            receiver,
            sender
        });
    } catch (error) {
        next(error);
    }
})

// Decline
userRoute.put('/decline/:senderId/:receiverId', async (req, res, next) => {
    const { senderId, receiverId } = req.params;

    const sender = await User.findById(senderId);
    const receiver = await User.findById(receiverId);

    if (!sender || !receiver) {
        return res.status(404).json({ error: 'Sender or receiver not found' });
    }

    const indexSender = sender.request_sent.indexOf(receiverId);
    const indexReceiver = receiver.request_received.indexOf(senderId);
    if (indexReceiver == -1 || indexSender == -1) {
        return res.status(404).json({ message: 'request not found' });
    } else {
        if (indexSender !== -1) {
            sender.request_sent.splice(indexSender, 1);
            await sender.save();
        }
        if (indexReceiver !== -1) {
            receiver.request_received.splice(indexReceiver, 1);
            await receiver.save();
        }
    }
    res.status(201).json({
        receiver,
        sender
    });

})

userRoute.route('/getChats').get(async (req, res, next) => {
    try {
        const messages = await Chat.countDocuments()
        res.json(messages);
    } catch (error) {
        next(error);
    }
});

userRoute.route('/getMatchmakings').get(async (req, res, next) => {
    try {
        const users = await User.find()
        let count = 0;
        users.forEach(user => {
            if(user.matchmakings_list){
                count += user.matchmakings_list.length;
            }
        })
        count = count / 2;
        res.json(count);
    } catch (error) {
        next(error);
    }
});

// reset password *
userRoute.post('/reset-password', async (req, res, next) => {
    try {
        const token = req.body.token;
        const newPassword = req.body.password;

        const data = jwt.verify(token, "secret_string");

        // Find the user by email
        const user = await User.findOne({ email: { $regex: '^' + data.email + '$', $options: 'i' } });

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Encrypt the new password
        const salt = await bcrypt.genSalt(10);
        const encryptedPassword = await bcrypt.hash(newPassword, salt);

        user.password = encryptedPassword;
        const updatedUser = await user.save();

        res.status(200).json({
            message: 'Password reset successfully!',
            result: updatedUser
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Something went wrong while resetting the password!'
        });
    }
});

// forget password
userRoute.post('/send-email', async (req, res) => {
    const email = req.body.email;
    const user = await User.findOne({ email: { $regex: '^' + email + '$', $options: 'i' } });
    const resetUrl = `http://localhost:4200`;
    if (!user) {
        return res.status(404).json({
            message: 'User not found'
        })
    }
    const payload = {
        email: user.email
    }
    const expiryTime = 300;  // 5 min
    const token = jwt.sign(payload, "secret_string", { expiresIn: expiryTime });

    const newToken = UserToken({
        userId: user._id,
        token: token
    })
    const mailTransporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: "ahmedhadjhssan917@gmail.com",
            pass: "fcwy tpnm zekw yuie"
        }
    });
    let mailDetails = {
        from: "ahmedhadjhssan917@gmail.com",
        to: email,
        subject: "Reset Password!",
        html: `
        <html>
        <head>
        <title>Reset Password Request</title>
        </head>
        <body>
        <h1>Reset Password Request</h1>
        <p>Dear ${user.email},</p>
        <p>We have received a request to reset your password for your account with (Project name). To complete the password reset process, please click on the button below:</p>
        <a href=${resetUrl}/reset/${token}><button style="background-color: #4CAF50; color: white; padding: 14px 20px; border: none; cursor: pointer; border-radius: 4px;">Reset Password</button></a>
        <p>Please note that this link is only valid for a 5 mins. If you did not request a password reset, please disregard this message.</p>
        <p> Thank you,</p>
        </body>
        </html>`,
    };
    mailTransporter.sendMail(mailDetails, async (err, data) => {
        if (err) {
            console.log(err);
            return next(
                res.status(404).json({
                    message: 'User not found'
                }))
        } else {
            await newToken.save()
                .then(result => {
                    res.status(201).json({
                        message: 'Email send successfully!',
                        result: result

                    })
                })

        }
    })
});

// sign-up user
userRoute.post('/sign-up', (req, res) => {

    bcrypt.hash(req.body.password, 10)
        .then(hash => {
            const userModel = new User({
                email: req.body.email,
                password: hash,
                role: req.body.role
            })
            userModel.save()
                .catch(err => {
                    res.status(500).json({
                        message: 'USER ALREADY EXIST !',
                        error: err
                    })
                })
                .then(result => {
                    if (result) {
                        if (req.body.role === "entrepreneur") {
                            const entrepreneurModel = new Entrepreneur({
                                _id: userModel._id
                            })
                            entrepreneurModel.save()
                                .then(result => {
                                    res.status(201).json({
                                        message: 'Entrepreneur created',
                                        result: result
                                    })
                                })
                                .catch(err => {
                                    res.status(500).json({
                                        error: err
                                    })
                                })
                        } else if (req.body.role === "investor") {
                            const investorModel = new Investor({
                                _id: userModel._id
                            })
                            investorModel.save()
                                .then(result => {
                                    res.status(201).json({
                                        message: 'Investor created',
                                        result: result
                                    })
                                })
                                .catch(err => {
                                    res.status(500).json({
                                        error: err
                                    })
                                })
                        }
                    }
                })
        })

});

// login user
userRoute.post('/login', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });

        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        const passwordMatch = await bcrypt.compare(req.body.password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ message: 'Password is incorrect' });
        }

        const token = jwt.sign({ email: user.email, userId: user._id }, 'secret_string', { expiresIn: '8h' });

        return res.status(200).json({
            token: token,
            expiresIn: 3600 * 8,
            userId: user._id,
            role: user.role
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});


module.exports = userRoute;