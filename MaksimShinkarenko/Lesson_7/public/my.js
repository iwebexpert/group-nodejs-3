function patchForm (e) {
  e.preventDefault();
  let url = "http://localhost:4000/task/" + e.target.id.value;

  let data = {}
  data.title = e.target.title.value
  data.desc = e.target.desc.value
  data.status = e.target.status.value
  data._id = e.target.id.value

  fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
    .then(location="http://localhost:4000/")
    .catch((err) => {
      console.log("Ошибка обновления: ", err)
    })
}

function delForm (e) {
  let url = "http://localhost:4000/task/" + e.target.dataset.id;
  fetch(url, {
    method: 'DELETE',
  })
    .then(location="http://localhost:4000/")
    .catch((err) => {
      console.log("Ошибка удаления: ", err)
    })
}