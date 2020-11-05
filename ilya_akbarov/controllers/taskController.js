const express = require('express')
const router = express.Router()
const TaskModel = require('../mongo/models/tasks')
const passport = require('../auth')

router.use('/', passport.mustBeAuthenticated)

router.get('/', async (req, res) => {
  try {
    const tasks = await TaskModel.find().lean()
    res.render('tasks', { tasks })
  } catch (err) {
    res.status(500).send('Ошибка сервера')
  }
})

router.post('/', async (req, res) => {
  try {
    const newTask = await TaskModel.create(req.body)
    res.json(newTask)
  } catch (err) {
    res.status(500).send('Ошибка сервера')
  }
})

router.delete('/:id', async (req, res) => {
  const _id = req.params.id

  try {
    await TaskModel.deleteOne({ _id })
    res.status(200).send('Задача успкшно удалена')
  } catch (err) {
    res.status(500).send('Ошибка сервера')
  }
})

router.patch('/:id', async (req, res) => {
  const _id = req.params.id

  try {
    const task = await TaskModel.findOne({ _id })

    if (!task) {
      res.send('задача не найдена')
    }

    task.completed = !task.completed
    task.save()
    res.json(task)
  } catch (err) {
    res.status(500).send('Ошибка сервера')
  }
})

module.exports = router
