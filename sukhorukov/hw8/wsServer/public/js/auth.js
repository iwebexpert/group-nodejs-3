submit.addEventListener('click', (event) => {
  event.preventDefault()

  localStorage.removeItem('token')

  fetch('http://localhost:4000/auth', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: email.value,
      password: password.value,
    }),
  })
  .then((response) => {
    if (response.status !== 200){
      //Подсветка поля
      return {token: null}
    }

    return response.json()
  })
  .then((response) => {
    if (response.token) {
      localStorage.setItem('registeredUser', JSON.stringify(response))

      window.location = '/'
    }
  })
})