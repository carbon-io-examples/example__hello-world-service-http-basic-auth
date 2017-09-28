const carbon = require('carbon-io')
const __ = carbon.fibers.__(module)
const _o = carbon.bond._o(module)
const o = carbon.atom.o(module).main // Note the .main here since this is the main (test) application

/***************************************************************************************************
 * HelloServiceTest
 */
__(function() {
  module.exports = o({

    /***************************************************************************
     * _type
     */
    _type: carbon.carbond.test.ServiceTest,

    /***************************************************************************
     * name
     */
    name: "HelloServiceTest",

    /***************************************************************************
     * service
     */
    service: _o('../lib/HelloService'),

    /***************************************************************************
     * setup
     */
    setup: function() {
      carbon.carbond.test.ServiceTest.prototype.setup.call(this)
      this.service.db.command({dropDatabase: 1})
    },
    
    /***************************************************************************
     * suppressServiceLogging
     */
    suppressServiceLogging: false,

    /***************************************************************************
     * tests
     */
    tests: [  
      // Test POST user
      {
        name: 'POST /users bob@jones.com',
        description: 'should return 201',
        reqSpec: {
          url: '/users',
          method: 'POST',
          body: {
            email: 'bob@jones.com',
            password: '1234'
          }
        },
        resSpec: {
          statusCode: 201
        }
      },
      
      // Test POST user
      {
        name: 'POST /users alice@smith.com',
        reqSpec: {
          url: '/users',
          method: 'POST',
          body: {
            email: 'alice@smith.com',
            password: '5678'
          }
        },
        resSpec: {
          statusCode: 201
        }
      },
      
      // Test POST user with same email
      {
        description: 'should return 409',
        reqSpec: {
          url: '/users',
          method: "POST",
          body: {
            email: 'bob@jones.com',
            password: '1234',
          }
        },
        resSpec: {
          statusCode: 409
        }
      },
      
      // Test GET user with correct credentials
      {
        name: 'GET /users/:_id',
        reqSpec: function(context) { // We need the previous response to get the _id
          return {
            url: context.httpHistory.getRes('POST /users bob@jones.com').headers.location,
            method: 'GET',
            headers: {
              Authorization: authorizationHeader('bob@jones.com', '1234'),
            }
          }
        },
        resSpec: {
          statusCode: 200
        }
      },
      
      // Test GET user with wrong credentials
      {
        name: 'GET /users/:_id',
        description: 'Should return 403',
        reqSpec: function(context) { // We need the previous response to get the _id
          return {
            url: context.httpHistory.getRes('POST /users bob@jones.com').headers.location,
            method: 'GET',
            headers: {
              Authorization: authorizationHeader('alice@smith.com', '5678'),
            }
          }
        },
        resSpec: {
          statusCode: 403
        }
      },
      
      // Test PATCH user
      {
        name: 'PATCH /users/:_id',
        reqSpec: function(context) { // We need the previous response to get the _id
          return {
            url: context.httpHistory.getRes('POST /users bob@jones.com').headers.location,
            method: 'PATCH',
            body: {
              password: 'abcd'
            },
            headers: {
              Authorization: authorizationHeader('bob@jones.com', '1234'),
            }
          }
        },
        resSpec: {
          statusCode: 200
        }
      },
      
      // Test DELETE user
      {
        name: 'DELETE /users/:_id',
        reqSpec: function(context) { // We need the previous response to get the _id
          return {
            url: context.httpHistory.getRes('POST /users bob@jones.com').headers.location,
            method: 'DELETE',
            headers: {
              Authorization: authorizationHeader('bob@jones.com', 'abcd'),
            }
          }
        },
        resSpec: {
          statusCode: 200
        }
      },
      
      // Test GET with no authentication
      {
        description: 'Should return 403',
        reqSpec: {
          url: '/hello',
          method: "GET",
        },
        resSpec: {
          statusCode: 403 // Should be 401
        }
      },
      
      // Test GET with user
      {
        reqSpec: {
          url: '/hello',
          method: "GET",
          headers: {
            Authorization: authorizationHeader('alice@smith.com', '5678')
          }
        },
        resSpec: {
          statusCode: 200,
          body: { msg: "Hello world!" }
        }
      }
    ]
  })
})

/***************************************************************************************************
 * authorizationHeader()
 */
function authorizationHeader(username, password) {
  var s = new Buffer(`${username}:${password}`).toString('base64')
  return `Basic ${s}`
}
