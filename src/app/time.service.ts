import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TimeService {
  private currentTimeSubject = new BehaviorSubject<string>('');

  currentTime$ = this.currentTimeSubject.asObservable();

  constructor() {
    this.updateTime();
    setInterval(() => this.updateTime(), 1000);
  }

  private updateTime() {
    const currentDate = new Date();
    const hours = currentDate.getHours();
    const minutes = currentDate.getMinutes();
    const formattedTime = this.formatTime(hours, minutes);
    this.currentTimeSubject.next(formattedTime);
  }

  private formatTime(hours: number, minutes: number): string {
    const formattedHours = (hours < 10 ? '0' : '') + hours;
    const formattedMinutes = (minutes < 10 ? '0' : '') + minutes;
    return `${formattedHours}:${formattedMinutes}`;
  }
}
