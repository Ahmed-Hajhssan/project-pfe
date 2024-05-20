const express = require('express');
const app = express();
const userRoute = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

let Chat = require('../models/Chat');
let User = require('../models/User');
let Post = require('../models/Post');
let Entrepreneur = require('../models/Entrepreneur');
let Investor = require('../models/Investor');
const UserToken = require('../models/UserToken');




app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    next();
})


// Add Post
userRoute.route('/addPost/:id').post(async (req, res, next) => {
    try {

        const post = await Post.create(req.body);
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        user.posts.push(post._id);

        await user.save();

        res.json(post);
    } catch (error) {
        next(error);
    }
});

// get all user's Posts
userRoute.route('/getPosts/:id').get(async (req, res, next) => {
    try {

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ error: 'user not found' });
        }

        const posts = await Post.find({ _id: { $in: user.posts } });

        res.json(posts);
    } catch (error) {
        next(error);
    }
});

userRoute.route('/getFriendsPosts/:id').get(async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ error: 'user not found' });
        }

        const friendsId = user.matchmakings_list;

        // Fetch all friends concurrently
        const friends = await Promise.all(friendsId.map(friendId => User.findById(friendId)));

        // Fetch all posts concurrently
        const posts = await Promise.all(friends.flatMap(friend =>
            Post.find({ _id: { $in: friend.posts } })
        ));

        res.json(posts.flat());  // Flatten the array of arrays
    } catch (error) {
        next(error);
    }
});


// Get a single post
userRoute.route('/getPost/:postId').get(async (req, res, next) => {
    try {
        const postId = req.params.postId;

        const post = await Post.findOne({ _id: postId });

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        res.json(post);
    } catch (error) {
        next(error);
    }
});

// Update a post
userRoute.route('/updatePost/:postId').put(async (req, res, next) => {
    try {
        const postId = req.params.postId;
        const updatedData = req.body;

        const post = await Post.findByIdAndUpdate(postId, updatedData, { new: true });

        if (!post) {
            return res.status(404).json({ error: 'post not found' });
        }

        res.json(post);
    } catch (error) {
        next(error);
    }
});

// like
userRoute.route('/like/:postId/:userId').put(async (req, res, next) => {
    try {
        const postId = req.params.postId;
        const userId = req.params.userId;

        const post = await Post.findOne({ _id: postId });

        if (!post) {
            return res.status(404).json({ error: 'post not found' });
        }
        if (post.likes)
            post.likes.push(userId)
        else
            post.likes = [userId];
        post.save();
        res.json(post);
    } catch (error) {
        next(error);
    }
});

// unlike
userRoute.route('/unlike/:postId/:userId').put(async (req, res, next) => {
    try {
        const postId = req.params.postId;
        const userId = req.params.userId;

        const post = await Post.findOne({ _id: postId });

        if (!post) {
            return res.status(404).json({ error: 'post not found' });
        }

        const index = post.likes.indexOf(userId);
        if (index !== -1) {
            post.likes.splice(index, 1);
        }
        post.save()
        res.json(post);
    } catch (error) {
        next(error);
    }
});


// Delete a post
userRoute.route('/deletePost/:id/:postId').delete(async (req, res, next) => {
    try {
        const userId = req.params.id;
        const postId = req.params.postId;

        const user = await User.findByIdAndUpdate(
            userId,
            { $pull: { posts: postId } },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ error: 'user not found' });
        }

        const post = await Post.findByIdAndDelete(postId);
        if (!post) {
            return res.status(404).json({ error: 'post not found' });
        }

        res.json({ message: 'post deleted successfully' });
    } catch (error) {
        next(error);
    }
});

// Get user
userRoute.route('/read/:id').get(async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        res.json(user);
    } catch (error) {
        next(error);
    }
});

// Update user
userRoute.route('/update/:id').put(async (req, res, next) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });

        // Wait for a short delay to ensure the update is completed
        await new Promise(resolve => setTimeout(resolve, 1000));

        const user = await Investor.findById(updatedUser._id);
        res.json(user);
    } catch (error) {
        next(error);
    }
});

// get all statuses
userRoute.route('/getAllStatus').get(async (req, res, next) => {
    try {
        const users = await User.find({ active: "false" });

        if (!users) {
            return res.status(404).json({ error: 'No users found' });
        }
        const userIds = users.map(user => user._id);
        res.json(userIds);
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
            if (user.matchmakings_list) {
                count += user.matchmakings_list.length;
            }
        })
        count = count / 2;
        res.json(count);
    } catch (error) {
        next(error);
    }
});

// count unread messages between two IDs
userRoute.route('/unread/:senderId/:receiverId').get(async (req, res) => {
    const { senderId, receiverId } = req.params;
    try {
        const unreadCount = await Chat.countDocuments({ senderId: senderId, receiverId: receiverId, read: false });
        res.json({ unreadCount });
    } catch (error) {
        console.error("Error counting unread messages:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

userRoute.route('/markAsRead/:senderId/:receiverId').put(async (req, res) => {
    const { senderId, receiverId } = req.params;
    try {
        // Update messages to mark them as read
        const result = await Chat.updateMany({ senderId: senderId, receiverId: receiverId }, { $set: { read: true } });
        res.json({ success: true, message: `All messages between ${senderId} and ${receiverId} marked as read.` });
    } catch (error) {
        console.error("Error marking messages as read:", error);
        res.status(500).json({ success: false, error: "Internal Server Error" });
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
                                _id: userModel._id,
                                email: userModel.email
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
                                _id: userModel._id,
                                email: userModel.email
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
        const user = await User.findOne({ email: req.body.email, active: true });

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