var request = require('request');
var crypto = require('crypto');
var bcrypt = require('bcrypt-nodejs');
var util = require('../lib/utility');
var mongoose = require('mongoose');

var db = require('../app/config-mongo');
var User = require('../app/models/user');
var Link = require('../app/models/link');

exports.renderIndex = function(req, res) {
  res.render('index');
};

exports.signupUserForm = function(req, res) {
  res.render('signup');
};

exports.loginUserForm = function(req, res) {
  res.render('login');
};

exports.logoutUser = function(req, res) {
  req.session.destroy(function() {
    res.redirect('/login');
  });
};

exports.fetchLinks = function(req, res) {
  Link.find({}).exec(function(err, links) {
    if (err) {
      console.error(err);
    }else {

      res.send(200, links);
    }
  });
};

exports.saveLink = function(req, res) {
  var uri = req.body.url;

  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.send(404);
  }

  Link.findOne({ 'url': uri }).exec(function(err, link) {
    if (err) {
      console.error(err);
    }else if (link) {
      res.send(200, link);
    } else {
      util.getUrlTitle(uri, function(err, title) {
        if (err) {
          console.log('Error reading URL heading: ', err);
          return res.send(404);
        }
        var newLink = new Link({
          url: uri,
          title: title,
          base_url: req.headers.origin
        });
        newLink.save(function(err, newLink) {
          if (err) {
            console.error(err);
          } else {
              res.send(200, newLink);
          }
        });
      });
    }
  });
};

exports.loginUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  User.findOne({ 'username': username }).exec(function(err, user) {
    if (err) {
      console.error(err);
    }else if (!user) {
        res.redirect('/login');
      } else {
        user.comparePassword(password, function(err, match) {
          if (err) {
            console.error(err);
          } else if (match) {
            util.createSession(req, res, user);
          } else {
            res.redirect('/login');
          }
        });
      }
  });
};

exports.signupUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;
  
  User.findOne({'username': username}).exec(function(err, user) {
    if (err) {
      console.error(err);
    } else if (!user) {
      var newUser = new User({
        username: username,
        password: password
      });

      newUser.save(function(err, newUser) {
        if (err) {
          console.error(err);
        } else {
            util.createSession(req, res, newUser);
        }
        });
    } else {
      console.log('Account already exists');
      //changed from signup
      res.redirect('/login');
    }
  });
};

exports.navToLink = function(req, res) {

  Link.findOne({ 'code': req.params[0] }).exec(function(err, link) {
    if (err) {
      console.error(err);
    }else if (!link) {
      res.redirect('/');
    } else {
      link.visits++;
      link.save(function(err, link){
        if (err){
          console.error(err);
        }else {
          res.redirect(link.url);
        }
      });
    }
  });
};