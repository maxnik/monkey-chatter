const { IntegerObject } = require('./object')

function evaluate(node) {
	switch (node.constructor.name) {
		case 'Program':
			return eval_statements(node.statements)
			break
		case 'IntegerLiteral': 
			return new IntegerObject (node.value)
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

module.exports = {
	evaluate
}