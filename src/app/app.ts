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
  private breadcrumbService = inject(BreadcrumbService);

  ngOnInit(): void {
    // 1. Manually trigger for the Initial Page Load (Googlebot pass)
    // We use a brief timeout to ensure the router tree has fully finished building
    setTimeout(() => {
      this.updateSeoData(this.router.url);
    }, 0);

    // 2. Listen for all future route changes (User navigation)
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.updateSeoData(event.urlAfterRedirects);
    });
  }

  private updateSeoData(url: string): void {
    // Update Canonical URL
    this.seoService.updateCanonicalUrl(url);

    // Traverse the route tree to find the deepest active route
    let route = this.activatedRoute;
    while (route.firstChild) {
      route = route.firstChild;
    }

    // Extract Route Data with fallbacks
    const title = route.snapshot.routeConfig?.title as string || 'Medical Interpreters in India | Verbrix';
    const description = route.snapshot.data?.['description'] || 'Find verified medical interpreters for medical tourism in India. Verbrix provides secure real-time translation and healthcare communication.';

    // Apply the updates instantly
    this.seoService.updateTitle(title);
    this.seoService.updateDescription(description);
  }
}
