var db = require('../config-mongo');
var crypto = require('crypto');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var urlsSchema = new Schema({
  url: {type: String}, 
  base_url: {type: String},
  code: {type: String},
  title: {type: String},
  visits: {type: Number, default: 0},
});

urlsSchema.pre('save', function(next) {
  var shasum = crypto.createHash('sha1');
  shasum.update(this.url);
  this.code = shasum.digest('hex').slice(0, 5);    
  next();
});

var Link = mongoose.model('Link', urlsSchema);

module.exports = Link;
