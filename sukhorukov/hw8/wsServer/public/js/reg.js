submit.addEventListener('click', (event) => {
  event.preventDefault()

  localStorage.removeItem('token')

  fetch('http://localhost:4000/register', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      firstName: firstName.value,
      email: email.value,
      password: password.value,
      repassword: repassword.value,
    }),
  })
  .then((response) => {
    switch (response.status) {
      case 201:
        window.location = '/auth'
        break
      case 400:
        window.location = '/register?error=Пароли не совпадают'
        break
      case 409:
        window.location = '/register?error=Такая учетная запись уже существует'  
        break    
    }
  })
})