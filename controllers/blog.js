
const Blog = require('../models/blog');
const Category = require('../models/category');
const Tag = require('../models/tag');
const User = require('../models/user');
const formidable = require('formidable');
const stripHtml = require('string-strip-html');
const { errorHandler } = require('../helpers/dbErrorHandler');
const slugify = require('slugify');
const _ = require('lodash');
const fs = require('fs');
const { smartTrim } = require('../helpers/blog');


exports.create = async (req, res) => {
    try {
        let form = new formidable.IncomingForm();
        form.keepExtensions = true;
        form.parse(req, async (err, fields, files) => {

            if (err) {
                return res.status(400).json({
                    error: '이미지를 업로드 할 수 없습니다.'
                });
            }

            const { title, body, categories, tags } = fields;

            if (!title || !title.length) {
                return res.status(400).json({
                    error: '제목이 필요합니다'
                });
            }

            if (!body || body.length < 200) {
                console.log('22222222222222222222')
                return res.status(400).json({
                    error: '콘텐츠가 너무 짧습니다.'
                });
            }

            if (!categories || categories.length === 0) {
                return res.status(400).json({
                    error: '하나 이상의 카테고리가 필요합니다.'
                });
            }

            if (!tags || tags.length === 0) {
                return res.status(400).json({
                    error: '하나 이상의 태그가 필요합니다.'
                });
            }

            let blog = await new Blog();
            blog.title = title;
            blog.body = body;
            blog.excerpt = smartTrim(body, 320, ' ', ' ...');
            blog.slug = slugify(title).toLowerCase();
            blog.mtitle = `${title} | ${process.env.APP_NAME}`;
            console.log("body.substring(0, 160):  ", stripHtml(body.substring(0, 160)).result)
            blog.mdesc = stripHtml(body.substring(0, 160)).result;

            blog.postedBy = req.user._id;
            let arrayOfCategories = categories && categories.split(',');
            let arrayOfTags = tags && tags.split(',');

            if (files.photo) {
                if (files.photo.size > 10000000) {
                    return res.status(400).json({
                        error: 'Image should be less then 1mb in size'
                    });
                }
                blog.photo.data = fs.readFileSync(files.photo.path);
                blog.photo.contentType = files.photo.type;
            }

            const blogFind = await blog.save();
            console.log('blogFind: ', blogFind)
            await Blog.findByIdAndUpdate(blogFind._id, { $push: { categories: arrayOfCategories } }, { new: true });
            const lastBlog = await Blog.findByIdAndUpdate(blogFind._id, { $push: { tags: arrayOfTags } }, { new: true });
            res.status(200).json({ blog: lastBlog })
        })
    } catch (err) {
        console.error(error);
        return res.status(400).json({
            error: errorHandler(err)
        });
    }
}

exports.list = async (req, res) => {
    try {
        const blogs = await Blog.find({})
            .populate('categories', '_id name slug')
            .populate('tags', '_id name slug')
            .populate('postedBy', '_id name username')
            .select('_id title slug excerpt categories tags postedBy createdAt updatedAt')
        res.status(200).json({ blogs: blogs })
    } catch (err) {
        console.error(error);
        return res.status(400).json({
            error: errorHandler(err)
        });
    }
};

exports.listAllBlogsCategoriesTags = async (req, res) => {
    try {
        let limit = req.body.limit ? parseInt(req.body.limit) : 10;
        let skip = req.body.skip ? parseInt(req.body.skip) : 0;
        console.log(req.body)
        const blogs = await Blog.find({})
            .populate('categories', '_id name slug')
            .populate('tags', '_id name slug')
            .populate('postedBy', '_id name username profile')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .select('_id title slug excerpt categories tags postedBy createdAt updatedAt')

        const categories = await Category.find({});

        const tags = await Tag.find({});
        res.json({ blogs, categories, tags, size: blogs.length });
    } catch (err) {
        console.error(error);
        return res.status(400).json({
            error: errorHandler(err)
        });
    }

}


