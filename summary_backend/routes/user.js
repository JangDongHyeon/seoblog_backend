const express = require('express');
const router = express.Router();
const { me, publicProfile, photo, update } = require("../controllers/user");
const { isNotLoggedIn, isLoggedIn } = require('../middlewares/auth');

router.get('/me', isLoggedIn, me);

router.put('/update', isLoggedIn, update);
router.get('/photo/:username', photo);
router.get('/:username', publicProfile);

module.exports = router;
