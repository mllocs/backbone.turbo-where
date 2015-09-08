var assert = require('assert');
var Backbone = require('backbone');
var TurboWhere = require('../backbone.turbo-where.js');
var MyCollection;
var my_collection;

MyCollection = Backbone.Collection.extend({
  initialize: function () {
    TurboWhere.setupIndexes(this, ['foreign_key']);
  }
});

my_collection = new MyCollection();

describe('Backbone.TurboWhere', function () {
  before(function () {
    my_collection.reset([
      {id: 1, foreign_key: 11},
      {id: 2, foreign_key: 11},
      {id: 3, foreign_key: 11},
      {id: 4, foreign_key: 22},
      {id: 5, foreign_key: 22},
      {id: 6, foreign_key: 22}
    ]);
  });

  it('works after a reset', function () {
    assert.equal(my_collection.where({foreign_key: 11}).length, 3);
    assert.equal(my_collection.where({foreign_key: 22}).length, 3);
  });

  it('works after a delete', function () {
    my_collection.remove(1);
    assert.equal(my_collection.where({foreign_key: 11}).length, 2);
    assert.equal(my_collection.where({foreign_key: 22}).length, 3);
  });

  it('works after another delete', function () {
    my_collection.remove(5);
    assert.equal(my_collection.where({foreign_key: 11}).length, 2);
    assert.equal(my_collection.where({foreign_key: 22}).length, 2);
  });

  it('works after an add', function () {
    my_collection.add({id: 7, foreign_key: 11});
    assert.equal(my_collection.where({foreign_key: 11}).length, 3);
    assert.equal(my_collection.where({foreign_key: 22}).length, 2);
  });

  it('works after a change', function () {
    var model = my_collection.get(7);
    model.set({foreign_key: 22});
    assert.equal(my_collection.where({foreign_key: 11}).length, 2);
    assert.equal(my_collection.where({foreign_key: 22}).length, 3);
  });

  it('works after another change', function () {
    var model = my_collection.get(7);
    model.set({foreign_key: 11});
    assert.equal(my_collection.where({foreign_key: 11}).length, 3);
    assert.equal(my_collection.where({foreign_key: 22}).length, 2);
  });
});
