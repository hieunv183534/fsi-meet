import { Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, Renderer2, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-meet-item',
  templateUrl: './meet-item.component.html',
  styleUrls: ['./meet-item.component.css']
})
export class MeetItemComponent implements OnInit, OnChanges {

  @Input() uid: string = "";
  @Input() videoTrack: any = null;
  @Input() audioTrack: any = null;

  @Input() isOnMic?: boolean = false;

  @Input() isSceenShare: boolean = false;

  @Input() videoPlaying?: boolean = false;
  @Input() audioPlaying?: boolean = false;

  @Output() pin: EventEmitter<any> = new EventEmitter();

  @Output() onVideo: EventEmitter<any> = new EventEmitter();
  @Output() offVideo: EventEmitter<any> = new EventEmitter();

  @Output() onAudio: EventEmitter<any> = new EventEmitter();
  @Output() offAudio: EventEmitter<any> = new EventEmitter();

  userInfo: any;


  constructor(private el: ElementRef, private renderer: Renderer2) {
    this.renderer.addClass(this.el.nativeElement, 'meet-item');
  }


  ngOnChanges(changes: SimpleChanges): void {
    if (changes['videoTrack']?.currentValue) {
      setTimeout(() => {
        this.videoTrack.play(this.uid);
        this.onVideo.emit(this.uid);
      }, 100);
    }

    if (changes['audioTrack']?.currentValue) {
      this.audioTrack.play();
      this.onAudio.emit(this.uid);
    }

    // if(changes['videoPlaying']?.currentValue){

    // }

    // if(changes['audioPlaying']?.currentValue){

    // }
  }

  ngOnInit() {
    if (this.isSceenShare) {
      let userId = this.uid.replace("screen", "");
      this.userInfo = JSON.parse(localStorage.getItem("users") || "[]").find((x: any) => x.id == userId);
    } else {
      this.userInfo = JSON.parse(localStorage.getItem("users") || "[]").find((x: any) => x.id == this.uid);
    }
  }

  pinUser() {
    this.pin.emit({ uid: this.uid, userName: this.userInfo.name, avatarUrl: this.userInfo.avatarUrl });
  }

  clickOnVideo() {
    this.onVideo.emit(this.uid);
  }

  clickOffVideo() {
    this.offVideo.emit(this.uid);
  }

  clickOnAudio() {
    this.onAudio.emit(this.uid);
  }

  clickOffAudio() {
    this.offAudio.emit(this.uid);
  }

}
