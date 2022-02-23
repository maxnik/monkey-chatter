const token_types = require('../token/token_types')
const Lexer = require('../lexer')

test('get feedback about about the working state of the lexer', () => {
    const input = `let five = 5;
    let ten = 10;

    let add = fn(x,y) {
        x + y;
    };

    let result = add(five, ten);
    !-/*5;
    5 < 10 > 5;

    if (5 < 10) {
        return true;
    } else {
        return false;
    }

    10 == 10;
    10 != 9;
    "foobar"
    "foo bar"
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

        [token_types.BANG, '!'],
        [token_types.MINUS, '-'],
        [token_types.SLASH, '/'],
        [token_types.ASTERISK, '*'],
        [token_types.INT, '5'],
        [token_types.SEMICOLON, ';'],

        [token_types.INT, '5'],
        [token_types.LT, '<'],
        [token_types.INT, '10'],
        [token_types.GT, '>'],
        [token_types.INT, '5'],
        [token_types.SEMICOLON, ';'],

        [token_types.IF, 'if'],
        [token_types.LPAREN, '('],
        [token_types.INT, '5'],
        [token_types.LT, '<'],
        [token_types.INT, '10'],
        [token_types.RPAREN, ')'],
        [token_types.LBRACE, '{'],
        [token_types.RETURN, 'return'],
        [token_types.TRUE, 'true'],
        [token_types.SEMICOLON, ';'],
        [token_types.RBRACE, '}'],
        [token_types.ELSE, 'else'],
        [token_types.LBRACE, '{'],
        [token_types.RETURN, 'return'],
        [token_types.FALSE, 'false'],
        [token_types.SEMICOLON, ';'],
        [token_types.RBRACE, '}'],

        [token_types.INT, '10'],
        [token_types.EQ, '=='],
        [token_types.INT, '10'],
        [token_types.SEMICOLON, ';'],

        [token_types.INT, '10'],
        [token_types.NOT_EQ, '!='],
        [token_types.INT, '9'],
        [token_types.SEMICOLON, ';'],

        [token_types.STRING, 'foobar'],
        [token_types.STRING, 'foo bar'],
        [token_types.EOF, '']
    ]

    const lexer = new Lexer(input)

    for (const [expected_type, expected_literal] of expected_results) {
        const next_token = lexer.next_token()

        expect(next_token.type).toBe(expected_type)
        expect(next_token.literal).toBe(expected_literal)
    }
})

test('works for a single identifier without whitespace after it', () => {
    const lexer = new Lexer('let')
    const token = lexer.next_token()

    expect(token.type).toBe(token_types.LET)
    expect(token.literal).toBe('let')
})