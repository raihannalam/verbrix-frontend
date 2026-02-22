import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ScrollToTopComponent } from "./shared/components/scroll-to-top";
import { SeoService } from './core/services/seo.service';
import { BreadcrumbService } from './core/services/breadcrumb.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ScrollToTopComponent],
  template: `
    <router-outlet />
    <app-scroll-to-top />
  `,
})
export class App implements OnInit {
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private seoService = inject(SeoService);

  // By injecting this here, we force Angular to instantiate the service on app load.
  // This ensures it immediately starts building the JSON-LD schema on every route change.
  private breadcrumbService = inject(BreadcrumbService);

  ngOnInit(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {

      // Update Canonical URL based on the final resolved URL
      this.seoService.updateCanonicalUrl(event.urlAfterRedirects);

      // Traverse the route tree to find the deepest active route
      let route = this.activatedRoute;
      while (route.firstChild) {
        route = route.firstChild;
      }

      // Extract Route Data with production fallbacks
      const title = route.snapshot.routeConfig?.title as string || 'Medical Interpreters in India | Verbrix';
      const description = route.snapshot.data?.['description'] || 'Find verified medical interpreters for medical tourism in India. Verbrix provides secure real-time translation and healthcare communication.';

      // Apply the updates
      this.seoService.updateTitle(title);
      this.seoService.updateDescription(description);
    });
  }
}
