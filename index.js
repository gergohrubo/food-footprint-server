const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const imageRouter = require('./image/router')

const app = express();

const port = process.env.PORT || 4000;

const corsMiddleware = cors();
const bodyparserMiddleware = bodyParser.json();

app.use(corsMiddleware)
app.use(bodyparserMiddleware)

app.use(imageRouter)

app.listen(port, () => console.log(`Server listening on port ${port}`))