const { Router } = require('express');
const Task = require('../model/task');
const moment = require('moment');
const router = Router();

router.post('/newtask', async (req, res) => {

  let obj = new Task({
    task: req.body.task || 'No task',
    priority: req.body.priority,
    status: req.body.status,    
    date: req.body.date || `${moment().format('YYYY-MM-DD')}`,
    user: req.user._id
  });
  try {
    await obj.save();
    let tasks =  await Task.find({ user: req.user._id }).lean()
    res.json({ result: true, tasks: tasks.sort(sortByDate) });
  } catch (e) {
    console.error(e);
    res.json({ result: false });
  }
});

router.post('/delById', async (req, res) => {
  try {
    await Task.deleteOne({ _id: req.body._id });
    let tasks = await Task.find();
    res.json({ result: true, tasks: tasks.sort(sortByDate) });
  } catch (e) {
    console.error(e);
    res.json({ result: false });
  }
});

router.post('/taskedit', async (req, res) => {
  try {
    let task = await Task.findById(req.body._id);
    if (task) {
      await Task.findByIdAndUpdate(
        req.body._id,
        { $set: { task: req.body.task } },
        { new: true }
      );
      let tasks = await Task.find();
      res.json({ result: true, tasks: tasks.sort(sortByDate) });
    } else {
      res.json({ result: false });
    }
  } catch (e) {
    console.error(e);
  }
});

router.post('/statusedit', async (req, res) => {
  try {
    let task = await Task.findById(req.body._id);
    if (task) {
      await Task.findByIdAndUpdate(
        req.body._id,
        { $set: { status: req.body.status } },
        { new: true }
      );
      res.json({ result: true });
    } else {
      res.json({ result: false });
    }
  } catch (e) {
    console.error(e);
  }
});

router.post('/priorityedit', async (req, res) => {
  try {
    let task = await Task.findById(req.body._id);
    if (task) {
      await Task.findByIdAndUpdate(
        req.body._id,
        { $set: { priority: req.body.priority } },
        { new: true }
      );
      res.json({ result: true });
    } else {
      res.json({ result: false });
    }
  } catch (e) {
    console.error(e);
  }
});

module.exports = router;

function sortByDate(a, b) {
  if (new Date(a.date) < new Date(b.date)) return 1;
  if (new Date(a.date) > new Date(b.date)) return -1;
  if (new Date(a.date) === new Date(b.date)) return 0;
}
