import { Component, ElementRef, Input, OnChanges, OnInit, Renderer2, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-meet-item',
  templateUrl: './meet-item.component.html',
  styleUrls: ['./meet-item.component.css']
})
export class MeetItemComponent implements OnInit, OnChanges {

  @Input() uid: string = "";
  @Input() videoTrack: any = null;
  @Input() audioTrack: any = null;

  @Input() isSceenShare: boolean = false;

  userInfo: any;


  constructor(private el: ElementRef, private renderer: Renderer2) {
    this.renderer.addClass(this.el.nativeElement, 'meet-item');
  }


  ngOnChanges(changes: SimpleChanges): void {
    if (changes['videoTrack']?.currentValue) {
      this.videoTrack.play(this.uid);
    }

    if (changes['audioTrack']?.currentValue) {
      this.audioTrack.play();
    }
  }

  ngOnInit() {
    this.userInfo = JSON.parse(localStorage.getItem("users") || "[]").find((x: any)=> x.id == this.uid);
  }

}
