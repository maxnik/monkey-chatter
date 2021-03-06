const Lexer = require('../lexer')
const Parser = require('../parser/parser')
const { IntegerObject, BooleanObject, NullObject,
		ErrorObject, Environment, FunctionObject,
		StringObject, ArrayObject, HashObject } = require('../object')
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

test('return statements', () => {
	const cases = [
		['return 10;',          10],
		['return 10; 9',        10],
		['return 2 * 5; 9',     10],
		['9; return 2 * 5; 11', 10],
		[`if (10 > 1) {
			if (10 > 1) {
				return 10; 
			}

			return 1;
		  }`,                   10],
		[`let f = fn(x) {
  			return x;
  			x + 10;
		  };
		  f(10);`,              10],
		[`let f = fn(x) {
   			let result = x + 10;
   			return result;
   			return 10;
		  };
		  f(10);`,              20]]

	for (const [input, expected] of cases) {
		test_integer_object(test_eval(input), expected)
	}
})

test('error handling', () => {
	const cases = [
		['5 + true;',                       'type mismatch: INTEGER + BOOLEAN'],
		['5 + true; 6',                     'type mismatch: INTEGER + BOOLEAN'],
		['-true',                           'unknown operator: -BOOLEAN'],
		['true + false;',                   'unknown operator: BOOLEAN + BOOLEAN'],
		['5; true + false; 6',              'unknown operator: BOOLEAN + BOOLEAN'],
		['if (10 > 1) { true + false; }',   'unknown operator: BOOLEAN + BOOLEAN'],
		[`if (10 > 1) {
			if (10 > 1) {
				return true + false;
			}
			return 1;
		 }`,                                 'unknown operator: BOOLEAN + BOOLEAN'],
		['foobar',                           'identifier not found: foobar'],
		['"Hello" - "World"',                'unknown operator: STRING - STRING'],
		['{"name": "Monkey"}[fn(x) { x }];', 'unusable as hash key: FUNCTION']]

	for (const [input, expected_message] of cases) {
		const evaluated = test_eval(input)

		expect(evaluated).toBeInstanceOf(ErrorObject)
		expect(evaluated.message).toBe(expected_message)
	}
})

test('let statements', () => {
	const cases = [
		['let a = 5; a;',                               5],
		['let a = 5 * 5; a;',                           25],
		['let a = 5; let b = a; b',                     5],
		['let a = 5; let b = a; let c = a + b + 5; c;', 15]]

	for (const [input, expected] of cases) {
		test_integer_object(test_eval(input), expected)
	}
})

test('function object', () => {
	const input = 'fn(x) { x + 2; };'
	const fn = test_eval(input)

	expect(fn).toBeInstanceOf(FunctionObject)
	expect(fn.parameters.length).toBe(1)
	expect(fn.parameters[0].toString()).toBe('x')
	expect(fn.body.toString()).toBe('(x + 2)')
})

test.each([
['let identity = fn(x) { x; }; identity(5);',             5],
['let identity = fn(x) { return x; }; identity(5);',      5],
['let double = fn(x) { x * 2; }; double(5);',             10],
['let add = fn(x, y) { x + y; }; add(5, 6);',             11],
['let add = fn(x, y) { x + y; }; add(5 + 6, add(7, 8));', 26],
['fn(x) { x; }(5)',                                       5]])(
	'function application %s', (input, expected) => {
		
		test_integer_object(test_eval(input), expected)
})

test.each([
['[1, 2, 3][0]',       1],
['[1, 2, 3][1]',       2],
['[1, 2, 3][2]',       3],
['let i = 0; [1][i];', 1],
['[1, 2, 3][1 + 1];',  3],
['let myArray = [1, 2, 3]; myArray[2];', 3],
['let myArray = [1, 2, 3]; myArray[0] + myArray[1] + myArray[2];', 6],
['let myArray = [1, 2, 3]; let i = myArray[0]; myArray[i]',        2],
['[1, 2, 3][3]',       null],
['[1, 2, 3][-1]',      null]])(
	'array index expression %s', (input, expected) => {
	const evaluated = test_eval(input)

	if (typeof(expected) === 'number') {
		test_integer_object(evaluated, expected)
	} else {
		expect(evaluated).toBeInstanceOf(NullObject)
	}	
})

