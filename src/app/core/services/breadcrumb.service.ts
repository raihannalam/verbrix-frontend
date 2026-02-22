import { Injectable, Inject } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { DOCUMENT } from '@angular/common';
import { filter } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';

export interface Breadcrumb {
  label: string;
  url: string;
}

@Injectable({
  providedIn: 'root'
})
export class BreadcrumbService {
  private readonly baseUrl = 'https://verbrix.com';

  private breadcrumbsSubject = new BehaviorSubject<Breadcrumb[]>([]);
  public breadcrumbs$ = this.breadcrumbsSubject.asObservable();

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    @Inject(DOCUMENT) private dom: Document
  ) {
    // 1. Manually trigger for the Initial Page Load
    setTimeout(() => {
      this.generateBreadcrumbs();
    }, 0);

    // 2. Listen for future route changes
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.generateBreadcrumbs();
    });
  }

  private generateBreadcrumbs(): void {
    const rootBreadcrumb: Breadcrumb = { label: 'Home', url: '/' };
    const breadcrumbs = this.createBreadcrumbs(this.activatedRoute.root, '', [rootBreadcrumb]);

    const uniqueBreadcrumbs = breadcrumbs.filter((v, i, a) => a.findIndex(t => (t.url === v.url)) === i);

    this.breadcrumbsSubject.next(uniqueBreadcrumbs);
    this.updateStructuredData(uniqueBreadcrumbs);
  }

  private createBreadcrumbs(route: ActivatedRoute, url: string = '', breadcrumbs: Breadcrumb[] = []): Breadcrumb[] {
    const children: ActivatedRoute[] = route.children;

    if (children.length === 0) {
      return breadcrumbs;
    }

    for (const child of children) {
      const routeURL: string = child.snapshot.url.map(segment => segment.path).join('/');
      if (routeURL !== '') {
        url += `/${routeURL}`;
      }

      const label = child.snapshot.data['breadcrumb'];
      if (label && label !== 'Home') {
        breadcrumbs.push({ label, url });
      }

      return this.createBreadcrumbs(child, url, breadcrumbs);
    }

    return breadcrumbs;
  }

  private updateStructuredData(breadcrumbs: Breadcrumb[]): void {
    const scriptId = 'dynamic-breadcrumb-schema';
    let scriptEl = this.dom.getElementById(scriptId) as HTMLScriptElement;

    if (!scriptEl) {
      scriptEl = this.dom.createElement('script');
      scriptEl.type = 'application/ld+json';
      scriptEl.id = scriptId;
      this.dom.head.appendChild(scriptEl);
    }

    const schema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": breadcrumbs.map((crumb, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": crumb.label,
        "item": `${this.baseUrl}${crumb.url}`
      }))
    };

    scriptEl.text = JSON.stringify(schema);
  }
}
