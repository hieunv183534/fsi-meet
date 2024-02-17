import { Component, Inject, Injector, OnInit, Renderer2, ViewEncapsulation } from '@angular/core';
import { TimeService } from './time.service';
import axios from 'axios';
import AgoraRTC from "agora-rtc-sdk-ng";
AgoraRTC.disableLogUpload();
AgoraRTC.setLogLevel(4);
import jwt_decode from 'jwt-decode';
import { DOCUMENT } from '@angular/common';
import * as signalR from '@microsoft/signalr';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  encapsulation: ViewEncapsulation.None

})
export class AppComponent implements OnInit {
  title = 'fsi-meet';

  thisUser: any = {};
  listMicrophones: any[] = [];

  isVideoOn: boolean = false;
  isMicroOn: boolean = false;
  isScreenShare: boolean = false;

  isShowChat: boolean = false;
  isShowMember: boolean = false;
  isShowPreview: boolean = false;

  currentTime: string = '';
  agoraEngine: any = null;
  agoraEngine1: any = null;

  pinUserName?: string;
  pinAvararUrl?: string;

  cameraDeviceId: string = ''
  micDeviceId: string = '';
  speakerDeviceId: string = '';

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
    isOnMic?: boolean,
    videoTrack?: any,
    audioTrack?: any,
    isScreenShare: boolean,
    videoPlaying?: boolean,
    audioPlaying?: boolean
  }[] = [];

  pinParam?: {
    uid: any,
    isOnMic?: boolean,
    videoTrack?: any,
    audioTrack?: any,
    isScreenShare: boolean,
    videoPlaying?: boolean,
    audioPlaying?: boolean
  };

  invitedUserIds: string[] = [];

  connection!: signalR.HubConnection;

  constructor(private timeService: TimeService,
    @Inject(DOCUMENT) private document: Document,
    private renderer: Renderer2) {
  }

  async ngOnInit() {
    this.initSignal();
    this.timeService.currentTime$.subscribe((time) => {
      this.currentTime = time;
    });
    const urlParams = new URLSearchParams(window.location.search);
    const authToken = urlParams.get('token');
    const chanel = urlParams.get('chanel');
    this.decodedAccessToken(authToken);
    this.options.channel = chanel;
    this.getUsersInConversation(authToken, chanel);
  }
  // ngOnChanges(changes: SimpleChanges) {
  //   if (changes['isShowPreview']) { // Sửa ở đây
  //     const newValue = changes['isShowPreview'].currentValue; // Sửa ở đây
  //     console.log('isShowPreview changed to:', newValue);
  //     debugger
  //   }
  // }

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

  }
  getUsersInConversation(authToken: any, chanel: any) {
    axios.get("https://fsiconnectedapi.azurewebsites.net/api/fsi/chat/users-by-conversation/" + chanel, {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + authToken,
      }
    }).then(res => {
      localStorage.setItem("users", JSON.stringify(res.data.map((x: any) => x.user)));
      this.invitedUserIds = res.data.map((x: any) => x.user.id);
      this.invitedUserIds = this.invitedUserIds.filter(x => x != this.thisUser.nameid);
      this.getRTCToken(authToken, chanel);
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
        this.initAndJoinRTC();
      })
  }


  async initAndJoinRTC() {
    this.agoraEngine = AgoraRTC.createClient({ mode: "rtc", codec: "vp9" });
    await this.agoraEngine.join(this.options.appId, this.options.channel, this.options.token, this.options.uid);

    this.agoraEngine1 = AgoraRTC.createClient({ mode: "rtc", codec: "vp9" });
    await this.agoraEngine1.join(this.options.appId, this.options.channel, this.options.token1, this.options.uid + "screen");

    this.listenRTC();
  }
  analyzeSound(audioTrack: any, param: any) {

    const updateIcon = () => {
      requestAnimationFrame(updateIcon);
      const volume = audioTrack.getVolumeLevel();
      if (volume > 0.5) {
        console.log("toto");
        param.isOnMic = true;
      }
      else
        param.isOnMic = false;
    };
    setTimeout(()=>{
      updateIcon();
    },10)
  }
  listenRTC() {

    this.agoraEngine.on('user-joined', (user: any) => {
      if (!user.uid.includes("screen")) {
        let oldUser = this.remoteParams.find(x => x.uid == user.uid);
        if (!oldUser) {
          this.remoteParams.push({
            uid: user.uid,
            isScreenShare: false
          });
          this.invitedUserIds = this.invitedUserIds.filter(x => x != user.uid);
        }
      }
    });

    this.agoraEngine.on('user-left', (user: any) => {
      this.remoteParams = this.remoteParams.filter(x => x.uid != user.uid);
      if (this.pinParam?.uid == user.uid) {
        this.pinParam = undefined;
        this.pinAvararUrl = "";
        this.pinUserName = "";
      }
      if (!user.uid.includes("screen")) {
        this.invitedUserIds.push(user.uid);
      }
    });


    this.agoraEngine.on("user-published", async (user: any, mediaType: any) => {
      await this.agoraEngine.subscribe(user, mediaType);
      if (mediaType == "video") {
        if (user.uid.includes("screen")) {
          if (!user.uid.includes(this.thisUser.nameid)) {
            var oldScreen = this.remoteParams.find(x => x.uid == user.uid);
            if (!oldScreen) {
              this.remoteParams.push({
                uid: user.uid,
                isScreenShare: true,
                videoPlaying: true
              });
            }
            setTimeout(() => {
              this.remoteParams.find(x => x.uid == user.uid)!.videoTrack = user.videoTrack;
            }, 100);
          }
        } else {
          if (this.pinParam?.uid == user.uid) {
            this.pinParam!.videoTrack = user.videoTrack;
            this.pinParam!.videoPlaying = true;
            this.pinParam?.videoTrack.play("pinMeet", { fit: "contain" });
          } else {
            let userParam = this.remoteParams.find(x => x.uid == user.uid);
            userParam!.videoTrack = user.videoTrack;
            // userParam!.videoPlaying = true;
          }
        }
      }
      if (mediaType == "audio") {
        if (this.pinParam?.uid == user.uid) {
          this.pinParam!.audioTrack = user.audioTrack;
          this.analyzeSound(user.audioTrack, this.pinParam)

        } else {
          let param = this.remoteParams.find(x => x.uid == user.uid);
          param!.audioTrack = user.audioTrack;
          this.analyzeSound(user.audioTrack, param)
        }
      }
    });

    this.agoraEngine.on("user-unpublished", (user: any, mediaType: any) => {
      let param = this.remoteParams.find(x => x.uid == user.uid);
      if (mediaType == "video") {
        if (user.uid.includes('screen')) {
          if (this.pinParam?.uid == user.uid) {
            this.pinParam = undefined;
            this.pinAvararUrl = "";
            this.pinUserName = "";
          } else {
            this.remoteParams = this.remoteParams.filter(x => x.uid != user.uid);
          }
        } else {
          if (this.pinParam?.uid == user.uid) {
            this.pinParam!.videoTrack = null;
          } else {
            param!.videoTrack = null;
          }
        }
      } else {
        if (this.pinParam?.uid == user.uid) {
          this.pinParam!.audioTrack = null;
        } else {
          let param = this.remoteParams.find(x => x.uid == user.uid);
          param!.audioTrack = null;
        }
      }
    });


    setTimeout(() => {
      let remoteUsers = this.agoraEngine.remoteUsers;
      remoteUsers.forEach(async (remoteUser: any) => {
        if (!remoteUser.uid.includes(this.thisUser.nameid)) {
          if (remoteUser.uid.includes("screen")) {
            if (remoteUser.hasVideo) {
              let oldRemoteUser = this.remoteParams.find(x => x.uid == remoteUser.uid);
              if (!oldRemoteUser) {
                this.remoteParams.push({
                  isScreenShare: true,
                  uid: remoteUser.uid
                });
              }

              await this.agoraEngine.subscribe(remoteUser, "video");
              this.remoteParams.find(x => x.uid == remoteUser.uid)!.videoTrack = remoteUser.videoTrack;
            }
          } else {
            let oldRemoteUser = this.remoteParams.find(x => x.uid == remoteUser.uid);
            if (!oldRemoteUser) {
              this.remoteParams.push({
                isScreenShare: false,
                uid: remoteUser.uid
              });
              this.invitedUserIds = this.invitedUserIds.filter(x => x != remoteUser.uid);
            }

            if (remoteUser.hasVideo) {
              await this.agoraEngine.subscribe(remoteUser, "video");
              this.remoteParams.find(x => x.uid == remoteUser.uid)!.videoTrack = remoteUser.videoTrack;
            }

            if (remoteUser.hasAudio) {
              await this.agoraEngine.subscribe(remoteUser, "audio");
              this.remoteParams.find(x => x.uid == remoteUser.uid)!.audioTrack = remoteUser.audioTrack;
            }
          }
        }
      });
    }, 4000);
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
    this.localParam.videoTrack = await AgoraRTC.createCameraVideoTrack({ cameraId: this.cameraDeviceId ? this.cameraDeviceId : "" });// tạo camera mới
    await this.agoraEngine.publish([this.localParam.videoTrack]); //public cam
    this.localParam.videoTrack.play("localCameraVideo");// 
    this.isVideoOn = true;
  }
  async endShareCamera() {
    await this.agoraEngine.unpublish([this.localParam.videoTrack]);
    this.localParam.videoTrack.close();
    this.isVideoOn = false;
  }

  // audio
  async shareVoice() {
    this.localParam.audioTrack = await AgoraRTC.createMicrophoneAudioTrack({ microphoneId: this.micDeviceId ? this.micDeviceId : 'default' });
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

  pin(pin: { uid: string, userName: string, avatarUrl: string }) {
    this.pinUserName = pin.userName;
    this.pinAvararUrl = pin.avatarUrl;
    if (this.pinParam?.uid) {
      this.remoteParams.push(this.pinParam);
      if (this.pinParam?.audioTrack && !this.pinParam?.audioPlaying) {
        let uid = this.pinParam?.uid;
        setTimeout(() => {
          this.offAudio(uid);
        }, 130);
      }
      if (this.pinParam?.videoTrack && !this.pinParam?.videoPlaying) {
        let uid = this.pinParam?.uid;
        setTimeout(() => {
          this.offVideo(uid);
        }, 130);
      }
    }
    let pinUser = this.remoteParams.find(x => x.uid == pin.uid);
    this.pinParam = pinUser;
    this.remoteParams = this.remoteParams.filter(x => x.uid != pin.uid);
    if (this.pinParam?.videoTrack?.isPlaying) {
      this.pinParam.videoTrack.play("pinMeet", { fit: "contain" });
    }
  }


  unPinUser() {
    if (this.pinParam?.uid) {
      this.remoteParams.push(this.pinParam);
      if (this.pinParam?.audioTrack && !this.pinParam?.audioPlaying) {
        let uid = this.pinParam?.uid;
        setTimeout(() => {
          this.offAudio(uid);
        }, 130);
      }
      if (this.pinParam?.videoTrack && !this.pinParam?.videoPlaying) {
        let uid = this.pinParam?.uid;
        setTimeout(() => {
          this.offVideo(uid);
        }, 130);
      }
    }
    this.pinParam = undefined;
    this.pinAvararUrl = "";
    this.pinUserName = "";
  }

  onVideo(uid: string) {
    let remote = this.remoteParams.find(x => x.uid == uid);
    remote!.videoPlaying = true;
  }

  offVideo(uid: string) {
    let remote = this.remoteParams.find(x => x.uid == uid);
    remote!.videoPlaying = false;
  }

  onAudio(uid: string) {
    let remote = this.remoteParams.find(x => x.uid == uid);
    remote!.audioPlaying = true;
    remote?.audioTrack.play();
  }

  offAudio(uid: string) {
    let remote = this.remoteParams.find(x => x.uid == uid);
    remote!.audioPlaying = false;
    remote?.audioTrack.stop();
  }

  onVideoPin() {
    this.pinParam!.videoPlaying = true;
  }

  offVideoPin() {
    this.pinParam!.videoPlaying = false;
  }

  onAudioPin() {
    this.pinParam!.audioPlaying = true;
    this.pinParam!.audioTrack.play();
  }

  offAudioPin() {
    this.pinParam!.audioPlaying = false;
    this.pinParam!.audioTrack.stop();
  }

  decodedAccessToken(authToken: any): any {
    try {
      this.thisUser = jwt_decode(authToken);
      this.options.uid = this.thisUser.nameid
    } catch (Error) {
    }
  }
  // async publicCamera(e: any) {
  //   if (e.isPublicCam) {
  //     await this.agoraEngine.unpublish([this.localParam.videoTrack]);
  //   }
  //   this.localParam.videoTrack = await AgoraRTC.createCameraVideoTrack({ cameraId: e.id });// tạo camera mới
  //   await this.agoraEngine.publish([this.localParam.videoTrack]); //public cam
  //   this.localParam.videoTrack.play("localCameraVideo");// 
  //   this.isVideoOn = true;
  //   this.isShowPreview = false;
  // }
  async changeCamera(idCam: string) {
    if (this.isVideoOn) {
      await this.agoraEngine.unpublish([this.localParam.videoTrack]);
      this.localParam.videoTrack.close();
      this.localParam.videoTrack = await AgoraRTC.createCameraVideoTrack({ cameraId: idCam });// tạo camera mới
      await this.agoraEngine.publish([this.localParam.videoTrack]); //public cam
      this.localParam.videoTrack.play("localCameraVideo");// 
    }
    this.cameraDeviceId = idCam
  }
  async previewVideo() {
    this.localParam.videoTrack = await AgoraRTC.createCameraVideoTrack({ cameraId: this.cameraDeviceId ? this.cameraDeviceId : '' });// tạo camera mới
    this.localParam.videoTrack.play("previewVideo");// 
  }
  async changeMicrophone(id: string) {
    if (this.isMicroOn) {
      await this.agoraEngine.unpublish([this.localParam.audioTrack]);
      this.localParam.audioTrack.close();
      this.localParam.audioTrack = await AgoraRTC.createMicrophoneAudioTrack({ microphoneId: id });
      await this.agoraEngine.publish([this.localParam.audioTrack]);
    }
    this.micDeviceId = id
  }
  async changeSpeaker(speakerId: string) {
    debugger
  }
  onHide() {
    // this.localParam!.audioTrack.stop()
    // if (this.localParam!.audioTrack)
    //   this.localParam!.audioTrack.stop()
    this.isShowPreview = false;
    // console.log('isShowPreview value when onHide is triggered:', this.isShowPreview);
    // Additional logic or actions you want to perform when onHide occurs
  }
}
