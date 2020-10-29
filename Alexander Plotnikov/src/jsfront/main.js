const addTask = document.querySelector('#addtask');
const form = document.querySelector('#creatTask');
const task = document.querySelector('#exampleInputEmail1');
const mydate = document.querySelector('#exampleInputDate');
const status = document.querySelector('.custom-select.status');
const table = document.querySelector('.table');
const alltasks = document.querySelector('#alltasks');
const priority = document.querySelector('.custom-select.priority');
const body = document.querySelector('body');

Tools.color('.status-id');
Tools.color('.priority-id');

addTask.addEventListener('click', (e) => {
  addTask.classList.toggle('btn-primary');
  addTask.classList.toggle('btn-dark');

  if (!e.target.classList.contains('btn-primary')) {
    form.style.height = '0';
    form.style.visibility = 'hidden';
    addTask.innerHTML = '+ Add task';
    form.classList.remove('my-2');
    form.classList.remove('p-2');
  } else {
    form.style.height = '252px';
    form.style.visibility = 'visible';
    addTask.innerHTML = '- Close this window';
    form.classList.add('my-2');
    form.classList.add('p-2');
  }
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  let res = await Tools.server('http://localhost:8001/newtask', {
    task: task.value,
    status: status.options[status.value - 1].innerHTML.trim(),
    priority: priority.options[priority.value - 1].innerHTML.trim(),
    date: mydate.value,
  });
  await Promise.resolve(Tools.render(res));
  Tools.color('.status-id');
  Tools.color('.priority-id');
});

body.addEventListener('click', async (e) => {
  if (e.target.dataset.id) {
    let res = await Tools.server('http://localhost:8001/delById', {
      _id: e.target.dataset.id,
    });
    await Promise.resolve(Tools.render(res));
    Tools.color('.status-id');
    Tools.color('.priority-id');
  }

  if (e.target.tagName == 'BUTTON' && e.target.dataset.taskedit) {
    document
      .querySelector(`div[data-taskedit = "${e.target.dataset.taskedit}"]`)
      .classList.add('none');
    document
      .querySelector(`div[data-tasksave = "${e.target.dataset.taskedit}"]`)
      .classList.remove('none');
    Tools.color('.status-id');
    Tools.color('.priority-id');
  }

  if (e.target.tagName == 'BUTTON' && e.target.dataset.tasksave) {
    let res = await Tools.server('http://localhost:8001/taskedit', {
      _id: e.target.dataset.tasksave,
      task: document.querySelector(
        `textarea[data-task = "${e.target.dataset.tasksave}"]`
      ).value,
    });
    await Promise.resolve(Tools.render(res));
    Tools.color('.status-id');
    Tools.color('.priority-id');
  }
  if (e.target.tagName == 'SPAN' && e.target.dataset.status) {
    let res = await Tools.server('http://localhost:8001/statusedit', {
      _id: e.target.dataset.status,
      status: e.target.innerHTML,
    });
    if (res) {
      document.querySelector(
        `span[data-statustext = "${e.target.dataset.status}"]`
      ).innerHTML = e.target.innerHTML;
      Tools.color('.status-id');
      Tools.color('.priority-id');
    }
  }
  if (e.target.tagName == 'SPAN' && e.target.dataset.priority) {
    let res = await Tools.server('http://localhost:8001/priorityedit', {
      _id: e.target.dataset.priority,
      priority: e.target.innerHTML,
    });
    if (res) {
      document.querySelector(
        `span[data-prioritytext = "${e.target.dataset.priority}"]`
      ).innerHTML = e.target.innerHTML;
      Tools.color('.status-id');
      Tools.color('.priority-id');
    }
  }
});
