const types = Object.freeze({
	NULL_OBJ: 'NULL',
	INTEGER_OBJ: 'INTEGER',
	BOOLEAN_OBJ: 'BOOLEAN'
})

class NullObject {
	type() {
		return types.NULL_OBJ
	}

	inspect() {
		return 'null'
	}
}

class IntegerObject {
	constructor(value) {
		this.value = value
	}

	type() {
		return types.INTEGER_OBJ
	}

	inspect() {
		return this.value.toString()
	}
}

class BooleanObject {
	constructor(value) {
		this.value = value
	}

	type() {
		return types.BOOLEAN_OBJ
	}

	inspect() {
		return this.value.toString()
	}
}

module.exports = {
	types,
	NullObject,
	IntegerObject,
	BooleanObject
}