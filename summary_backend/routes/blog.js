
const express = require('express');
const router = express.Router();
const {
    create,
    list,
    listAllBlogsCategoriesTags,
    read,
    remove,
    update,
    photo,
    listRelated,
    listSearch,
    listByUser
} = require('../controllers/blog');

const { adminMiddleware, canUpdateDeleteBlog } = require('../controllers/auth');
const { isLoggedIn } = require('../middlewares/auth');

router.post('/create', isLoggedIn, adminMiddleware, create);
router.get('/list', list);
router.post('/blogs-categories-tags', listAllBlogsCategoriesTags);
router.post('/related', listRelated);
router.get('/search', listSearch);
router.get('/photo/:slug', photo);
router.get('/:username/blogs', isLoggedIn, listByUser)
router.get('/:slug', read);
router.delete('/:slug', isLoggedIn, adminMiddleware, canUpdateDeleteBlog, remove);
router.put('/:slug', isLoggedIn, adminMiddleware, canUpdateDeleteBlog, update);

;




module.exports = router;