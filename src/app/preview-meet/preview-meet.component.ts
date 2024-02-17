import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild, ViewEncapsulation, Injectable, Input, SimpleChanges } from '@angular/core';
import AgoraRTC, { IMicrophoneAudioTrack } from 'agora-rtc-sdk-ng';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-preview-meet',
  templateUrl: './preview-meet.component.html',
  styleUrls: ['./preview-meet.component.css'],
  encapsulation: ViewEncapsulation.None
})

export class PreviewMeetComponent implements OnInit {

  localParam: { audioTrack: any, videoTrack: any, screenTrack: any } = {
    audioTrack: "",
    videoTrack: "",
    screenTrack: ""
  }
  agoraEngine: any;
  cameras: any[] = [];
  microphones: any[] = [];
  speakers: any[] = [];
  isPublicCam: boolean = false;
  isPublicMic: boolean = false;
  isCheckMic: boolean = false;
  isCheckSpeaker: boolean = false;

  micId: string = 'default'

  stream!: MediaStream;
  isPreviewing = false;
  audioTrack!: IMicrophoneAudioTrack;
  speakerTrack!: IMicrophoneAudioTrack;

  @Input() isShowPreview: any
  @Output() cameraId = new EventEmitter<string>();
  @Output() speakerId = new EventEmitter<string>();
  @Output() microphoneId = new EventEmitter<string>();
  constructor(

  ) { }
  @ViewChild('preview') preview!: ElementRef;



  async startPreviewSpeaker(speakerId: string) {
    // this.isCheckSpeaker = true;
    // if (this.audioTrack) {
    //   this.audioTrack.close();
    // }

    // // Tạo một IAudioTrack từ một file âm thanh
    // this.audioTrack = await AgoraRTC.createBufferSourceAudioTrack({ source: audioFilePath });

    // // Đặt đầu ra âm thanh của audioTrack thành loa với speakerId được chỉ định
    // await this.audioTrack.setPlaybackDevice(speakerId);

    // // Phát audioTrack
    // this.audioTrack.play();
  }

  // ngOnChanges(changes: SimpleChanges) {
  //   // if (changes['isShowPreview']) { // Sửa ở đây
  //   const isShowPreviewValue = changes['isShowPreview'].currentValue; // Sửa ở đây
  //   debugger
  //   if (isShowPreviewValue !== true){
  //     // this.audioTrack.play();
  //     debugger
  //   }
  //   // }
  // }
  async startPreviewMic(id: string) {
    this.isCheckMic = true
    if (this.audioTrack) {
      this.audioTrack.close();
    }
    this.audioTrack = await AgoraRTC.createMicrophoneAudioTrack({ microphoneId: id });
    this.audioTrack.play();
    this.analyzeSound();
  }
  analyzeSound() {
    const micIcon = document.getElementById('mic-icon');
    if (micIcon === null) {
      return;
    }
    const updateIcon = () => {
      requestAnimationFrame(updateIcon);
      const volume = this.audioTrack.getVolumeLevel();
      if (volume > 0.5) {
        micIcon.classList.add("text-primary");
      }
      else
        micIcon.classList.remove("text-primary");
    };
    updateIcon();
  }



  async ngOnInit() {
    this.cameras = await AgoraRTC.getCameras();
    this.microphones = await AgoraRTC.getMicrophones();
    this.speakers = await AgoraRTC.getPlaybackDevices();
    this.cameras = await AgoraRTC.getCameras();
    this.shareCamera(this.cameras[0].deviceId);
    // this.cameraDeviceId = this.cameras[0].deviceId
  }

  async shareCamera(deviceId: string) {
    this.localParam.videoTrack = await AgoraRTC.createCameraVideoTrack({ cameraId: deviceId });
    this.localParam.videoTrack.play("previewCamera");
  }
  async switchCamera(deviceId: string) {
    if (this.localParam.videoTrack) {
      this.localParam.videoTrack.close();
    }
    this.shareCamera(deviceId);
  }

}