exports.read = async (req, res) => {
    try {
        const slug = req.params.slug.toLowerCase();
        const blog = await Blog.findOne({ slug })
            .populate('categories', '_id name slug')
            .populate('tags', '_id name slug')
            .populate('postedBy', '_id name username')
            .select('_id title slug excerpt body categories tags postedBy createdAt updatedAt')
        if (!blog)
            return res.status(400).json({ error: '블로그가없습니다' })
        res.status(200).json({ blog: blog })
    } catch (err) {
        console.error(error);
        return res.status(400).json({
            error: errorHandler(err)
        });
    }
};

exports.remove = async (req, res) => {
    try {
        const slug = req.params.slug.toLowerCase();
        const blog = await Blog.findOneAndRemove({ slug })
        res.status(200).json({ _id: blog._id })
    } catch (err) {
        console.error(error);
        return res.status(400).json({
            error: errorHandler(err)
        });
    }
};


exports.update = async (req, res) => {
    try {
        const slug = req.params.slug.toLowerCase();

        const blog = await Blog.findOne({ slug })
        if (!blog)
            return res.status(400).json({
                error: '블로그가 없습니다.'
            });

        let form = new formidable.IncomingForm();
        form.keepExtensions = true;

        form.parse(req, async (err, fields, files) => {
            if (err)
                return res.status(400).json({
                    error: '이미지를 업로드 할 수 없습니다.'
                });

            let slugBeforeMerge = blog.slug;
            blog = _.merge(blog, fields);
            blog.slug = slugBeforeMerge;

            const { body, desc, categories, tags } = fields;

            if (body) {
                blog.excerpt = smartTrim(body, 320, ' ', ' ...');
                blog.desc = stripHtml(body.substring(0, 160));
            }

            if (categories) {
                blog.categories = categories.split(',');
            }

            if (tags) {
                blog.tags = tags.split(',');
            }

            if (files.photo) {
                if (files.photo.size > 10000000) {
                    return res.status(400).json({
                        error: 'Image should be less then 1mb in size'
                    });
                }
                blog.photo.data = fs.readFileSync(files.photo.path);
                blog.photo.contentType = files.photo.type;
            }

            const blogLast = await blog.save();
            res.status(200).json({ blog: blogLast })
        })
    } catch (err) {
        console.error(error);
        return res.status(400).json({
            error: errorHandler(err)
        });
    }
}

exports.photo = async (req, res) => {
    try {
        const slug = req.params.slug.toLowerCase();
        const blog = await Blog.findOne({ slug }).select('photo')

        res.set('Content-Type', blog.photo.contentType);
        return res.send(blog.photo.data);

    } catch (err) {
        console.error(error);
        return res.status(400).json({
            error: errorHandler(err)
        });
    }
};

exports.listRelated = async (req, res) => {
    try {
        let limit = req.body.limit ? parseInt(req.body.limit) : 3;
        const { _id, categories } = req.body.blog;

        const blogs = await Blog.find({ _id: { $ne: _id }, categories: { $in: categories } })
            .limit(limit)
            .populate('postedBy', '_id name username profile')
            .select('title slug excerpt postedBy createdAt updatedAt')
        res.json({ relatedBlogs: blogs });

    } catch (err) {
        console.error(err);
        return res.status(400).json({
            error: errorHandler(err)
        });
    }
};

exports.listSearch = async (req, res) => {
    try {

        const { search } = req.query;
        if (search) {
            const blogs = await Blog.find({
                $or: [{ title: { $regex: search, $options: 'i' } }, { body: { $regex: search, $options: 'i' } }]
            });
            return res.status(200).json({ blogs })
        } else {
            const blogs = await Blog.find({});
            return res.status(200).json({ blogs })
        }
    } catch (err) {
        console.error(err);
        return res.status(400).json({
            error: errorHandler(err)
        });
    }
}

exports.listByUser = async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username });
        if (!user)
            return res.status(400).json({
                error: "유저가 없습니다."
            })

        const blogs = await Blog({ postedBy: user._id })
            .populate('categories', '_id name slug')
            .populate('tags', '_id name slug')
            .populate('postedBy', '_id name username')
            .select('_id title slug postedBy createdAt updatedAt')
        res.json({ blogs })
    } catch (err) {
        console.error(err);
        return res.status(400).json({
            error: errorHandler(err)
        });
    }
}