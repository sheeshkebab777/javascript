import { Injectable } from '@angular/core';
import {CanvasComponent} from "../components/canvas/canvas.component";

@Injectable({
  providedIn: 'root'
})
export class DrawService {

  private canvasComponent!: CanvasComponent;
  constructor() { }

  public set _canvasComponent(canvasComponent: CanvasComponent){
    this.canvasComponent = canvasComponent
  }

  public draw(x:number,y:number,color:number){
    this.canvasComponent.draw(x,y*10,color)
  }
}
