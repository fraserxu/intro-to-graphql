const nano = require('nano')('http://localhost:5984')

const dbName = 'marketplace-graphql-demo'

// create db
// nano.db.create(dbName)

// // use db
const mgd = nano.db.use(dbName)

// insert one doc
// mgd.insert({
//   "id": "1",
//   "name": "Dan"
// }, '1', function (err, body, header) {
//   if (err) {
//     console.log('[mgd.insert]', err.message)
//     return
//   }

//   console.log('you have inserted the first item')
//   console.log('body', body)
// })

// bulk operation
nano.db.destroy(dbName, function () {
  nano.db.create(dbName, function () {
    const mgd = nano.db.use(dbName)
    mgd.bulk({
      "docs": [
        { "_id": "1", "id": "1", "name": "Dan", "age": 23 },
        { "_id": "2", "id": "2", "name": "Ean", "age": 24 },
        { "_id": "3", "id": "3", "name": "Fan", "age": 25 }
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
