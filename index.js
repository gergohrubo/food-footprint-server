const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const connectDb = require("./db")
const User = require('./user/User.model')

const imageRouter = require('./image/router')

const app = express();

const port = process.env.PORT || 4000;

const corsMiddleware = cors();
const bodyparserMiddleware = bodyParser.json();

app.use(corsMiddleware)
app.use(bodyparserMiddleware)

app.use(imageRouter)

app.get("/", async (req, res) => {
  console.log("got a get request on /");
  res.json({ status: 'server running' });
});
app.get("/users", async (req, res) => {
  const users = await User.find();
  res.json(users);
});
app.get("/user-create", async (req, res) => {
  const user = new User({ username: "userTest" });
  await user.save().then(() => console.log('User created'));
  res.send("User created \n");
});

app.listen(port, () => console.log(`Server listening on port ${port} v1.0`))

connectDb()
  .then(() => {
    console.log("MongoDb connected");
  })
  .catch(console.error)