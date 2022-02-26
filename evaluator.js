const { Program, IntegerLiteral, BooleanLiteral,
		PrefixExpression, InfixExpression, IfExpression,
		BlockStatement, ExpressionStatement, ReturnStatement,
		LetStatement, Identifier, FunctionLiteral,
		CallExpression, StringLiteral, ArrayLiteral } = require('./ast/ast')
const { types, IntegerObject, BooleanObject, NullObject,
		ReturnValue, ErrorObject, Environment,
		FunctionObject, StringObject, BuiltinObject,
		ArrayObject } = require('./object')

const TRUE = new BooleanObject (true)
const FALSE = new BooleanObject (false)
const NULL  = new NullObject ()

const builtins = {
	'len': new BuiltinObject ((args) => {
		if (args.length !== 1) {
			return new ErrorObject(`wrong number of arguments. got=${args.length}, want=1`)
		}

		const arg = args[0]
		if (arg instanceof StringObject) {
			return new IntegerObject (arg.value.length)
		} else {
			return new ErrorObject (`argument to 'len' not supported, got ${arg.type}`)
		}
	})
}

function evaluate(node, env) {
	if (node instanceof Program) {
		return eval_program(node.statements, env)

	} else if (node instanceof IntegerLiteral) {
		return new IntegerObject (node.value)

	} else if (node instanceof BooleanLiteral) {
		return node.value ? TRUE : FALSE

 	} else if (node instanceof PrefixExpression) {
 		const operand = evaluate(node.right, env)
		if (is_error(operand)) {
			return operand
		}			
		return eval_prefix_expression(node.operator, operand)

 	} else if (node instanceof InfixExpression) {
 		const left = evaluate(node.left, env)
		if (is_error(left)) {
			return left
		}
		const right = evaluate(node.right, env)
		if (is_error(right)) {
			return right
		}
		return eval_inflix_expression(node.operator, left, right)

 	} else if (node instanceof IfExpression) {
 		return eval_if_expression(node, env)

 	} else if (node instanceof BlockStatement) {
 		return eval_block_statement(node.statements, env)

 	} else if (node instanceof ExpressionStatement) {
 		return evaluate(node.expression, env)

 	} else if (node instanceof ReturnStatement) {
 		const val = evaluate(node.return_value, env)
		if (is_error(val)) {
			return val
		}
		return new ReturnValue (val)

 	} else if (node instanceof LetStatement) {
 		const assigned_value = evaluate(node.value, env)
		if (is_error(assigned_value)) {
			return assigned_value
		}
		env.set(node.name.value, assigned_value)

 	} else if (node instanceof Identifier) {
 		return eval_identifier(node, env)

 	} else if (node instanceof FunctionLiteral) {
 		return new FunctionObject (node.parameters, node.body, env)

 	} else if (node instanceof CallExpression) {
 		const fn = evaluate(node.fn, env)
 		if (is_error(fn)) {
 			return fn
 		}

 		const args = eval_expressions(node.arguments, env)
 		if (args.length === 1 && is_error(args[0])) {
 			return args[0]
 		}

 		return apply_function(fn, args)

 	} else if (node instanceof StringLiteral) {
 		return new StringObject (node.value)

 	} else if (node instanceof ArrayLiteral) {
 		const elements = eval_expressions(node.elements, env)

 		if (elements.length === 1 && is_error(elements[0])) {
 			return elements[0]
 		}

 		return new ArrayObject (elements)
 	}
}

function eval_program(stmts, env) {
	let result = null

	for (const statement of stmts) {
		result = evaluate(statement, env)

		if (result instanceof ReturnValue) {
			return result.value
		} else if (result instanceof ErrorObject) {
			return result
		}
	}

	return result
}

function eval_block_statement(stmts, env) {
	let result = null

	for (const statement of stmts) {
		result = evaluate(statement, env)

		if (result) {
			if (result.type === types.RETURN_VALUE_OBJ || result.type === types.ERROR_OBJ) {
				return result
			}	
		}		
	}

	return result
}

