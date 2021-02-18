const Category = require('../models/category');
const Blog = require('../models/blog');
const slugify = require("slugify");
const { errorHandler } = require('../helpers/dbErrorHandler');

exports.create = async (req, res, next) => {
    try {
        const { name } = req.body;
        const slug = slugify(name, { lower: true })
        console.log(name)
        const findCategory = await Category.findOne({ slug });
        if (findCategory)
            return res.status(400).json({
                error: '이름이 같은 카테고리가 있습니다.'
            });

        const category = await Category.create({ name, slug });
        await category.save();

        res.status(200).json({ category })
    } catch (error) {
        console.error(error);
        return res.status(400).json({
            error: errorHandler(err)
        });
    }

}

exports.list = async (req, res, next) => {
    try {
        const categorys = await Category.find({});

        res.status(200).json({ categorys })
    } catch (error) {
        console.error(error);
        return res.status(400).json({
            error: errorHandler(err)
        });
    }
}

exports.read = async (req, res, next) => {
    try {
        const slug = req.params.slug.toLowerCase();

        const category = await Category.findOne({ slug });

        const blogs = await Blog.find({ categories: category })
            .populate('categories', '_id name slug')
            .populate('tags', '_id name slug')
            .populate('postedBy', '_id name')
            .select('_id title slug excerpt categories postedBy tags createdAt updatedAt')

        res.status(200).json({ category, blogs })
    } catch (error) {
        console.error(error);
        return res.status(400).json({
            error: errorHandler(err)
        });
    }
}

exports.remove = async (req, res, next) => {
    try {
        const slug = req.params.slug.toLowerCase();

        const category = await Category.findOneAndRemove({ slug });

        res.json({ _id: category._id });
    } catch (error) {
        console.error(error);
        return res.status(400).json({
            error: errorHandler(err)
        });
    }
}