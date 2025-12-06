import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-progress-circle',
  templateUrl: './progress-circle.component.html',
  styleUrls: ['./progress-circle.component.scss']
})
export class ProgressCircleComponent {
  @Input() size: number = 125;
  @Input() progress: number = 75;
  @Input() value: string = '';
  @Input() subtitle: string = '';

  get circumference(): number {
    return 2 * Math.PI * (this.size / 2 - 10);
  }

  get offset(): number {
    return this.circumference - (this.progress / 100) * this.circumference;
  }
}

