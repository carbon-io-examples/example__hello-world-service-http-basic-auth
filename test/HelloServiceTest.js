var carbon = require('carbon-io')
var __     = carbon.fibers.__(module)
var _o     = carbon.bond._o(module)
var o      = carbon.atom.o(module).main // Note the .main here since this is the main (test) application

/***************************************************************************************************
 * SEED_USERS
 */
var SEED_USERS = [
  {
    firstName: "Bob",
    lastName: "Jones",
    email: "bob@jones.com",
    apiKey: "1234",
    role: "Admin"
  },
  {
    firstName: "Mary",
    lastName: "Smith",
    email: "mary@smith.com",
    apiKey: "5678",
    role: "Reader"
  },
  {
    firstName: "Charlie",
    lastName: "Fox",
    email: "charlie@fox.com",
    apiKey: "3456",
    role: "Writer"
  },
]

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
      
      // Seed some users
      this.service.db.command({dropDatabase: 1})
      this.service.db.getCollection("users").insert(SEED_USERS)
    },

    /***************************************************************************
     * tests
     */
    tests: [
      // Test GET with no ApiKey
      {
        reqSpec: {
          url: '/hello',
          method: "GET",
        },
        resSpec: {
          statusCode: 403 // Should be 401
        }
      },
      
      // Test GET with Admin user
      {
        reqSpec: {
          url: '/hello',
          method: "GET",
          headers: {
            ApiKey: SEED_USERS[0].apiKey
          }
        },
        resSpec: {
          statusCode: 200,
          body: { msg: "Hello world!" }
        }
      },

      // Test PUT with Admin user
      {
        reqSpec: {
          url: '/hello',
          method: "PUT",
          headers: {
            ApiKey: SEED_USERS[0].apiKey
          },
          body: { msg: "Hello there!" }
        },
        resSpec: {
          statusCode: 204,
        }
      },

      // Test GET with Reader
      {
        reqSpec: {
          url: '/hello',
          method: "GET",
          headers: {
            ApiKey: SEED_USERS[1].apiKey
          }
        },
        resSpec: {
          statusCode: 200,
          body: { msg: "Hello there!" }
        }
      },

      // Test PUT with Reader
      {
        reqSpec: {
          url: '/hello',
          method: "PUT",
          headers: {
            ApiKey: SEED_USERS[1].apiKey
          },
          body: { msg: "Hello hello!" }
        },
        resSpec: {
          statusCode: 403 // Reader cannot write so should get Forbidden 
        }
      },

      // Test PUT with Writer
      {
        reqSpec: {
          url: '/hello',
          method: "PUT",
          headers: {
            ApiKey: SEED_USERS[2].apiKey
          },
          body: { msg: "Hello hello!" }
        },
        resSpec: {
          statusCode: 204
        }
      },

      // Test GET with Writer
      {
        reqSpec: {
          url: '/hello',
          method: "GET",
          headers: {
            ApiKey: SEED_USERS[2].apiKey
          }
        },
        resSpec: {
          statusCode: 200,
          body: { msg: "Hello hello!" }
        }
      },
    ]

  })
})
