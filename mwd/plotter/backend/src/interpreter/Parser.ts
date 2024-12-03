import * as E from "./Expressions"
import * as S from "./Scanner"

class Parser{
    private scanner: S.Scanner;
    constructor(scanner: S.Scanner){this.scanner = scanner};

    

    parse(str: string): E.Expression | E.BracketedExpression{
        var tokens: S.Token[] = this.scanner.getTokens(str);
        var finalExpression: E.Expression = this.startParsing(tokens);
        //console.log(finalExpression.terms[0].factors) 
        return finalExpression;
    }

    private checkEmptyTokens(tokens: S.Token[]): void{
        if (tokens.length <= 0){
            throw new Error("Tokens are empty")
        }
    }
    private startParsing(tokens: S.Token[]): E.Expression{
        var exp: E.Expression = this.parseExpression(tokens);

        if (tokens.length > 0){
            throw new Error("Token: '" + tokens[0].str +"' causing problem")
        }

        return exp;
    }
    private parseExpression(tokens: S.Token[]): E.Expression{
        this.checkEmptyTokens(tokens);
        var exp: E.Expression = new E.Expression();

        if (tokens[0].type != S.Type.operator){
            exp.addTerm(1,this.parseTerm(tokens));
        }

        while (tokens.length > 0  && tokens[0].type == S.Type.operator){
            var operator = tokens[0]
            if (operator.str == "+"){
                tokens.shift()
                exp.addTerm(1,this.parseTerm(tokens))
            }
            else if (operator.str == "-"){
                tokens.shift()
                exp.addTerm(-1,this.parseTerm(tokens))
            }
            else{
                break;
            }
            
            
        }
        return exp;
    }

    private parseTerm(tokens: S.Token[]): E.Term{
        this.checkEmptyTokens(tokens);
        var term: E.Term = new E.Term();

        if (tokens[0].type != S.Type.operator){
            term.addFactor("*",this.parseFactor(tokens));
        }

        while (tokens.length > 0 && tokens[0].type == S.Type.operator){
            var operator = tokens[0]
            if (operator.str == "*"){
                tokens.shift()
                term.addFactor("*",this.parseFactor(tokens))
            }
            else if (operator.str == "/"){
                tokens.shift()
                term.addFactor("/",this.parseFactor(tokens))
            }
            else{
                break;
            }
            
        } 
        if (term.isEmpty()){
            throw new Error("Token: '" + tokens[0].str + "' causing problems")
        }
        return term;
    }

    private parseFactor(tokens: S.Token[]): E.Factor{
        this.checkEmptyTokens(tokens);
    
        var factor: E.Factor = new E.Factor();
        switch(tokens[0].type){
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
                throw new Error("No type for factor found at token: '" + tokens[0].str + "'")
        }

        return factor;
    }

    private parseBracketedExpression(tokens: S.Token[]): E.BracketedExpression{
        this.checkEmptyTokens(tokens);
        var brackExpression: E.BracketedExpression = new E.BracketedExpression();
        //already checked for opening bracket
        tokens.shift()
        brackExpression.expression = this.parseExpression(tokens);

        this.checkEmptyTokens(tokens);
        var bracket: S.Token = tokens.shift() as S.Token;
        if (bracket.type != S.Type.closingBracket){
            throw new Error("Missing closing bracket")
        }

        return brackExpression;
        
    }

    private parseFunctionCall(tokens:S.Token[]): E.FunctionCall{
        this.checkEmptyTokens(tokens);

        var functionCall: E.FunctionCall = new E.FunctionCall();
        //we already know there is a functioncall token
        var token: S.Token = tokens.shift() as S.Token
        functionCall.name = token.str 

        if(tokens.length > 0 && (tokens[0].type as S.Type) == S.Type.openBracket){
            tokens.shift()
            functionCall.expression = this.parseExpression(tokens)

            if (tokens.length > 0 && (tokens[0].type as S.Type) == S.Type.closingBracket){
                tokens.shift()
            }
            else{
                throw new Error("No closing brackets for function call")
            }
        }
        else{
            throw new Error("No opening bracket for function call")
        }
        return functionCall;
    }

    private parseNumber(tokens: S.Token[]): E.Num{
        this.checkEmptyTokens(tokens);
        var num: string | undefined = tokens.shift()?.str;
        if (num == undefined){
            throw new Error("No number left");
            
        }

        return new E.Num(num);
    }
    



}
export const runInterpreter = (input: string) => {
    var parser: Parser = new Parser(new S.Scanner());
    try{
         const sol = (parser.parse(input).eval())
         return sol.toString();

    }
    catch (e){
        return (e as Error).message.toString()
    }
       
};
