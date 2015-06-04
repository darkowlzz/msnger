var express    = require('express'),
    cors       = require('cors'),
    app        = express(),
    bodyParser = require('body-parser'),
    nodemailer = require('nodemailer'),
    util       = require('util')
    _          = require('lodash');


// Send Mail object
var msnger = {
  PORT: 8000,
  SERVICE: '',
  USERNAME: '',
  PASS: '',
  DESTINATION: '',

  SUBJECT: function (req) {
    return util.format('Enquiry - %s', req.body.name);
  },

  BODY: function (req) {
    return util.format('Name: %s\nEmail: %s\nPhone: %s\nMessage: %s',
                       req.body.name, req.body.email, req.body.phone,
                       req.body.message);
  },

  setMailOptions: function (req) {
    return {
      to: process.env.DESTINATION || this.DESTINATION,
      subject: this.SUBJECT(req),
      text: this.BODY(req)
    }
  },

  // Start the server
  startServer: function () {
    this.checkParameters();
    var port = process.env.PORT || this.PORT;
    var server = app.listen(port, function () {
      var host = server.address().address;
      var port = server.address().port;
      util.log(util.format('Server listening at http://%s:%s', host, port));
    });
  },

  checkParameters: function () {
    if (_.isEmpty(this.SERVICE) || _.isEmpty(this.USERNAME) ||
        _.isEmpty(this.PASS) || _.isEmpty(this.DESTINATION)) {
      console.log('Please specify SERVICE, USERNAME, PASS and DESTINATION');
      process.exit();    
    }
  }
}
module.exports = msnger;


app.use(cors()); // enable cross-origin resource sharing
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// ======================= Routes =========================

// Route for testing if the service is running
app.get('/', function (req, res) {
  res.send('Works good!');
});

/**
 * Route to send mail
 * The SMTP transport creates a connection pool that is closed after sending a
 * mail. This is done because there is no need to maintain a connection all
 * the time.
 */
app.post('/message', function (req, res) {
  var transporter = nodemailer.createTransport({
    service: process.env.SERVICE || msnger.SERVICE, // like gmail, Mailgun, etc
    auth: {
      user: process.env.USERNAME || msnger.USERNAME,
      pass: process.env.PASS || msnger.PASS
    }
  });

  var mailOptions = msnger.setMailOptions(req);
  console.log(mailOptions);

  transporter.sendMail(mailOptions, function (err, responseStatus) {
    if (err) {
      util.log(util.format('ERROR: %j', err));
      res.status(500).send('Something broke!');
    } else {
      util.log(util.format('STATUS: %j', responseStatus));
      util.log('mail sent!');
      res.send(true);
    }

    // Close the SMTP pool.
    transporter.close();
    util.log('SMTP pool closed');

    // Clean up
    transporter = mailOptions = null;
  });
});
