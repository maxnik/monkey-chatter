const { Program, LetStatement, Identifier, 
	ReturnStatement, ExpressionStatement, IntegerLiteral,
	PrefixExpression } = require('../ast/ast')
const token_types = require('../token/token_types')

const precedences = Object.freeze({
	LOWEST: 1,
	EQUALS: 2,      // ==
	LESSGREATER: 3, // > or <
	SUM: 4,         // +
	PRODUCT: 5,     // *
	PREFIX: 6,      // -X or !X
	CALL: 7         // myFunction(X)
})

class Parser {
	errors = []
	prefix_parse_fns = {}

	constructor(lexer) {
		this.l = lexer

		// Read two tokens, so cur_token and peek_token are both set
		this.next_token()
		this.next_token()

		this.prefix_parse_fns[token_types.IDENT] = parse_identifier
		this.prefix_parse_fns[token_types.INT] = parse_integer_literal
		this.prefix_parse_fns[token_types.BANG] = parse_prefix_expression
		this.prefix_parse_fns[token_types.MINUS] = parse_prefix_expression
	}

	next_token() {
		this.cur_token = this.peek_token
		this.peek_token = this.l.next_token()
	}

	parse_program() {
		this.program = new Program()

		while (this.cur_token.type != token_types.EOF) {
			const statement = this.parse_statement()

			if (statement) {
				this.program.statements.push(statement)
			}

			this.next_token()
		}

		return this.program
	}

	parse_statement() {
		switch (this.cur_token.type) {
			case token_types.LET:
				return this.parse_let_statement()
				break
			case token_types.RETURN:
				return this.parse_return_statement()
				break
			default:
				return this.parse_expression_statement()
		}
	}

	parse_let_statement() {
		const stmt = new LetStatement (this.cur_token)

		if (! this.expect_peek(token_types.IDENT)) {
			return null
		}

		stmt.name = new Identifier (this.cur_token, null)

		if (! this.expect_peek(token_types.ASSIGN)) {
			return null
		}

		while (this.cur_token.type !== token_types.SEMICOLON) {
			// We're skipping the expressions until we encounter a semicolon
			this.next_token()
		}

		return stmt
	}

	parse_return_statement() {
		const stmt = new ReturnStatement (this.cur_token)

		this.next_token()

		while (this.cur_token.type !== token_types.SEMICOLON) {
			// We're skipping the expressions until we encounter a semicolon
			this.next_token()
		}

		return stmt
	}

	parse_expression_statement() {
		const stmt = new ExpressionStatement (this.cur_token)

		stmt.expression = this.parse_expression(precedences.LOWEST)

		if (this.peek_token.type === token_types.SEMICOLON) {
			this.next_token()
		}

		return stmt
	}

	parse_expression(precedence) {
		const prefix = this.prefix_parse_fns[this.cur_token.type]
		if (! prefix) {
			this.errors.push(`no prefix parse function for ${this.cur_token.type} found`)
			return null
		}
		const left_expression = prefix(this)

		return left_expression
	}

	expect_peek(token_type) {
		if (this.peek_token.type === token_type) {
			this.next_token()
			return true
		} else {
			this.peek_error(token_type)
			return false
		}
	}

	peek_error(expected) {
		const actual = this.peek_token.type
		const msg = `expected next token to be ${expected}, got ${actual} instead`
		this.errors.push(msg)
	}
}

const parse_identifier = (parser) => {
	return new Identifier (parser.cur_token, parser.cur_token.literal)
}

const parse_integer_literal = (parser) => {
		const lit = new IntegerLiteral (parser.cur_token)

		const value = parseInt(parser.cur_token.literal)
		if (typeof(value) != 'number') {
			parser.errors.push(`could not parse ${parser.cur_token.literal} as integer`)
			return null
		}

		lit.value = value
		return lit
}

const parse_prefix_expression = (parser) => {
	const expression = new PrefixExpression (
		parser.cur_token, parser.cur_token.literal)

	parser.next_token()
	expression.right = parser.parse_expression(precedences.PREFIX)

	return expression
}

module.exports = Parser