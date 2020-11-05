import http from '@/api/http'

export const add = async (task, token) => {
  let { data } = await http.post(token ? `newtask/${token}` : `newtask`, task)
  return data
}
export const all = async ( token) => {
  let { data } = await http.get(token ? `alltasks/${token}` : 'alltasks')
  return data
}
export const delById = async (_id, token) => {
  let { data } = await http.post(token ? `delById/${token}` : `delById`, {
    _id,
    _id,
  })
  return data
}
export const editTask = async (task, token) => {
  let { data } = await http.post(token ? `taskedit/${token}`: `taskedit`, task)
  return data
}
export const editPriorety = async (task, token) => {
  let { data } = await http.post(token ? `priorityedit/${token}`: `taskedit`, task)
  return data
}
export const editStatus = async (task, token) => {
  let { data } = await http.post(token ? `statusedit/${token}`: `taskedit`, task)
  return data
}
