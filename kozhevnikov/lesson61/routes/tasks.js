const { Router } = require('express')
const Task = require('../models/Task')
const router = Router()

router.get('/', async (req, res) => {
  const tasks = await Task.find({})

  res.render('index', {
    title: 'Tasks list',
    isIndex: true,
    tasks
  })
})

router.get('/create', (req, res) => {
  res.render('create', {
    title: 'Create task',
    isCreate: true
  })
})

router.post('/create', async (req, res) => {
  const task = new Task({
    title: req.body.title
  })

  await task.save()
  res.redirect('/')
})

router.post('/complete', async (req, res) => {
  const task = await Task.findById(req.body.id)

  task.completed = !!req.body.completed
  await task.save()

  res.redirect('/')
})

module.exports = router
