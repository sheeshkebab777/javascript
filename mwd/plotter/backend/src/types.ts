export enum MessageType {
    CONTROL,
    FORMULA,
    LOGIN,
    PLOT,
    ERROR,
}


export interface ServerMessage {
    type: MessageType;
    content: string;
    x: number;
    f_out: number;

};

export interface ClientMessage{
    type: MessageType;
    username: string;
    content: string;
    beginW: number;
    endW: number;
};
