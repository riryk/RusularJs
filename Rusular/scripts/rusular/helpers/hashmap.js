
function HashMap(array) {
	function nextUid() {
	};

	function getHashKeyForObject(object) {
		if (object.$$hashKey === "function") {
			return object.$$hashKey();
		}
		object.$$hashKey = nextUid();
		return object.$$hashKey;
	};

	function hashKey(object) {
		var objType = typeof object,
            key;

		if (objType === "object" && object !== null) {
			key = getHashKeyForObject(object);
		} else {
			key = object;
		}

		return objType + ":" + key;
	}

	forEach(array, this.put, this);

    return {
        put: function (key, value) {
            var hash = hashKey(key);
            this[hash] = value;
        },
        get: function (key) {
            var hash = hashKey(key);
            return this[hash];
        },
        remove: function (key) {
            var hash = hashKey(key);
            var value = this[hash];
            delete this[hash];
            return value;
        }
    };
}