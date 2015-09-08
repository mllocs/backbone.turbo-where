var assert = require('assert');
var Backbone = require('backbone');
var TurboWhere = require('../backbone.turbo-where.js');
var Benchmark = require('benchmark');
var suite = new Benchmark.Suite();
var MyCollection;
var data = [];

MyCollection = Backbone.Collection.extend({
  initialize: function () {
    TurboWhere.setupIndexes(this, ['foreign_key']);
  }
});

var fast = new MyCollection();
var slow = new Backbone.Collection();

for (var i = 1; i < 10000; i++) {
  data.push({id: i, foreign_key: Math.floor(Math.random() * 100)});
}

fast.reset(data);
slow.reset(data);

describe('Performance', function () {
  it('tests that with turbo is faster', function (done) {
    this.timeout(60000);

    suite
      .add('regular collection', function () {
        slow.where({foreign_key: 5});
      })
      .add('with turbo', function () {
        fast.where({foreign_key: 5});
      })
      .on('cycle', function (event) {
        console.log(String(event.target));
      })
      .on('complete', function () {
        assert(this.filter('fastest').pluck('name'), 'with turbo');
        done();
      })
      .run({ 'async': true });
  });
});
