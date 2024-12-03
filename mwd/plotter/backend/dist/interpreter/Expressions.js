"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BracketedExpression = exports.FunctionCall = exports.Factor = exports.Term = exports.Expression = exports.Num = void 0;
//interface/record for functions
const functions = {
    "sin": Math.sin,
    "cos": Math.cos,
    "tan": Math.tan,
    "custom": (x) => { return x * 3; }
};
//Treenode is the superclass for the AST structure
class TreeNode {
    constructor() { }
}
/**
 * Number class
 */
class Num extends TreeNode {
    constructor(str) { super(); this.digits = str; }
    ;
    eval() {
        return Number(this.digits);
    }
}
exports.Num = Num;
/**
 * Expression class
 */
class Expression extends TreeNode {
    constructor() {
        super();
        //tuple of (operator(-1,+1), term)
        this.terms = [];
    }
    ;
    addTerm(operator, term) {
        this.terms.push([operator, term]);
    }
    eval() {
        let final_value = 0;
        this.terms.forEach((value) => {
            let operator = value[0];
            let term = value[1];
            final_value += operator * term.eval();
        });
        return final_value;
    }
}
exports.Expression = Expression;
/**
 * Term class
 */
class Term extends TreeNode {
    constructor() {
        super();
        //list of operators ("*","/") and factors
        this.factors = [];
    }
    addFactor(operator, factor) {
        this.factors.push([operator, factor]);
    }
    eval() {
        let final_value = this.factors[0][1].eval();
        for (var i = 0; i < this.factors.length - 1; i++) {
            if (this.factors[i + 1][0] == "*") {
                final_value *= this.factors[i + 1][1].eval();
            }
            else {
                final_value /= this.factors[i + 1][1].eval();
            }
        }
        return final_value;
    }
    isEmpty() {
        return this.factors.length <= 0;
    }
}
exports.Term = Term;
/**
 * Factor class
 */
class Factor extends TreeNode {
    constructor() { super(); }
    ;
    eval() {
        return this.factor.eval();
    }
}
exports.Factor = Factor;
/**
 * Function call class
 */
class FunctionCall extends TreeNode {
    constructor() { super(); }
    ;
    eval() {
        if (functions[this.name] == undefined) {
            throw new Error("Function name '" + this.name + "' not found");
        }
        return functions[this.name](this.expression.eval());
    }
}
exports.FunctionCall = FunctionCall;
/**
 * Bracketed Expression class
 */
class BracketedExpression extends TreeNode {
    constructor() { super(); }
    ;
    eval() {
        return this.expression.eval();
    }
}
exports.BracketedExpression = BracketedExpression;
