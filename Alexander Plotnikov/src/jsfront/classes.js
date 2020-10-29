

class Tamplate {
  constructor({ _id, task, priority, status, date, index }) {
    this._id = _id;
    this.task = task;
    this.priority = priority;
    this.status = status;
    this.date = date;
    this.index = index;
  }
  render() {
    return `
      <tr class="row mx-0">
        <td scope="row" class="col-1 center">
        ${this.index + 1}
        </td>
        <td class="col-3 center-height">
          <div class="sb width100 p-1" data-taskedit="${this._id}">
            <p class="mb-0">${
              this.task
            }</p> <button class="btn btn-outline-primary ml-1" data-taskedit="${
      this._id
    }">
              Edit </button>
          </div>
          <div class="sb width100 p-1 none" data-tasksave="${this._id}">
            <textarea type="text" class="form-control" data-task="${
              this._id
            }"> ${this.task} </textarea> 
            <button class="btn btn-outline-primary ml-1" data-tasksave="${
              this._id
            }">Save</button>
          </div>
        </td>
        <td class="col-2 center priority-id rounded">
        <div class="priority-text">
          <span data-prioritytext="${this._id}">${this.priority}</span>
          <div class="select">
            <span class="choice-status" data-priority="${this._id}">High</span>
            <span class="choice-status" data-priority="${
              this._id
            }">Middle</span>
            <span class="choice-status" data-priority="${this._id}">Low</span>
          </div>
          </div>
        </td>
        <td scope="col" class="col-2 center status-id rounded">
            <div class = "status-text">
              <span data-statustext="${this._id}">${this.status}</span>
              <div class="select">
                <span class="choice-status" data-status="${
                  this._id
                }">Waiting</span>
                <span class="choice-status" data-status="${
                  this._id
                }">Unknown</span>
                <span class="choice-status" data-status="${
                  this._id
                }">Done</span>
              </div>
            </div>
        </td>
        <td scope="col" class="col-2 center">
        ${this.date}
        </td>
        <td scope="col" class="col-2 center">
        <button type="button" class="btn btn-dark" data-id="${this._id}">
            Del task
        </button>
        </td>
      </tr>        
         `;
  }
}

class Tools {
  static async server(link, object) {
    let res = await fetch(link, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(object),
    });
    return res;
  }

  static async render(res) {
    let { result, tasks } = await res.json();
    if (result) {
      let listTasks = '';
      tasks.forEach((t, i) => {
        listTasks += new Tamplate({ ...t, index: i }).render();
      });
      alltasks.innerHTML = listTasks;
    }
  }

  static color(slector) {
    [...document.querySelectorAll(slector)].forEach((el) => {
      if (el.querySelector('span').innerHTML.includes('Waiting') || el.querySelector('span').innerHTML.includes('High')) {
        el.classList.remove('unknown');
        el.classList.remove('done');
        el.classList.add('waiting');
      }
      if (el.querySelector('span').innerHTML.includes('Unknown') || el.querySelector('span').innerHTML.includes('Middle')) {
        el.classList.remove('waiting');
        el.classList.remove('done');
        el.classList.add('unknown');
      }
      if (el.querySelector('span').innerHTML.includes('Done') || el.querySelector('span').innerHTML.includes('Low')) {
        el.classList.remove('waiting');
        el.classList.remove('done');
        el.classList.add('done');
      }
    });
  }
}
