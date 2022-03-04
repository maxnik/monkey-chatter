const { types, BuiltinObject, ErrorObject, 
		IntegerObject, ArrayObject, StringObject,
		NULL } = require('./object')

module.exports = {
	'len': new BuiltinObject ((args) => {
		if (args.length !== 1) {
			return new ErrorObject(`wrong number of arguments. got=${args.length}, want=1`)
		}

		const arg = args[0]
		if (arg instanceof StringObject) {
			return new IntegerObject (arg.value.length)
		} else if (arg instanceof ArrayObject) {
			return new IntegerObject (arg.elements.length)
		} else {
			return new ErrorObject (`argument to 'len' not supported, got ${arg.type}`)
		}
	}),
	'first': new BuiltinObject ((args) => {
		if (args.length !== 1) {
			return new ErrorObject(`wrong number of arguments. got=${args.length}, want=1`)
		}
		if (args[0].type !== types.ARRAY_OBJ) {
			return new ErrorObject(`argument to 'first' must be ARRAY, got ${args[0].type}`)
		}
		if (args[0].elements.length > 0) {
			return args[0].elements[0]
		}

		return NULL
	}),
	'last': new BuiltinObject ((args) => {
		if (args.length !== 1) {
			return new ErrorObject(`wrong number of arguments. got=${args.length}, want=1`)
		}
		if (args[0].type !== types.ARRAY_OBJ) {
			return new ErrorObject(`argument to 'last' must be ARRAY, got ${args[0].type}`)
		}
		const length = args[0].elements.length
		if (length > 0) {
			return args[0].elements[length - 1]
		}

		return NULL
	}),
	'rest': new BuiltinObject ((args) => {
		if (args.length !== 1) {
			return new ErrorObject(`wrong number of arguments. got=${args.length}, want=1`)
		}
		if (args[0].type !== types.ARRAY_OBJ) {
			return new ErrorObject(`argument to 'rest' must be ARRAY, got ${args[0].type}`)
		}
		const elements = args[0].elements
		if (elements.length > 0) {
			return new ArrayObject ( [...elements.slice(1)] )
		}

		return NULL
	}),
	'push': new BuiltinObject ((args) => {
		if (args.length !== 2) {
			return new ErrorObject(`wrong number of arguments. got=${args.length}, want=2`)
		}
		if (args[0].type !== types.ARRAY_OBJ) {
			return new ErrorObject(`argument to 'push' must be ARRAY, got ${args[0].type}`)
		}
		
		const array = args[0].elements
		const new_element = args[1]
		return new ArrayObject (array.concat(new_element))
	}),
	'puts': new BuiltinObject ((args) => {
		for (const arg of args) {
			console.log(arg.inspect())
		}

		return NULL
	})
}