var assert = require('assert');
var Backbone = require('backbone');
var TurboWhere = require('../backbone.turbo-where.js');
var MyCollection;
var my_collection;

MyCollection = Backbone.Collection.extend({
  initialize: function () {
    Backbone.Collection.prototype.initialize.apply(this, arguments);

    TurboWhere.setupIndexes(this, ['foreign_key']);
  }
});

my_collection = new MyCollection([
  {id: 1, foreign_key: 11, other: 100},
  {id: 2, foreign_key: 11, other: 200},
  {id: 3, foreign_key: 11, other: 300},
  {id: 4, foreign_key: 22, other: 400},
  {id: 5, foreign_key: 22, other: 500},
  {id: 6, foreign_key: 22, other: 600}
]);

describe('Backbone.TurboWhere', function () {
  it('works with findWhere', function () {
    assert.equal(my_collection.findWhere({foreign_key: 22, id: 4}), my_collection.get(4));
    assert.equal(my_collection.findWhere({foreign_key: 22, id: 999}), undefined);
    assert.equal(my_collection.findWhere({foreign_key: 22, other: 999}), undefined);
    assert.equal(my_collection.findWhere({foreign_key: 22, other: 500}), my_collection.get(5));
  });

  it('works after a reset', function () {
    my_collection.reset([
      {id: 1, foreign_key: 11, other: 100},
      {id: 2, foreign_key: 11, other: 200},
      {id: 3, foreign_key: 33, other: 300},
      {id: 4, foreign_key: 22, other: 400},
      {id: 5, foreign_key: 22, other: 500},
      {id: 6, foreign_key: 33, other: 600}
    ]);
    assert.equal(my_collection.where({foreign_key: 11}).length, 2);
    assert.equal(my_collection.where({foreign_key: 22}).length, 2);
    assert.equal(my_collection.where({foreign_key: 33}).length, 2);
  });

  it('works with models without id', function () {
    var model = new Backbone.Model({foreign_key: 44});
    my_collection.add(model);
    assert.equal(my_collection.where({foreign_key: 44}).length, 1);
    assert.equal(my_collection.findWhere({foreign_key: 44}), model);
  });

  it('works after a delete', function () {
    my_collection.remove(1);
    assert.equal(my_collection.where({foreign_key: 11}).length, 1);
    assert.equal(my_collection.where({foreign_key: 22}).length, 2);
  });

  it('works after another delete', function () {
    my_collection.remove(5);
    assert.equal(my_collection.where({foreign_key: 11}).length, 1);
    assert.equal(my_collection.where({foreign_key: 22}).length, 1);
  });

  it('works after an add', function () {
    my_collection.add({id: 7, foreign_key: 44});
    assert.equal(my_collection.where({foreign_key: 11}).length, 1);
    assert.equal(my_collection.where({foreign_key: 22}).length, 1);
    assert.equal(my_collection.where({foreign_key: 33}).length, 2);
    assert.equal(my_collection.where({foreign_key: 44}).length, 2);
  });

  it('works after a change', function () {
    var model = my_collection.get(7);
    model.set({foreign_key: 22});
    assert.equal(my_collection.where({foreign_key: 22}).length, 2);
    assert.equal(my_collection.where({foreign_key: 44}).length, 1);
  });

  it('works after another change', function () {
    var model = my_collection.get(7);
    model.set({foreign_key: 11});
    assert.equal(my_collection.where({foreign_key: 11}).length, 2);
    assert.equal(my_collection.where({foreign_key: 22}).length, 1);
    assert.equal(my_collection.where({foreign_key: 44}).length, 1);
  });
});
