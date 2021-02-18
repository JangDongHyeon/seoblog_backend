const User = require('../models/user')
const Blog = require('../models/blog')
const formidable = require('formidable');
const _ = require('lodash');
const fs = require('fs');
exports.me = async (req, res, next) => {
    try {

        const user = await User.findOne({
            _id: req.user._id
        }).select('-salt -hashed_password');
        if (!user)
            return res.status(400).json({
                error: '유저를 찾을수없습니다'
            });
        res.status(200).json(user);
    } catch (error) {
        console.error(error);
        next(error);
    }
}

exports.publicProfile = async (req, res) => {

    try {
        const { username } = req.params;
        const user = await User.findOne({ username }).select('-salt -hashed_password -photo');
        if (!user)
            return res.status(400).json({
                error: '유저를 찾을수없습니다'
            });
        const blogs = await Blog.find({ postedBy: user._id })
            .populate('categories', '_id name slug')
            .populate('tags', '_id name slug')
            .populate('postedBy', '_id name')
            .limit(10)
            .select('_id title slug excerpt categories tags postedBy createdAt updatedAt')
        res.status(200).json({
            user,
            blogs
        });



    } catch (error) {
        console.error(error);
        next(error);
    }
}

exports.update = async (req, res) => {
    try {
        let form = new formidable.IncomingForm();
        form.keepExtensions = true;
        form.parse(req, async (err, fields, files) => {
            if (err)
                return res.status(400).json({
                    error: '사진을 업데이트 할수없습니다.'
                });
            let user = req.user;
            user = _.extend(user, fields);

            if (fields.password && fields.password.length < 6) {
                return res.status(400).json({
                    error: '비밀번호는 6 자 이상이어야합니다'
                });
            }

            if (files.photo) {
                if (files.photo.size > 10000000) {
                    return res.status(400).json({
                        error: '이미지는 1MB 미만이어야합니다.'
                    });
                }
                user.photo.data = fs.readFileSync(files.photo.path);
                user.photo.contentType = files.photo.type;
            }
            await user.save();
            user.hashed_password = undefined;
            user.salt = undefined;
            user.photo = undefined;
            res.status(200).json({ user });

        })
    } catch (error) {
        console.error(error);
        next(error);
    }
}

exports.photo = async (req, res) => {
    try {
        const { username } = req.params;
        const user = await User.findOne({ username })
        if (user && user.photo.data) {
            res.set('Content-Type', user.photo.contentType);
            return res.send(user.photo.data);
        }
    } catch (error) {
        console.error(error);
        next(error);
    }
}