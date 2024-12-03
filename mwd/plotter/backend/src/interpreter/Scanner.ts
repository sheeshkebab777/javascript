import * as E from "./Expressions";
//token types
export enum Type {
    num,
    functionName,
    openBracket,
    closingBracket,
    operator,
    null,
}
//token
export interface Token {
    type: Type;
    str: string;
}

export class Scanner {
    constructor() {}
    //convert string to array of tokens
    getTokens(str: string) {
        var currentType: Type = Type.null;
        var tokens: Token[] = [];
        //remove spaces and split into an array of characters
        //if (hasSyntaxError(str)){
            //. without a num after and if numbers are seperated by blank
        //}
        var chars: string[] = str.split(" ").join("").split("");
        var currentString: string = "";

        //scanning
        chars.forEach((value) => {
            //if its a digit
            if (!isNaN(Number(value)) || value == ".") {
                
                if (currentType == Type.functionName && value != "."){
                    currentString = currentString.concat(value);
                    return;
                }
                if (currentType != Type.num && currentType != Type.null) {
                    tokens.push({ type: currentType, str: currentString });
                    currentString = "";
                }

                currentType = Type.num;
                currentString = currentString.concat(value);
            } else {
                if (currentType == Type.num) {
                    tokens.push({ type: Type.num, str: currentString });
                    currentString = "";
                    currentType = Type.null;
                }
                if (["+", "-", "*", "/", "(", ")", ","].includes(value)) {
                    if (currentType == Type.functionName) {
                        tokens.push({
                            type: Type.functionName,
                            str: currentString,
                        });
                        currentString = "";
                        currentType = Type.null;
                    }

                    if (value == "(") {
                        tokens.push({ type: Type.openBracket, str: "(" });
                    } else if (value == ")") {
                        tokens.push({ type: Type.closingBracket, str: ")" });
                    } else if (["+", "*", "-", "/"].includes(value)) {
                        tokens.push({ type: Type.operator, str: value });
                    }
                } else {
                    currentType = Type.functionName;
                    currentString = currentString.concat(value);
                }
            }
        });
        if (currentType != Type.null) {
            tokens.push({ type: currentType, str: currentString });
        }

        return tokens;
    }
}

