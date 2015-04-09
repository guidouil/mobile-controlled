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
    },
    orientation: function (stateId) {
      var state = States.findOne({_id: stateId});
      if (state && state.tiltLR && state.tiltFB && state.dir) {
        var logo = document.getElementById("imgLogo");
        logo.style.webkitTransform = "rotate("+ state.tiltLR +"deg) rotate3d(1,0,0, "+ (state.tiltFB*-1)+"deg)";
        logo.style.MozTransform = "rotate("+ state.tiltLR +"deg)";
        logo.style.transform = "rotate("+ state.tiltLR +"deg) rotate3d(1,0,0, "+ (state.tiltFB*-1)+"deg)";
        console.log(state.tiltLR);
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

  Template.MobileControl.helpers({
    stateId: function(){
      return Iron.controller().getParams()._id;
    }
  });

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

  Template.MobileControl.rendered = function(){
    // Copied from http://www.html5rocks.com/en/tutorials/device/orientation/ and adapted
    init();
    var count = 0;
    var stateId = Iron.controller().getParams()._id;

    function init() {
      if (window.DeviceOrientationEvent) {
        document.getElementById("doEvent").innerHTML = "DeviceOrientation";
        // Listen for the deviceorientation event and handle the raw data
        window.addEventListener('deviceorientation', function(eventData) {
          // gamma is the left-to-right tilt in degrees, where right is positive
          var tiltLR = eventData.gamma;
          // beta is the front-to-back tilt in degrees, where front is positive
          var tiltFB = eventData.beta;
          // alpha is the compass direction the device is facing in degrees
          var dir = eventData.alpha;
          // call our orientation event handler
          deviceOrientationHandler(tiltLR, tiltFB, dir);
          }, false);

      } else {
        document.getElementById("doEvent").innerHTML = "Not supported on your device or browser.  Sorry.";
      }
    }

    function deviceOrientationHandler(tiltLR, tiltFB, dir) {
      document.getElementById("doTiltLR").innerHTML = Math.round(tiltLR);
      document.getElementById("doTiltFB").innerHTML = Math.round(tiltFB);
      document.getElementById("doDirection").innerHTML = Math.round(dir);

      // Apply the transform to the image
      var logo = document.getElementById("imgLogo");
      logo.style.webkitTransform = "rotate("+ tiltLR +"deg) rotate3d(1,0,0, "+ (tiltFB*-1)+"deg)";
      logo.style.MozTransform = "rotate("+ tiltLR +"deg)";
      logo.style.transform = "rotate("+ tiltLR +"deg) rotate3d(1,0,0, "+ (tiltFB*-1)+"deg)";

      var state = States.findOne({_id: stateId});
      if (state === undefined) {
        States.insert({_id: stateId, 'tiltLR': tiltLR, 'tiltFB': tiltFB, 'dir': dir});
      } else {
        if (state.tiltLR !== Math.round(tiltLR) || state.tiltFB !== Math.round(tiltFB) || state.dir !== Math.round(dir) ) {
          States.update({_id: stateId}, {$set: {'tiltLR': Math.round(tiltLR), 'tiltFB': Math.round(tiltFB), 'dir': Math.round(dir)}});
        }
      }
    }
  };

} // end client

if (Meteor.isServer) {
  Meteor.startup(function () {
    Kadira.connect('xpZ4yAoMrrgZe72ib', 'bfef51f1-200a-485f-ab0c-5ba6a9f00fd7');
  });
  Meteor.publish('States', function (stateId) {
    check(stateId, String);
    return States.find({_id: stateId});
  });
}
