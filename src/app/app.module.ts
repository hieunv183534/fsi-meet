import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { TimeService } from './time.service';
import { BadgeModule } from 'primeng/badge';
import { MeetItemComponent } from './meet-item/meet-item.component';
import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { FormsModule } from '@angular/forms';
import { TooltipModule } from 'primeng/tooltip';
import { MemberItemComponent } from './member-item/member-item.component';
import { InputTextModule } from 'primeng/inputtext';
import { ChatComponent } from './chat/chat.component';
import { PreviewMeetComponent } from './preview-meet/preview-meet.component';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { TabMenuModule } from 'primeng/tabmenu';
import {TabViewModule} from 'primeng/tabview';
@NgModule({
  declarations: [
    AppComponent,
    MeetItemComponent,
    MemberItemComponent,
    ChatComponent,
    PreviewMeetComponent
  ],
  imports: [
    BrowserModule,
    TabViewModule,
    TabMenuModule,
    DropdownModule,
    BrowserAnimationsModule,
    CardModule,
    DialogModule,
    ButtonModule,
    ToggleButtonModule,
    BadgeModule,
    AvatarModule,
    AvatarGroupModule,
    OverlayPanelModule,
    FormsModule,
    TooltipModule,
    InputTextModule
  ],
  providers: [TimeService],
  bootstrap: [AppComponent]
})
export class AppModule { }
