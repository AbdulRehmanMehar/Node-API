const cors = require('cors');
const path = require('path');
const morgan = require('morgan');
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
mongoose.connect('mongodb://127.0.0.1:27017/sosharu', { useNewUrlParser: true });

const usersController = require('./app/controllers/users');

app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'public')));
app.use('/users', usersController);

app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is Running',
        data: null
    });
});

app.listen(3000);