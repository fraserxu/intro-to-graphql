const graphql = require('graphql')
const graphqlHTTP = require('express-graphql')
const express = require('express')

// db connection
const nano = require('nano')('http://localhost:5984')
const dbName = 'marketplace-graphql-demo'

const mgd = nano.db.use(dbName)

function getUserById (id) {
  return new Promise(function (resolve, reject) {
    mgd.get(id, function (err, body) {
      if (err) {
        console.log('get item err', err)
        reject(err)
      }
      const data = {
        id: body.id,
        name: body.name
      }
      resolve(data)
    })
  })
}

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

const data = require('./data.json')

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
          // return Object.keys(data).map(function(id) {
          //   return data[id]
          // })
          return getAllUser()
        }
      },
      user: {
        type: userType,
        args: {
          id: { type: graphql.GraphQLString }
        },
        resolve: function (_, args) {
          // return data[args.id]
          return getUserById(args.id)
        }
      }
    }
  })
})

const port = process.env.port || 3000
express()
  .use('/graphql', graphqlHTTP({
    schema: schema,
    pretty: true,
    graphiql: true
  }))
  .listen(port)

console.log('GraphQL server running on http://localhost:3000/graphql')
