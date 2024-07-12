import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DateTimeService {

  constructor() { }
  public convertToTimeString(dateTime: string): string {
    const date = new Date(dateTime);
    return date.toTimeString().split(' ')[0]; // Extract the time part (HH:MM:SS)
  }
}
