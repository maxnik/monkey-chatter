const types = Object.freeze({
	NULL_OBJ: 'NULL',
	INTEGER_OBJ: 'INTEGER',
	BOOLEAN_OBJ: 'BOOLEAN',
	RETURN_VALUE_OBJ: 'RETURN_VALUE',
	ERROR_OBJ: 'ERROR'
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

class ErrorObject {
	constructor(message) {
		this.message = message
	}

	get type() {
		return types.ERROR_OBJ
	}

	inspect() {
		return `ERROR: ${this.message}`
	}
}

class Environment {
	store = {}

	get(name) {
		return this.store[name]
	}

	set(name, val) {
		this.store[name] = val
		return val
	}
}

module.exports = {
	types,
	NullObject,
	IntegerObject,
	BooleanObject,
	ReturnValue, 
	ErrorObject,
	Environment
}