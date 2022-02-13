const { Program, LetStatement, Identifier } = require('../ast/ast')
const token_types = require('../token/token_types')
const Token = require('../token/token')

test('get our whole program back as string', () => {
	const program = new Program ()

	const var_token = new Token (token_types.IDENT, 'myVar')
	const name = new Identifier (var_token, 'myVar')

	const val_token = new Token (token_types.IDENT, 'anotherVar')
	const value_identifier = new Identifier (val_token, 'anotherVar')

	const let_token = new Token (token_types.LET, 'let')
	const let_statement = new LetStatement (let_token)
	let_statement.name = name
	let_statement.value = value_identifier

	program.statements = [ let_statement ]

	expect(program.toString()).toBe('let myVar = anotherVar;')
})