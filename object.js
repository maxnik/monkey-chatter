const types = Object.freeze({
	NULL_OBJ:     'NULL',
	INTEGER_OBJ:  'INTEGER',
	BOOLEAN_OBJ:  'BOOLEAN',
	RETURN_VALUE_OBJ: 'RETURN_VALUE',
	ERROR_OBJ:    'ERROR',
	FUNCTION_OBJ: 'FUNCTION',
	STRING_OBJ:   'STRING',
	BUILTIN_OBJ:  'BUILTIN',
	ARRAY_OBJ:    'ARRAY',
	HASH_OBJ:     'HASH'
})

class NullObject {
	get type() {
		return types.NULL_OBJ
	}

	inspect() {
		return 'null'
	}
}

const NULL  = new NullObject ()

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

	toString() {
		return this.value
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

class HashPair {
	constructor(key, value) {
		this.key = key
		this.value = value
	}
}

class HashObject {
	constructor() {
		this.pairs = new Map ()
	}

	get type() {
		return types.HASH_OBJ
	}

	set(key, value) {
		return this.pairs.set(key.toString(), new HashPair (key, value))
	}

	get(key) {
		return this.pairs.get(key.toString())
	}

	inspect() {
		const pairs = Array.from(this.pairs, ([key, hash_pair]) => {
			return `${hash_pair.key.inspect()}:${hash_pair.value.inspect()}`
		}).join(', ')

		return `{${pairs}}`
	}
}

module.exports = {
	types,
	NullObject,
	NULL,
	IntegerObject,
	BooleanObject,
	ReturnValue, 
	ErrorObject,
	Environment,
	FunctionObject,
	StringObject,
	BuiltinObject,
	ArrayObject,
	HashObject
}