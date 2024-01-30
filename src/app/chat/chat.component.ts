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
  // connection?: signalR.HubConnection;
  userInfo: any;
  messages: any[] = [];
  @Input() curUser: any = {};
  @Input() connection?: signalR.HubConnection;
  constructor() { }

  ngOnInit() {
    this.connection?.on("OnMessage", (userId: string, message: string) => {
      this.userInfo = JSON.parse(localStorage.getItem("users") || "[]").find((x: any) => x.id == userId);
      let msgObj = { sender: this.userInfo, message: message, time: new Date(), showA: false };

      if (msgObj.sender.id === this.curUser.nameid) {
        msgObj.sender.name = 'Bạn';
      }
      this.messages.push(msgObj)
      this.messages?.forEach((m, i: number) => {
        if (i == 0) {
          m.showA = true;
        } else {
          let _m = this.messages[i - 1];
          if (m.sender?.id == _m.sender?.id) {
            let diff = Number(new Date(m.time ?? "")) - Number(new Date(_m.time ?? ""));
            if (diff > 240000) {
              m.showA = true;
            } else {
              return;
            }
          } else {
            m.showA = true;
          }
        }
      });
    });
  }

  async send() {
    if (this.contentText === "")
      return;
    await this.connection?.invoke("Chat", this.contentText);
    this.contentText = "";
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
  handleChange(event: any): void {
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
