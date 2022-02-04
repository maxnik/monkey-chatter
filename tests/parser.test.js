const Lexer = require('../lexer')
const { LetStatement } = require('../ast/ast')
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

	const expected_identifiers = ['x', 'y', 'foobar']
	for (const [i, identifier] of expected_identifiers.entries()) {
		const statement = program.statements[i]

		expect(statement).toBeInstanceOf(LetStatement)
		expect(statement.token_literal()).toBe('let')
		// expect(statement.name.value).toBe(identifier)
		expect(statement.name.token_literal()).toBe(identifier)
	}
})