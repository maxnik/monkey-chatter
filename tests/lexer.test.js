const token_types = require('../token/token_types')
const Lexer = require('../lexer')

test('get feedback about about the working state of the lexer', () => {
    const input = '=+(){},;'

    const expected_results = [
        [token_types.ASSIGN, '='],
        [token_types.PLUS, '+'],
        [token_types.LPAREN, '('],
        [token_types.RPAREN, ')'],
        [token_types.LBRACE, '{'],
        [token_types.RBRACE, '}'],
        [token_types.COMMA, ','],
        [token_types.SEMICOLON, ';'],
        [token_types.EOF, '']
    ]

    const lexer = new Lexer(input)

    for (const expected of expected_results) {
        const next_token = lexer.next_token()

        expect(next_token.type).toBe(expected[0])
        expect(next_token.literal).toBe(expected[1])
    }
})
