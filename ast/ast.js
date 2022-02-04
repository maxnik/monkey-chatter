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
}

class LetStatement {
	// value - an instance of Expression

	constructor(token) {
		this.token = token
		this.name = null // an instance of Identifier
	}

	statement_node() {
		// part of Statement interface
	}

	token_literal() {
		// part of the Node interface, returns debug information
		return this.token.literal
	}
}

class Identifier {
	// value - string

	constructor(token) {
		this.token = token // the token_types.IDENT token
	}

	expression_node() {
		// part of Expression interface
	}

	token_literal() {
		return this.token.literal
	}
}

module.exports = {
	Program,
	LetStatement,
	Identifier
}