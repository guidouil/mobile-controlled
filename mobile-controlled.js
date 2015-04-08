States = new Meteor.Collection('states');
States.allow({
  insert: function () {
    return true;
  },
  update: function () {
    return true;
  },
  remove: function () {
    return true;
  },
  fetch: null
});

Router.configure({
  layoutTemplate: 'layout',
});

Router.route('/', function () {
  this.render('Home');
});

Router.route('/m/:_id', {
  name: 'MobileControl',
  subscriptions: function (){
    return Meteor.subscribe('States', this.params._id);
  },
  action: function () {
    this.render();
  }
});

if (Meteor.isClient) {
  Template.Home.helpers({
    stateId: function(){
      if (!Session.get('stateId')) {
        var _id = Random.secret(7);
        Session.set('stateId', _id);
      }
      return Session.get('stateId');
    },
    absoluteUrl: function (stateId) {
      return Meteor.absoluteUrl('m/'+stateId);
    },
    direction: function (stateId) {
      var state = States.findOne({_id: stateId});
      if (state && state.direction) {
        return state.direction;
      }
    }
  });

  Template.Home.rendered = function(){
    if (Session.get('stateId')) {
      Meteor.subscribe('States', Session.get('stateId'));
      var url = Meteor.absoluteUrl('m/'+Session.get('stateId'));
      $('#qrcode').qrcode({text: url});
    }
  };

  Template.MobileControl.events({
    "click button": function(evt, tmpl){
      evt.preventDefault();
      var stateId = Iron.controller().getParams()._id;
      var direction = $(evt.currentTarget).val();
      var state = States.findOne({_id: stateId});
      if (state === undefined) {
        States.insert({_id: stateId, direction: direction});
      } else {
        States.update({_id: stateId}, {$set: {direction: direction}});
      }
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
  Meteor.publish('States', function (stateId) {
    check(stateId, String);
    return States.find({_id: stateId});
  });
  Meteor.methods({

  });
}
