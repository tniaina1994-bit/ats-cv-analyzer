import { Routes } from '@angular/router';
import { ScanComponent } from './features/scan/scan.component';

export const routes: Routes = [
  { path: '', component: ScanComponent },
  { path: '**', redirectTo: '' },
];