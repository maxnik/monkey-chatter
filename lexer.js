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

        this.skip_whitespace()

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
            default:
                if (is_letter(this.ch)) {
                    const ident = this.read_identifier()
                    const type = lookup_identifier(ident)
                    token = new Token (type, ident)
                    return token
                } else if (is_digit(this.ch)) {
                    token = new Token (token_types.INT, this.read_number())
                    return token
                } else {
                    token = new Token (token_types.ILLEGAL, this.ch)
                }
        }

        this.read_char()
        return token
    }

    skip_whitespace() {
        while ((/\s/).test(this.ch)) {
            this.read_char()
        }
    }

    read_identifier() {
        const start = this.position
        while (is_letter(this.ch)) {
            this.read_char()
        }
        return this.input.slice(start, this.position)
    }

    read_number() {
        const start = this.position
        while (is_digit(this.ch)) {
            this.read_char()
        }
        return this.input.slice(start, this.position)
    }
}

function is_letter(char) {
    return (/[a-z_]/i).test(char)
}

function is_digit(char) {
    return (/[0-9]/).test(char)
}

function lookup_identifier(ident) {
    switch (ident) {
        case 'fn':
            return token_types.FUNCTION
            break
        case 'let':
            return token_types.LET
            break
        default:
            return token_types.IDENT
    }
}

module.exports = Lexer
