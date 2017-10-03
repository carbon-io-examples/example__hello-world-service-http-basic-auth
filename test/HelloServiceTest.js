const assert = require('assert')

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
     * teardown
     */
    teardown: function() {
      this.service.db.command({dropDatabase: 1})
      carbon.carbond.test.ServiceTest.prototype.teardown.call(this)
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
          statusCode: 201,
          body: function(body) {
            assert(body.email === 'bob@jones.com')
          }
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
          statusCode: 201,
          body: function(body) {
            assert(body.email === 'alice@smith.com')
          }
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
          statusCode: 409,
          body: {
            code: 409,
            description: 'Conflict',
            message: 'User exists with this email'
          }
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
          statusCode: 200,
          body: function(body, context) {
            assert.deepEqual(body, context.httpHistory.getRes('POST /users bob@jones.com').body)
          }
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
          statusCode: 403,
          body: {
            code: 403,
            description: 'Forbidden',
            message: 'User does not have permission to perform operation'
          }
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
          statusCode: 200,
          body: { n: 1 }
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
          statusCode: 200,
          body: { n: 1 }
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
          statusCode: 403, // Should be 401
          body: {
            code: 403,
            description: 'Forbidden',
            message: 'User does not have permission to perform operation'
          }
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
