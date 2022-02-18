const Lexer = require('../lexer')
const Parser = require('../parser/parser')
const { IntegerObject, BooleanObject, NullObject } = require('../object')
const { evaluate } = require('../evaluator')

test('eval integer expression', () => {
	const cases = [
		['5', 5],
		['10', 10],
		['-5', -5],
		['-10', -10],
		['5 + 5 + 5 + 5 - 10', 10],
		['2 * 2 * 2 * 2 * 2', 32],
		['-50 + 100 + -50', 0],
		['5 * 2 + 10', 20],
		['20 + 2 * -10', 0],
		['50 / 2 * 2 + 10', 60],
		['2 * (5 + 10)', 30],
		['3 * 3 * 3 + 10', 37],
		['3 * (3 * 3) + 10', 37],
		['(5 + 10 * 2 + 15 / 3) * 2 + -10', 50]]

	for (const [input, expected] of cases) {

		const evaluated = test_eval(input)
		test_integer_object(evaluated, expected)
	}
})

test('eval boolean expression', () => {
	const cases = [
		['true',   true],
		['false',  false],
		['1 < 2',  true],
		['1 > 2',  false],
		['1 < 1',  false],
		['1 > 1',  false],
		['1 == 1', true],
		['1 != 1', false],
		['1 == 2', false],
		['1 != 2', true],
		['true == true',     true],
		['false == false',   true],
		['true == false',    false],
		['true != false',    true],
		['false != true',    true],
		['(1 < 2) == true',  true],
		['(1 < 2) == false', false],
		['(1 > 2) == false', true],
		['(1 > 2) == true',  false]]

	for (const [input, expected] of cases) {

		const evaluated = test_eval(input)
		test_boolean_object(evaluated, expected)
	}
})

test('bang operator', () => {
	const cases = [
		['!true', false],
		['!false', true],
		['!5', false],
		['!!true', true],
		['!!false', false],
		['!!5', true]]

	for (const [input, expected] of cases) {
		test_boolean_object(test_eval(input), expected)
	}
})

test('if else expressions', () => {
	const cases = [
		['if (true) { 10 }',              10],
		['if (false) { 10 }',             null],
		['if (1) { 10 }',                 10],
		['if (1 < 2) { 10 }',             10],
		['if (1 > 2) { 10 }',             null],
		['if (1 > 2) { 10 } else { 20 }', 20],
		['if (1 < 2) { 10 } else { 20 }', 10]]

	for (const [input, expected] of cases) {
		const evaluated = test_eval(input)

		if (typeof(expected) === 'number') {
			test_integer_object(evaluated, expected)
		} else {
			expect(evaluated).toBeInstanceOf(NullObject)
		}
	}
})

function test_eval(input) {
	const p = new Parser (new Lexer (input))
	const program = p.parse_program()

	return evaluate(program)
}

function test_integer_object(obj, expected) {
	expect(obj).toBeInstanceOf(IntegerObject)
	expect(obj.value).toBe(expected)
}

function test_boolean_object(obj, expected) {
	expect(obj).toBeInstanceOf(BooleanObject)
	expect(obj.value).toBe(expected)
}
