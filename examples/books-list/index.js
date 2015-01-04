var express = require('express'),
    odata = require('../../index'),
    mongoose = odata.mongoose,
    fixtures = require('pow-mongoose-fixtures'),
    callback,
    done;
var app = express();

app.use(express.bodyParser());
app.use(express.query());

odata.set('app', app);
odata.set('db', 'mongodb://localhost/test-books-list');

var bookInfo = {
  author: String,
  description: String,
  genre: String,
  id: String,
  price: Number,
  publish_date: Date,
  title: String
}

odata.resources.register({
  url: '/books',
  model: bookInfo,
  actions: {
    '/50off': function(req, res, next){
      repository = mongoose.model('books');
      repository.findById(req.params.id, function(err, book){
        book.price = +(book.price / 2).toFixed(2);
        book.save(function(err){
          res.jsonp(book);
        });
      });
    }
  }
});

odata.functions.register({
    url: '/license',
    method: 'GET',
    handle: function(req, res, next){
      res.jsonp({license:'MIT'});
    }
})

// import data.
data = require('./data.json');
for(var i = 0; i < data.length; i++){
  data[i]._id = mongoose.Types.ObjectId();
}
fixtures.load({ 'books': data }, mongoose.connection, function(err) {
  module.exports.books = data;
  done = true;
  if(callback) callback();
});

// start server
app.listen(3000, function(){
  console.log('OData services has started, you can visit by http://localhost:3000/odata/books');
});

// for mocha-test
module.exports.app = app;
module.exports.ready = function(cb){
  callback = cb;
  if(done) callback();
}
