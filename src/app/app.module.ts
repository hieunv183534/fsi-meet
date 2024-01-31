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
import { AccordionModule } from 'primeng/accordion';
import { ChatComponent } from './chat/chat.component';

@NgModule({
  declarations: [
    AppComponent,
    MeetItemComponent,
    MemberItemComponent,
      ChatComponent
   ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    CardModule,
    ButtonModule,
    ToggleButtonModule,
    BadgeModule,
    AvatarModule,
    AvatarGroupModule,
    OverlayPanelModule,
    FormsModule,
    TooltipModule,
    InputTextModule,
    AccordionModule
  ],
  providers: [TimeService],
  bootstrap: [AppComponent]
})
export class AppModule { }
