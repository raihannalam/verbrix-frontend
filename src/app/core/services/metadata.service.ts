import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MetadataService {
  private http = inject(HttpClient);
  private readonly API_URL = environment.apiUrl + '/metadata';

  // Caches for our labels
  private languageMap = signal<Record<string, string>>({});
  private specializationMap = signal<Record<string, string>>({});

  constructor() {
    this.loadMetadata();
  }

  private loadMetadata() {
    // Fetch Languages
    this.http.get<any>(`${this.API_URL}/languages`).subscribe(res => {
      const langMap: Record<string, string> = {};
      res.languages.forEach((lang: { id: string, label: string }) => {
        langMap[lang.id] = lang.label;
      });
      this.languageMap.set(langMap);
    });

    // Fetch Specializations
    this.http.get<any[]>(`${this.API_URL}/specializations`).subscribe(res => {
      const specMap: Record<string, string> = {};
      res.forEach(spec => {
        specMap[spec.id] = spec.label;
      });
      this.specializationMap.set(specMap);
    });
  }

  // Helper methods to get the full name (falls back to the raw code if loading)
  getLanguageName(code: string): string {
    if (!code) return '';
    return this.languageMap()[code.toUpperCase()] || code;
  }

  getSpecializationName(code: string): string {
    if (!code) return '';
    return this.specializationMap()[code.toUpperCase()] || code;
  }
}
