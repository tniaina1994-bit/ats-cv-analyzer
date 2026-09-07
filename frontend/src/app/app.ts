import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, MatToolbarModule],
  template: `
    <mat-toolbar color="primary">
      <span>ATS CV Analyzer</span>
    </mat-toolbar>
    <main>
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`
    main {
      padding: 1rem;
    }
  `]
})
export class AppComponent {
  title = 'ATS CV Analyzer';
}