const mysql = require('mysql')
const settings = require('../settings/settings');

const pool = mysql.createPool(settings)

class Task {
  static getAll() {
    return new Promise((resolve, reject) => {
      pool.getConnection((err, connection) => {
        if (err) {
          reject(err)
        }

        pool.query('SELECT * FROM tasks', (err, rawRows) => {
          if (err) {
            reject(err)
          }

          const rows = JSON.parse(JSON.stringify(rawRows))

          connection.release()
          resolve(rows)
        })
      })
    })
  }

  static getOne(task) {
    return new Promise((resolve, reject) => {
      pool.getConnection((err, connection) => {
        if (err) {
          reject(err)
        }

        pool.query('SELECT * FROM tasks WHERE ?', task, (err, rawRow) => {
          if (err) {
            reject(err)
          }

          const row = JSON.parse(JSON.stringify(rawRow[0]))

          connection.release()
          resolve(row)
        })
      })
    })
  }

  static add(task) {
    return new Promise((resolve, reject) => {
      pool.getConnection((err, connection) => {
        if (err) {
          reject(err)
        }

        pool.query('INSERT INTO tasks SET ?', task, (err, result) => {
          if (err) {
            reject(err)
          }

          connection.release()

          if (result.insertId) {
            resolve(result.insertId)
          } else {
            reject(new Error('result.insertId'))
          }
        })
      })
    })
  }

  static update(task, id) {
    return new Promise((resolve, reject) => {
      pool.getConnection((err, connection) => {
        if (err) {
          reject(err)
        }

        pool.query('UPDATE tasks SET ? WHERE id = ?', [task, id], (err, result) => {
          if (err) {
            reject(err)
          }

          connection.release()

          if (result.affectedRows) {
            resolve(result.affectedRows)
          } else {
            reject(new Error('result.affectedRows'))
          }
        })
      })
    })
  }

  static save(task, id = false) {
    if(!id) {
      return this.add(task)
    }

    return this.update(task, id)
  }

  static delete(task) {
    return new Promise((resolve, reject) => {
      pool.getConnection((err, connection) => {
        if (err) {
          reject(err)
        }

        pool.query('DELETE FROM tasks WHERE ?', task, (err, result) => {
          if (err) {
            reject(err)
          }

          connection.release()

          if (result.affectedRows) {
            resolve(result.affectedRows)
          } else {
            reject(new Error('result.affectedRows'))
          }
        })
      })
    })
  }
}

module.exports = Task