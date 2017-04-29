var carbon = require('carbon-io')
var __     = carbon.fibers.__(module)
var _o     = carbon.bond._o(module)
var o      = carbon.atom.o(module).main // Note the .main here since this is the main application 

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
       _type: carbon.carbond.security.MongoDBApiKeyAuthenticator,

       apiKeyParameterName: "ApiKey",
       apiKeyLocation: "header",
       userCollection: "users",
       apiKeyField: "apiKey"
     }),
    
    /***************************************************************************
     * message
     */
    message: "Hello world!",
    
    /***************************************************************************
     * endpoints
     */
    endpoints : {
      hello: o({
        _type: carbon.carbond.Endpoint,

        acl: o({
          _type: carbon.carbond.security.EndpointAcl,

          groupDefinitions: {
            role: 'role',
          },

          entries: [
            { // Grant those in Admin role permission to all operations
              user: { role: 'Admin' },
              permissions: {
                '*': true
              }
            },
            { // Grant those in Reader role get permissions
              user: { role: 'Reader' },
              permissions: {
                get: true,
                '*': false // Everything else false. This rule is implicit if not present.
              }
            },
            { // Grant those in Writer role both get and put permissions
              user: { role: 'Writer' },
              permissions: {
                get: true,
                put: true
              }
            },
          ]
        }),
        
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

        put: {
          parameters: {
            body: {
              location: 'body',
              schema: {
                type: 'object',
                properties: {
                  msg: { type: 'string' }
                },
                required: [ 'msg' ],
                additionalProperties: false 
              },
              required: true
            }
          },
          responses: [
            {
              statusCode: 204,
              description: "Success",
            }
          ],
          
          service: function(req, res) {
            var msg = req.body.msg
            if (msg) {
              this.getService().message = msg
            }
            res.status(204).end()
          }
        }


      })
    }

  })
})
