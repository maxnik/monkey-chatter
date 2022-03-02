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
                if (this.peek_char() === '=') {
                    const ch = this.ch
                    this.read_char()
                    const literal = ch + this.ch
                    token = new Token (token_types.EQ, literal)
                } else {
                    token = new Token (token_types.ASSIGN, this.ch)    
                }                
                break
            case '!':
                if (this.peek_char() === '=') {
                    const ch = this.ch
                    this.read_char()
                    const literal = ch + this.ch
                    token = new Token (token_types.NOT_EQ, literal)
                } else {
                    token = new Token (token_types.BANG, this.ch)
                }                
                break
            case '+':
                token = new Token (token_types.PLUS, this.ch)
                break
            case '-':
                token = new Token (token_types.MINUS, this.ch)
                break
            case '*':
                token = new Token (token_types.ASTERISK, this.ch)
                break
            case '/':
                token = new Token (token_types.SLASH, this.ch)
                break
            case '<':
                token = new Token (token_types.LT, this.ch)
                break
            case '>':
                token = new Token (token_types.GT, this.ch)
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
            case '"':
                token = new Token (token_types.STRING, this.read_string())
                break
            case '[':
                token = new Token (token_types.LBRACKET, this.ch)
                break
            case ']':
                token = new Token (token_types.RBRACKET, this.ch)
                break
            case ':':
                token = new Token (token_types.COLON, this.ch)
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

    peek_char() {
        if (this.read_position >= this.input.length) {
            return null
        } else {
            return this.input[this.read_position]
        }
    }

    read_string() {
        const start = this.position + 1

        while (true) {
            this.read_char()

            if (this.ch === '"' || this.ch == null) {
                break
            }
        }

        return this.input.slice(start, this.position)
    }
}

function is_letter(char) {
    // regex.test() coerces its argument to string, so null becomes 'null' and this returns true
    return (/[a-z_]/i).test(char || '')
}

function is_digit(char) {
    return (/[0-9]/).test(char)
}

const keywords = {
    'fn': token_types.FUNCTION,
    'let': token_types.LET,
    'true': token_types.TRUE,
    'false': token_types.FALSE,
    'if': token_types.IF,
    'else': token_types.ELSE,
    'return': token_types.RETURN
}

function lookup_identifier(ident) {
    const keyword = keywords[ident]
    if (keyword) {
        return keyword
    } else {
        return token_types.IDENT
    }
}

module.exports = Lexer
