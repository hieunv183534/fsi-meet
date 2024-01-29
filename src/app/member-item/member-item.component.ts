import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-member-item',
  templateUrl: './member-item.component.html',
  styleUrls: ['./member-item.component.css']
})
export class MemberItemComponent implements OnInit {

  @Input() uid: string = "";
  @Input() videoTrack: any = null;
  @Input() audioTrack: any = null;

  @Input() isSceenShare: boolean = false;

  @Output() pin: EventEmitter<any> = new EventEmitter();

  userInfo: any;

  constructor() { }

  ngOnInit() {
    if (this.isSceenShare) {
      let userId = this.uid.replace("screen", "");
      this.userInfo = JSON.parse(localStorage.getItem("users") || "[]").find((x: any) => x.id == userId);
    } else {
      this.userInfo = JSON.parse(localStorage.getItem("users") || "[]").find((x: any) => x.id == this.uid);
    }
  }

  pinUser() {

  }

  changePin(e: any){
    if(e.checked){
      this.pin.emit({ uid: this.uid, userName: this.userInfo.name, avatarUrl: this.userInfo.avatarUrl });
    }else{

    }
  }

}
