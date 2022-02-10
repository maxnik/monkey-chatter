const Lexer = require('../lexer')
const { LetStatement, ReturnStatement, ExpressionStatement, 
	Identifier, IntegerLiteral, BooleanLiteral,
	PrefixExpression, InfixExpression } = require('../ast/ast')
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
	// expect(p.errors.length).toBe(2)
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

test('integer literal expression', () => {
	const input = '5;'
	const p = new Parser (new Lexer (input))
	const program = p.parse_program()

	check_parser_errors(p)
	expect(program.statements.length).toBe(1)
	
	const stmt = program.statements[0]
	expect(stmt).toBeInstanceOf(ExpressionStatement)
	expect(stmt.expression).toBeInstanceOf(IntegerLiteral)
	expect(stmt.expression.value).toBe(5)
	expect(stmt.expression.token_literal()).toBe('5')	
})

test('prefix expressions', () => {
	const prefix_tests = [
		['!5;',      '!', 5],
		['-15;',     '-', 15],
		['!foobar;', '!', 'foobar'],
		['-foobar;', '-', 'foobar'],
		['!true;',   '!', true],
		['!false;',  '!', false]]

	for (const [input, operator, value] of prefix_tests) {
		const p = new Parser (new Lexer (input))
		const program = p.parse_program()

		check_parser_errors(p)
		expect(program.statements.length).toBe(1)

		const stmt = program.statements[0]
		expect(stmt).toBeInstanceOf(ExpressionStatement)

		expect(stmt.expression).toBeInstanceOf(PrefixExpression)
		expect(stmt.expression.operator).toBe(operator)
		test_literal_expression(stmt.expression.right, value)
	}
})

test('infix expressions', () => {
	const infix_tests = [
	['5 + 6;',        5, '+', 6],
	['5 - 6;',        5, '-', 6],
	['5 * 6;',        5, '*', 6],
	['5 / 6;',        5, '/', 6],
	['5 > 6;',        5, '>', 6],
	['5 < 6;',        5, '<', 6],
	['5 == 6;',       5, '==', 6],
	['5 != 6;',       5, '!=', 6],
	['true == true',  true, '==', true],
	['true != false', true, '!=', false]]

	for (const [input, left_value, operator, right_value] of infix_tests) {
		const p = new Parser (new Lexer (input))
		const program = p.parse_program()

		check_parser_errors(p)
		expect(program.statements.length).toBe(1)

		const stmt = program.statements[0]
		expect(stmt).toBeInstanceOf(ExpressionStatement)

		const exp = stmt.expression
		expect(exp).toBeInstanceOf(InfixExpression)
		
		test_literal_expression(exp.left, left_value)
		expect(exp.operator).toBe(operator)
		test_literal_expression(exp.right, right_value)
	}

})

test('operator precedence parsing', () => {
	const test_cases = [
	['-a * b',                     '((-a) * b)'],
	['!-a',                        '(!(-a))',],
	['a + b + c',                  '((a + b) + c)'],
	['a + b - c',                  '((a + b) - c)'],
	['a * b * c',                  '((a * b) * c)'],
	['a * b / c',                  '((a * b) / c)'],
	['a + b / c',                  '(a + (b / c))'],
	['a + b * c + d / e - f',      '(((a + (b * c)) + (d / e)) - f)'],
	['3 + 4; -5 * 6',              '(3 + 4)((-5) * 6)'],
	['5 > 4 == 3 < 6',             '((5 > 4) == (3 < 6))'],
	['5 < 4 != 3 > 7',             '((5 < 4) != (3 > 7))'],
	['3 + 4 * 5 == 6 * 7 + 8 * 9', '((3 + (4 * 5)) == ((6 * 7) + (8 * 9)))'],
	['true',                       'true'],
	['false',                      'false'],
	['3 > 5 == false',             '((3 > 5) == false)'],
	['true == 3 < 5',              '(true == (3 < 5))']]

	for (const [input, expected] of test_cases) {
		const p = new Parser (new Lexer (input))
		const program = p.parse_program()

		check_parser_errors(p)
		expect(program.toString()).toBe(expected)
	}
})

test('boolean expression', () => {
	const test_cases = [
		['true;', true],
		['false;', false]]

	for (const [input, expected] of test_cases) {
		const p = new Parser (new Lexer (input))
		const program = p.parse_program()

		check_parser_errors(p)
		expect(program.statements.length).toBe(1)

		const stmt = program.statements[0]
		expect(stmt).toBeInstanceOf(ExpressionStatement)
		test_boolean_literal(stmt.expression, expected)
	}
})

function check_parser_errors(parser) {
	try {
		expect(parser.errors.length).toBe(0)
	} catch {
		throw new Error(parser.errors.join('///'))
	}
}

function test_integer_literal(expression, value) {
	expect(expression).toBeInstanceOf(IntegerLiteral)
	expect(expression.value).toBe(value)
	expect(expression.token_literal()).toBe(value.toString())
}

function test_identifier(expression, value) {
	expect(expression).toBeInstanceOf(Identifier)
	expect(expression.value).toBe(value)
	expect(expression.token_literal()).toBe(value)
}

function test_boolean_literal(exp, value) {
	expect(exp).toBeInstanceOf(BooleanLiteral)
	expect(exp.value).toBe(value)
	expect(exp.token_literal()).toBe(value.toString())
}

function test_literal_expression(exp, expected) {
	switch(typeof(expected)) {
		case 'number':
			test_integer_literal(exp, expected)
			break
		case 'boolean':
			test_boolean_literal(exp, expected)
			break
		default:
			test_identifier(exp, expected)
	}
}

function test_infix_expression(exp, left, operator, right) {
	expect(exp).toBeInstanceOf(InfixExpression)
	test_literal_expression(exp.left, left)
	expect(exp.operator).toBe(operator)
	test_literal_expression(exp.right, right)
}