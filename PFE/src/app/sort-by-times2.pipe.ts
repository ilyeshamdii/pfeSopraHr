import { Pipe, PipeTransform } from '@angular/core';
export interface Message {
  sender: string;
  content: string;
  timestamp: string;
}

@Pipe({
  name: 'sortByTimes2'
})
export class SortByTimes2Pipe implements PipeTransform {

  transform(messages: Message[]): Message[] {
    if (!messages || messages.length === 0) {
      return [];
    }

    // Sort messages by timestamp in ascending order using string comparison
    return messages.sort((a, b) => {
      return a.timestamp.localeCompare(b.timestamp);
    });
  }
}
