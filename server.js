require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { authenticate } = require('./middelware');
const Pool = require('pg').Pool;

const pool = new Pool ({
    connectionString: process.env.DATABASE_URL,
});

const app = express();


app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static('build'));

const secret = process.env.SECRET;
const port = process.env.PORT;

/////////////////////////////////////////////////////////////////////////

async function getUsers() {
    const { rows } = await pool.query('SELECT * FROM users ORDER BY id ASC');
    return rows;
}

async function getTweetsAndUsers() {
    const { rows } = await pool.query(
        'SELECT tweets.id, tweets.message, tweets.created_at, users.name, users.handle FROM tweets INNER JOIN users ON (tweets.user_id = users.id) ORDER BY tweets.created_at DESC');
    return rows;
};

function createTweet(message, userId) {
    return pool.query('INSERT INTO tweets (message, user_id) VALUES ($1, $2) RETURNING *', [message, userId]).then(({rows}) => rows[0]);
}

function getUserByHandle(handle) {
    return pool.query('SELECT * FROM users WHERE handle = $1', [handle]).then(({ rows }) => rows[0]);
}

function addUser({ name, handle, password }) {
    return pool.query('INSERT INTO users (name, handle, password) VALUES ($1, $2, $3) RETURNING id, name, handle', [name, handle, password]).then(({rows}) => rows[0])
}


////////////////////////////////////////////////////////////////////////

const api = express();

api.get('/user', async function (req, res) {
    const users = await getUsers();
    res.send(users);
  });

api.get('/tweets', async function (req, res) {
    const tweets = await getTweetsAndUsers();
    res.send(tweets);
});


api.get('/session', authenticate, function (req, res) {
    res.send ({
        message: 'You are authenticated'
    })
    
});

api.post('/session', async function (req, res) {
    const { handle, password } = req.body;
    const user = await getUserByHandle(handle);

    if (!user) {
        return res.status(404).send({ error: 'Unknown user' });
    }

    if (user.password !== password) {
        return res.status(404).send({ error: 'Wrong password' });
    }

    const token = jwt.sign({
        id: user.id,
        handle: user.handle,
        name: user.name
    }, new Buffer(secret, 'base64'));

    res.send({ token: token });
});

api.post('/tweets', authenticate, async function (req, res) {
    const { id, handle, name } = req.user;
    const { message } = req.body;
    
    const newTweet = await createTweet(message, id);
    res.send(newTweet);
});

api.post('/users', async function (req, res) {
    const { name, handle, password } = req.body;

    const user = await addUser({ name, handle, password });

    const token = jwt.sign({
        id: user.id,
        handle: user.handle,
        name: user.name
    }, new Buffer(secret, 'base64'));

    res.send({ token: token });
});

app.use('/api', api);

app.listen(port, () => {
    console.log(`Twitter app is running og http://localhost:${port}`);
});