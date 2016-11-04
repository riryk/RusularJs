
function HashMap(array) {
    forEach(array, this.put, this);
};

HashMap.prototype = {
    put: function (key, value) {
        this[hashKey(key)] = value;
    },
    get: function (key) {
        return this[hashKey(key)];
    },
    remove: function (key) {
        var hash = hashKey(key);
        var value = this[hash];
        delete this[key];
        return value;
    }
};