import { Injectable, Inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  private readonly baseUrl = 'https://verbrix.com';

  constructor(
    private meta: Meta,
    private title: Title,
    @Inject(DOCUMENT) private dom: Document
  ) {}

  public updateTitle(title: string): void {
    this.title.setTitle(title);
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ name: 'twitter:title', content: title });
  }

  public updateDescription(description: string): void {
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ name: 'twitter:description', content: description });
  }

  public updateCanonicalUrl(routeUrl: string): void {
    // Strip query parameters to ensure canonical URLs are pristine
    const cleanPath = routeUrl.split('?')[0];
    const canonicalUrl = `${this.baseUrl}${cleanPath === '/' ? '' : cleanPath}`;

    const head = this.dom.getElementsByTagName('head')[0];
    let element: HTMLLinkElement | null = this.dom.querySelector(`link[rel='canonical']`);

    if (!element) {
      element = this.dom.createElement('link') as HTMLLinkElement;
      element.setAttribute('rel', 'canonical');
      head.appendChild(element);
    }

    element.setAttribute('href', canonicalUrl);

    // Also update Open Graph URL so social shares point to the exact page
    this.meta.updateTag({ property: 'og:url', content: canonicalUrl });
  }
}
