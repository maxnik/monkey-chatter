const token_types = require('./token/token_types')
const Token = require('./token/token')

class Lexer {
    // position - current position in input (points to current char)
    // read_position - current reading position in input (after current char)
    // ch - current char under examination

    constructor(input) {
        this.input = input
        this.read_position = 0
        this.read_char()
    }

    read_char() {
        if (this.read_position >= this.input.length) {
            this.ch = null
        } else {
            this.ch = this.input[this.read_position]
        }
        this.position = this.read_position
        this.read_position += 1
    }

    next_token() {
        let token = null

        switch (this.ch) {       
            case '=':
                token = new Token (token_types.ASSIGN, this.ch)
                break
            case '+':
                token = new Token (token_types.PLUS, this.ch)
                break
            case ';':
                token = new Token (token_types.SEMICOLON, this.ch)
                break
            case '(':
                token = new Token (token_types.LPAREN, this.ch)
                break
            case ')':
                token = new Token (token_types.RPAREN, this.ch)
                break
            case '{':
                token = new Token (token_types.LBRACE, this.ch)
                break
            case '}':
                token = new Token (token_types.RBRACE, this.ch)
                break
            case ',':
                token = new Token (token_types.COMMA, this.ch)
                break
            case null:
                token = new Token (token_types.EOF, '')
                break
        }

        this.read_char()
        return token
    }
}

module.exports = Lexer
