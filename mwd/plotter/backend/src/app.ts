import {WebSocket, WebSocketServer} from 'ws';
import {runInterpreter} from "./interpreter/Parser";
import {ClientMessage, MessageType, ServerMessage} from "./types"


class Server{
    private wss!: WebSocketServer
    private clientsSet: Set<string>;
    private socketToUsername: Map<WebSocket, string>;
    constructor() {
        this.clientsSet = new Set<string>();
        this.socketToUsername = new Map<WebSocket, string>();
    }

    private sendToClient(client: WebSocket, msg: ServerMessage){
        client.send(JSON.stringify(msg));
    }

    private isOnline(username: string): boolean{
       return this.clientsSet.has(username)
    }
    private NotifyClientNotLoggedIn(client: WebSocket): void{
        this.sendToClient(client,
            {
            type: MessageType.ERROR,
            content: "User not logged in",
            f_out: 0,
                x: 0
        })
    }

    private evalAndSendFormula(msg: ClientMessage, client: WebSocket){

        console.log("Received formula")
        for (let i = msg.beginW; i <= msg.endW; i++) {
            try{
                let formula: string = msg.content.replace(/[x]/g,i.toString());
                let f_out: number = Number(runInterpreter(formula))
                this.sendToClient(client,{
                    type: MessageType.PLOT,
                    content: "",
                    f_out: f_out,
                    x:i
                });
            }
            catch(e){
                this.sendToClient(client,{
                    type: MessageType.ERROR,
                    content: "Couldn't parse formula",
                    f_out: 0,
                    x:0
                })
            }
        }
    }
    private clientLogin(msg: ClientMessage, client: WebSocket){
        console.log(msg.type )
        this.clientsSet.add(msg.username);
        this.socketToUsername.set(client, msg.username);
        this.sendToClient(client,{
            type: MessageType.LOGIN,
            content: "",
            f_out: 0,
            x:0
        });
        console.log(`Login of ${msg.username}`)

    }

    private processMessageType(msg: ClientMessage, client: WebSocket){
        switch(msg.type){
            case MessageType.CONTROL:
                if(!this.isOnline(msg.username)){
                    this.NotifyClientNotLoggedIn(client)
                    break
                }
                break;
            case MessageType.LOGIN:
                if(this.isOnline(msg.username)){
                    this.sendToClient(client,{
                        type: MessageType.ERROR,
                        content: "Already logged in",
                        f_out: 0,
                        x:0
                    });
                    break;
                }
                this.clientLogin(msg,client)
                break;
            case MessageType.FORMULA:
                if(!this.isOnline(msg.username)){
                    this.NotifyClientNotLoggedIn(client)
                    break
                }
                this.evalAndSendFormula(msg,client);
            default:
                break;
        }
    }

    private processMessage(message: string, client: WebSocket): void{
        var msg!: ClientMessage;
        try {
            msg = JSON.parse(JSON.parse(message));
        }
        catch(e){
            this.sendToClient(client,{
                type: MessageType.ERROR,
                content: "JSON parse failed",
                f_out: 0,
                x:0
            })
            return
        }
        this.processMessageType(msg,client);
    }

    private processClose(client: WebSocket): void{
        var username: string = (this.socketToUsername.get(client) as string);
        this.socketToUsername.delete(client);
        this.clientsSet.delete(username);

    }

    public init(port:number = 8080): void{
        this.wss = new WebSocketServer({port:port})

        console.log(`Server started on port ${port}`)

        this.wss.on("connection",(ws: WebSocket) => {

            console.log(`New client connected - Clients: ${this.clientsSet.size + 1}`);

            ws.on("message", (message: string) => {
                console.log("Received message")
                this.processMessage(message, ws);
            })

            ws.on("close", () => {
                console.log("Connection closed")
                this.processClose(ws);
            })

        })
    }

}

const server: Server = new Server();
server.init();



