const express = require('express');
const router = express.Router();
const { signup, signin, signout } = require("../controllers/auth");
const { isNotLoggedIn, isLoggedIn } = require('../middlewares/auth');
const { runValidation } = require('../validators');
const { userSignupValidator, userSigninValidator } = require('../validators/auth');

router.post('/signup', userSignupValidator, runValidation, isNotLoggedIn, signup);
router.post('/signin', userSigninValidator, runValidation, isNotLoggedIn, signin);

router.get('/logout', isLoggedIn, signout)
//test
router.get('/secret', isLoggedIn, (req, res) => {
    res.json({
        user: req.user
    });
});

module.exports = router;
