const types = Object.freeze({
	NULL_OBJ: 'NULL',
	INTEGER_OBJ: 'INTEGER',
	BOOLEAN_OBJ: 'BOOLEAN',
	RETURN_VALUE_OBJ: 'RETURN_VALUE'
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

class ReturnValue {
	constructor(value) {
		this.value = value
	}

	get type() {
		return types.RETURN_VALUE_OBJ
	}

	inspect() {
		return this.value.inspect()
	}
}

module.exports = {
	types,
	NullObject,
	IntegerObject,
	BooleanObject,
	ReturnValue
}