test.each([
['len("")',            0],
['len("four")',        4],
['len("hello world")', 11],
['len(1)',             'argument to \'len\' not supported, got INTEGER'],
['len("one", "two")',  'wrong number of arguments. got=2, want=1'],
['len([1, 2, 3])',     3],
['len([])',            0],
['first([1, 2, 3])',   1],
['first([])',          null],
['first(1)',           'argument to \'first\' must be ARRAY, got INTEGER'],
['last([1, 2, 3])',    3],
['last([])',           null],
['last(1)',            'argument to \'last\' must be ARRAY, got INTEGER'],
['rest([1, 2, 3])',    [2, 3]],
['rest([])',           null],
['push([], 1)',        [1]],
['push(1, 1)',         'argument to \'push\' must be ARRAY, got INTEGER']])(
	'built-in function %s', (input, expected) => {
	const evaluated = test_eval(input)

	if (typeof expected === 'string') {
		expect(evaluated).toBeInstanceOf(ErrorObject)
		expect(evaluated.message).toBe(expected)

	} else {
		if (evaluated instanceof ErrorObject) {
			throw new Error (evaluated.message)
		}

		if (typeof expected === 'number') {		
			test_integer_object(evaluated, expected)

		} else if (Array.isArray(expected)) {
			const elements = evaluated.elements
			expect(elements.length).toBe(expected.length)
			for (const [i, expected_elem] of expected.entries()) {
				test_integer_object(elements[i], expected_elem)
			}

		} else {
			expect(evaluated).toBeInstanceOf(NullObject)
		}
	}	
})

test('closures', () => {
	const input = `
		let newAdder = fn(x) {
			fn(y) { x + y };
		};
		let addTwo = newAdder(2);
		addTwo(2);`

	test_integer_object(test_eval(input), 4)
})

test('string literal', () => {
	const evaluated = test_eval('"Hello World!"')

	expect(evaluated).toBeInstanceOf(StringObject)
	expect(evaluated.value).toBe('Hello World!')
})

test('string concatenation', () => {
	const evaluated = test_eval('"Hello" + " " + "World!"')

	expect(evaluated).toBeInstanceOf(StringObject)
	expect(evaluated.value).toBe('Hello World!')	
})

test('array literals', () => {
	const evaluated = test_eval('[1, 2 * 3, 4 + 5]')

	expect(evaluated).toBeInstanceOf(ArrayObject)
	expect(evaluated.elements.length).toBe(3)
	test_integer_object(evaluated.elements[0], 1)
	test_integer_object(evaluated.elements[1], 6)
	test_integer_object(evaluated.elements[2], 9)
})

test('hash literals', () => {
	const input = `let two = "two";
	{
		"one": 10 - 9,
		two: 1 + 1,
		"thr" + "ee": 6 / 2
	}`
	const evaluated = test_eval_without_error(input)

	expect(evaluated).toBeInstanceOf(HashObject)
	expect(evaluated.pairs.size).toBe(3)

	const expected = {'one': 1, 'two': 2, 'three': 3}
	for (const [key, pair] of evaluated.pairs) {
		test_integer_object(pair.value, expected[key])
	}
})

test.each([
	['{"foo": 5}["foo"]',                5],
	['{"foo": 5}["bar"]',                null],
	['let key = "foo"; {"foo": 5}[key]', 5],
	['{}["foo"]',                        null]
])('hash index expression %s', (input, expected) => {
	const evaluated = test_eval_without_error(input)

	if (typeof expected === 'number') {
		test_integer_object(evaluated, expected)
	} else {
		expect(evaluated).toBeInstanceOf(NullObject)	
	}
})

function test_eval(input) {
	const p = new Parser (new Lexer (input))
	const program = p.parse_program()
	const env = new Environment ()

	return evaluate(program, env)
}

function test_eval_without_error(input) {
	const evaluated = test_eval(input)

	if (evaluated instanceof ErrorObject) {
		throw new Error (evaluated.message)
	}

	return evaluated
}

function test_integer_object(obj, expected) {
	expect(obj).toBeInstanceOf(IntegerObject)
	expect(obj.value).toBe(expected)
}

function test_boolean_object(obj, expected) {
	expect(obj).toBeInstanceOf(BooleanObject)
	expect(obj.value).toBe(expected)
}
