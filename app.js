const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')

const dbPath = path.join(__dirname, 'todoApplication.db')
const app = express()
app.use(express.json())

let db = null

const intitDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () =>
      console.log('Server is running at http://localhost:3000/'),
    )
  } catch (err) {
    console.log(`DB Error ${err.message}`)
    process.exit(1)
  }
}
intitDbAndServer()
const hasPriorPropAndStatusProp = requestQuery => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  )
}
const hasPriorProp = requestQuery => {
  return requestQuery.priority !== undefined
}
const hasStatusProp = requestQuery => {
  return requestQuery.status !== undefined
}

app.get('/todos/', async (request, response) => {
  let data = null
  let getTodosQuery = ''
  const {search_q = '', priority, status} = request.query
  switch (true) {
    case hasPriorPropAndStatusProp(request.query):
      getTodosQuery = `SELECT * FROM todo WHERE todo LIKE "%${search_q}%"
            AND status = '${status}' AND priority = '${priority}';`
      break

    case hasPriorProp(request.query):
      getTodosQuery = `SELECT * FROM todo WHERE todo LIKE "%${search_q}%"
            AND priority = '${priority}';`
      break

    case hasStatusProp(request.query):
      getTodosQuery = `SELECT * FROM todo WHERE todo LIKE "%${search_q}%"
            AND status = '${status}';`
      break

    default:
      getTodosQuery = `SELECT * FROM todo WHERE todo LIKE '%${search_q}%';`
  }
  data = await db.all(getTodosQuery)
  response.send(data)
})

app.get('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const getTodo = `SELECT * FROM todo WHERE id = ${todoId};`
  const todo = await db.get(getTodo)
  response.send(todo)
})
app.post('/todos/', async (request, response) => {
  const {id, todo, priority, status} = request.body
  const postTodo = `INSERT INTO todo(id, todo, priority, status)
    VALUES (${id}, "${todo}", "${priority}", "${status}" );`
  await db.run(postTodo)
  response.send('Todo Successfully Added')
})
app.put('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const updateCol = ''
  const requestBody = request.body
  switch (true) {
    case requestBody.status !== undefined:
      updateCol = 'Status'
      break
    case requestBody.priority !== undefined:
      updateCol = 'Priority'
      break
    case requestBody.todo !== undefined:
      updateCol = 'Todo'
      break
  }
  const prevTodoQuery = `SELECT * FROM todo WHERE id = ${todoId};`
  const prevTodo = await db.get(prevTodoQuery)
  const {
    todo = prevTodo.todo,
    priority = prevTodo.priority,
    status = prevTodo.status,
  } = request.body

  const updateTodoQuery = `UPDATE todo SET todo="${todo}", priority="${priority}", 
    status="${status}" WHERE id = ${todoId};`

  await db.run(updateTodoQuery)
  response.send(`${updateCol} Updated`)
})

app.delete('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const delTodo = `DELETE FROM todo WHERE id=${todoId};`
  await db.run(delTodo)
  response.send('Todo Deleted')
})
module.exports = app