function eval_prefix_expression(operator, right) {
	switch (operator) {
		case '!':
			return eval_bang_operator(right)
		case '-':
			return eval_minus_prefix_operator(right)
		default:
			return new ErrorObject(`unknown operator: ${operator}${right.type}`)
	}
}

function eval_inflix_expression(operator, left, right) {
	if (left.type === types.INTEGER_OBJ && right.type === types.INTEGER_OBJ) {
		return eval_integer_inflix_expression(operator, left, right)

	} else if (left.type === types.STRING_OBJ && right.type === types.STRING_OBJ) {
		return eval_string_infix_expression(operator, left, right)

	} else if (left.type !== right.type) {
		return new ErrorObject(`type mismatch: ${left.type} ${operator} ${right.type}`)

	} else if (operator === '==') {
		return left === right ? TRUE : FALSE

	} else if (operator === '!=') { 
		return left !== right ? TRUE : FALSE

	} else {
		return new ErrorObject(`unknown operator: ${left.type} ${operator} ${right.type}`)
	}
}

function eval_integer_inflix_expression(operator, left, right) {
	switch (operator) {
		case '+':
			return new IntegerObject (left.value + right.value)
		case '-':
			return new IntegerObject (left.value - right.value)
		case '*':
			return new IntegerObject (left.value * right.value)
		case '/':
			return new IntegerObject (left.value / right.value)
		case '<':
			return left.value < right.value ? TRUE : FALSE
		case '>':
			return left.value > right.value ? TRUE : FALSE
		case '==':
			return left.value === right.value ? TRUE : FALSE
		case '!=':
			return left.value !== right.value ? TRUE : FALSE
		default:
			return new ErrorObject(`unknown operator: ${left.type} ${operator} ${right.type}`)
	}
}

function eval_string_infix_expression(operator, left, right) {
	if (operator !== '+') {
		return new ErrorObject(`unknown operator: ${left.type} ${operator} ${right.type}`)
	}
	return new StringObject (left.value + right.value)
}

function eval_bang_operator(right) {
	switch (right) {
		case TRUE: 
			return FALSE
		case FALSE:
			return TRUE
		case NULL:
			return TRUE
		default:
			return FALSE
	}
}

function eval_minus_prefix_operator(right) {
	if (right.type !== types.INTEGER_OBJ) {
		return new ErrorObject(`unknown operator: -${right.type}`)
	} else {
		return new IntegerObject (-right.value)
	}
}

function eval_if_expression(ie, env) {
	const condition = evaluate(ie.condition, env)

	if (condition.type === types.ERROR_OBJ) {
		return condition
	}

	if (is_truthy(condition)) {
		return evaluate(ie.consequence, env)
	} else if (ie.alternative) {
		return evaluate(ie.alternative, env)
	} else {
		return NULL
	}
}

function eval_identifier(node, env) {
	
	const val = env.get(node.value)
	if (val) {
		return val		
	}

	const builtin = builtins[node.value]
	if (builtin) {
		return builtin
	}

	return new ErrorObject(`identifier not found: ${node.value}`)
}

function eval_expressions(exps, env) {
	const results = []

	for (const exp of exps) {
		const evaluated = evaluate(exp, env)
		
		if (is_error(evaluated)) {
			return [evaluated]
		}

		results.push(evaluated)
	}
	return results
}

function apply_function(fn, args) {
	if (fn instanceof FunctionObject) {
		const extended_env = extend_function_env(fn, args)
		const evaluated = evaluate(fn.body, extended_env)
		if (evaluated instanceof ReturnValue) {
			return evaluated.value
		}
		return evaluated

	} else if (fn instanceof BuiltinObject) {
		return fn.fn(args)
	} else {
		return new ErrorObject(`not a function: ${fn.type}`)
	}
}

function extend_function_env(fn, args) {
	const env = new Environment (fn.env)

	for (const [i, param] of fn.parameters.entries()) {
		env.set(param.value, args[i])
	}

	return env
}

function is_truthy(obj) {
	switch (obj) {
		case NULL:
			return false
		case TRUE:
			return true
		case FALSE:
			return false
		default:
			return true
	}
}

function is_error(obj) {
	return obj.type === types.ERROR_OBJ
}

module.exports = {
	evaluate
}