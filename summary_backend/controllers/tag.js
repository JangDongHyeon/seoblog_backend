const Tag = require('../models/tag');
const Blog = require('../models/blog');
const slugify = require("slugify");
const { errorHandler } = require('../helpers/dbErrorHandler');

exports.create = async (req, res, next) => {
    try {
        const { name } = req.body;
        const slug = slugify(name, { lower: true })

        const findTag = await Tag.findOne({ slug });
        if (findTag)
            return res.status(400).json({
                error: '이름이 같은 태그가 있습니다.'
            });

        const tag = await Tag.create({ name, slug });
        await tag.save();

        res.status(200).json({ tag })
    } catch (error) {
        console.error(error);
        return res.status(400).json({
            error: errorHandler(err)
        });
    }

}

exports.list = async (req, res, next) => {
    try {
        const tags = await Tag.find({});

        res.status(200).json({ tags })
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

        const tag = await Tag.findOne({ slug });

        const blogs = await Blog.find({ tags: tag })
            .populate('categories', '_id name slug')
            .populate('tags', '_id name slug')
            .populate('postedBy', '_id name')
            .select('_id title slug excerpt categories postedBy tags createdAt updatedAt')


        res.status(200).json({ tag, blogs })
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

        const tag = await Tag.findOneAndRemove({ slug });

        res.json({ _id: tag._id });
    } catch (error) {
        console.error(error);
        return res.status(400).json({
            error: errorHandler(err)
        });
    }
}