const logout = document.querySelector('#logout')

logout.addEventListener('click', event => {
  event.preventDefault()
  
  localStorage.removeItem('registeredUser')
  window.location = '/auth'
  return
})