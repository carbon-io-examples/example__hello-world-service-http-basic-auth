# Hello Service (Authentication and access control)

In this example we introduce the central ideas of authentication and access control. 

The code defining the service is located in ```lib/HelloService.js``` and uses a simple ```Endpoint``` object 
to implement an HTTP ```GET``` at the path ```/hello```. 

**Authentication**

This service has an ```Authenticator``` defined that authenticates users based on an API key stored in MongoDB.

```node
o({
  _type: carbon.carbond.security.MongoDBApiKeyAuthenticator,
  apiKeyParameterName: "ApiKey",
  apiKeyLocation: "header", // can be one of 'header' or 'query'
  userCollection: "users",
  apiKeyField: "apiKey"
})
```

This authenticator ensures that an API key is presented for each request to the service and that the 
supplied API key matches a user in the system. The authenticated user is then attached to the ```request``` 
object as a field called ```user``` so that it may be used by the request downstream. 

**Access Control**

Once we have authenticated users, we can then use access control lists (ACLs) to control what operations users can perform. 

The ```hello``` endpoint defines an ACL that defines different permissions for users based on their *role*. 

```node
o({
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
})
```

## Installing the service

We encourage you to clone the git repository so you can play around
with the code. 

```
% git clone git@github.com:carbon-io/example__hello-world-service-aac.git
% cd example__hello-world-service-aac
% npm install
```

## Setting up your environment

This example expects a running MongoDB database. The code will honor a ```MONGODB_URI``` environment variable. The default URI is
```mongodb://localhost:27017/contacts```.

To set the environment variable to point the app at a database different from the default (on Mac):
```
export MONGODB_URI=mongodb://localhost:27017/mydb
```

## Running the service

To run the service:

```sh
% node lib/HelloService
```

For cmdline help:

```sh
% node lib/HelloService -h
```

## Accessing the service

You can interact with the service via HTTP. To test authentication and access control, you'll need to first create a new user in your MongoDB database. Here is an example using Terminal/mongo:

```
% mongo
% use hello-world
% db.users.insert({"name":"chris","apiKey":"test-api-key","role":"Admin"})
```

Once you have a user, you can test using curl:

```
% curl localhost:8888/hello -H "ApiKey: test-api-key"
```


## Running the unit tests

This example comes with a simple unit test written in Carbon.io's test framework called TestTube. It is located in the ```test``` directory. 

```
% node test/HelloServiceTest
```

or 

```
% npm test
```

## Generating API documentation (aglio flavor)

```sh
% node lib/HelloService gen-static-docs --flavor aglio --out docs/index.html
```

* [View current documentation](
http://htmlpreview.github.io/?https://raw.githubusercontent.com/carbon-io/example__hello-world-service-aac/master/docs/index.html)
