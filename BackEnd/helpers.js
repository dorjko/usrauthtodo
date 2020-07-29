const mongoClient = require('mongodb').MongoClient;
const jwt = require('jsonwebtoken');
const SECRET = process.env.SECRET || 'secret';
const isLoggedIn = async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    if (!authorization) {
      return res.status(401).send({
        result: null,
        message: 'Token not found'
      });
    }
    const [, token] = authorization.split(' ');
    if (!token) {
      return res.status(401).send({
        result: null,
        message: 'Token not found'
      });
    }
    const decodedToken = jwt.verify(token, SECRET);
    const con = await getConnection();
    const result = await con.collection('users').findOne({
      username: decodedToken.username,
      name: decodedToken.name
    });
    req['user'] = result;
    next();
  } catch (ex) {
    console.log(`Ex`, ex);
    return res.status(403).send({
      result: null,
      message: 'Forbidden error'
    });
  }
};
const getConnection = () => {
  return new Promise((resolve, reject) => {
    const url = `mongodb://127.0.0.1:27017`;
    mongoClient
      .connect(url, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      })
      .then(async con => {
        con = con.db('to-do-app');
        resolve(con);
      })
      .catch(err => {
        reject(err);
      });
  });
};
class User {
  name;
  username;
  password;
  constructor({ name, username, password }) {
    this.name = name;
    this.username = username;
    this.password = password;
  }
  getDetails() {
    return {
      name: this.name,
      username: this.username,
      password: this.password
    };
  }
}
class Todo {
  title;
  description;

  constructor({ title, description }) {
    this.title = title;
    this.description = description;
  }

  getDetails() {
    return {
      title: this.title,
      description: this.description
    };
  }
}

module.exports = {
  getConnection,
  SECRET,
  isLoggedIn,
  User,
  Todo
};
