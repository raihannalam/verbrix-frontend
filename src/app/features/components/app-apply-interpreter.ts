import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { environment } from '../../../environments/environment';
import { Navbar } from "../../features/layout/navbar";

interface Metadata {
  id: string;
  label: string;
}

@Component({
  selector: 'app-interpreter-apply',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Navbar],
  template: `
    <app-navbar class="fixed top-0 left-0 h-[72px] w-full z-50"></app-navbar>

    <div class="min-h-screen pt-24 pb-12 px-4 sm:px-6 bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <div class="max-w-5xl mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-8 transition-colors duration-300">
        
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 border-b border-gray-100 dark:border-gray-800 pb-6 gap-4">
            <div>
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                  {{ isReapplying() ? 'Update Application' : 'Interpreter Application' }}
              </h2>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Complete your profile to get verified and start accepting jobs.
              </p>
            </div>
            <span class="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-xs font-bold uppercase tracking-wider border border-blue-100 dark:border-blue-800/50">
                Professional Verification
            </span>
        </div>

        <form [formGroup]="applyForm" (ngSubmit)="onSubmit()" class="space-y-10">
          
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            <div class="lg:col-span-4 space-y-3">
                <label class="text-sm font-bold text-gray-700 dark:text-gray-200">Profile Photo</label>
                <div [class]="'relative group aspect-square w-full rounded-2xl overflow-hidden border-2 border-dashed flex items-center justify-center transition-all cursor-pointer ' + 
                             (applyForm.get('profilePictureUrl')?.value 
                                ? 'border-green-500/50 dark:border-green-500/50 bg-green-50 dark:bg-green-900/10' 
                                : 'border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 hover:border-blue-500 dark:hover:border-blue-400')"
                     (click)="profilePic.click()">
                    
                    @if (isUploadingPic()) {
                        <div class="flex flex-col items-center gap-2">
                            <div class="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                        </div>
                    } @else if (applyForm.get('profilePictureUrl')?.value) {
                        <img [src]="applyForm.get('profilePictureUrl')?.value" class="h-full w-full object-cover">
                        <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <i class="ri-camera-switch-line text-white text-3xl"></i>
                        </div>
                    } @else {
                        <div class="flex flex-col items-center text-gray-400 dark:text-gray-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">
                            <i class="ri-user-smile-line text-5xl mb-2"></i>
                            <span class="text-xs font-semibold uppercase tracking-wide">Upload Photo</span>
                        </div>
                    }
                </div>
                <input type="file" (change)="onFileUpload($event, 'profilePictureUrl')" accept="image/*" class="hidden" #profilePic>
                @if (applyForm.get('profilePictureUrl')?.invalid && applyForm.get('profilePictureUrl')?.touched) {
                    <p class="text-red-500 text-xs mt-1">Profile photo is required.</p>
                }
            </div>

            <div class="lg:col-span-8 space-y-3 flex flex-col">
                <label class="text-sm font-bold text-gray-700 dark:text-gray-200">
                    Self-Introduction Video
                    <span class="text-xs font-normal text-gray-500 dark:text-gray-400 ml-2">(YouTube or Vimeo URL)</span>
                </label>
                
                <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i class="ri-link text-gray-400"></i>
                    </div>
                    <input formControlName="introVideoUrl" 
                           placeholder="https://www.youtube.com/watch?v=..." 
                           class="w-full pl-10 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white p-3 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600">
                </div>
                
                <div class="flex-1 rounded-xl overflow-hidden bg-black/5 dark:bg-black/40 border border-gray-200 dark:border-gray-700 relative min-h-[200px] flex items-center justify-center">
                    @if (videoPreviewUrl()) {
                        <iframe [src]="videoPreviewUrl()" 
                                class="w-full h-full absolute inset-0" 
                                frameborder="0" 
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                allowfullscreen>
                        </iframe>
                    } @else {
                        <div class="text-center p-6 text-gray-400 dark:text-gray-600">
                            <i class="ri-video-line text-4xl mb-2 block"></i>
                            <span class="text-xs">Paste a valid YouTube/Vimeo link to preview</span>
                        </div>
                    }
                </div>
                @if (applyForm.get('introVideoUrl')?.invalid && applyForm.get('introVideoUrl')?.touched) {
                    <p class="text-red-500 text-xs">A valid video URL is required.</p>
                }
            </div>
          </div>

          <div class="space-y-6 pt-6 border-t border-gray-100 dark:border-gray-800">
            <h3 class="font-bold text-lg text-gray-800 dark:text-white flex items-center gap-2">
                <i class="ri-file-user-line text-blue-600 dark:text-blue-400"></i> Basic Information
            </h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="flex flex-col space-y-1">
                <label class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">First Name</label>
                <input formControlName="firstName" 
                       class="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white p-3 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all">
              </div>
              <div class="flex flex-col space-y-1">
                <label class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Last Name</label>
                <input formControlName="lastName" 
                       class="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white p-3 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all">
              </div>
            </div>

            <div class="flex flex-col space-y-1">
              <label class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Professional Bio</label>
              <textarea formControlName="bio" rows="4" 
                        class="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white p-3 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" 
                        placeholder="Describe your interpretation experience..."></textarea>
               @if (applyForm.get('bio')?.hasError('minlength') && applyForm.get('bio')?.touched) {
                  <p class="text-red-500 text-xs">Bio must be at least 50 characters.</p>
               }
            </div>

            <div (click)="govId.click()" 
                 [class]="'flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all ' + 
                          (applyForm.get('governmentIdUrl')?.value 
                            ? 'border-green-500/50 bg-green-50 dark:bg-green-900/10' 
                            : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800')">
                    
                    <div class="h-12 w-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center">
                        @if(isUploadingDoc()) {
                            <div class="animate-spin h-5 w-5 border-2 border-current border-t-transparent rounded-full"></div>
                        } @else {
                            <i class="ri-passport-line text-2xl"></i>
                        }
                    </div>
                    <div class="flex-1">
                        <p class="text-sm font-bold text-gray-700 dark:text-gray-200">Government ID / Passport</p>
                        <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                             {{ applyForm.get('governmentIdUrl')?.value ? 'Document Uploaded Successfully' : 'Upload PDF or JPG (Max 5MB)' }}
                        </p>
                    </div>
                    @if (applyForm.get('governmentIdUrl')?.value) { 
                        <i class="ri-checkbox-circle-fill text-green-500 text-2xl"></i> 
                    }
                <input type="file" (change)="onFileUpload($event, 'governmentIdUrl')" accept="application/pdf,image/*" class="hidden" #govId>
            </div>
            @if (applyForm.get('governmentIdUrl')?.invalid && applyForm.get('governmentIdUrl')?.touched) {
                <p class="text-red-500 text-xs">Government ID is required.</p>
            }
          </div>

          <div class="space-y-4 pt-6 border-t border-gray-100 dark:border-gray-800">
            <h3 class="font-bold text-lg text-gray-800 dark:text-white flex items-center gap-2">
                <i class="ri-stethoscope-line text-blue-600 dark:text-blue-400"></i> Medical Specializations
            </h3>
            <div class="flex flex-wrap gap-2">
                @for (spec of availableSpecializations(); track spec.id) {
                    <button type="button" (click)="toggleSpecialization(spec.id)"
                        [class]="isSpecSelected(spec.id) 
                            ? 'bg-blue-600 text-white border-blue-600 dark:border-blue-500 shadow-md shadow-blue-500/20' 
                            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500'"
                        class="px-4 py-2 rounded-full border text-sm font-medium transition-all">
                        {{ spec.label }}
                    </button>
                }
            </div>
            @if (applyForm.get('specializations')?.invalid && applyForm.get('specializations')?.touched) {
                <p class="text-red-500 text-xs">Select at least one specialization.</p>
            }
          </div>

          <div class="space-y-4 pt-6 border-t border-gray-100 dark:border-gray-800">
            <div class="flex justify-between items-center pb-2">
              <h3 class="font-bold text-lg text-gray-800 dark:text-white flex items-center gap-2">
                <i class="ri-translate text-blue-600 dark:text-blue-400"></i> Language Expertise
              </h3>
              <button type="button" (click)="addLanguage()" class="text-blue-600 dark:text-blue-400 text-sm font-bold hover:underline flex items-center gap-1">
                <i class="ri-add-line"></i> Add Language
              </button>
            </div>
            
            <div formArrayName="languageAbilities" class="space-y-3">
              <div *ngFor="let lang of languageAbilities.controls; let i=index" [formGroupName]="i" 
                   class="flex flex-col md:flex-row gap-4 items-start md:items-end p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl">
                
                <div class="flex-1 w-full">
                  <label class="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 mb-1 block">Language</label>
                  <select formControlName="language" class="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white p-3 rounded-xl text-sm outline-none focus:border-blue-500">
                    <option value="" class="dark:bg-gray-800 text-gray-500">Select Language</option>
                    @for (l of availableLanguages(); track l.id) { <option [value]="l.id">{{ l.label }}</option> }
                  </select>
                </div>

                <div class="w-full md:w-48">
                  <label class="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 mb-1 block">Proficiency</label>
                  <select formControlName="proficiency" class="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white p-3 rounded-xl text-sm outline-none focus:border-blue-500">
                    <option value="" class="dark:bg-gray-800 text-gray-500">Level</option>
                    @for (p of proficiencyLevels(); track p.id) { <option [value]="p.id">{{ p.id }}</option> }
                  </select>
                </div>

                <button type="button" (click)="removeLanguage(i)" class="text-gray-400 hover:text-red-500 dark:hover:text-red-400 p-2 md:mb-1 transition-colors">
                    <i class="ri-delete-bin-line text-xl"></i>
                </button>
              </div>
            </div>
          </div>

          <div class="space-y-4 pt-6 border-t border-gray-100 dark:border-gray-800">
            <div class="flex justify-between items-center pb-2">
              <h3 class="font-bold text-lg text-gray-800 dark:text-white flex items-center gap-2">
                <i class="ri-award-line text-blue-600 dark:text-blue-400"></i> Certifications
              </h3>
              <button type="button" (click)="addCertification()" class="text-blue-600 dark:text-blue-400 text-sm font-bold hover:underline flex items-center gap-1">
                <i class="ri-add-line"></i> Add Cert
              </button>
            </div>
            
            <div formArrayName="certifications" class="space-y-4">
              <div *ngFor="let cert of certifications.controls; let i=index" [formGroupName]="i" 
                   class="p-5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/30 relative group">
                
                <button type="button" (click)="removeCertification(i)" class="absolute top-2 right-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 p-1">
                    <i class="ri-close-circle-line text-xl"></i>
                </button>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input formControlName="name" placeholder="Certificate Name" 
                         class="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white p-3 rounded-xl text-sm outline-none focus:border-blue-500">
                  
                  <input formControlName="issuingOrganization" placeholder="Issuing Organization" 
                         class="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white p-3 rounded-xl text-sm outline-none focus:border-blue-500">
                  
                  <div class="flex items-center gap-2">
                    <input type="file" (change)="onCertFileUpload($event, i)" accept="application/pdf,image/*" class="hidden" #certFile>
                    <button type="button" (click)="certFile.click()" 
                            [class]="cert.get('fileUrl')?.value 
                                ? 'border-green-500/30 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' 
                                : 'border-blue-300/50 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30'"
                            class="w-full text-xs font-bold border border-dashed p-3 rounded-xl flex items-center justify-center gap-2 transition-all h-[46px]">
                      @if(cert.get('fileUrl')?.value) { <i class="ri-check-line"></i> Attached } 
                      @else { <i class="ri-upload-cloud-line"></i> Upload Proof }
                    </button>
                  </div>
                  
                  <input type="date" formControlName="issueDate" 
                         class="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white p-3 rounded-xl text-sm outline-none focus:border-blue-500">
                  
                  <input type="date" formControlName="expiryDate" placeholder="Expiry Date (Optional)"
                         class="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white p-3 rounded-xl text-sm outline-none focus:border-blue-500">
                </div>
              </div>
            </div>
          </div>

          <div class="pt-8">
            <button type="submit" [disabled]="applyForm.invalid || isSubmitting() || isUploadingPic() || isUploadingDoc()"
              class="w-full py-4 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white rounded-xl font-bold shadow-lg shadow-blue-600/20 
                     disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-lg">
              @if (isSubmitting()) { 
                <div class="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div> 
              }
              {{ isSubmitting() ? 'Processing...' : (isReapplying() ? 'Confirm Updates' : 'Submit Application') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class InterpreterApplyComponent implements OnInit {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private router = inject(Router);
  private sanitizer = inject(DomSanitizer);

  private readonly API_URL = environment.apiUrl;

  // Signals
  availableSpecializations = signal<Metadata[]>([]);
  availableLanguages = signal<Metadata[]>([]);
  proficiencyLevels = signal<any[]>([]);

  applyForm!: FormGroup;
  
  // State Signals
  isReapplying = signal(false);
  isSubmitting = signal(false);
  
  // Separate loading states for better UX
  isUploadingPic = signal(false);
  isUploadingDoc = signal(false);

  // Computed Signal for Video Preview
  videoPreviewUrl = signal<SafeResourceUrl | null>(null);

  ngOnInit() {
    this.initForm();
    this.loadMetadata();
    this.isReapplying.set(this.router.url.includes('re-apply'));

    // React to video URL changes for preview
    this.applyForm.get('introVideoUrl')?.valueChanges.subscribe(url => {
        this.updateVideoPreview(url);
    });
  }

  private initForm() {
    this.applyForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      bio: ['', [Validators.required, Validators.minLength(50)]],
      profilePictureUrl: ['', Validators.required],
      governmentIdUrl: ['', Validators.required],
      introVideoUrl: ['', [Validators.required, Validators.pattern(/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be|vimeo\.com)\/.+$/)]],
      specializations: [[], [Validators.required, Validators.minLength(1)]],
      languageAbilities: this.fb.array([this.createLanguageGroup()]),
      certifications: this.fb.array([])
    });
  }

  // --- 401 Fix: Manual Header Construction ---
  private getAuthHeaders(): HttpHeaders {
    // Attempt to grab token from localStorage (common patterns)
    // Adjust key if your app uses a different one
    const token = localStorage.getItem('access_token') || localStorage.getItem('token') || localStorage.getItem('jwtToken');
    
    let headers = new HttpHeaders();
    if (token) {
        // IMPORTANT: Must be "Bearer <token>"
        headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  // --- File Upload Logic with Headers ---
  onFileUpload(event: Event, field: string) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const formData = new FormData();
    formData.append('file', input.files[0]);

    if (field === 'profilePictureUrl') this.isUploadingPic.set(true);
    if (field === 'governmentIdUrl') this.isUploadingDoc.set(true);

    // FIX: Pass { headers: this.getAuthHeaders() } to bypass failing interceptor for this request
    this.http.post<{ url: string }>(`${this.API_URL}/files/upload`, formData, { headers: this.getAuthHeaders() })
      .pipe(finalize(() => {
         if (field === 'profilePictureUrl') this.isUploadingPic.set(false);
         if (field === 'governmentIdUrl') this.isUploadingDoc.set(false);
      }))
      .subscribe({
        next: (res) => this.applyForm.patchValue({ [field]: res.url }),
        error: (err) => {
            console.error('Upload failed', err);
            // Optional: Alert user
            // alert('Upload failed: ' + err.message);
        }
      });
  }

  onCertFileUpload(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const formData = new FormData();
    formData.append('file', input.files[0]);
    
    // FIX: Pass { headers: this.getAuthHeaders() } here too
    this.http.post<{ url: string }>(`${this.API_URL}/files/upload`, formData, { headers: this.getAuthHeaders() })
      .subscribe(res => {
        const certs = this.certifications;
        certs.at(index).patchValue({ fileUrl: res.url });
      });
  }

  // --- Form Logic ---
  toggleSpecialization(specId: string) {
    const control = this.applyForm.get('specializations');
    if (!control) return;
    const current = control.value as string[];
    const updated = current.includes(specId) ? current.filter(id => id !== specId) : [...current, specId];
    control.patchValue(updated);
    control.markAsDirty();
  }

  isSpecSelected(specId: string): boolean {
    return (this.applyForm.get('specializations')?.value || []).includes(specId);
  }

  get languageAbilities() { return this.applyForm.get('languageAbilities') as FormArray; }
  get certifications() { return this.applyForm.get('certifications') as FormArray; }

  createLanguageGroup() {
    return this.fb.group({
      language: ['', Validators.required],
      proficiency: ['', Validators.required]
    });
  }
  addLanguage() { this.languageAbilities.push(this.createLanguageGroup()); }
  removeLanguage(i: number) { if (this.languageAbilities.length > 1) this.languageAbilities.removeAt(i); }

  addCertification() {
    this.certifications.push(this.fb.group({
      name: ['', Validators.required],
      issuingOrganization: ['', Validators.required],
      fileUrl: ['', Validators.required],
      description: [''],
      issueDate: ['', Validators.required],
      expiryDate: [''] // Init as empty string
    }));
  }
  removeCertification(i: number) { this.certifications.removeAt(i); }

  // --- Submit with Data Cleanup ---
  onSubmit() {
    if (this.applyForm.invalid) return;

    this.isSubmitting.set(true);
    
    // 1. Clone value to avoid mutating form
    const payload = { ...this.applyForm.value };

    // 2. Fix Empty Dates for Java Backend
    // Java LocalDate cannot parse empty string "". We must convert it to null.
    if (payload.certifications && Array.isArray(payload.certifications)) {
        payload.certifications = payload.certifications.map((cert: any) => ({
            ...cert,
            expiryDate: cert.expiryDate ? cert.expiryDate : null
        }));
    }

    const url = this.isReapplying()
      ? `${this.API_URL}/interpreters/re-apply`
      : `${this.API_URL}/interpreters/apply`;

    const request$ = this.isReapplying() 
      ? this.http.put(url, payload) 
      : this.http.post(url, payload);

    request$.subscribe({
      next: () => this.router.navigate(['/dashboard/interpreter/home']),
      error: (err) => {
        this.isSubmitting.set(false);
        console.error('Application failed', err);
      }
    });
  }

  // --- Video Preview Helper ---
  private updateVideoPreview(url: string | null) {
    if (!url) { this.videoPreviewUrl.set(null); return; }
    let embedUrl = '';
    const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    if (ytMatch) { embedUrl = `https://www.youtube.com/embed/${ytMatch[1]}`; } 
    else {
        const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
        if (vimeoMatch) { embedUrl = `https://player.vimeo.com/video/${vimeoMatch[1]}`; }
    }
    this.videoPreviewUrl.set(embedUrl ? this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl) : null);
  }

  private loadMetadata() {
    forkJoin({
      specializations: this.http.get<Metadata[]>(`${this.API_URL}/metadata/specializations`),
      languages: this.http.get<any>(`${this.API_URL}/metadata/languages`)
    }).subscribe(res => {
        this.availableSpecializations.set(res.specializations);
        this.availableLanguages.set(res.languages.languages);
        this.proficiencyLevels.set(res.languages.proficiencyLevels);
    });
  }
}