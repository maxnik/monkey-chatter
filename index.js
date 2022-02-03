const readline = require('readline')
const Lexer = require('./lexer')
const token_types = require('./token/token_types')

console.log('This is the Monkey programming language!')
console.log('Feel free to type in commands')

const rl = readline.createInterface(process.stdin, process.stdout)

rl.setPrompt('>> ')

rl.prompt()
rl.on('line', (input) => {
	if (!input) {
		rl.close()
	} else {
		const l = new Lexer(input)

		let token = l.next_token()
		while (token.type != token_types.EOF) {
			console.log(token)
			token = l.next_token()
		}

		rl.prompt()
	}
})

