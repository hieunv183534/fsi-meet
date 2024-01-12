import { Component, Inject, OnInit, Renderer2 } from '@angular/core';
import { TimeService } from './time.service';
import { ActivatedRoute } from '@angular/router';
import axios from 'axios';
import AgoraRTC from "agora-rtc-sdk-ng";
import jwt_decode from 'jwt-decode';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'fsi-meet';

  thisUser: any = {};

  isVideoOn: boolean = false;
  isMicroOn: boolean = false;
  isScreenShare: boolean = false;

  isShowChat: boolean = false;
  isShowMember: boolean = false;

  currentTime: string = '';
  agoraEngine: any = null;
  agoraEngine1: any = null;

  options: any = {
    appId: '48f5a9f8d4e644a6a1ca96376fdcf441',
    channel: '',
    token: '',
    token1: '',
    uid: ""
  };

  localParam: { audioTrack: any, videoTrack: any, screenTrack: any } = {
    audioTrack: "",
    videoTrack: "",
    screenTrack: ""
  }

  remoteParams: any = {}

  constructor(private timeService: TimeService, @Inject(DOCUMENT) private document: Document, private renderer: Renderer2) { }

  ngOnInit() {
    this.timeService.currentTime$.subscribe((time) => {
      this.currentTime = time;
    });
    const urlParams = new URLSearchParams(window.location.search);
    const authToken = urlParams.get('token');
    const chanel = urlParams.get('chanel');
    this.decodedAccessToken(authToken);
    this.options.channel = chanel;
    this.getRTCToken(authToken, chanel);
  }

  getRTCToken(authToken: any, chanel: any) {
    var seft = this;
    axios.post('https://fsiconnected.cloud/api/fsi/agora/rtc-token', {
      channelName: chanel
    }, {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + authToken,
      }
    })
      .then(function (res) {
        let token = res.data.split('_and_')[0];
        let token1 = res.data.split('_and_')[1];
        seft.options.token = token;
        seft.options.token1 = token1;
        seft.initAndJoinRTC();
      })
  }

  decodedAccessToken(authToken: any): any {
    try {
      this.thisUser = jwt_decode(authToken);
      this.options.uid = this.thisUser.nameid
    } catch (Error) {
    }
  }

  async initAndJoinRTC() {
    this.agoraEngine = AgoraRTC.createClient({ mode: "rtc", codec: "vp9" });
    await this.agoraEngine.join(this.options.appId, this.options.channel, this.options.token, this.options.uid);
    this.localParam.audioTrack = await AgoraRTC.createMicrophoneAudioTrack();

    this.agoraEngine1 = AgoraRTC.createClient({ mode: "rtc", codec: "vp9" });
    await this.agoraEngine1.join(this.options.appId, this.options.channel, this.options.token1, this.options.uid + "screen");

    this.listenRTC();
  }

  listenRTC() {
    this.agoraEngine.on("user-published", async (user: any, mediaType: any) => {
      await this.agoraEngine.subscribe(user, mediaType);
      if (mediaType == "video") {

        this.remoteParams[user.uid] = {
          videoTrack: user.videoTrack,
          audioTrack: user.audioTrack
        }

        let div = this.renderer.createElement("div");
        this.renderer.setProperty(div, "id", user.uid);
        this.renderer.addClass(div, "meet-item");
        this.renderer.appendChild(this.document.querySelector(".list-meet-item"), div);

        this.remoteParams[user.uid].videoTrack.play(user.uid);
      }
      if (mediaType == "audio") {
        this.remoteParams[user.uid] = {
          audioTrack: user.audioTrack
        }
        this.remoteParams[user.uid].audioTrack.play();
      }
    });

    this.agoraEngine.on("user-unpublished", (user: any, mediaType: any) => {

    });
  }

  async join() {
  }

  async leave() {
    this.localParam.audioTrack.close();
    this.localParam.videoTrack.close();
    await this.agoraEngine.leave();
  }

  // screen
  async shareScreen() {
    this.localParam.screenTrack = await AgoraRTC.createScreenVideoTrack({});
    await this.agoraEngine1.publish([this.localParam.screenTrack]);
    this.localParam.screenTrack.play("localScreenVideo");
    this.isScreenShare = true;
  }
  async endShareScreen() {
    await this.agoraEngine1.unpublish([this.localParam.screenTrack]);
    this.localParam.screenTrack.close();
    this.isScreenShare = false;
  }


  // camera
  async shareCamera() {
    this.localParam.videoTrack = await AgoraRTC.createCameraVideoTrack();
    await this.agoraEngine.publish([this.localParam.videoTrack]);
    this.localParam.videoTrack.play("localCameraVideo");
    this.isVideoOn = true;
  }
  async endShareCamera() {
    await this.agoraEngine.unpublish([this.localParam.videoTrack]);
    this.localParam.videoTrack.close();
    this.isVideoOn = false;
  }

  // audio
  async shareVoice() {
    this.localParam.audioTrack = await AgoraRTC.createMicrophoneAudioTrack({});
    await this.agoraEngine1.publish([this.localParam.audioTrack]);
    this.isMicroOn = true;
  }
  async endShareVoice() {
    await this.agoraEngine.unpublish([this.localParam.audioTrack]);
    this.isMicroOn = false;
  }


  endCall(){
    this.agoraEngine.leave();
    this.agoraEngine1.leave();
    this.localParam.screenTrack.close();
    this.localParam.videoTrack.close();
  }
}
