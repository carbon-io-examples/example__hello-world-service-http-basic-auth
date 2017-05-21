# Hello Service (Authentication and access control)

This example is a more elaborate version of [our original hello-world example](https://github.com/carbon-io/example__hello-world-service)
that illustrates how you implement authentication and access control (AAC) in carbon.io apps. 

The code defining the service is located in ```lib/HelloService.js```
and uses a simple ```Endpoint``` object to implement an HTTP ```GET```
at the path ```/hello```. 

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
