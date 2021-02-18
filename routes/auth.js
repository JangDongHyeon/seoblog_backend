const express = require('express');
const router = express.Router();
const { signup, signin, signout, forgotPassword, resetPassword } = require("../controllers/auth");
const { isNotLoggedIn, isLoggedIn } = require('../middlewares/auth');
const { runValidation } = require('../validators');
const { userSignupValidator, userSigninValidator, forgotPasswordValidator, resetPasswordValidator } = require('../validators/auth');

//router.post('/pre-signup', userSignupValidator, runValidation, preSignup);
router.post('/signup', userSignupValidator, runValidation, isNotLoggedIn, signup);
router.post('/signin', userSigninValidator, runValidation, isNotLoggedIn, signin);

router.get('/logout', isLoggedIn, signout)
//test
router.get('/secret', isLoggedIn, (req, res) => {
    res.json({
        user: req.user
    });
});
router.put('/forgot-password', forgotPasswordValidator, runValidation, forgotPassword);
router.put('/reset-password', resetPasswordValidator, runValidation, resetPassword);
// google login
// router.post('/google-login', googleLogin);

module.exports = router;
