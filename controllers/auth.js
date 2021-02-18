const User = require('../models/user')
const Blog = require('../models/blog')
const shortId = require('shortid')
const jwt = require('jsonwebtoken');
const passport = require('passport');
const expressJwt = require('express-jwt');
const sgMail = require('@sendgrid/mail'); // SENDGRID_API_KE
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.preSignup = (req, res) => {
    try {

        const { name, email, password } = req.body;
        const user = User.findOne({ email: email.toLowerCase() });
        if (user) {
            return res.status(400).json({
                error: '있는 이메일입니다.'
            });
        }
        const token = jwt.sign({ name, email, password }, process.env.JWT_ACCOUNT_ACTIVATION, { expiresIn: '10m' });

        const emailData = {
            from: process.env.EMAIL_FROM,
            to: email,
            subject: `Account activation link`,
            html: `
            <p>Please use the following link to activate your acccount:</p>
            <p>${process.env.CLIENT_URL}/auth/account/activate/${token}</p>
            <hr />
            <p>This email may contain sensetive information</p>
            <p>https://seoblog.com</p>
        `
        };

        sgMail.send(emailData).then(sent => {
            return res.json({
                message: `Email has been sent to ${email}. Follow the instructions to activate your account.`
            });
        });
    } catch (error) {
        console.error(error);
        next(error);
    }
}

exports.signup = async (req, res) => {
    try {


        const { name, email, password, role } = req.body;
        const user = await User.findOne({ email });


        if (user)
            return res.status(400).json({ error: '이메일이 있습니다.' });

        const username = shortId.generate();
        const profile = `${process.env.CLIENT_URL}/profile/${username}`;

        await User.create({ name, email, password, profile, username, role });
        return res.json({
            message: 'Singup success! Please signin'
        });
    } catch (error) {
        console.error(error);
        next(error);
    }
}

exports.signin = async (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            console.error(err);
            return next(err);
        }
        if (info) {
            return res.status(401).json({ error: info.reason });
        }
        // const { email, password } = req.body;
        // console.log(email)
        // const user = await User.findOne({ email })

        // if (!user)
        //     return res.status(400).json({
        //         error: 'User with that email does not exist. Plase signup'
        //     })

        // if (!user.authenticate(password))
        //     return res.status(400).json({
        //         error: 'Email and password do not match.'
        //     });

        return req.login(user, async (loginErr) => {
            if (loginErr) {
                console.error(loginErr);
                return next(loginErr);
            }

            const fullUserWithoutPassword = await User.findOne({
                _id: user._id
            }).select('-salt -hashed_password');;

            return res.status(200).json({ user: fullUserWithoutPassword })
        });
        // const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

        // res.cookie('token', token, { expiresIn: '1d' });
        // const { _id, username, name, role } = user;
        // return res.json({
        //     token,
        //     user: { _id, username, name, email, role }
        // })
    })(req, res, next);

}



exports.signout = (req, res) => {
    req.logout();
    req.session.destroy();
    res.json({
        message: 'Signout success'
    })
}

exports.requireSignin = expressJwt({
    secret: process.env.JWT_SECRET,
    algorithms: ["HS256"], // added later
    userProperty: "user",
});



exports.adminMiddleware = async (req, res, next) => {
    const adminUserId = req.user._id;

    const adminUser = await User.findOne({ _id: adminUserId });

    if (!adminUser) {
        console.log('1111111111111111111')
        return res.status(400).json({
            error: "유저를 찾을수 없습니다."
        });
    }

    if (adminUser.role !== 1) {
        console.log('222222222222222222222')
        return res.status(400).json({
            error: 'Admin 유저가 아닙니다.'
        });
    }
    next();
}

exports.canUpdateDeleteBlog = async (req, res, next) => {
    try {
        const slug = req.params.slug.toLowerCase();
        const blog = await Blog.findOne({ slug });
        if (!blog)
            return res.status(400).json({
                error: '블로그가 없습니다.'
            });
        let authorizedUser = data.postedBy._id.toString() === req.user._id.toString();
        if (!authorizedUser) {
            return res.status(400).json({
                error: '권한이없습니다.'
            });
        }
        next();

    } catch (error) {
        console.error(error);
        next(error);
    }
}

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                error: '유저가 없습니다..'
            });
        }

        const token = jwt.sign({ _id: user._id }, process.env.JWT_RESET_PASSWORD, { expiresIn: '10m' });

        const emailData = {
            from: process.env.EMAIL_FROM,
            to: email,
            subject: `Password reset link`,
            html: `
            <p>Please use the following link to reset your password:</p>
            <p>${process.env.CLIENT_URL}/auth/password/reset/${token}</p>
            <hr />
            <p>This email may contain sensetive information</p>
            <p>https://seoblog.com</p>
        `
        }

        const userUpdate = await user.updateOne({ resetPasswordLink: token });
        if (userUpdate)
            sgMail.send(emailData).then(sent => {
                return res.json({
                    message: `Email has been sent to ${email}. Follow the instructions to reset your password. Link expires in 10min.`
                });
            });
    } catch (error) {
        console.error(error);
        next(error);
    }
}

exports.resetPassword = async (req, res) => {
    try {
        const { resetPasswordLink, newPassword } = req.body;
        if (resetPasswordLink) {
            jwt.verify(resetPasswordLink, process.env.JWT_RESET_PASSWORD, async (err, decoded) => {
                if (err) {
                    return res.status(401).json({
                        error: '만료 된 링크입니다. 다시 시도하십시오'
                    });
                }

                const user = await User.findOne({ resetPasswordLink });
                if (!user)
                    return res.status(401).json({
                        error: '문제가 발생했습니다. 나중에 시도'
                    });

                const updatedFields = {
                    password: newPassword,
                    resetPasswordLink: ''
                };
                user = _.extend(user, updatedFields);
                await user.save()
                res.json({
                    message: `좋아! 이제 새 비밀번호로 로그인 할 수 있습니다.`
                });
            })

        } else {
            return res.status(401).json({
                error: '만료 된 링크입니다. 다시 시도하십시오'
            });
        }
    } catch (error) {
        console.error(error);
        next(error);
    }
}