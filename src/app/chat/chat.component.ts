import { Component, OnInit } from '@angular/core';
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


  constructor() { }

  ngOnInit() {
    this.initSignal();
  }
  initSignal() {
    const urlParams = new URLSearchParams(window.location.search);
    const authToken = urlParams.get('token');
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl("https://localhost:7777/meet", {
        accessTokenFactory: () => authToken + '',
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets
      })
      .configureLogging(signalR.LogLevel.Information)
      .build();

    this.connection.start().then(function () {

      console.log('SignalR Connected!');
    }).catch(function (err: any) {
      console.log('ddeso Connected!');

      return console.error(err.toString());
    });

    this.connection.on("OnMessage", (userId: string, message: string) => {
     debugger
    });

  }
  async send() {
    await this.connection?.invoke("Chat", "abc")
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

}
