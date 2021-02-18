const express = require('express');
const router = express.Router();
const { add } = require('../controllers/summary');



router.post('/add', add);


module.exports = router;