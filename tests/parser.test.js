const Lexer = require('../lexer')
const { LetStatement, ReturnStatement, ExpressionStatement, 
	Identifier, IntegerLiteral, BooleanLiteral,
	PrefixExpression, InfixExpression, IfExpression,
	FunctionLiteral, CallExpression, StringLiteral,
	ArrayLiteral, IndexExpression } = require('../ast/ast')
const Parser = require('../parser/parser')

test('let statements', () => {
	const cases = [
		['let x = 5;',      'x', 5],
		['let y = true;',   'y', true],
		['let foobar = y;', 'foobar', 'y']]

	for (const [input, expected_identifier, expected_value] of cases) {
		const p = new Parser (new Lexer (input))	
		const program = p.parse_program()

		check_parser_errors(p)
		expect(program.statements.length).toBe(1)

		const stmt = program.statements[0]
		expect(stmt.token_literal()).toBe('let')
		expect(stmt).toBeInstanceOf(LetStatement)
		expect(stmt.name.value).toBe(expected_identifier)
		expect(stmt.value.value).toBe(expected_value)
	}
})

test('return statements', () => {
	const cases = [
		['return 5;', 5],
		['return true;', true],
		['return foobar;', 'foobar']]

	for (const [input, expected_value] of cases) {
		const p = new Parser (new Lexer (input))	
		const program = p.parse_program()

		check_parser_errors(p)
		expect(program.statements.length).toBe(1)

		const stmt = program.statements[0]
		expect(stmt).toBeInstanceOf(ReturnStatement)
		test_literal_expression(stmt.return_value, expected_value)
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
	['true == 3 < 5',              '(true == (3 < 5))'],
	['1 + (2 + 3) + 4',            '((1 + (2 + 3)) + 4)'],
	['(5 + 5) * 2',                '((5 + 5) * 2)'],
	['2 / (5 + 5)',                '(2 / (5 + 5))'],
	['-(5 + 5)',                   '(-(5 + 5))'],
	['!(true == true)',            '(!(true == true))'],
	['a + add(b * c) + d',         '((a + add((b * c))) + d)'],
	['add(a + b + c * d / f + g)', 'add((((a + b) + ((c * d) / f)) + g))'],
	['add(a, b, 1, 2 * 3, 4 + 5, add(6, 7 * 8))', 'add(a, b, 1, (2 * 3), (4 + 5), add(6, (7 * 8)))'],
	['a * [1, 2, 3, 4][b * c] * d',               '((a * ([1, 2, 3, 4][(b * c)])) * d)'],
	['add(a * b[2], b[1], 2 * [1, 2][1])',        'add((a * (b[2])), (b[1]), (2 * ([1, 2][1])))']]

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

test('if expression', () => {
	const input = 'if (x < y) { z }'
	const p = new Parser (new Lexer (input))
	const program = p.parse_program()

	check_parser_errors(p)
	expect(program.statements.length).toBe(1)

	const stmt = program.statements[0]
	expect(stmt).toBeInstanceOf(ExpressionStatement)

	const exp = stmt.expression
	expect(exp).toBeInstanceOf(IfExpression)
	test_infix_expression(exp.condition, 'x', '<', 'y')
	expect(exp.consequence.statements.length).toBe(1)

	const consequence = exp.consequence.statements[0]
	expect(consequence).toBeInstanceOf(ExpressionStatement)
	test_identifier(consequence.expression, 'z')

	expect(exp.alternative).toBeNull()
})

test('if else expression', () => {
	const input = 'if (y == x) { z } else { a }'
	const p = new Parser (new Lexer (input))
	const program = p.parse_program()

	check_parser_errors(p)
	expect(program.statements.length).toBe(1)

	const stmt = program.statements[0]
	expect(stmt).toBeInstanceOf(ExpressionStatement)

	const exp = stmt.expression
	expect(exp).toBeInstanceOf(IfExpression)
	test_infix_expression(exp.condition, 'y', '==', 'x')
	expect(exp.alternative.statements.length).toBe(1)

	const alternative = exp.alternative.statements[0]
	expect(alternative).toBeInstanceOf(ExpressionStatement)
	test_identifier(alternative.expression, 'a')
})

test('function literal', () => {
	const input = 'fn(x, y) { x + y; }'
	const p = new Parser (new Lexer (input))
	const program = p.parse_program()

	check_parser_errors(p)
	expect(program.statements.length).toBe(1)

	const stmt = program.statements[0]
	expect(stmt).toBeInstanceOf(ExpressionStatement)

	const fn = stmt.expression
	expect(fn).toBeInstanceOf(FunctionLiteral)
	
	expect(fn.parameters.length).toBe(2)
	test_literal_expression(fn.parameters[0], 'x')
	test_literal_expression(fn.parameters[1], 'y')

	expect(fn.body.statements.length).toBe(1)
	const body_stmt = fn.body.statements[0]
	expect(body_stmt).toBeInstanceOf(ExpressionStatement)
	test_infix_expression(body_stmt.expression, 'x', '+', 'y')
})

test('function parameter parsing', () => {
	const test_cases = [
		['fn() {}',        []],
		['fn(x) {}',       ['x']],
		['fn(x, y, z) {}', ['x', 'y', 'z']]]

	for (const [input, expected] of test_cases) {
		const p = new Parser (new Lexer (input))
		const program = p.parse_program()

		check_parser_errors(p)
		const fn = program.statements[0].expression

		expect(fn.parameters.length).toBe(expected.length)
		for (const [i, param] of expected.entries()) {
			test_literal_expression(fn.parameters[i], param)
		}
	}
})

test('call expression', () => {
	const input = 'add(1, 2 * 3, 4 + 5);'
	const p = new Parser (new Lexer (input))
	const program = p.parse_program()

	check_parser_errors(p)
	expect(program.statements.length).toBe(1)

	const stmt = program.statements[0]
	expect(stmt).toBeInstanceOf(ExpressionStatement)

	const exp = stmt.expression
	expect(exp).toBeInstanceOf(CallExpression)
	test_identifier(exp.fn, 'add')
	
	expect(exp.arguments.length).toBe(3)
	test_literal_expression(exp.arguments[0], 1)
	test_infix_expression(exp.arguments[1], 2, '*', 3)
	test_infix_expression(exp.arguments[2], 4, '+', 5)
})

test('call expression parameter parsing', () => {
	const call_cases = [
	['add();', 'add', []],
	['add(1);', 'add', ['1']],
	['add(1, 2 * 3, 4 + 5)', 'add', ['1', '(2 * 3)', '(4 + 5)']]]

	for (const [input, expected_ident, expected_args] of call_cases) {
		const p = new Parser (new Lexer (input))
		const program = p.parse_program()

		check_parser_errors(p)

		const exp = program.statements[0].expression
		expect(exp).toBeInstanceOf(CallExpression)
		test_identifier(exp.fn, expected_ident)

		expect(exp.arguments.length).toBe(expected_args.length)
		for (const [i, arg] of expected_args.entries()) {
			expect(exp.arguments[i].toString()).toBe(arg)
		}
	}
})

test('string literal expression', () => {
	const input = '"hello world";'

	const p = new Parser (new Lexer (input))
	const program = p.parse_program()

	check_parser_errors(p)
	expect(program.statements[0]).toBeInstanceOf(ExpressionStatement)

	const literal = program.statements[0].expression
	expect(literal).toBeInstanceOf(StringLiteral)
	expect(literal.value).toBe('hello world')
})

test('parsing empty array literals', () => {
	const p = new Parser (new Lexer ('[]'))
	const program = p.parse_program()

	check_parser_errors(p)

	const array = program.statements[0].expression
	expect(array).toBeInstanceOf(ArrayLiteral)
	expect(array.elements.length).toBe(0)
})

test('parsing array literals', () => {
	const p = new Parser (new Lexer ('[1, 2 * 3, 4 + 5]'))
	const program = p.parse_program()

	check_parser_errors(p)

	const array = program.statements[0].expression
	expect(array).toBeInstanceOf(ArrayLiteral)
	expect(array.elements.length).toBe(3)
	test_integer_literal(array.elements[0], 1)
	test_infix_expression(array.elements[1], 2, '*', 3)
	test_infix_expression(array.elements[2], 4, '+', 5)
})

test('index expressions', () => {
	const p = new Parser (new Lexer ('myArray[1 + 2]'))
	const program = p.parse_program()

	check_parser_errors(p)

	const index_exp = program.statements[0].expression
	expect(index_exp).toBeInstanceOf(IndexExpression)
	test_identifier(index_exp.left, 'myArray')
	test_infix_expression(index_exp.index, 1, '+', 2)
})

function check_parser_errors(parser) {
	try {
		expect(parser.errors.length).toBe(0)
	} catch {
		throw new Error(parser.errors.join('\n'))
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