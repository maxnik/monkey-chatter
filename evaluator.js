const { types, IntegerObject, BooleanObject, NullObject,
		ReturnValue } = require('./object')

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
			return eval_prefix_expression(node.operator, operand)
		case 'InfixExpression':
			const left = evaluate(node.left)
			const right = evaluate(node.right)
			return eval_inflix_expression(node.operator, left, right)
		case 'IfExpression':
			return eval_if_expression(node)
		case 'BlockStatement':
			return eval_block_statement(node.statements)
		case 'ExpressionStatement':
			return evaluate(node.expression)
		case 'ReturnStatement':
			return new ReturnValue (evaluate(node.return_value))
	}
}

function eval_program(stmts) {
	let result = null

	for (const statement of stmts) {
		result = evaluate(statement)

		if (result.constructor.name === 'ReturnValue') {
			return result.value
		}
	}

	return result
}

function eval_block_statement(stmts) {
	let result = null

	for (const statement of stmts) {
		result = evaluate(statement)

		if (result && result.type === types.RETURN_VALUE_OBJ) {
			return result
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
			return NULL
	}
}

function eval_inflix_expression(operator, left, right) {
	if (left.type === types.INTEGER_OBJ && right.type === types.INTEGER_OBJ) {
		return eval_integer_inflix_expression(operator, left, right)
	} else if (operator === '==') {
		return left === right ? TRUE : FALSE
	} else if (operator === '!=') { 
		return left !== right ? TRUE : FALSE
	} else {
		return NULL
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
			return NULL
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
		return NULL
	} else {
		return new IntegerObject (-right.value)
	}
}

function eval_if_expression(ie) {
	const condition = evaluate(ie.condition)

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