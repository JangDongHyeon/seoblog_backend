const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const passport = require('passport');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const passportConfig = require('./passport');
//bring routes
const blogRoutes = require('./routes/blog');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const categoryRoutes = require('./routes/category');
const tagRoutes = require('./routes/tag');
const summaryRoutes = require('./routes/summary');
// app
const app = express();

// db
mongoose
    .connect(process.env.DATABASE_LOCAL, { useNewUrlParser: true, useCreateIndex: true, useFindAndModify: false, useUnifiedTopology: true })
    .then(() => console.log('DB connected'))
    .catch(err => {
        console.log(err);
    });
passportConfig();
// middlewares
app.use(morgan('dev'));
// if (process.env.NODE_ENV === 'dev') {
app.use(cors({
    origin: true,
    credentials: true,
}));
// }

app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(session({
    saveUninitialized: false,
    resave: false,
    secret: process.env.COOKIE_SECRET,
    // cookie: {
    //     httpOnly: true,
    //     secure: false, //https 하면 true
    //     // domain: process.env.NODE_ENV === 'production' && '.nodebu.ml'
    // },
}));

app.use(passport.initialize());
app.use(passport.session());

// routes middleware
app.use('/api/blog', blogRoutes);
app.use('/api/user', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/category', categoryRoutes);
app.use('/api/tag', tagRoutes);
app.use('/api/summary', summaryRoutes);
// port
const port = process.env.PORT || 8006;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});