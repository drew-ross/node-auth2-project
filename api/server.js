const express = require('express');
const helmet = require('helmet');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const usersDb = require('./usersModel');
const constants = require('../config/constants');

const server = express();

server.use(helmet());
server.use(express.json());

server.get('/', (req, res) => res.status(200).json({ message: "server up." }));
server.get('/api', (req, res) => res.status(200).json({ message: "api up." }));

server.post('/api/register', requireProperties(['username', 'password']), (req, res) => {
  let user = req.body;
  const hash = bcrypt.hashSync(user.password, constants.bcryptRounds);
  user.password = hash;

  usersDb.add(user)
    .then(newUser => {
      if (newUser) {
        res.status(201).json({ message: 'created', username: newUser.username });
      } else {
        res.status(400).json({ message: 'An account with that username already exists.' });
      }
    })
    .catch(error => {
      res.status(500).json({ message: error.message });
    });
});

server.post('/api/login', requireProperties(['username', 'password']), (req, res) => {
  const { username, password } = req.body;

  usersDb.findBy({ username })
    .then(user => {
      if (user && bcrypt.compareSync(password, user.password)) {
        const token = signToken(user);
        res.status(200).json({ message: `Welcome ${username}.`, token });
      } else {
        res.status(401).json({ message: 'Invalid credentials' });
      }
    });
});

server.get('/api/users', restricted('customer_support'), (req, res) => {
  usersDb.find()
    .then(users => res.status(200).json(users))
    .catch(err => res.status(500).json({ message: 'There was an issue with the server.', error: err.message }));
});


//middleware

function requireProperties(keys) {
  return (req, res, next) => {
    const missing = [];
    keys.forEach(key => {
      if (!req.body.hasOwnProperty(key)) {
        missing.push(key);
      }
    });
    if (missing.length > 0) {
      res.status(400).json({ message: `Please include: ${missing.join(', ')}` });
    } else {
      next();
    }
  };
};

function signToken(user) {
  const payload = {
    subject: user.id,
    username: user.username,
    department: user.department
  };
  const secret = constants.jwtSecret;
  const options = {
    expiresIn: '1d'
  };
  return jwt.sign(payload, secret, options);
}

function restricted(department) {
  return (req, res, next) => {
    const token = req.headers.authorization;

    if (token) {
      jwt.verify(token, constants.jwtSecret, (error, decodedToken) => {
        if (error) {
          res.status(401).json({ message: 'Unauthorized.' });
        } else if (decodedToken.department !== department) {
          res.status(401).json({ message: 'Unauthorized.' });
        } else {
          req.decodedToken = decodedToken;
          next();
        }
      });
    } else {
      res.status(401).json({ message: 'Unauthorized.' });
    }
  };
}

module.exports = server;