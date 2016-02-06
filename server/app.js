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


WORDS = [
  'yell',
  'bellow',
  'howl',
  'roar',

  'message',
  'text',
  'words',
  'content',

  'reveal',
  'see',
  'show',
  'disrobe',

  'rise',
  'strong',
  'limbic',
  'loud'
];

// From http://www.2ality.com/2012/02/js-integers.html
String.prototype.bin = function () {
    return parseInt(this, 2);
};
Number.prototype.bin = function () {
    var sign = (this < 0 ? "-" : "");
    var result = Math.abs(this).toString(2);
    while(result.length < 32) {
        result = "0" + result;
    }
    return sign + result;
};

function messageIDtoPath(messageID) {
  // Takes an integer Number in [0, 2**32) and returns a string path
  // for the message
  var sBin = messageID.bin();
  console.log(sBin);
  var path = "";
  var binSub, idx;
  for (var i=0; i<8; i++) {
    if (i) {path = path + '-';}
    binSub = sBin.substr(i*4, 4);
    idx = binSub.bin();
    path += WORDS[idx];
  }
  console.log("Converted", messageID, "to", path);
  return path;
}

function pathToMessageID(path) {
  // Takes a string path for the message and returns
  // an integer Number ID in [0, 2**32) 
  var words = path.split('-');
  var sBin = "";
  var idx;
  for (var i=0; i<8; i++) {
    word = words[i];
    idx = WORDS.indexOf(word);
    sBin += idx.bin().substr(-4);
  }
  console.log(sBin);
  var messageID = sBin.bin();
  console.log("Converted", path, "to", messageID);
  return sBin.bin();
}

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
        var newMessageID = results.result.upserted[0]._id; // ;(
        var path = messageIDtoPath(newMessageID);
        res.redirect('/' + path);
      }
    });
  });

app.route('/:messageId')
  .get(function(req, res){
    var path = req.params.messageId;
    console.log("Path:", path);
    var mId = pathToMessageID(path);
    console.log("message ID:", mId);
    Message.findById(mId, function(err, results){
      if(err){
        console.log(err);
      } else {
        if( results && results.message){
          var message = results.message;
          res.render('message', {message:message});
        } else {
          console.log('something weird happened!>>>>>>>>>>');
          console.log('message.findById did not error but there was not message');
          console.log(results);

        }
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
  console.log('Express is listening on port:', port);
  app.listen(port);
});
