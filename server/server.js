var path       = require('path');

var express    = require('express');
var app        = express();

var bodyParser = require('body-parser');
var morgan     = require('morgan');
var routes     = require('./routes');
var logger     = require('./logger');
var database   = require('./configs/database');

app.use(morgan('dev', {stream: logger.stream}));
app.use(express.static(path.join( __dirname, 'client')));
app.use(bodyParser.json({inflate: false, limit: '10kb'}));
app.set('port', (process.env.PORT || 80));

// Route Configuration
var router = express.Router();
app.use('/', router);

router.route('/api/data')
  .post(routes.data.post)
  .get(routes.data.get);

router.route('/api/register')
  .post(routes.register.post)
  .get(routes.register.get);

// Start Server
app.listen(app.get('port'), function() {
    logger.info("Server is running at localhost:" + app.get('port'));
});
