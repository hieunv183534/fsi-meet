import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-member-item',
  templateUrl: './member-item.component.html',
  styleUrls: ['./member-item.component.css']
})
export class MemberItemComponent implements OnInit, OnChanges {

  @Input() uid: string = "";
  @Input() videoTrack: any = null;
  @Input() audioTrack: any = null;

  @Input() isSceenShare: boolean = false;

  @Input() isPinned: boolean = false;
  @Input() isInvited: boolean = false;

  @Output() pin: EventEmitter<any> = new EventEmitter();
  @Output() unPin: EventEmitter<any> = new EventEmitter();

  userInfo: any;

  constructor() { }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['uid']?.currentValue) {
      if (this.isSceenShare) {
        let userId = this.uid.replace("screen", "");
        this.userInfo = JSON.parse(localStorage.getItem("users") || "[]").find((x: any) => x.id == userId);
      } else {
        this.userInfo = JSON.parse(localStorage.getItem("users") || "[]").find((x: any) => x.id == this.uid);
      }
    }
  }

  ngOnInit() {
    if (this.isSceenShare) {
      let userId = this.uid.replace("screen", "");
      this.userInfo = JSON.parse(localStorage.getItem("users") || "[]").find((x: any) => x.id == userId);
    } else {
      this.userInfo = JSON.parse(localStorage.getItem("users") || "[]").find((x: any) => x.id == this.uid);
    }
  }


  pinU(){
    this.pin.emit({ uid: this.uid, userName: this.userInfo.name, avatarUrl: this.userInfo.avatarUrl });
  }

  unPinU(){
    this.unPin.emit();
  }
}
