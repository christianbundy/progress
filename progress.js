Lifts = new Meteor.Collection('lifts');

var settings = {
  minimum: 45,
  delta: 2.5,
}

var warmup = [
  // sets, rep %, and weight %
  [2, 100,   0],
  [1,  75,  25],
  [1,  50,  50],
  [1,  25,  75]
];


lifts = {
  'Barbell Squat': {
    sets: 3,
    reps: 5,
    wght: 225
  },
  'Barbell Shoulder Press': {
    sets: 3,
    reps: 5,
    wght: 160
  },
  'Power Clean': {
    sets: 5,
    reps: 3,
    wght: 140
  },
  'Barbell Bench Press': {
    sets: 3,
    reps: 5,
    wght: 160
  },
  'Deadlift': {
    sets: 1,
    reps: 5,
    wght: 225
  }
};

seedDb = function () {
  for (var lift in lifts) {
    var l = lifts[lift];
    l.name = lift;
    Lifts.insert(l);
  }
};


var workouts = {
  'Day A': [
    'Barbell Squat',
    'Barbell Shoulder Press',
    'Power Clean'
  ],
  'Day B': [
    'Barbell Squat',
    'Barbell Bench Press',
    'Deadlift'
  ]
};

if (Meteor.isClient) {
  // Set the current workout to the first (alphabetically).
  Session.setDefault('workout', Object.keys(workouts)[0]);

  Template.progress.helpers({
    workouts: function () {
      var all = Object.keys(workouts);
      var cur = Session.get('workout');
      var res = [];

      all.forEach(function (workout) {
        if (workout === cur) {
          res.push({name: workout, current: true});
        } else {
          res.push({name: workout, current: false});
        }
      });

      return res;
    },
    lifts: function () {
      var all = workouts[Session.get('workout')];
      var res = [];
      all.forEach(function (lift) {
        var liftRes = {
          name: lift,
          workout: []
        };

        liftObj = Lifts.findOne({name: lift});

        if (typeof liftObj !== 'undefined') {
          warmup.forEach(function (set) {
            liftRes.workout.push({
              sets: set[0],
              reps: Math.round(set[1] / 100 * liftObj.reps),
              wght: Math.max(settings.minimum, Math.ceil(set[2] / 100 * liftObj.wght / settings.delta) * settings.delta)
            });
          });

          liftRes.workout.push({
            sets: liftObj.sets,
            reps: liftObj.reps,
            wght: liftObj.wght
          });
        }
        res.push(liftRes);
      });
      return res;
    }
  });

  Template.progress.events({
    'click .workouts button.day': function () {
      Session.set('workout', this.name);
    },
    'click .sets .inc': function () {
      Meteor.call('changeWeight', this.name, 2.5);
    },
    'click .sets .dec': function () {
      Meteor.call('changeWeight', this.name, -2.5);
    }
  });
}

if (Meteor.isServer) {
  Meteor.methods({
    'changeWeight': function (liftName, delta) {
      Lifts.update({
        name: liftName
      }, {
        $inc: {
          wght: delta,
        }
      });
    }
  });
}
