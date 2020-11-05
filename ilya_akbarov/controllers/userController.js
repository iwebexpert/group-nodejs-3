const express = require('express')
const passport = require('../auth')
const router = express.Router()
const UserModel = require('../mongo/models/user')

router.get('/register', (req, res) => {
  res.render('register')
})

router.post('/register', async (req, res) => {
  const { confirmPassword, ...resBody } = req.body

  if (resBody.password === confirmPassword) {
    const user = new UserModel(resBody)
    await user.save()
    res.redirect('/user/auth')
  } else {
    res.redirect('/user/register?err=repassword')
  }
})

router.get('/auth', (req, res) => {
  const { error } = req.query
  res.render('auth', { error })
})

router.post('/auth', passport.authenticate)

router.get('/logout', (req, res) => {
  req.logOut()
  res.redirect('/user/auth')
})

module.exports = router
