import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from "./features/layout/navbar";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet], 
  template: `
    <router-outlet />
  `,
})
export class App {}