import {Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import {WebsocketService} from "../../services/websocket.service";
import {FormsModule} from "@angular/forms";
import {MessageType} from "../../other/types";
import {StatusService} from "../../services/status.service";
import {DrawService} from "../../services/draw.service";

@Component({
  selector: 'app-canvas',
  standalone: true,
  imports: [
    FormsModule
  ],
  templateUrl: './canvas.component.html',
  styleUrl: './canvas.component.css'
})
export class CanvasComponent implements  AfterViewInit{

  private colors: string[] = ["red","blue","green"]
  public formula: string = ""
  @ViewChild('canvasRef') canvasRef!: ElementRef<HTMLCanvasElement>;
  constructor(public webSocketService: WebsocketService, public statusService: StatusService, public drawService: DrawService) {
    this.drawService._canvasComponent = this
  }

  ngAfterViewInit(){
    this.drawCoordinateSys()
  }

  private getCanvas(){
    return this.canvasRef.nativeElement
  }
  private drawCoordinateSys(){
    const canvas = this.getCanvas()
    const context = (canvas.getContext("2d") as CanvasRenderingContext2D)

    context.strokeStyle = "black"
    context.lineWidth = 1
    context.beginPath()
    context.moveTo(canvas.width/2,0)
    context.lineTo(canvas.width/2,canvas.height)
    context.stroke()

    context.beginPath()
    context.moveTo(0,canvas.height/2)
    context.lineTo(canvas.width,canvas.height/2)
    context.stroke()

  }
  public draw(x: number, y: number, color: any){

    const canvas = this.getCanvas()
    const context = (canvas.getContext("2d") as CanvasRenderingContext2D)
    y = canvas.height/2 - y
    y *= 10
    context.fillStyle = this.colors[color%this.colors.length]
    context.fillRect(x,y,2,2);
  }

  public clear(){
    const canvas = this.getCanvas()
    const context = (canvas.getContext("2d") as CanvasRenderingContext2D)
    context.clearRect(0, 0,canvas.width, canvas.height);

    this.drawCoordinateSys()
  }

  public send(){
    const canvas = this.getCanvas()
    this.webSocketService.send({
      type: MessageType.FORMULA,
      username: this.statusService.username,
      content: this.formula,
      beginW: 0,
      endW: canvas.width
    })
  }
}
