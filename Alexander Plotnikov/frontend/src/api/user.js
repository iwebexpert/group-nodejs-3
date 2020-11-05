import http from '@/api/http'

export const check = async (token) => {
  let { data } = await http.get(token ? `getUser/${token}` : `getUser`)
  return data
}
