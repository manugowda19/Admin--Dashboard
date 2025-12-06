import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit {
  selectedDate: Date = new Date();
  events: any[] = [];

  constructor() {}

  ngOnInit() {
    this.loadEvents();
  }

  loadEvents() {
    // Mock events
    this.events = [
      { date: new Date(), title: 'Team Meeting', time: '10:00 AM' },
      { date: new Date(), title: 'Client Call', time: '2:00 PM' },
      { date: new Date(Date.now() + 86400000), title: 'Project Review', time: '11:00 AM' }
    ];
  }

  onDateSelect(date: Date) {
    this.selectedDate = date;
  }
}

