const { Router } = require('express')
const User = require('./User.model')
const { toJWT } = require('../auth/jwt')
const bcrypt = require('bcrypt')

const router = new Router()

router.get("/users", async (req, res) => {
  const users = await User.find();
  res.json(users);
});

router.post('/signup', async (req, res) => {
  try {
    const { username, email } = req.body
    const password = bcrypt.hashSync(req.body.password, 10)
    const user = new User({ username, email, password })
    await user.save()
    res.send({
      jwt: toJWT({ userId: user._id })
    })
  } catch (error) {
    console.log(error)
    res.status(500).send('Please send a valid signup request')
  }
})

router.post('/login', async (req, res, next) => {
  if (!req.body.username || !req.body.password) {
    res.status(400).send({
      message: 'Please supply a valid username and password'
    })
  } else {
    try {
      const entity = await User.findOne({ username: req.body.username })
      if (!entity) {
        res.status(400).send({
          message: 'User with that username does not exist'
        })
      }
      else if (bcrypt.compareSync(req.body.password, entity.password)) {
        res.send({
          jwt: toJWT({ userId: entity._id })
        })
      }
      else {
        res.status(400).send({
          message: 'Password was incorrect'
        })
      }
    }
    catch (error) {
      console.error(error)
      res.status(500).send({
        message: 'Something went wrong'
      })
    }
  }
})

module.exports = router