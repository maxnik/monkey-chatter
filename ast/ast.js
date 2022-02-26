class Program {
	constructor() {
		this.statements = []
	}

	token_literal() {
		if (this.statements.length > 0) {
			return this.statements[0].token_literal()
		} else {
			return ''
		}
	}

	toString() {
		return this.statements.map(s => s.toString()).join('')
	}
}

class LetStatement {
	name = null
	// value - an instance of Expression

	constructor(token) {
		this.token = token
	}

	statement_node() {
		// part of Statement interface
	}

	token_literal() {
		// part of the Node interface, returns debug information
		return this.token.literal
	}

	toString() {
		let s = `${this.token.literal} ${this.name.toString()} = `
		if (this.value) {
			s += this.value.toString()
		}
		s += ';'
		return s
	}
}

class Identifier {
	constructor(token, value) {
		this.token = token // the token_types.IDENT token
		this.value = value
	}

	expression_node() {
		// part of Expression interface
	}

	token_literal() {
		return this.token.literal
	}

	toString() {
		return this.value
	}
}

class ReturnStatement {
	return_value = null

	constructor(token) {
		this.token = token
	}

	statement_node() {

	}

	token_literal() {
		return this.token.literal
	}

	toString() {
		let s = `${this.token.literal} `
		if (this.return_value) {
			s += this.return_value.toString()
		}
		s += ';'
		return s
	}
}

class ExpressionStatement {
	expression = null

	constructor(token) {
		this.token = token
	}

	statement_node() {

	}

	token_literal() {
		return this.token.literal
	}

	toString() {
		if (this.expression) {
			return this.expression.toString()
		}
		return ''
	}
}

class IntegerLiteral {
	value = null

	constructor(token) {
		this.token = token
	}

	token_literal() {
		return this.token.literal
	}

	toString() {
		return this.token.literal
	}
}

class StringLiteral {
	constructor(token, value) {
		this.token = token
		this.value = value
	}

	token_literal() {
		return this.token.literal
	}

	toString() {
		return this.token.literal
	}
}

class BooleanLiteral {

	constructor(token, value) {
		this.token = token
		this.value = value
	}

	token_literal() {
		return this.token.literal
	}

	toString() {
		return this.token.literal
	}
}

class PrefixExpression {
	right = null 

	constructor(token, operator) {
		this.token = token
		this.operator = operator
	}

	token_literal() {
		return this.token.literal
	}

	toString() {
		return `(${this.operator}${this.right.toString()})`
	}
}

class InfixExpression {
	left = null
	right = null

	constructor(token, operator, left) {
		this.token = token
		this.operator = operator
		this.left = left
	}

	toString() {
		return `(${this.left.toString()} ${this.operator} ${this.right.toString()})`
	}
}

class IfExpression {
	condition = null
	consequence = null
	alternative = null

	constructor(token) {
		this.token = token
	}

	token_literal() {
		return this.token.literal
	}

	toString() {
		const alternative = this.alternative ? `else ${this.alternative.toString()}` : ''

		return `if ${this.condition.toString()} ${this.consequence.toString()} ${alternative}`
	}
}

class BlockStatement {
	statements = []

	constructor(token) {
		this.token = token // the { token
	}

	token_literal() {
		return this.token.literal
	}

	toString() {
		return this.statements.map(s => s.toString()).join('')
	}
}

class FunctionLiteral {
	parameters = null
	body = null

	constructor(token) {
		this.token = token
	}

	token_literal() {
		return this.token.literal
	}

	toString() {
		const params = this.parameters.map(p => p.toString()).join(', ')

		return `${this.token_literal()}(${params}) { ${this.body.toString()} }`
	}
}

class CallExpression {
	fn = null
	arguments = null

	constructor(token, fn) {
		this.token = token
		this.fn = fn
	}

	token_literal() {
		return this.token.literal
	}

	toString() {
		const args = this.arguments.map(a => a.toString()).join(', ')

		return `${this.fn.toString()}(${args})`
	}
}

class ArrayLiteral {
	elements = null

	constructor(token, elements) {
		this.token = token
	}

	token_literal() {
		return this.token.literal
	}

	toString() {
		const elems = this.elements.map(e => e.toString()).join(', ')

		return `[${elems}]`
	}
}

class IndexExpression {
	index = null

	constructor(token, left) {
		this.token = token
		this.left = left
	}

	token_literal() {
		return this.token.literal
	}

	toString() {
		return `(${this.left.toString()}[${this.index.toString()}])`
	}
}

module.exports = {
	Program,
	LetStatement,
	Identifier,
	ReturnStatement,
	ExpressionStatement,
	IntegerLiteral,
	StringLiteral,
	BooleanLiteral,
	PrefixExpression,
	InfixExpression,
	IfExpression,
	BlockStatement,
	FunctionLiteral,
	CallExpression,
	ArrayLiteral,
	IndexExpression
}