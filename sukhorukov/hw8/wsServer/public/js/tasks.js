window.addEventListener('load', () => {
  const tasksList = document.querySelector('#tasks')
  const registeredUser = localStorage.getItem('registeredUser') ? JSON.parse(localStorage.getItem('registeredUser')): null
  const socket = io.connect(`http://localhost:3000?token=${registeredUser.token}`)

  if (registeredUser) {
    fetch('http://localhost:4000/tasks', {
      headers: {
        'Content-type': 'application/json',
        'Authorization': `Bearer ${registeredUser.token}`,
      },
    })
    .then((response) => {
      if (response.status !== 200) {
        localStorage.removeItem('registeredUser')
        window.location = '/auth'
        return
      }

      return response.json()
    })
    .then((tasks) => {
      tasks.forEach((task) => {
        const el = document.createElement('div')
        el.classList.add('task-wrapper')
        const start = `<a class="task" href="/task/${task._id}"><div>${task.title}<div class="description">${task.description}</div>`
        const middle = task.completed ? '<div class="is-completed">Задача завершена</div>' : ''
        const end = `</div></a><button class="del-btn" data-id="${task._id}">X</button></div></div>`
        const result = start + middle + end
        el.innerHTML = result
        tasksList.append(el)
      })
    })
    

    socket.on('deleted', () => {
      window.location = '/tasks'
    })
    
    tasksList.addEventListener('click', event => {
      if (event.target.tagName === 'BUTTON') {
        socket.emit('delete', event.target.dataset.id)
      }
    })

  } else {
    window.location = '/auth'
  }
}) 
