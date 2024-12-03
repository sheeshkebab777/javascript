"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const Parser_1 = require("./interpreter/Parser");
const types_1 = require("./types");
class Server {
    constructor() {
        this.clientsSet = new Set();
        this.socketToUsername = new Map();
    }
    sendToClient(client, msg) {
        client.send(JSON.stringify(msg));
    }
    isOnline(username) {
        return this.clientsSet.has(username);
    }
    NotifyClientNotLoggedIn(client) {
        this.sendToClient(client, {
            type: types_1.MessageType.ERROR,
            content: "User not logged in",
            f_out: 0,
            x: 0
        });
    }
    evalAndSendFormula(msg, client) {
        console.log("Received formula");
        for (let i = msg.beginW; i <= msg.endW; i++) {
            try {
                let formula = msg.content.replace(/[x]/g, i.toString());
                let f_out = Number((0, Parser_1.runInterpreter)(formula));
                this.sendToClient(client, {
                    type: types_1.MessageType.PLOT,
                    content: "",
                    f_out: f_out,
                    x: i
                });
            }
            catch (e) {
                this.sendToClient(client, {
                    type: types_1.MessageType.ERROR,
                    content: "Couldn't parse formula",
                    f_out: 0,
                    x: 0
                });
            }
        }
    }
    clientLogin(msg, client) {
        console.log(msg.type);
        this.clientsSet.add(msg.username);
        this.socketToUsername.set(client, msg.username);
        this.sendToClient(client, {
            type: types_1.MessageType.LOGIN,
            content: "",
            f_out: 0,
            x: 0
        });
        console.log(`Login of ${msg.username}`);
    }
    processMessageType(msg, client) {
        switch (msg.type) {
            case types_1.MessageType.CONTROL:
                if (!this.isOnline(msg.username)) {
                    this.NotifyClientNotLoggedIn(client);
                    break;
                }
                break;
            case types_1.MessageType.LOGIN:
                if (this.isOnline(msg.username)) {
                    this.sendToClient(client, {
                        type: types_1.MessageType.ERROR,
                        content: "Already logged in",
                        f_out: 0,
                        x: 0
                    });
                    break;
                }
                this.clientLogin(msg, client);
                break;
            case types_1.MessageType.FORMULA:
                if (!this.isOnline(msg.username)) {
                    this.NotifyClientNotLoggedIn(client);
                    break;
                }
                this.evalAndSendFormula(msg, client);
            default:
                break;
        }
    }
    processMessage(message, client) {
        var msg;
        try {
            msg = JSON.parse(JSON.parse(message));
        }
        catch (e) {
            this.sendToClient(client, {
                type: types_1.MessageType.ERROR,
                content: "JSON parse failed",
                f_out: 0,
                x: 0
            });
            return;
        }
        this.processMessageType(msg, client);
    }
    processClose(client) {
        var username = this.socketToUsername.get(client);
        this.socketToUsername.delete(client);
        this.clientsSet.delete(username);
    }
    init(port = 8080) {
        this.wss = new ws_1.WebSocketServer({ port: port });
        console.log(`Server started on port ${port}`);
        this.wss.on("connection", (ws) => {
            console.log(`New client connected - Clients: ${this.clientsSet.size + 1}`);
            ws.on("message", (message) => {
                console.log("Received message");
                this.processMessage(message, ws);
            });
            ws.on("close", () => {
                console.log("Connection closed");
                this.processClose(ws);
            });
        });
    }
}
const server = new Server();
server.init();
