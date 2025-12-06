import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-stat-box',
  templateUrl: './stat-box.component.html',
  styleUrls: ['./stat-box.component.scss']
})
export class StatBoxComponent {
  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() progress: number = 0;
  @Input() increase: string = '';
  @Input() icon: string = '';
}

