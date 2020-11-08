window.addEventListener('load', () => {
  const registeredUser = localStorage.getItem('registeredUser') ? JSON.parse(localStorage.getItem('registeredUser')): null

  if (registeredUser) {
    const socket = io.connect(`http://localhost:3000?token=${registeredUser.token}`)
    const id = form.dataset.id

    fetch(`http://localhost:4000/tasks/${id}`, {
      headers: {
        'Content-type': 'application/json',
        'Authorization': `Bearer ${registeredUser.token}`,
      },
    })
    .then((response) => {
      if (response.status !== 200) {
        window.location = '/tasks'
        return
      }

      return response.json()
    })
    .then((task) => {
      title.value = task.title
      description.value = task.description
      if (task.completed) completed.checked = true
    })

    socket.on('updated', () => {
      window.location = '/tasks'
    })
    
    form.addEventListener('submit', event => {
      event.preventDefault()

      const data = {}
      data.title = title.value
      data.description = description.value
      data.completed = completed.checked

      socket.emit('update',  {id, data})
    })
  } else {
    window.location = '/auth'
  }
})