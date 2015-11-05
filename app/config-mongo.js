var mongoose = require('mongoose');
//TODO: update URI once we set it up
mongoose.connect('mongodb://localhost/my_database');

var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function(ourCallback) {
  ourCallback();
  console.log('yay! connected');
});

var ourCallback = function() {
  var usersSchema = mongoose.Schema({
    username: {type: String}, 
    password: {type: String},
    timestamps: { type: Date, default: Date.now }
  });
  
  var urlsSchema = mongoose.Schema({
    url: {type: String}, 
    base_url: {type: String},
    code: {type: String},
    title: {type: String},
    visits: {type: Number, default: 0}
    timestamps: { type: Date, default: Date.now }
  });

  var Link = mongoose.model('Link', urlsSchema);
  var User = mongoose.model('User', usersSchema);
}

module.exports = db;