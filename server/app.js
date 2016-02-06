var connect     = require('connect'),
    express     = require('express'),
    serveStatic = require('serve-static'),
    morgan      = require('morgan'),
    port        = process.env.PORT || '8888',
    Mongo       = require('mongodb'),
    bodyParser  = require('body-parser');

var app = express();
var db      = process.env.DB || process.env.MONGOLAB_URI;

//app.engine('jade', require('jade').__express);

app.set('views', './views');
app.set('view engine', 'jade');

//logging
app.use(morgan('dev'));
//set static file server
app.use(serveStatic('./public'));

//parse POST requrests as JSON
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

//ROUTES
app.route('/')
  .get(function(req, res){
    console.log('get to /');
    res.render('index');
  });

app.route('/newmessage')
  .get(function(req, res){
    res.redirect('/');
  })
  .post(function(req, res){
    Message.create(req.body, function(err, results){
      if(err){
        console.log(err);
      } else {
        var newMessage = results.ops[0];
        res.redirect('/' + newMessage._id);
      }
    });
  });

app.route('/:messageId')
  .get(function(req, res){
    var mId = req.params.messageId;
    Message.findById(mId, function(err, results){
      if(err){
        console.log(err);
      } else {
        var message = results.message;
        res.render('message', {message:message});
      }
    });
  });

// app.route('/:messageId')
  // .get()


//
//Message Model

function Message(){}

Object.defineProperty(Message, 'collection', {
  get: function(){return global.mongodb.collection('messages');}
});

Message.findById = function(id, cb){
  var _id = Mongo.ObjectID(id);
  Message.collection.findOne({_id:_id}, cb);
};

Message.create = function(o, cb){
  Message.collection.save(o, cb);
};

///////
//


require('./lib/mongodb')(db, function(){
  console.log('Express is lsitening on port:', port);
  app.listen(port);
});

//app.listen(port);
//console.log('Node listening on port ' + port);
