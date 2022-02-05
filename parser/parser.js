const { Program, LetStatement, Identifier, ReturnStatement} = require('../ast/ast')
const token_types = require('../token/token_types')

class Parser {
	errors = []

	constructor(lexer) {
		this.l = lexer

		// Read two tokens, so cur_token and peek_token are both set
		this.next_token()
		this.next_token()
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
				return null
		}
	}

	parse_let_statement() {
		const stmt = new LetStatement (this.cur_token)

		if (! this.expect_peek(token_types.IDENT)) {
			return null
		}

		stmt.name = new Identifier (this.cur_token)

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

module.exports = Parser