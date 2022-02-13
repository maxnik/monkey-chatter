const { Program, LetStatement, Identifier, 
	ReturnStatement, ExpressionStatement, IntegerLiteral,
	BooleanLiteral, PrefixExpression, InfixExpression,
	IfExpression, BlockStatement, FunctionLiteral,
	CallExpression } = require('../ast/ast')
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

const token_p = {}
token_p[token_types.EQ] = precedences.EQUALS
token_p[token_types.NOT_EQ] = precedences.EQUALS
token_p[token_types.NOT_EQ] = precedences.EQUALS
token_p[token_types.LT] = precedences.LESSGREATER
token_p[token_types.GT] = precedences.LESSGREATER
token_p[token_types.PLUS] = precedences.SUM
token_p[token_types.MINUS] = precedences.SUM
token_p[token_types.SLASH] = precedences.PRODUCT
token_p[token_types.ASTERISK] = precedences.PRODUCT
token_p[token_types.LPAREN] = precedences.CALL
const token_precedences = Object.freeze(token_p)

class Parser {
	errors = []
	prefix_parse_fns = {}
	infix_parse_fns = {}

	constructor(lexer) {
		this.l = lexer

		// Read two tokens, so cur_token and peek_token are both set
		this.next_token()
		this.next_token()

		this.prefix_parse_fns[token_types.IDENT] = parse_identifier
		this.prefix_parse_fns[token_types.INT] = parse_integer_literal
		this.prefix_parse_fns[token_types.BANG] = parse_prefix_expression
		this.prefix_parse_fns[token_types.MINUS] = parse_prefix_expression
		this.prefix_parse_fns[token_types.TRUE] = parse_boolean
		this.prefix_parse_fns[token_types.FALSE] = parse_boolean
		this.prefix_parse_fns[token_types.LPAREN] = parse_grouped_expression
		this.prefix_parse_fns[token_types.IF] = parse_if_expression
		this.prefix_parse_fns[token_types.FUNCTION] = parse_function_literal

		this.infix_parse_fns[token_types.PLUS] = parse_infix_expression
		this.infix_parse_fns[token_types.MINUS] = parse_infix_expression
		this.infix_parse_fns[token_types.SLASH] = parse_infix_expression
		this.infix_parse_fns[token_types.ASTERISK] = parse_infix_expression
		this.infix_parse_fns[token_types.EQ] = parse_infix_expression
		this.infix_parse_fns[token_types.NOT_EQ] = parse_infix_expression
		this.infix_parse_fns[token_types.LT] = parse_infix_expression
		this.infix_parse_fns[token_types.GT] = parse_infix_expression
		this.infix_parse_fns[token_types.LPAREN] = parse_call_expression
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
		
		let left_expression = prefix(this)

		while (this.peek_token.type !== token_types.SEMICOLON && precedence < this.peek_precedence()) {
			const infix = this.infix_parse_fns[this.peek_token.type]
			if (! infix) {
				return left_expression
			}

			this.next_token()
			left_expression = infix(this, left_expression)

		}

		return left_expression
	}

	parse_block_statement() {
		const block = new BlockStatement(this.cur_token)

		this.next_token()

		while (this.cur_token.type !== token_types.RBRACE 
			&& this.cur_token.type !== token_types.EOF) {
			
			const stmt = this.parse_statement()
			if (stmt) {
				block.statements.push(stmt)
			}
			this.next_token()
		}

		return block
	}

	parse_function_parameters() {
		const identifiers = []

		if (this.peek_token.type === token_types.RPAREN) {
			this.next_token()
			return identifiers
		}

		this.next_token()

		let ident = new Identifier (this.cur_token, this.cur_token.literal)
		identifiers.push(ident)

		while (this.peek_token.type === token_types.COMMA) {
			this.next_token()
			this.next_token()

			ident = new Identifier (this.cur_token, this.cur_token.literal)
			identifiers.push(ident)
		}

		if (! this.expect_peek(token_types.RPAREN)) {
			return null
		}

		return identifiers
	}

	parse_call_arguments() {
		const args = []

		if (this.peek_token.type === token_types.RPAREN) {
			this.next_token()
			return args
		}

		this.next_token()
		args.push(this.parse_expression(precedences.LOWEST))

		while (this.peek_token.type === token_types.COMMA) {
			this.next_token()
			this.next_token()
			args.push(this.parse_expression(precedences.LOWEST))
		}

		if (! this.expect_peek(token_types.RPAREN)) {
			return null
		}

		return args
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

	cur_precedence() {
		return token_precedences[this.cur_token.type] || precedences.LOWEST
	}

	peek_precedence() {
		return token_precedences[this.peek_token.type] || precedences.LOWEST
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

const parse_boolean = (parser) => {
	const token = parser.cur_token
	return new BooleanLiteral(token, token.type === token_types.TRUE)
}

const parse_prefix_expression = (parser) => {
	const expression = new PrefixExpression (
		parser.cur_token, parser.cur_token.literal)

	parser.next_token()
	expression.right = parser.parse_expression(precedences.PREFIX)

	return expression
}

const parse_infix_expression = (parser, left) => {
	const expression = new InfixExpression (
		parser.cur_token, parser.cur_token.literal, left)

	const precedence = parser.cur_precedence()
	parser.next_token()
	expression.right = parser.parse_expression(precedence)

	return expression
}

const parse_grouped_expression = (parser) => {
	parser.next_token()

	const exp = parser.parse_expression(precedences.LOWEST)

	if (! parser.expect_peek(token_types.RPAREN)) {
		return null
	}

	return exp
}

const parse_if_expression = (parser) => {
	const expression = new IfExpression(parser.cur_token)

	if (! parser.expect_peek(token_types.LPAREN)) {
		return null
	}

	parser.next_token()
	expression.condition = parser.parse_expression(precedences.LOWEST)

	if (! parser.expect_peek(token_types.RPAREN)) {
		return null
	}

	if (! parser.expect_peek(token_types.LBRACE)) {
		return null
	}

	expression.consequence = parser.parse_block_statement()

	if (parser.peek_token.type === token_types.ELSE) {
		// not expect_peek because we allow an optional else block
		// but don't add parser error is there is none
		parser.next_token()

		if (! parser.expect_peek(token_types.LBRACE)) {
			return null
		}

		expression.alternative = parser.parse_block_statement()
	}

	return expression
}

const parse_function_literal = (parser) => {
	const fn = new FunctionLiteral (parser.cur_token)

	if (! parser.expect_peek(token_types.LPAREN)) {
		return null
	}

	fn.parameters = parser.parse_function_parameters()

	if (! parser.expect_peek(token_types.LBRACE)) {
		return null
	}

	fn.body = parser.parse_block_statement()

	return fn
}

const parse_call_expression = (parser, fn) => {
	const exp = new CallExpression (parser.cur_token, fn)

	exp.arguments = parser.parse_call_arguments()

	return exp
}

module.exports = Parser