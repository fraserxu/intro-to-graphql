# intro-to-graphql
A intro to graphql

### 1. Setup

```sh
mkdir intro-to-graphql
cd intro-to-graphql
```

Install npm dependencies

```sh
npm init -y
npm install graphql express express-graphql --save
```

### 2. Data

```sh
touch index.js
touch data.json
```

Define the user data in `data.json`

```JSON
{
  "1": {
    "id": "1",
    "name": "Dan"
  },
  "2": {
    "id": "2",
    "name": "Marie"
  },
  "3": {
    "id": "3",
    "name": "Jessie"
  }
}
```

### 3. Server

```js
const graphql = require('graphql')
const graphqlHTTP = require('express-graphql')
const express = require('express')

const port = process.env.port || 3000
express().listen(port)

console.log('GraphQL server running on http://localhost:3000/graphql')
```

### 4. Define Schema and add `users` query

```js
const userType = new graphql.GraphQLObjectType({
  name: 'User',
  fields: {
    id: { type: graphql.GraphQLString },
    name: { type: graphql.GraphQLString }
  }
})

const schema = new graphql.GraphQLSchema({
  query: new graphql.GraphQLObjectType({
    name: 'Query',
    fields: {
      users: {
        type: new graphql.GraphQLList(userType),
        resolve: function () {
          return Object.keys(data).map(function(id) {
            return data[id]
          })
        }
      }
    }
  })
})
```

### 5. Load schema and use as middleware

```js
const port = process.env.port || 3000
express()
  .use('/graphql', graphqlHTTP({
    schema: schema,
    pretty: true,
    graphiql: true
  }))
  .listen(port)
```

### 6. Add `user` query

```js
user: {
  type: userType,
  args: {
    id: { type: graphql.GraphQLString }
  },
  resolve: function (_, args) {
    return data[args.id]
  }
}
```

### 7. Talk to restful api

### 8. Talk to database

Install couchdb nodejs client `npm install nano --save`

```js
// connect to db
const nano = require('nano')('http://localhost:5984')
```
Save some data to db

```js
nano.db.destroy(dbName, function () {
  nano.db.create(dbName, function () {
    const mgd = nano.db.use(dbName)
    mgd.bulk({
      "docs": [
        { "_id": "1", "id": "1", "name": "Dan" },
        { "_id": "2", "id": "2", "name": "Ean" },
        { "_id": "3", "id": "3", "name": "Fan" }
      ]
    }, function (err, body, header) {
      if (err) {
        console.log('[mgd.bulk]', err.message)
        return
      }

      console.log('bulk operation successd')
      console.log('body', body)
    })
  })
})
```
### 9. Fetch data from db

```js
function getUserById (id) {
  return new Promise(function (resolve, reject) {
    mgd.get(id, function (err, body) {
      if (err) {
        console.log('get item err', err)
      }
      const data = {
        id: body.id,
        name: body.name
      }
      resolve(data)
    })
  })
}
```

Update resolve function to use db connection

```js
resolve: function (_, args) {
  // return data[args.id]
  return getUserById(args.id)
}
```

Get all users

```js
function getAllUser ()  {
  return new Promise(function (resolve, reject) {
    mgd.list(function (err, body) {
      if (err) {
        console.log('get all user err', err)
        reject(err)
      }
      const requests = body.rows.map(function (d) {
        return d.key
      }).map(function (id) { return getUserById(id) })

      return Promise.all(requests)
        .then(function (values) {
          resolve(values)
        })
    })
  })
}
```
