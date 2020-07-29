const express = require('express');
const jwt = require('jsonwebtoken');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 8000;
const { getConnection, SECRET, User, Todo, isLoggedIn } = require('./helpers');
const ObjectID = require('mongodb').ObjectID;
if (!PORT) {
  throw new Error(`Port is not configured`);
}

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { name, username, password, confirmPassword } = req.body;
    if (!name || !username || !password || password !== confirmPassword) {
      return res.status(400).send({
        result: null,
        message: 'Bad Request'
      });
    }

    const con = await getConnection();
    const result = await con.collection('users').findOne({
      username
    });

    if (result) {
      return res.status(400).send({
        result: null,
        message: `Username is already taken`
      });
    }
    const user = new User(req.body);
    const { ops } = await con.collection('users').insertOne(user.getDetails());
    const [userDetails] = ops;
    return res.status(201).send({
      result: userDetails,
      message: 'User has been registered successfully'
    });
  } catch (ex) {
    console.log(`Exception: `, ex);
    return res.status(500).send({
      result: null,
      message: `Something went wrong`
    });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).send({
        result: null,
        message: `Bad request`
      });
    }

    const con = await getConnection();
    const result = await con.collection('users').findOne({
      username,
      password
    });

    if (!result) {
      return res.status(404).send({
        result: null,
        message: `User does not exist`
      });
    }

    const token = jwt.sign(result, SECRET);
    return res.status(200).send({
      result: { ...result, token },
      message: `User logged in successfully`
    });
  } catch (ex) {
    console.log(`Exception: `, ex);
    return res.status(500).send({
      result: null,
      message: `Something went wrong`
    });
  }
});

router.get('/to-do', isLoggedIn, async (req, res) => {
  try {
    const con = await getConnection();
    const result = await con.collection('todos').find({}).toArray();
    return res.status(200).send({
      result: result,
      message: 'To Do`s have been fetched successfully'
    });
  } catch (ex) {
    console.log(`Exception: `, ex);
    return res.status(500).send({
      result: null,
      message: `Something went wrong`
    });
  }
});

router.post('/to-do', isLoggedIn, async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title || !description) {
      return res.status(400).send({
        result: null,
        message: 'Bad Request'
      });
    }
    const todo = new Todo(req.body);
    const con = await getConnection();
    const { ops } = await con.collection('todos').insertOne(todo.getDetails());
    const [todoDetails] = ops;
    return res.status(200).send({
      result: todoDetails,
      message: 'To Do has been saved successfully'
    });
  } catch (ex) {
    console.log(`Exception: `, ex);
    return res.status(500).send({
      result: null,
      message: `Something went wrong`
    });
  }
});

router.patch('/to-do/:id', isLoggedIn, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;
    if (!title || !description) {
      return res.status(400).send({
        result: null,
        message: 'Bad Request'
      });
    }
    const todo = new Todo(req.body);
    const con = await getConnection();
    const { result } = await con.collection('todos').updateOne(
      {
        _id: ObjectID.createFromHexString(id)
      },
      {
        $set: todo.getDetails()
      }
    );
    if (!result) {
      return res.status(404).send({
        result: null,
        message: 'To Do not found'
      });
    }
    return res.status(200).send({
      result,
      message: 'To Do has been updated successfully'
    });
  } catch (ex) {
    console.log(`Exception: `, ex);
    return res.status(500).send({
      result: null,
      message: `Something went wrong`
    });
  }
});

router.delete('/to-do/:id', isLoggedIn, async (req, res) => {
  try {
    const { id } = req.params;
    const con = await getConnection();
    const result = await con.collection('todos').deleteOne({
      _id: ObjectID.createFromHexString(id)
    });

    if (!result) {
      return res.status(404).send({
        result: null,
        message: 'To Do not found'
      });
    }
    return res.status(200).send({
      result,
      message: 'To Do has been updated successfully'
    });
  } catch (ex) {
    console.log(`Exception: `, ex);
    return res.status(500).send({
      result: null,
      message: `Something went wrong`
    });
  }
});

router.get('/error', async (req, res) => {
  return res.status(404).send({
    result: null,
    message: 'Not Found'
  });
});

app.use('/', router);
app.use('/**', async (req, res, next) => {
  return res.redirect('/error');
});

app.listen(PORT, () => {
  console.log(`Server started on PORT = ${PORT}`);
});

process.on('SIGINT', () => {
  process.exit();
});
