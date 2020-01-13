const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const connectDb = require("./db")

const userRouter = require('./user/router')
const imageRouter = require('./image/router')
const ingredientRouter = require('./apis/spoonacular')

const app = express();

const port = process.env.PORT || 4000;

const corsMiddleware = cors();
const bodyparserMiddleware = bodyParser.json();

app.use(corsMiddleware)
app.use(bodyparserMiddleware)

app.use(userRouter)
app.use(imageRouter)
app.use(ingredientRouter)

app.get("/", async (req, res) => {
  console.log("got a get request on /");
  res.json({ status: 'server running' });
});

app.listen(port, () => console.log(`Server listening on port ${port} v1.1`))

connectDb()
  .then(() => {
    console.log("MongoDb connected");
  })
  .catch(console.error)