import { ApplicationConfig, DEFAULT_CURRENCY_CODE, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withInMemoryScrolling, withViewTransitions } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { IMAGE_CONFIG } from '@angular/common';

import { routes } from './app.routes';
import { authInterceptor } from './core/auth/auth.intercepter';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),

    provideRouter(
      routes,
      withInMemoryScrolling({
        scrollPositionRestoration: 'enabled',
        anchorScrolling: 'enabled',
      }),
      withViewTransitions()
    ),
    provideHttpClient(
      withInterceptors([authInterceptor])
    ),
    { provide: DEFAULT_CURRENCY_CODE, useValue: 'INR' },
    {
      provide: IMAGE_CONFIG,
      useValue: {
        domains: ['flagcdn.com'],
      }
    }
  ]
};
