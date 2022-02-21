const readline = require('readline')
const Lexer = require('./lexer')
const Parser = require('./parser/parser')
const { Environment } = require('./object')
const { evaluate } = require('./evaluator')

console.log('This is the Monkey programming language!')
console.log('Feel free to type in commands')

const rl = readline.createInterface(process.stdin, process.stdout)

rl.setPrompt('>> ')

const env = new Environment ()

rl.prompt()
rl.on('line', (input) => {
	if (!input) {
		rl.close()
	} else {
		const p = new Parser (new Lexer(input))
		const program = p.parse_program()

		if (p.errors.length != 0) {
			for (const error of p.errors) {
				console.log(`\t${error}`)
			}
		} else {
			const evaluated = evaluate(program, env)
			if (evaluated) {
				console.log(evaluated.inspect())	
			}			
		}

		rl.prompt()
	}
})

