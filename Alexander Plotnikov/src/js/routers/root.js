const { Router } = require('express');
const Task = require('../model/task');
const moment = require('moment');
const router = Router();

router.get('/', async (req, res) => {
  let tasks = await Task.find();
  let currentDate = moment().format('YYYY-MM-DD');
  res.render('tasks', {
    tasks: tasks
      .sort(sortByDate)
      .map((t, i) => ({ ...t._doc, index: (i + 1).toString() })),
    currentDate,
    title: 'Todo list',
  });
});

module.exports = router;

function sortByDate(a, b) {
  if (new Date(a.date) < new Date(b.date)) return 1;
  if (new Date(a.date) > new Date(b.date)) return -1;
  if (new Date(a.date) === new Date(b.date)) return 0;
}
