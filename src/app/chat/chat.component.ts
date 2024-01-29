import { Component, OnInit, Input } from '@angular/core';
import * as signalR from '@microsoft/signalr';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
  contentText: string = "";
  rows: number = 1;
  maxRows: number = 5;
  connection?: signalR.HubConnection;
  userInfo: any;
  messages: any[] = [];
  @Input() curUser: any = {};
  constructor() { }

  ngOnInit() {
    this.initSignal();
  }
  initSignal() {
    const urlParams = new URLSearchParams(window.location.search);
    const authToken = urlParams.get('token');
    const chanel = urlParams.get('chanel');

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl("https://fsiconnectedapi.azurewebsites.net/meet", {
        accessTokenFactory: () => authToken + '',
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets
      })
      .configureLogging(signalR.LogLevel.Information)
      .build();

    this.connection.start().then(async () => {
      await this.connection?.invoke("JoinMeet", chanel);
      console.log('SignalR Connected!');
    }).catch(function (err: any) {
      console.log('ddeso Connected!');

      return console.error(err.toString());
    });

    this.connection.on("OnMessage", (userId: string, message: string) => {
      this.userInfo = JSON.parse(localStorage.getItem("users") || "[]").find((x: any) => x.id == userId);
      let msgObj = { sender: this.userInfo, message: message, time: this.getTime(new Date()) };

      if (msgObj.sender.id === this.curUser.nameid) {
        msgObj.sender.name = 'Bạn';
      }
      this.messages.push(msgObj)
    });

  }
  async send() {
    await this.connection?.invoke("Chat", this.contentText);
    this.contentText= "";
  }
  handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && event.shiftKey) {

      this.rows = Math.min(this.rows + 1, this.maxRows);
    } else if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.send();
      this.rows = 1;
    } else if (event.key === 'Backspace' && this.contentText !== '') {
      const lines = this.contentText.split('\n');
      const lastLine = lines[lines.length - 1];
      if (lastLine.trim() === '') {
        this.rows = Math.max(this.rows - 1, 1);
      }
    }
  }

  handleKeyUp(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
    }
  }
  handleChange(): void {
    if (this.contentText === '') {
      this.rows = 1;
    }
  }
  getTime(d: Date) {
    return `${this.formatNumber(d.getHours())}:${this.formatNumber(d.getMinutes())}`;
  }
  formatNumber(n: any) {
    if (n >= 10)
      return n;
    else
      return '0' + n;
  }

}
