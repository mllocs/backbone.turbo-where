# backbone.turbo-where

![](https://api.travis-ci.org/mllocs/backbone.turbo-where.svg) <a href='http://redbooth.com' target='_blank'>![](https://www.dropbox.com/s/qo4yp1tpbsvqfya/made-at-redbooth-blue.svg?dl=1)</a>

Get faster reads in Backbone Collections using indexes. The indexes will be calculated on collection `reset` and updated on `add`, `remove` and `change` events. It overrides the `where` method in the given collection object. The new `where` method will use the cached index if exists, otherwise, it will execute the regular `where` method.

## Example

```js
var MyCollection = Backbone.Collection.extend({
  initialize: function () {
    Backbone.Collection.prototype.initialize.apply(this, arguments);

    TurboWhere.setupIndexes(this, ['foreign_key']); // <= API
  }
});

var my_collection = new MyCollection([
  {id: 1, foreign_key: 11},
  {id: 2, foreign_key: 11},
  {id: 3, foreign_key: 11},
  {id: 4, foreign_key: 22},
  {id: 5, foreign_key: 22},
  {id: 6, foreign_key: 22}
]); // <= will setup the index

my_collection.where({foreign_key: 22}); // <= will use an index
my_collection.add({id: 7, foreign_key: 33}) // <= will update the index
my_collection.remove(1) // <= will update the index

var model = my_collection.get(2);
model.set({foreign_key: 44}); // <= will update the index
```
