var connect     = require('connect'),
    express     = require('express'),
    serveStatic = require('serve-static'),
    morgan      = require('morgan'),
    port        = process.env.PORT || '8888',
    Mongo       = require('mongodb'),
    bodyParser  = require('body-parser');

var app = express();
var db  = process.env.DB || process.env.MONGOLAB_URI;

//set views dir and template engine
app.set('views', './views');
app.set('view engine', 'jade');

//set static file server
app.use(serveStatic('./public'));

//logging
app.use(morgan('dev'));
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
    Message.create(req.body.message, function(err, results){
      if(err){
        console.log(err);
      } else {
        var newMessageID = results.result.upserted[0]._id; // :/
        res.redirect('/' + newMessageID);
      }
    });
  });

app.route('/:messageId')
  .get(function(req, res){
    var mId = Number(req.params.messageId);
    Message.findById(mId, function(err, results){
      if(err){
        console.log(err);
      } else {
        var message = results.message;
        res.render('message', {message:message});
      }
    });
  });
//End Routes

//Message Model
function Message(){}

Object.defineProperty(Message, 'collection', {
  get: function(){return global.mongodb.collection('messages');}
});

Message.findById = function(id, cb){
  var _id = Number(id);
  Message.collection.findOne({_id:id}, cb);
};

// Returns a random integer between min (included) and max (excluded)
// Using Math.round() will give you a non-uniform distribution!
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function makeMessageID() {
  // This does not check for uniqueness.
  // According to a birthday paradox calculator, we expect ~80k messages before hitting a duplicate ID. Good enough for now!
  var baseID = getRandomInt(0, Math.pow(2, 32)-1);
  return baseID;
}

Message.create = function(message, cb){
  var o = {
    message: message,
    _id: makeMessageID()
  };
  Message.collection.save(o, cb);
};

//End Message Model

//fire it up!
require('./lib/mongodb')(db, function(){
  console.log('Express is lsitening on port:', port);
  app.listen(port);
});
