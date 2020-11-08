window.addEventListener('load', () => {
  const registeredUser = localStorage.getItem('registeredUser') ? JSON.parse(localStorage.getItem('registeredUser')): null

  if (registeredUser) {
    const socket = io.connect(`http://localhost:3000?token=${registeredUser.token}`)

    socket.on('created', () => {
      window.location = '/tasks'
    })
    
    form.addEventListener('submit', event => {
      event.preventDefault()

      const data = {}
      data.title = title.value
      data.description = description.value
      data.completed = completed.value
      data.userId =  registeredUser._id

      socket.emit('create',  data)
    })
  } else {
    window.location = '/auth'
  }
})