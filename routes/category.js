const express = require('express');
const router = express.Router();
const { create, list, read, remove } = require('../controllers/category');

// validators
const { runValidation } = require('../validators');
const { categoryCreateValidator } = require('../validators/category');
const { adminMiddleware } = require('../controllers/auth');
const { isNotLoggedIn, isLoggedIn } = require('../middlewares/auth');
// isLoggedIn, adminMiddleware
router.post('/create', categoryCreateValidator, runValidation, isLoggedIn, adminMiddleware, create);
router.get('/list', list);
router.get('/:slug', read);
router.delete('/:slug', isLoggedIn, adminMiddleware, remove);

module.exports = router;