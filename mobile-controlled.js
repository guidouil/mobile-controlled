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
  subscribe: function (){
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
    "click [data-action=left]": function(evt, tmpl){
      evt.preventDefault();
      var stateId = Iron.controller().getParams()._id;
      Meteor.call('stateUpsert',stateId, {direction: 'left'});
    },
    "click [data-action=right]": function(evt, tmpl){
      evt.preventDefault();
      var stateId = Iron.controller().getParams()._id;
      Meteor.call('stateUpsert',stateId, {direction: 'right'});

    },
    "click [data-action=up]": function(evt, tmpl){
      evt.preventDefault();
      var stateId = Iron.controller().getParams()._id;
      Meteor.call('stateUpsert',stateId, {direction: 'up'});
    },
    "click [data-action=down]": function(evt, tmpl){
      evt.preventDefault();
      var stateId = Iron.controller().getParams()._id;
      Meteor.call('stateUpsert',stateId, {direction: 'down'});
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
  Meteor.publish('States', function (stateId) {
    return States.find({_id: stateId});
  });
  Meteor.methods({
  stateUpsert: function( id, doc ){
     States.upsert( id, doc );
    }
  });
}
