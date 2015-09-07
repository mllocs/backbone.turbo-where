'use strict';

(function (root, factory) {
  if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.BackboneTurboWhere = factory();
  }
}(this, function () {

  /**
   * TurboWhere library
   *
   * @param {Backbone.Collection} collection
   */
  function TurboWhere(collection) {
    this.collection = collection;
    this.indexes = {};
  }

  /**
   * Groups the models by the attribute
   *
   * @param  {Backbone.Collection} collection
   * @param  {String} attr
   * @return {Object}
   */
  function grouper(collection, attr) {
    return collection.reduce(function (memo, model) {
      var val = model.get(attr);
      memo[val] = memo[val] || [];
      memo[val].push(model.id);
      return memo;
    }, {});
  }

  /**
   * Remove the element from the array
   *
   * @param  {Array} array
   * @param  {*}     value
   * @return {Array}
   */
  function removeFromArray(array, value) {
    var position = array.indexOf(value);
    if (~position) array.splice(position, 1);
    return array;
  }

  /**
   * Index setter
   *
   * @param {String} attr
   * @param {Object} index {1: [22, 23, 24], 2: [25, 26, 27]}
   */
  TurboWhere.prototype.setIndex = function (attr, index) {
    this.indexes[attr] = index;
  };

  /**
   * Index getter
   *
   * @param  {String} attr
   * @return {Object} index {1: [22, 23, 24], 2: [25, 26, 27]}
   */
  TurboWhere.prototype.getIndex = function (attr) {
    return this.indexes[attr] || {};
  };

  /**
   * Return true if the index exists
   *
   * @param  {String}  attr
   * @return {Boolean}
   */
  TurboWhere.prototype.hasIndex = function (attr) {
    return !!this.indexes[attr];
  };

  /**
   * Returns a function that builds the index for the given attributes
   *
   * @param  {Array<String>} attrs
   * @return {Function}
   */
  TurboWhere.prototype.indexBuilder = function (attrs) {
    var self = this;

    return function () {
      attrs.forEach(function (attr) {
        self.setIndex(attr, grouper(self.collection, attr));
      });
    };
  };

  /**
   * Return the models using the index
   *
   * @param  {String} attr
   * @param  {*}      value
   * @param  {Boolean} first
   * @return {Array<Backbone.Model>}
   */
  TurboWhere.prototype.getModels = function (attr, value, first) {
    var self = this;
    var ids = this.getIndex(attr)[value] || [];

    if (first) return ids[0] ? self.collection.get(ids[0]) : void 0;
    return ids.map(function (id) {
      return self.collection.get(id);
    });
  };

  /**
   * Like Backbone.Collection.prototype.where but uses the index if available
   *
   * @param  {Object}  filter {project_id: 1}
   * @param  {Boolean} first
   * @return {Array<Backbone.Model>}
   */
  TurboWhere.prototype.turboWhere = function (filter, first) {
    var keys = Object.keys(filter);

    if (keys.length === 1 && this.hasIndex(keys[0])) {
      return this.getModels(keys[0], filter[keys[0]], first);
    } else {
      return this.collection.constructor.prototype.where.apply(this.collection, arguments);
    }
  };

  /**
   * On collection add event
   *
   * @param  {Backbone.Model} model
   */
  TurboWhere.prototype._onAdd = function (model) {
    var self = this;

    Object.keys(this.indexes).forEach(function (key) {
      var ids = self.indexes[key][model.get(key)];
      ids = ids || [];
      ids.push(model.id);
      self.indexes[key][model.get(key)] = ids;
    });
  };

  /**
   * On collection remove event
   *
   * @param  {Backbone.Model} model
   */
  TurboWhere.prototype._onRemove = function (model) {
    var self = this;

    Object.keys(this.indexes).forEach(function (key) {
      var ids = self.indexes[key][model.get(key)];
      ids = removeFromArray(ids, model.id);
      self.indexes[key][model.get(key)] = ids;
    });
  };

  /**
   * On collection change event
   *
   * @param  {Backbone.Model} model
   */
  TurboWhere.prototype._onChange = function (model) {
    var self = this;

    Object.keys(model.changed).forEach(function (key) {
      if (self.hasIndex(key)) {
        var previous = model.previous(key);
        var tmp;

        tmp = self.indexes[key][previous];
        tmp = removeFromArray(tmp, model.id);
        self.indexes[key][previous] = tmp;

        var current = model.get(key);

        tmp = self.indexes[key][current];
        tmp = tmp || [];
        tmp.push(model.id);
        self.indexes[key][current] = tmp;
      }
    });
  };

  /**
   * TurboWhere setup API
   * Call it on initialize
   *
   * @param  {Backbone.Collection} collection
   * @param  {Array<String>} indexes ['user_id', 'project_id']
   */
  function setupIndexes(collection, indexes) {
    var tw = new TurboWhere(collection);

    collection.listenTo(collection, 'reset', tw.indexBuilder(indexes));
    collection.listenTo(collection, 'add', tw._onAdd.bind(tw));
    collection.listenTo(collection, 'remove', tw._onRemove.bind(tw));
    collection.listenTo(collection, 'change', tw._onChange.bind(tw));

    collection.__tw__ = tw;
    collection.where = tw.turboWhere.bind(tw);
  }

  return {setupIndexes: setupIndexes};

}));
