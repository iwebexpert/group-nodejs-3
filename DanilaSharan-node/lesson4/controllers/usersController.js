const express = require('express')
const router = express.Router()
const users = require('../data/users')

router.use('/:id', (req, res, next) => {
  const { id } = req.params
  if (!users[id]) {
    res.status(404).render('error')
  }
  next()
})

router.get('/', (req, res) => {
  res.render('users', { users })
})

router.get('/:id', (req, res) => {
  const { id } = req.params
  const user = users[id]
  res.render('user', { user })
})

router.post('/', (req, res) => {
  res.status(200).send('POST: users')
})

module.exports = router
