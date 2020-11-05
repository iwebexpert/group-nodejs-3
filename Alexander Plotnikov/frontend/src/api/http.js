import axios from 'axios'

const http = axios.create({
  baseURL: 'http://localhost:8001/',
  timeout: 10000,
})

/* const AUTH_TOKEN ='Bearer ' + localStorage.getItem('token')

console.log(AUTH_TOKEN);

if (AUTH_TOKEN) {
  http.defaults.headers.common['Authorization'] = AUTH_TOKEN
}
 */
export default http
