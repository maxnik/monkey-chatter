const { types, IntegerObject, BooleanObject, NullObject } = require('./object')

const TRUE = new BooleanObject (true)
const FALSE = new BooleanObject (false)
const NULL  = new NullObject ()

function evaluate(node) {
	switch (node.constructor.name) {
		case 'Program':
			return eval_statements(node.statements)
			break
		case 'IntegerLiteral': 
			return new IntegerObject (node.value)
			break
		case 'BooleanLiteral':
			return node.value ? TRUE : FALSE
			break
		case 'PrefixExpression':
			const right = evaluate(node.right)
			return eval_prefix_expression(node.operator, right)
			break
		case 'ExpressionStatement':
			return evaluate(node.expression)
	}
}

function eval_statements(stmts) {
	let result = null

	for (const statement of stmts) {
		result = evaluate(statement)
	}

	return result
}

function eval_prefix_expression(operator, right) {
	switch (operator) {
		case '!':
			return eval_bang_operator(right)
			break
		case '-':
			return eval_minus_prefix_operator(right)
			break
		default:
			return NULL
	}
}

function eval_bang_operator(right) {
	switch (right) {
		case TRUE: 
			return FALSE
			break
		case FALSE:
			return TRUE
			break
		case NULL:
			return TRUE
			break
		default:
			return FALSE
			null
	}
}

function eval_minus_prefix_operator(right) {
	if (right.type() !== types.INTEGER_OBJ) {
		return NULL
	} else {
		return new IntegerObject (-right.value)
	}
}

module.exports = {
	evaluate
}