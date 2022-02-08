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
	// value - an instance of Expression

	constructor(token, name) {
		this.token = token
		this.name = name // an instance of Identifier
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

module.exports = {
	Program,
	LetStatement,
	Identifier,
	ReturnStatement,
	ExpressionStatement,
	IntegerLiteral,
	PrefixExpression,
	InfixExpression
}