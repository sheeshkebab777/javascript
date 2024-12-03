"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.runInterpreter = void 0;
const E = __importStar(require("./Expressions"));
const S = __importStar(require("./Scanner"));
class Parser {
    constructor(scanner) { this.scanner = scanner; }
    ;
    parse(str) {
        var tokens = this.scanner.getTokens(str);
        var finalExpression = this.startParsing(tokens);
        //console.log(finalExpression.terms[0].factors) 
        return finalExpression;
    }
    checkEmptyTokens(tokens) {
        if (tokens.length <= 0) {
            throw new Error("Tokens are empty");
        }
    }
    startParsing(tokens) {
        var exp = this.parseExpression(tokens);
        if (tokens.length > 0) {
            throw new Error("Token: '" + tokens[0].str + "' causing problem");
        }
        return exp;
    }
    parseExpression(tokens) {
        this.checkEmptyTokens(tokens);
        var exp = new E.Expression();
        if (tokens[0].type != S.Type.operator) {
            exp.addTerm(1, this.parseTerm(tokens));
        }
        while (tokens.length > 0 && tokens[0].type == S.Type.operator) {
            var operator = tokens[0];
            if (operator.str == "+") {
                tokens.shift();
                exp.addTerm(1, this.parseTerm(tokens));
            }
            else if (operator.str == "-") {
                tokens.shift();
                exp.addTerm(-1, this.parseTerm(tokens));
            }
            else {
                break;
            }
        }
        return exp;
    }
    parseTerm(tokens) {
        this.checkEmptyTokens(tokens);
        var term = new E.Term();
        if (tokens[0].type != S.Type.operator) {
            term.addFactor("*", this.parseFactor(tokens));
        }
        while (tokens.length > 0 && tokens[0].type == S.Type.operator) {
            var operator = tokens[0];
            if (operator.str == "*") {
                tokens.shift();
                term.addFactor("*", this.parseFactor(tokens));
            }
            else if (operator.str == "/") {
                tokens.shift();
                term.addFactor("/", this.parseFactor(tokens));
            }
            else {
                break;
            }
        }
        if (term.isEmpty()) {
            throw new Error("Token: '" + tokens[0].str + "' causing problems");
        }
        return term;
    }
    parseFactor(tokens) {
        this.checkEmptyTokens(tokens);
        var factor = new E.Factor();
        switch (tokens[0].type) {
            case S.Type.openBracket:
                factor.factor = this.parseBracketedExpression(tokens);
                break;
            case S.Type.functionName:
                factor.factor = this.parseFunctionCall(tokens);
                break;
            case S.Type.num:
                factor.factor = this.parseNumber(tokens);
                break;
            default:
                throw new Error("No type for factor found at token: '" + tokens[0].str + "'");
        }
        return factor;
    }
    parseBracketedExpression(tokens) {
        this.checkEmptyTokens(tokens);
        var brackExpression = new E.BracketedExpression();
        //already checked for opening bracket
        tokens.shift();
        brackExpression.expression = this.parseExpression(tokens);
        this.checkEmptyTokens(tokens);
        var bracket = tokens.shift();
        if (bracket.type != S.Type.closingBracket) {
            throw new Error("Missing closing bracket");
        }
        return brackExpression;
    }
    parseFunctionCall(tokens) {
        this.checkEmptyTokens(tokens);
        var functionCall = new E.FunctionCall();
        //we already know there is a functioncall token
        var token = tokens.shift();
        functionCall.name = token.str;
        if (tokens.length > 0 && tokens[0].type == S.Type.openBracket) {
            tokens.shift();
            functionCall.expression = this.parseExpression(tokens);
            if (tokens.length > 0 && tokens[0].type == S.Type.closingBracket) {
                tokens.shift();
            }
            else {
                throw new Error("No closing brackets for function call");
            }
        }
        else {
            throw new Error("No opening bracket for function call");
        }
        return functionCall;
    }
    parseNumber(tokens) {
        var _a;
        this.checkEmptyTokens(tokens);
        var num = (_a = tokens.shift()) === null || _a === void 0 ? void 0 : _a.str;
        if (num == undefined) {
            throw new Error("No number left");
        }
        return new E.Num(num);
    }
}
const runInterpreter = (input) => {
    var parser = new Parser(new S.Scanner());
    try {
        const sol = (parser.parse(input).eval());
        return sol.toString();
    }
    catch (e) {
        return e.message.toString();
    }
};
exports.runInterpreter = runInterpreter;
