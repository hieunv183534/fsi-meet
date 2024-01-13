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

@NgModule({
  declarations: [
    AppComponent,
    MeetItemComponent
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
    FormsModule
  ],
  providers: [TimeService],
  bootstrap: [AppComponent]
})
export class AppModule { }
