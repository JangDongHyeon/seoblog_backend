const express = require('express');
const router = express.Router();

// controllers
const { adminMiddleware } = require('../controllers/auth');
const { create, list, read, remove } = require('../controllers/tag');

// validators
const { runValidation } = require('../validators');
const { createTagValidator } = require('../validators/tag');
const { isNotLoggedIn, isLoggedIn } = require('../middlewares/auth');

// only difference is methods not name 'get' | 'post' | 'delete'
router.post('/create', createTagValidator, runValidation, isLoggedIn, create);
router.get('/list', list);
router.get('/:slug', read);
router.delete('/:slug', isLoggedIn, remove);

module.exports = router; 