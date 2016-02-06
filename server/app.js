var connect     = require('connect'),
    express     = require('express'),
    serveStatic = require('serve-static'),
    morgan      = require('morgan'),
    port        = process.env.PORT || '8888',
    Mongo       = require('mongodb'),
    bodyParser  = require('body-parser');

var app = express();
var db      = process.env.DB;

//app.engine('jade', require('jade').__express);

app.set('views', './views');
app.set('view engine', 'jade');

//ROUTES
app.route('/')
  .get(function(req, res){
    console.log('get to /');
    res.render('index', {});
  });

// app.route('/:messageId')
  // .get()

//logging
app.use(morgan('dev'));
//set static file server
app.use(serveStatic('./public'));

//parse POST requrests as JSON
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

//Message Model
//


require('./lib/mongodb')(db, function(){
  console.log('Express is lsitening on port:', port);
  app.listen(port);
});

//app.listen(port);
//console.log('Node listening on port ' + port);
