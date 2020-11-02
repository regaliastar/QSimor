class Token:
    KEYWORD = [
        'if',
        'elif',
        'else',
        'while',
        'break',
        'func',
        'return'
    ]

    CIRCUIT = [
        'I',
        'X',
        'Y',
        'Z',
        'H',
        'S',
        'T',
        'V',
        'V_H',
        'SWAP',
        'measure',
        'quantum'
    ]

    SEPARATOR = [
        '(',
        ')',
        '[',
        ']',
        '{',
        '}',
        ':'
    ]

    OPERATOR = [
        '+',
        '-',
        '*',
        '/',
        '>',
        '<',
        '=',
        '>=',
        '<=',
        '==',
        '+=',
        '-=',
        '*=',
        '/=',
        '!',
        '&',
        '|'
    ]

    TOKENID = {
        'if': 100,
        'elif': 101,
        'else': 102,
        'while': 103,
        'break': 104,
        'func': 105,
        'return': 106,
        'I': 200,
        'X': 201,
        'Y': 202,
        'Z': 203,
        'H': 204,
        'S': 205,
        'T': 206,
        'V': 207,
        'V_H': 208,
        'SWAP': 209,
        'measure': 210,
        'quantum': 211,
        '(': 300,
        ')': 301,
        '[': 302,
        ']': 303,
        '{': 304,
        '}': 305,
        ':': 306,
        '+': 400,
        '-': 401,
        '*': 402,
        '/': 403,
        '>': 404,
        '<': 405,
        '=': 406,
        '>=': 407,
        '<=': 408,
        '==': 409,
        '+=': 410,
        '-=': 411,
        '*=': 412,
        '/=': 413,
        '!': 414,
        '&': 415,
        '|': 416
        # 标志符: 500
        # 整数：600
    }

    def isOPERATOR(ch):
        singleOp = ['+', '-', '*', '/', '>', '<', '=', '&', '|', '!']
        return ch in singleOp

    def isKEYWORD(str):
        return str in Token.KEYWORD

    def isCIRCUIT(str):
        return str in Token.CIRCUIT

    def isSEPARATOR(str):
        return str in Token.SEPARATOR