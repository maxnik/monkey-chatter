const Lexer = require('../lexer')
const { LetStatement, ReturnStatement, ExpressionStatement, Identifier } = require('../ast/ast')
const Parser = require('../parser/parser')

test('let statements', () => {
	const input = `let x = 5;
	let y = 10;
	let foobar = 838383;
	`

	const l = new Lexer (input)
	const p = new Parser (l)

	const program = p.parse_program()
	expect(program.statements.length).toBe(3)
	expect(p.errors.length).toBe(0)

	const expected_identifiers = ['x', 'y', 'foobar']
	for (const [i, identifier] of expected_identifiers.entries()) {
		const statement = program.statements[i]

		expect(statement).toBeInstanceOf(LetStatement)
		expect(statement.token_literal()).toBe('let')
		// expect(statement.name.value).toBe(identifier)
		expect(statement.name.token_literal()).toBe(identifier)
	}
})

test("handles tokens that aren't of expected type in let statements", () => {
	const input = `let x 5;
	let y = 10;
	let = 838383;
	`

	const l = new Lexer (input)
	const p = new Parser (l)
	const program = p.parse_program()

	// expect(program.statements.length).toBe(1)
	expect(p.errors.length).toBe(2)
	expect(p.errors[0]).toBe('expected next token to be =, got INT instead')
	expect(p.errors[1]).toBe('expected next token to be IDENT, got = instead')
})

test('return statements', () => {
	const input = `return 5;
	return 10;
	return 993322;
	`

	const l = new Lexer (input)
	const p = new Parser (l)

	const program = p.parse_program()
	expect(program.statements.length).toBe(3)
	expect(p.errors.length).toBe(0)

	for (const stmt of program.statements.values()) {
		expect(stmt).toBeInstanceOf(ReturnStatement)
		expect(stmt.token_literal()).toBe('return')
	}
})

test('identifier expression', () => {
	const input = 'foobar;'
	const l = new Lexer (input)
	const p = new Parser (l)
	program = p.parse_program()
	
	check_parser_errors(p)
	expect(program.statements.length).toBe(1)
	
	const expression_statement = program.statements[0]
	expect(expression_statement).toBeInstanceOf(ExpressionStatement)
	
	const ident = expression_statement.expression
	expect(ident).toBeInstanceOf(Identifier)
	expect(ident.value).toBe('foobar')
	expect(ident.token_literal()).toBe('foobar')
})

function check_parser_errors(parser) {
	try {
		expect(parser.errors.length).toBe(0)
	} catch {
		throw new Error(parser.errors.join('///'))
	}
}
