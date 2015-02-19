/**
 * Node.js Blog Engine for Zoo Example
 * Run: node blog
 * @author Nate Ferrero
 */
var zoo = require('../../runtimes/zoo')(module);
var blog = zoo.require('./blog.zo');

console.log(blog);
