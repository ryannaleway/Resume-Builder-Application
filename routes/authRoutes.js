const express = require('express');
const { fnListAuthenticatedUsers, fnSignUp, fnSignIn } = require('../controllers/authController');

const cRouter = express.Router();

cRouter.get('/users', fnListAuthenticatedUsers);
cRouter.post('/signup', fnSignUp);
cRouter.post('/login', fnSignIn);

module.exports = cRouter;
