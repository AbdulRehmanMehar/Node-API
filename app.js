const cors = require('cors');
const path = require('path');
const morgan = require('morgan');
const express = require('express');
const passport = require('passport');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();


const secret = require('./app/config/secret');
const usersController = require('./app/controllers/users');
const postsController = require('./app/controllers/posts');
const passportConfing = require('./app/config/passport');


mongoose.connect(secret.mongodbURI, { useNewUrlParser: true });

app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use(passport.initialize());
app.use(passport.session());
passportConfing(passport);


app.use(express.static(path.join(__dirname, 'public')));
app.use('/users', usersController);
app.use('/posts', postsController);

app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is Running',
        data: null
    });
});

app.listen(3000);