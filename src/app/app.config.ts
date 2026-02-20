// src/app/app.config.ts

import {ApplicationConfig, DEFAULT_CURRENCY_CODE, provideBrowserGlobalErrorListeners} from '@angular/core';
import { provideRouter, withInMemoryScrolling, withViewTransitions } from '@angular/router';
import { routes } from './app.routes';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

// Import interceptor
import { AuthInterceptor } from './core/auth/auth.intercepter';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),

    // 👇 UPDATED ROUTER CONFIGURATION
    provideRouter(
      routes,
      withInMemoryScrolling({
        scrollPositionRestoration: 'enabled', // Scroll to top on nav; Restore on back
        anchorScrolling: 'enabled',           // Allows scrolling to #ids (like #team)
      }),
      withViewTransitions()                   // Optional: Adds smooth fade between pages
    ),

    provideHttpClient(
      withInterceptorsFromDi()
    ),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    { provide: DEFAULT_CURRENCY_CODE, useValue: 'INR' }
  ]
};
