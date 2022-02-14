const readline = require('readline')
const Lexer = require('./lexer')
const Parser = require('./parser/parser')

console.log('This is the Monkey programming language!')
console.log('Feel free to type in commands')

const rl = readline.createInterface(process.stdin, process.stdout)

rl.setPrompt('>> ')

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
			console.log(program.toString())
		}

		rl.prompt()
	}
})

