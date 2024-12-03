import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StatusService {
  public loggedIn: boolean = false;
  public loginFailed: boolean = false;
  public statusString: string = ""
  public username: string = "";
  constructor() { }
}
