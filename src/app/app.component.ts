import { Component, ComponentFactoryResolver, Inject, Injector, OnInit, Renderer2 } from '@angular/core';
import { TimeService } from './time.service';
import { ActivatedRoute } from '@angular/router';
import axios from 'axios';
import AgoraRTC from "agora-rtc-sdk-ng";
import jwt_decode from 'jwt-decode';
import { DOCUMENT } from '@angular/common';
import { MeetItemComponent } from './meet-item/meet-item.component';
import * as signalR from '@microsoft/signalr';


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

  remoteParams: {
    uid: any,
    videoTrack?: any,
    audioTrack?: any,
    isScreenShare: boolean
  }[] = [];

  connection!: signalR.HubConnection;

  constructor(private timeService: TimeService,
    @Inject(DOCUMENT) private document: Document,
    private renderer: Renderer2) {
  }

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
    this.getUsersInConversation(authToken, chanel);
  }

  getUsersInConversation(authToken: any, chanel: any) {
    axios.get("https://fsiconnectedapi.azurewebsites.net/api/fsi/chat/users-by-conversation/" + chanel, {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + authToken,
      }
    }).then(res => {
      localStorage.setItem("users", JSON.stringify(res.data.map((x: any) => x.user)));
    })
  }

  getRTCToken(authToken: any, chanel: any) {
    axios.post('https://fsiconnectedapi.azurewebsites.net/api/fsi/agora/rtc-token', {
      channelName: chanel
    }, {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + authToken,
      }
    })
      .then((res) => {
        let token = res.data.split('_and_')[0];
        let token1 = res.data.split('_and_')[1];
        this.options.token = token;
        this.options.token1 = token1;
        this.initSignalR(authToken, chanel);
      })
  }

  initSignalR(token: string, group: string) {
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl("https://fsiconnectedapi.azurewebsites.net/meet", {
        accessTokenFactory: () => token,
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets
      })
      .configureLogging(signalR.LogLevel.Information)
      .build();

    this.connection.start().then(async () => {
      await this.connection?.invoke("JoinMeet", group);
    }).catch((err: any) => {
      return console.error(err.toString());
    });

    this.listenSignalR();
  }

  listenSignalR() {
    this.connection.on("OnJoinFailed", (msg: string) => {
      debugger
      alert(msg);
    });

    this.connection.on("OnJoinSuccess", (users) => {
      users.forEach(async (userId: string) => {
        let user = {
          uid: userId,
          isScreenShare: false
        };
        this.remoteParams.push(user);
        // await this.agoraEngine.subscribe(user, "video");
        // await this.agoraEngine.subscribe(user, "audio");
      });
      this.initAndJoinRTC();
    });

    this.connection.on("OnJoined", async (userId: string) => {

      if (userId != this.thisUser.nameid) {
        debugger;
        let remote = this.remoteParams.find(x => x.uid == userId);
        if (!remote) {
          this.remoteParams.push({
            uid: userId,
            isScreenShare: false
          });
        }

        setTimeout(async () => {
          if (this.isMicroOn) {
            await this.agoraEngine.unpublish([this.localParam.audioTrack]);
            await this.agoraEngine.publish([this.localParam.audioTrack]);
          }
          if (this.isVideoOn) {
            await this.agoraEngine.unpublish([this.localParam.videoTrack]);
            await this.agoraEngine.publish([this.localParam.videoTrack]);
          }
          if (this.isScreenShare) {

          }
        }, 5000);
      }
    });

    this.connection.on("OnPublish", (userId: string, track: string) => {
      debugger
    });

    this.connection.on("OnUnPublish", (userId: string, track: string) => {
      debugger
    });
  }

  async initAndJoinRTC() {
    this.agoraEngine = AgoraRTC.createClient({ mode: "rtc", codec: "vp9" });
    await this.agoraEngine.join(this.options.appId, this.options.channel, this.options.token, this.options.uid);
    this.localParam.audioTrack = await AgoraRTC.createMicrophoneAudioTrack();

    // console.log("hieunv");

    // console.log(this.agoraEngine._users);
    // this.agoraEngine._users.forEach((user: any) => {
    //   if (!user.uid.includes("screen")) {
    //     this.remoteParams.push({
    //       uid: user.uid,
    //       isScreenShare: false
    //     });

    //     console.log(user);
    //   }
    // });

    // debugger;

    this.agoraEngine1 = AgoraRTC.createClient({ mode: "rtc", codec: "vp9" });
    await this.agoraEngine1.join(this.options.appId, this.options.channel, this.options.token1, this.options.uid + "screen");

    this.listenRTC();
  }

  listenRTC() {

    // this.agoraEngine.on('user-joined', (user: any, elapsed: any) => {
    //   if (!user.uid.includes("screen")) {
    //     this.remoteParams.push({
    //       uid: user.uid,
    //       isScreenShare: false
    //     })
    //   } else {

    //   }
    //   /////////////
    //   if (!user.uid.includes("screen")) {
    //     let rmU = JSON.parse(localStorage.getItem("users") || "[]").find((x: any) => x.id == user.uid);
    //     console.log("hieunv183534 " + rmU.name);

    //   } else {
    //     let rmU = JSON.parse(localStorage.getItem("users") || "[]").find((x: any) => x.id == user.uid.replace("screen", ""));
    //     console.log("hieunv183534 " + rmU.name + "   ----------");
    //   }
    //   /////////////
    // });

    this.agoraEngine.on('user-left', (user: any) => {
      if (!user.uid.includes("screen")) {
        this.remoteParams = this.remoteParams.filter(x => x.uid != user.uid);
      } else {

      }
    });


    this.agoraEngine.on("user-published", async (user: any, mediaType: any) => {
      debugger
      await this.agoraEngine.subscribe(user, mediaType);
      if (mediaType == "video") {
        if (user.uid.includes("screen")) {

        } else {
          let userParam = this.remoteParams.find(x => x.uid == user.uid);
          userParam!.videoTrack = user.videoTrack;
        }
      }
      if (mediaType == "audio") {
        let param = this.remoteParams.find(x => x.uid == user.uid);
        param!.audioTrack = user.audioTrack;
      }
    });

    this.agoraEngine.on("user-unpublished", (user: any, mediaType: any) => {
      let param = this.remoteParams.find(x => x.uid == user.uid);
      if (mediaType == "video") {
        param!.videoTrack = null;
      } else {
        let param = this.remoteParams.find(x => x.uid == user.uid);
        param!.audioTrack = null;
      }
    });
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
    await this.agoraEngine.publish([this.localParam.audioTrack]);
    this.isMicroOn = true;
  }
  async endShareVoice() {
    await this.agoraEngine.unpublish([this.localParam.audioTrack]);
    this.isMicroOn = false;
  }

  endCall() {
    window.location.reload();
  }

  decodedAccessToken(authToken: any): any {
    try {
      this.thisUser = jwt_decode(authToken);
      this.options.uid = this.thisUser.nameid
    } catch (Error) {
    }
  }
}
