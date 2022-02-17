const types = Object.freeze({
	NULL_OBJ: 'NULL',
	INTEGER_OBJ: 'INTEGER',
	BOOLEAN_OBJ: 'BOOLEAN'
})

class NullObject {
	get type() {
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

	get type() {
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

	get type() {
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