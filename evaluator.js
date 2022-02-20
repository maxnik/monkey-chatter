const { types, IntegerObject, BooleanObject, NullObject,
		ReturnValue, ErrorObject } = require('./object')

const TRUE = new BooleanObject (true)
const FALSE = new BooleanObject (false)
const NULL  = new NullObject ()

function evaluate(node) {
	switch (node.constructor.name) {
		case 'Program':
			return eval_program(node.statements)

		case 'IntegerLiteral': 
			return new IntegerObject (node.value)

		case 'BooleanLiteral':
			return node.value ? TRUE : FALSE

		case 'PrefixExpression':
			const operand = evaluate(node.right)
			if (operand.type === types.ERROR_OBJ) {
				return operand
			}			
			return eval_prefix_expression(node.operator, operand)

		case 'InfixExpression':
			const left = evaluate(node.left)
			if (left.type === types.ERROR_OBJ) {
				return left
			}
			const right = evaluate(node.right)
			if (right.type === types.ERROR_OBJ) {
				return right
			}
			return eval_inflix_expression(node.operator, left, right)

		case 'IfExpression':
			return eval_if_expression(node)

		case 'BlockStatement':
			return eval_block_statement(node.statements)

		case 'ExpressionStatement':
			return evaluate(node.expression)

		case 'ReturnStatement':
			const val = evaluate(node.return_value)
			if (val.type === types.ERROR_OBJ) {
				return val
			}
			return new ReturnValue (val)
	}
}

function eval_program(stmts) {
	let result = null

	for (const statement of stmts) {
		result = evaluate(statement)

		switch (result.constructor.name) {
			case 'ReturnValue':
				return result.value
			case 'ErrorObject':
				return result
		}
	}

	return result
}

function eval_block_statement(stmts) {
	let result = null

	for (const statement of stmts) {
		result = evaluate(statement)

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

function eval_if_expression(ie) {
	const condition = evaluate(ie.condition)

	if (condition.type === types.ERROR_OBJ) {
		return condition
	}

	if (is_truthy(condition)) {
		return evaluate(ie.consequence)
	} else if (ie.alternative) {
		return evaluate(ie.alternative)
	} else {
		return NULL
	}
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

module.exports = {
	evaluate
}