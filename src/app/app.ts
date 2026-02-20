import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from "./layout/navbar/navbar";
import { ScrollToTopComponent } from "./shared/components/scroll-to-top";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ScrollToTopComponent],
  template: `
    <router-outlet />
    <app-scroll-to-top />
  `,
})
export class App {}
