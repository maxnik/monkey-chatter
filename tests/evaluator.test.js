const Lexer = require('../lexer')
const Parser = require('../parser/parser')
const { IntegerObject, BooleanObject } = require('../object')
const { evaluate } = require('../evaluator')

test('eval integer expression', () => {
	const cases = [
		['5', 5],
		['10', 10]]

	for (const [input, expected] of cases) {

		const evaluated = test_eval(input)
		test_integer_object(evaluated, expected)
	}
})

test('eval boolean expression', () => {
	const cases = [
		['true', true],
		['false', false]]

	for (const [input, expected] of cases) {

		const evaluated = test_eval(input)
		test_boolean_object(evaluated, expected)
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