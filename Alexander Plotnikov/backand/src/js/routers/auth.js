const { Router } = require('express')
const User = require('../model/user')
const jwt = require('jsonwebtoken')
const router = Router()

const TOKEN_SECRET_KEY = require('../secret')

// проверка наличия логина  в базе данных
router.get('/checkLogin/:login', async (req, res) => {
  try {
    let user = await User.findOne({ login: req.params.login })
    if (user) {
      res.status(200).send({ result: true })
    } else {
      res.status(200).send({ result: false })
    }
  } catch (e) {
    res.status(200).send({ result: false })
  }
})
// проверка наличия email в базе данных
router.get('/checkEmail/:email', async (req, res) => {
  try {
    let user = await User.findOne({ email: req.params.email })
    if (user) {
      res.status(200).send({ result: true })
    } else {
      res.status(200).send({ result: false })
    }
  } catch (e) {
    res.status(200).send({ result: false })
  }
})

router.get('/getUser/:token', async (req, res) => {
  if (req.user) {
    res.status(200).json(req.user)
  } else {
    res.status(403).send()
  }
})

router.post('/auth', async (req, res) => {
  let email = req.body.login
  try {
    let user = await User.findOne({ email })

    if (!user) {
      let login = req.body.login
      user = await User.findOne({ login })
    }

    if (!user) {
      return res.status(200).json({ reasult: false })
    }

    if (!user.validatePassword(req.body.password)) {
      return res.status(200).json({ result: false })
    }

    delete user.password1
    user = JSON.parse(JSON.stringify(user))
    res
      .status(200)
      .json({ ...user, result: true, token: jwt.sign(user, TOKEN_SECRET_KEY) })
  } catch (e) {
    console.log(e)
    res.status(200).json({ result: false })
  }
})

router.post('/registration', async (req, res) => {
  try {
    const { password2, ...user } = req.body
    const newUser = new User(user)
    await newUser.save()
    res.status(200).send({ result: true })
  } catch (e) {
    res.status(200).send({ result: false })
  }
})

module.exports = router
