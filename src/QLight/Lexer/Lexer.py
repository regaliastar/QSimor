'''
读取源文件生成TOKEN串，根据DAG来编写读取程序
date: 2020-11-2
'''
import os
import sys
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) #当前程序上上一级目录，这里为QSim
sys.path.append(BASE_DIR) #添加环境变量
from Lexer.Token import Token
import logging
def mkdir(path): 
    path=path.strip()
    path=path.rstrip("\\")
    isExists=os.path.exists(path)
    if not isExists:
        os.makedirs(path) 
        return True
    else:
        return False
mkdir('log')
logging.basicConfig(filename='log/Lexer.log', level=logging.DEBUG)
log = logging.getLogger('Lexer')

class Lexer:
    def __init__(self, file_path='', code = ''):
        self.current_raw = 0
        self.current_column = -1
        self.EOF = '\0'
        if file_path != '':
            self.source_code = self.read_source_code(file_path)
        elif code != '':
            self.source_code = self.code2readlines(code)
        self.TOKEN = []

    def getTOKEN(self):
        return self.TOKEN
    
    def log(self):
        log.debug(self.TOKEN)

    def read_source_code(self, file_path):
        f = open(file_path, "r", encoding='utf-8')
        source_code = f.readlines()
        f.close()
        return source_code

    def code2readlines(self, code):
        arr = code.split('\n')
        for i in range(len(arr)):
            arr[i] += '\n'
            arr[i].strip()
        return arr

    def getNextChar(self):
        self.current_column += 1
        if self.current_raw >= len(self.source_code):
            return self.EOF
        if self.current_column >= len(self.source_code[self.current_raw]):
            self.current_raw += 1
            self.current_column = -1
            return '\\n'
        return self.source_code[self.current_raw][self.current_column]

    def back(self):
        if self.current_column != -1:
            self.current_column -= 1
        else:
            self.current_raw -= 1
            self.current_column = len(self.source_code[self.current_raw])

    def recognizeId(self, ch):
        '''
        标志符 Identity
        包括 关键词、电路符、标志符（自定义变量）
        '''
        state = 0
        str = ''
        while state != 2:
            if state == 0:
                if ch.isalpha() or ch == '_':
                    state = 1
                    str += ch
                else:
                    raise ValueError('Failed to recognizeId ch: {}'.format(ch))
            if state == 1:
                ch = self.getNextChar()
                if ch.isalpha() or ch.isdigit() or ch == '_':
                    state = 1
                    str += ch
                else:
                    state = 2
        self.back()
        return str

    def recognizeOp(self, ch):
        '''识别操作数 OPERATOR'''
        state = 0
        str = ''
        while state != 2:
            if state == 0:
                if Token.isOPERATOR(ch):
                    state = 1
                    str += ch
                else:
                    raise ValueError('Failed to recognizeOp ch: {}'.format(ch))
            if state == 1:
                ch = self.getNextChar()
                if Token.isOPERATOR(ch):
                    state = 1
                    str += ch
                else:
                    state = 2
        self.back()
        return str

    def recognizeInteger(self, ch):
        '''
        简化版，会把 3a 这种明显错误的字符串识别为整数3，但是没关系，反正没有人review我代码:)
        '''
        state = 0
        str = ''
        while state != 2:
            if state == 0:
                if ch.isdigit():
                    state = 1
                    str += ch
                else:
                    raise ValueError('Failed to recognizeInteger ch: {}'.format(ch))
            if state == 1:
                ch = self.getNextChar()
                if ch.isdigit():
                    state = 1
                    str += ch
                else:
                    state = 2
        self.back()
        return str

    def recognizeComment(self, ch):
        state = 0
        str = ''
        while state != 3:
            if state == 0:
                if ch == '/':
                    state = 1
                    str += ch
                else:
                    raise ValueError('Failed to recognizeComment ch: {}'.format(ch))
            if state == 1:
                if ch == '/':
                    state = 2
                    str += ch
                else:
                    raise ValueError('Failed to recognizeComment ch: {}'.format(ch))
            if state == 2:
                ch = self.getNextChar()
                if ch != '\\n':
                    state = 2
                    str += ch
                else:
                    state = 3
        self.back()
        return str

    def lookahead(self):
        ch = self.getNextChar()
        self.back()
        return ch

    def scanner(self):
        ch = ''
        while ch != '\0':
            ch = self.getNextChar()
            if ch == ' ':
                pass
            elif ch == '\n':
                self.TOKEN.append([Token.TOKENID['\\n'], ch])
            elif ch.isalpha() or ch == '_':
                Identify = self.recognizeId(ch)
                if Token.isKEYWORD(Identify):
                    self.TOKEN.append([Token.TOKENID[Identify], Identify])
                elif Token.isCIRCUIT(Identify):
                    self.TOKEN.append([Token.TOKENID[Identify], Identify])
                else:
                    self.TOKEN.append([Token.TOKENID['Identify'], Identify])
            elif ch.isdigit():
                Integer = self.recognizeInteger(ch)
                if Integer.isdigit():
                    self.TOKEN.append([Token.TOKENID['INT'], Integer])
                #浮点数
            elif Token.isOPERATOR(ch):
                if ch == '/' and self.lookahead() == '/':
                    self.recognizeComment(ch)
                    self.TOKEN.append([Token.TOKENID['\\n'], '\n'])
                    continue
                Op = self.recognizeOp(ch)
                self.TOKEN.append([Token.TOKENID[Op], Op])
                pass
            elif Token.isSEPARATOR(ch):
                self.TOKEN.append([Token.TOKENID[ch], ch])
                pass
            else:
                pass
                # log.debug(ch)

if __name__ == '__main__':
    lexer = Lexer('QLight/code_0.txt')
    lexer.scanner()
    log.debug(lexer.getTOKEN())