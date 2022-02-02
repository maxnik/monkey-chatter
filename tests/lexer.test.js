const token_types = require('../token/token_types')
const Lexer = require('../lexer')

test('get feedback about about the working state of the lexer', () => {
    const input = `let five = 5;
    let ten = 10;

    let add = fn(x,y) {
        x + y;
    };

    let result = add(five, ten);
    `

    const expected_results = [
        [token_types.LET, 'let'],
        [token_types.IDENT, 'five'],
        [token_types.ASSIGN, '='],
        [token_types.INT, '5'],
        [token_types.SEMICOLON, ';'],

        [token_types.LET, 'let'],
        [token_types.IDENT, 'ten'],
        [token_types.ASSIGN, '='],
        [token_types.INT, '10'],
        [token_types.SEMICOLON, ';'],

        [token_types.LET, 'let'],
        [token_types.IDENT, 'add'],
        [token_types.ASSIGN, '='],
        [token_types.FUNCTION, 'fn'],
        [token_types.LPAREN, '('],
        [token_types.IDENT, 'x'],
        [token_types.COMMA, ','],
        [token_types.IDENT, 'y'],
        [token_types.RPAREN, ')'],
        [token_types.LBRACE, '{'],
        [token_types.IDENT, 'x'],
        [token_types.PLUS, '+'],
        [token_types.IDENT, 'y'],
        [token_types.SEMICOLON, ';'],
        [token_types.RBRACE, '}'],
        [token_types.SEMICOLON, ';'],
        
        [token_types.LET, 'let'],
        [token_types.IDENT, 'result'],
        [token_types.ASSIGN, '='],
        [token_types.IDENT, 'add'],
        [token_types.LPAREN, '('],
        [token_types.IDENT, 'five'],
        [token_types.COMMA, ','],
        [token_types.IDENT, 'ten'],    
        [token_types.RPAREN, ')'],
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
