const types = Object.freeze({
	NULL_OBJ:     'NULL',
	INTEGER_OBJ:  'INTEGER',
	BOOLEAN_OBJ:  'BOOLEAN',
	RETURN_VALUE_OBJ: 'RETURN_VALUE',
	ERROR_OBJ:    'ERROR',
	FUNCTION_OBJ: 'FUNCTION',
	STRING_OBJ:   'STRING',
	BUILTIN_OBJ:  'BUILTIN',
	ARRAY_OBJ:    'ARRAY'
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

	constructor(outer) {
		if (outer) {
			this.outer = outer
		}
	}

	get(name) {
		let obj = this.store[name]

		if ( !obj && this.outer) {
			obj = this.outer.get(name)
		}

		return obj
	}

	set(name, val) {
		this.store[name] = val
		return val
	}
}

class FunctionObject {
	constructor(parameters, body, env) {
		this.parameters = parameters
		this.body = body
		this.env = env
	}

	get type() {
		return types.FUNCTION_OBJ
	}

	inspect() {
		const params = this.parameters.map( p => p.toString() ).join(', ')

		return `fn(${params}) {\n${this.body.toString()}\n}`
	}
}

class StringObject {
	constructor(value) {
		this.value = value
	}

	get type() {
		return types.STRING_OBJ
	}

	inspect() {
		return `"${this.value}"`
	}
}

class BuiltinObject {
	constructor(fn) {
		this.fn = fn
	}

	get type() {
		return types.BUILTIN_OBJ
	}

	inspect() {
		return 'builtin function'
	}
}

class ArrayObject {
	constructor(elements) {
		this.elements = elements
	}

	get type() {
		return types.ARRAY_OBJ
	}

	inspect() {
		const elems = this.elements.map( e => e.inspect() ).join(', ')

		return `[${elems}]`
	}
}

module.exports = {
	types,
	NullObject,
	IntegerObject,
	BooleanObject,
	ReturnValue, 
	ErrorObject,
	Environment,
	FunctionObject,
	StringObject,
	BuiltinObject,
	ArrayObject
}