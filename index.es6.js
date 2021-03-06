/* jshint node:true */

import { Promise } from 'es6-promise';

var KEYVALUE_API_VERSION = 1;

var indexedDB = window.indexedDB ||
                window.mozIndexedDB ||
                window.webkitIndexedDB ||
                window.msIndexedDB;

function wrap(req) {
  return new Promise(function (resolve, reject) {
    req.onsuccess = function (e) {
      resolve(req.result);
    };
    req.onerror = function (e) {
      reject(req.errorCode);
    };
  });
}

function KeyValueStore(storeName) {

  var self = this;
  self._ready = false;
  self.storeName = storeName;

  self.ready = new Promise(function (resolve, reject) {
    if (!indexedDB) {
      reject('No indexedDB implementation found!');
    }
    var req = indexedDB.open(self.storeName, KEYVALUE_API_VERSION);
    req.onsuccess = function (e) {
      self.db = req.result;
      resolve(self);
    };
    req.onupgradeneeded = function (e) {
      self.db = req.result;
      self.db.createObjectStore(self.storeName, { keyPath: 'key' });
      resolve(self);
    };
    req.onerror = reject;
  });

  self.ready.then(function() {
    self._ready = true;
  });

}

KeyValueStore.prototype = {

  get: function (key) {
    var self = this;
    if (self._ready) {
      return self._get(key);
    } else {
      return self.ready.then(function() {
        return self._get(key);
      });
    }
  },

  _get: function (key) {
    var self = this;
    var storeName = self.storeName;
    var transaction = self.db.transaction([storeName]);
    var store = transaction.objectStore(storeName);
    return new Promise(function (resolve, reject) {
      wrap(store.get(key)).then(function(row) {
        resolve(row ? row.value : undefined);
      }, reject);
    });
  },

  set: function (key, value) {
    var self = this;
    if (self._ready) {
      return self._set(key, value);
    } else {
      return self.ready.then(function() {
        return self._set(key, value);
      });
    }
  },

  _set: function (key, value) {
    var self = this;
    var storeName = self.storeName;
    var transaction = self.db.transaction([storeName], 'readwrite');
    var store = transaction.objectStore(storeName);
    return wrap(store.put({ 'key': key, 'value': value }));
  },

  remove: function (key) {
    var self = this;
    if (self._ready) {
      return self._remove(key);
    } else {
      return self.ready.then(function() {
        return self._remove(key);
      });
    }
  },

  _remove: function (key) {
    var self = this;
    var storeName = self.storeName;
    var transaction = self.db.transaction([storeName], 'readwrite');
    var store = transaction.objectStore(storeName);
    return wrap(store.delete(key));
  }

};

export { KeyValueStore };

