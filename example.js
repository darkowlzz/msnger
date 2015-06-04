var msnger = require('./');
var util   = require('util');

msnger.PORT = 3000;
msnger.SERVICE = 'gmail';
msnger.USERNAME = 'postman';
msnger.PASS = 'password';
msnger.DESTINATION = 'receiver@xyzmail.com';

msnger.SUBJECT = function (req) {
  return util.format('Secret message from - %s', req.body.name);
};

msnger.BODY = function (req) {
  return util.format('Name: %s\nEmail: %s\nMessage: %s',
                     req.body.name, req.body.email, req.body.message);
};

msnger.startServer();
