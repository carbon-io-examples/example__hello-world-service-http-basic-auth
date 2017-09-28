const carbon = require('carbon-io')
const __ = carbon.fibers.__(module)
const _o = carbon.bond._o(module)
const o = carbon.atom.o(module).main // Note the .main here since this is the main application

/***************************************************************************************************
 * HelloService
 *
 * Hello-world example.
 */
__(function() {
  module.exports = o({

    /***************************************************************************
     * _type
     */
    _type: carbon.carbond.Service,

    /***************************************************************************
     * description
     */
    description: "Advanced hello-world service demonstrating aac",

    /***************************************************************************
     * environmentVariables
     */
    environmentVariables: {
      MONGODB_URI: {
        help: "MongoDB connection string URI",
        required: false
      }
    },
    
    /***************************************************************************
     * port
     */
    port: 8888,

    /***************************************************************************
     * dbUri
     */
    dbUri: _o('env:MONGODB_URI') || "mongodb://localhost:27017/hello-world",
    
    /***************************************************************************
     * authenticator
     */
    authenticator: o({
      _type: carbon.carbond.security.MongoDBHttpBasicAuthenticator,
      passwordHashFn: carbon.carbond.security.BcryptHasher,
      userCollection: "users",
      usernameField: "email",
      passwordField: "password"
    }),

    /***************************************************************************
     * message
     */
    message: "Hello world!",
    
    /***************************************************************************
     * endpoints
     */
    endpoints : {
      users: _o('./UsersEndpoint'),
      
      hello: o({
        _type: carbon.carbond.Endpoint,

        /***********************************************************************
         * acl
         *
         * All users can access the /hello endpoint if they are authenticated
         */
        acl: o({
          _type: carbon.carbond.security.EndpointAcl,

          entries: [
            {
              // All users
              user: '*',
              permissions: {
                '*': true
              }
            }
          ]
        }),
        
        /***********************************************************************
         * get
         *
         * Returns 'Hello World'
         */
        get: {
          responses: [
            {
              statusCode: 200,
              description: "Success",
              schema: {
                type: 'object',
                properties: {
                  msg: { type: 'string' }
                },
                required: [ 'msg' ],
                additionalProperties: false
              }
            }
          ],
          
          service: function(req, res) {
            return { msg: `${this.getService().message}` }
          }
        },
      })
    }
  })
})
