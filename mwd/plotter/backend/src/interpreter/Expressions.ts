//interface/record for functions
const functions: Record<string,Function> = {
    "sin": Math.sin,
    "cos": Math.cos,
    "tan": Math.tan,
    "custom": (x: number) => {return x*3}

} 
//Treenode is the superclass for the AST structure
abstract class TreeNode{
    constructor(){}

   abstract eval(): number;
}

/**
 * Number class
 */
export class Num extends TreeNode{
    private digits: string;
    
    constructor(str: string){super(); this.digits = str;};

    eval(): number{
        return Number(this.digits);
    }
}

/**
 * Expression class
 */
export class Expression extends TreeNode{
    //tuple of (operator(-1,+1), term)
    private terms: [number,Term][] = [];
    
    constructor(){super();};

    addTerm(operator: number,term: Term): void{
        this.terms.push([operator,term]);
    }

    eval(): number{
        let final_value: number = 0;
        this.terms.forEach((value) => {
            let operator: number = value[0];
            let term: Term = value[1];
            final_value += operator * term.eval(); 
        });

        return final_value;
    }
}

/**
 * Term class
 */
export class Term extends TreeNode{
    //list of operators ("*","/") and factors
    private factors: [string,Factor][] = []

    constructor(){
        super();
    }

    addFactor(operator: string, factor: Factor): void{
        this.factors.push([operator,factor]);
    }

    eval(): number{
        let final_value: number = this.factors[0][1].eval();
        for(var i: number = 0; i < this.factors.length-1; i++){

            if (this.factors[i+1][0] == "*"){
                final_value *= this.factors[i+1][1].eval();
            }
            else{
                final_value /= this.factors[i+1][1].eval();
            }
            
        }

        return final_value;
    }

    isEmpty(): boolean{
        return this.factors.length <= 0
    }
}
/**
 * Factor class
 */

export class Factor extends TreeNode{
    public factor!: Num | BracketedExpression | FunctionCall;

    constructor(){super()};  

    eval(): number{
        return this.factor.eval();
    }
}
/**
 * Function call class
 */
export class FunctionCall extends TreeNode{
    public name!: string;
    public expression!: Expression;


    constructor(){super();};

    eval(): number{
        if (functions[this.name] == undefined){
            throw new Error("Function name '" + this.name + "' not found");
        }

        return functions[this.name](this.expression.eval());
    }
}
/**
 * Bracketed Expression class
 */
export class BracketedExpression extends TreeNode{
    public expression!: Expression;


    constructor(){super();};

    eval(): number {
        return this.expression.eval();
    }
}


