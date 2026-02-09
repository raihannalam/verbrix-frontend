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
import { Router, ActivatedRoute } from '@angular/router';
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

    <div class="min-h-screen pt-24 pb-12 px-4 sm:px-6 bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      
      @if (loadingData()) {
        <div class="flex flex-col items-center justify-center h-[60vh] space-y-4">
           <div class="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full"></div>
           <p class="text-gray-500 animate-pulse">Checking for existing application...</p>
        </div>
      } 
      
      @else {
        <div class="max-w-4xl mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 sm:p-8 transition-colors duration-300">
          
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 border-b border-gray-100 dark:border-gray-800 pb-6 gap-4">
              <div>
                <h2 class="text-2xl font-bold tracking-tight">
                    {{ isReapplying() ? 'Update Application' : 'Interpreter Application' }}
                </h2>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {{ isReapplying() ? 'Update your details and resubmit for verification.' : 'Complete your profile to start receiving consultation requests.' }}
                </p>
              </div>
              <span class="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-xs font-bold uppercase tracking-wider border border-blue-100 dark:border-blue-800/50">
                  Professional Profile
              </span>
          </div>

          <form [formGroup]="applyForm" (ngSubmit)="onSubmit()" class="space-y-10">
            
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div class="lg:col-span-4 space-y-3">
                  <label class="text-[10px] font-bold uppercase text-gray-500 dark:text-gray-400 mb-1 block">Profile Photo</label>
                  <div [class]="'relative group aspect-square w-full rounded-2xl overflow-hidden border-2 border-dashed flex items-center justify-center transition-all cursor-pointer shadow-sm ' + 
                               (applyForm.get('profilePictureUrl')?.value 
                                ? 'border-green-500/50 dark:border-green-500/50 bg-gray-50 dark:bg-black/20' 
                                : 'border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 hover:border-blue-500')"
                       (click)="profilePic.click()">
                      
                      @if (isUploadingPic()) {
                          <div class="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                      } @else if (applyForm.get('profilePictureUrl')?.value) {
                          <img [src]="applyForm.get('profilePictureUrl')?.value" class="h-full w-full object-cover">
                          <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <i class="ri-camera-switch-line text-white text-3xl"></i>
                          </div>
                      } @else {
                          <div class="flex flex-col items-center text-gray-400 dark:text-gray-500 group-hover:text-blue-500 transition-colors">
                              <i class="ri-user-smile-line text-5xl mb-2"></i>
                              <span class="text-xs font-semibold uppercase">Upload Photo</span>
                          </div>
                      }
                  </div>
                  <input type="file" (change)="onFileUpload($event, 'profilePictureUrl')" accept="image/*" class="hidden" #profilePic>
              </div>

              <div class="lg:col-span-8 space-y-3 flex flex-col">
                  <label class="text-[10px] font-bold uppercase text-gray-500 dark:text-gray-400 mb-1 block">
                      Introduction Video <span class="text-[10px] normal-case opacity-70 ml-1">(YouTube/Vimeo URL)</span>
                  </label>
                  
                  <div class="relative">
                      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <i class="ri-link text-gray-400"></i>
                      </div>
                      <input formControlName="introVideoUrl" 
                             placeholder="https://youtube.com/..." 
                             class="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white p-3 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-gray-400 pl-10">
                  </div>
                  
                  <div class="flex-1 rounded-xl overflow-hidden bg-gray-100 dark:bg-black/40 border border-gray-200 dark:border-gray-800 relative min-h-[200px] flex items-center justify-center">
                      @if (videoPreviewUrl()) {
                          <iframe [src]="videoPreviewUrl()" 
                                  class="w-full h-full absolute inset-0" 
                                  frameborder="0" allowfullscreen></iframe>
                      } @else {
                          <div class="text-center p-6 text-gray-400 dark:text-gray-600">
                              <i class="ri-video-line text-4xl mb-2 block"></i>
                              <span class="text-xs">Video Preview</span>
                          </div>
                      }
                  </div>
              </div>
            </div>

            <div class="space-y-6 pt-6 border-t border-gray-100 dark:border-gray-800">
              <h3 class="font-bold text-lg flex items-center gap-2">
                  <i class="ri-file-user-line text-blue-600 dark:text-blue-400"></i> Basic Information
              </h3>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="space-y-1">
                  <label class="text-[10px] font-bold uppercase text-gray-500 dark:text-gray-400 mb-1 block">First Name</label>
                  <input formControlName="firstName" class="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white p-3 rounded-xl text-sm outline-none focus:border-blue-500 transition-all">
                </div>
                <div class="space-y-1">
                  <label class="text-[10px] font-bold uppercase text-gray-500 dark:text-gray-400 mb-1 block">Last Name</label>
                  <input formControlName="lastName" class="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white p-3 rounded-xl text-sm outline-none focus:border-blue-500 transition-all">
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div class="md:col-span-2 space-y-1">
                      <label class="text-[10px] font-bold uppercase text-gray-500 dark:text-gray-400 mb-1 block">Professional Bio</label>
                      <textarea formControlName="bio" rows="5" class="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white p-3 rounded-xl text-sm outline-none focus:border-blue-500 transition-all resize-none"></textarea>
                      @if (applyForm.get('bio')?.hasError('minlength')) {
                          <p class="text-red-500 text-xs">Minimum 50 characters required.</p>
                      }
                  </div>
                  
                  <div class="space-y-4">
                      <div class="grid grid-cols-2 gap-3">
                          <div class="space-y-1">
                              <label class="text-[10px] font-bold uppercase text-gray-500 dark:text-gray-400 mb-1 block">Exp (Years)</label>
                              <input type="number" formControlName="experienceYears" class="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white p-3 rounded-xl text-sm outline-none focus:border-blue-500 text-center">
                          </div>
                          <div class="space-y-1">
                              <label class="text-[10px] font-bold uppercase text-gray-500 dark:text-gray-400 mb-1 block">Exp (Months)</label>
                              <input type="number" formControlName="experienceMonths" class="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white p-3 rounded-xl text-sm outline-none focus:border-blue-500 text-center">
                          </div>
                      </div>

                      <div class="space-y-1">
                          <label class="text-[10px] font-bold uppercase text-gray-500 dark:text-gray-400 mb-1 block">Identity Verification</label>
                          <select formControlName="governmentIdType" class="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white p-2.5 rounded-xl text-xs outline-none focus:border-blue-500 appearance-none">
                              <option value="">Select ID Type</option>
                              <option value="PAN">PAN Card</option>
                              <option value="AADHAAR">Aadhaar Card</option>
                              <option value="DRIVING_LICENSE">Driving License</option>
                              <option value="PASSPORT">Passport</option>
                              <option value="VOTER_ID">Voter ID</option>
                          </select>
                      </div>

                      <input formControlName="governmentIdDetails" placeholder="ID Number" class="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white p-2.5 rounded-xl text-xs outline-none focus:border-blue-500">

                      <div (click)="govId.click()" 
                           [class]="'flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-all h-[70px] ' + 
                                    (applyForm.get('governmentIdUrl')?.value 
                                     ? 'border-green-500/30 bg-green-50 dark:bg-green-900/10' 
                                     : 'border-dashed border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800')">
                          <div class="h-8 w-8 shrink-0 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center">
                              @if(isUploadingDoc()) { 
                                  <div class="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div> 
                              } @else { 
                                  <i class="ri-passport-line text-lg"></i> 
                              }
                          </div>
                          <div class="flex-1 min-w-0">
                              <p class="text-[10px] font-bold uppercase tracking-tight">Upload ID Doc</p>
                              <p class="text-[10px] text-gray-500 dark:text-gray-400 truncate mt-0.5">
                                   {{ applyForm.get('governmentIdUrl')?.value ? 'File Attached' : 'PDF/JPG/PNG' }}
                              </p>
                          </div>
                          @if (applyForm.get('governmentIdUrl')?.value) { <i class="ri-check-fill text-green-500"></i> }
                          <input type="file" (change)="onFileUpload($event, 'governmentIdUrl')" accept="application/pdf,image/*" class="hidden" #govId>
                      </div>
                  </div>
              </div>
            </div>

            <div class="space-y-6 pt-6 border-t border-gray-100 dark:border-gray-800">
              <h3 class="font-bold text-lg flex items-center gap-2">
                  <i class="ri-money-dollar-circle-line text-blue-600 dark:text-blue-400"></i> Financial Information
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div class="space-y-1">
                      <label class="text-[10px] font-bold uppercase text-gray-500 dark:text-gray-400 mb-1 block">Consultation Fee</label>
                      <input type="number" formControlName="consultationFee" class="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white p-3 rounded-xl text-sm outline-none focus:border-blue-500 pl-4">
                  </div>
                  <div class="space-y-1">
                      <label class="text-[10px] font-bold uppercase text-gray-500 dark:text-gray-400 mb-1 block">Service Agreement Fee</label>
                      <input type="number" formControlName="serviceAgreementFee" class="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white p-3 rounded-xl text-sm outline-none focus:border-blue-500 pl-4">
                  </div>
              </div>
            </div>

            <div class="space-y-4 pt-6 border-t border-gray-100 dark:border-gray-800">
              <h3 class="font-bold text-lg flex items-center gap-2">
                  <i class="ri-stethoscope-line text-blue-600 dark:text-blue-400"></i> Specializations
              </h3>
              <div class="flex flex-wrap gap-2">
                  @for (spec of availableSpecializations(); track spec.id) {
                      <button type="button" (click)="toggleSpecialization(spec.id)"
                          [class]="isSpecSelected(spec.id) 
                              ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20' 
                              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-blue-400'"
                          class="px-4 py-2 rounded-full border text-sm font-medium transition-all">
                          {{ spec.label }}
                      </button>
                  }
              </div>
            </div>

            <div class="space-y-4 pt-6 border-t border-gray-100 dark:border-gray-800">
              <div class="flex justify-between items-center pb-2">
                <h3 class="font-bold text-lg flex items-center gap-2">
                  <i class="ri-translate text-blue-600 dark:text-blue-400"></i> Language Expertise
                </h3>
                <button type="button" (click)="addLanguage()" class="text-blue-600 dark:text-blue-400 text-sm font-bold hover:underline flex items-center gap-1">
                  <i class="ri-add-line"></i> Add Language
                </button>
              </div>
              
              <div formArrayName="languageAbilities" class="grid grid-cols-1 gap-4">
                <div *ngFor="let lang of languageAbilities.controls; let i=index" [formGroupName]="i" 
                     class="flex flex-col md:flex-row gap-4 p-4 bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700 rounded-xl relative group">
                  
                  <div class="grid grid-cols-2 md:flex md:flex-1 gap-4 w-full">
                      <div class="flex-1 space-y-1 col-span-2 md:col-span-1">
                          <label class="text-[10px] font-bold uppercase text-gray-500 dark:text-gray-400 mb-1 block">Language</label>
                          <select formControlName="language" class="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white p-3 rounded-xl text-sm outline-none focus:border-blue-500 appearance-none">
                              <option value="">Select</option>
                              @for (l of availableLanguages(); track l.id) { <option [value]="l.id">{{ l.label }}</option> }
                          </select>
                      </div>

                      <div class="flex-1 space-y-1">
                          <label class="text-[10px] font-bold uppercase text-gray-500 dark:text-gray-400 mb-1 block">Proficiency</label>
                          <select formControlName="proficiency" class="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white p-3 rounded-xl text-sm outline-none focus:border-blue-500 appearance-none">
                              <option value="">Level</option>
                              @for (p of proficiencyLevels(); track p.id) { <option [value]="p.id">{{ p.id }}</option> }
                          </select>
                      </div>

                      <div class="flex-1 space-y-1">
                          <label class="text-[10px] font-bold uppercase text-gray-500 dark:text-gray-400 mb-1 block">Proof</label>
                          <div class="relative">
                               <input type="file" (change)="onLanguageProofUpload($event, i)" accept="application/pdf,image/*" class="hidden" #langProof>
                               <button type="button" (click)="langProof.click()" 
                                  [class]="lang.get('proofUrl')?.value 
                                      ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800' 
                                      : 'bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 border-gray-300 dark:border-gray-600 hover:border-blue-400'"
                                  class="w-full h-[46px] border rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all">
                                  @if(lang.get('proofUrl')?.value) {
                                      <i class="ri-checkbox-circle-line text-lg"></i> Uploaded
                                  } @else {
                                      <i class="ri-upload-cloud-2-line text-lg"></i> Upload
                                  }
                               </button>
                          </div>
                      </div>
                  </div>
                  <button type="button" (click)="removeLanguage(i)" class="absolute top-2 right-2 md:relative md:top-auto md:right-auto md:self-end text-gray-400 hover:text-red-500 p-2">
                      <i class="ri-delete-bin-line text-lg"></i>
                  </button>
                </div>
              </div>
            </div>

            <div class="space-y-4 pt-6 border-t border-gray-100 dark:border-gray-800">
              <div class="flex justify-between items-center pb-2">
                <h3 class="font-bold text-lg flex items-center gap-2">
                  <i class="ri-award-line text-blue-600 dark:text-blue-400"></i> Other Certifications
                </h3>
                <button type="button" (click)="addCertification()" class="text-blue-600 dark:text-blue-400 text-sm font-bold hover:underline flex items-center gap-1">
                  <i class="ri-add-line"></i> Add Cert
                </button>
              </div>
              
              <div formArrayName="certifications" class="space-y-4">
                <div *ngFor="let cert of certifications.controls; let i=index" [formGroupName]="i" 
                     class="p-5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/30 relative group">
                  <button type="button" (click)="removeCertification(i)" class="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-colors">
                      <i class="ri-close-line text-xl"></i>
                  </button>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <div class="space-y-1">
                        <label class="text-[10px] font-bold uppercase text-gray-500 dark:text-gray-400 mb-1 block">Certificate Name</label>
                        <input formControlName="name" class="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white p-3 rounded-xl text-sm outline-none focus:border-blue-500">
                    </div>
                    <div class="space-y-1">
                        <label class="text-[10px] font-bold uppercase text-gray-500 dark:text-gray-400 mb-1 block">Issuing Org</label>
                        <input formControlName="issuingOrganization" class="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white p-3 rounded-xl text-sm outline-none focus:border-blue-500">
                    </div>
                    <div class="md:col-span-2 space-y-1">
                        <label class="text-[10px] font-bold uppercase text-gray-500 dark:text-gray-400 mb-1 block">Description</label>
                        <textarea formControlName="description" rows="2" class="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white p-3 rounded-xl text-sm outline-none focus:border-blue-500 resize-none"></textarea>
                    </div>
                    <div class="space-y-1">
                        <label class="text-[10px] font-bold uppercase text-gray-500 dark:text-gray-400 mb-1 block">Document</label>
                        <input type="file" (change)="onCertFileUpload($event, i)" accept="application/pdf,image/*" class="hidden" #certFile>
                        <button type="button" (click)="certFile.click()" 
                                [class]="cert.get('fileUrl')?.value 
                                    ? 'border-green-500/30 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' 
                                    : 'border-blue-300/50 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/10 hover:bg-blue-100'"
                                class="w-full text-xs font-bold border border-dashed rounded-xl flex items-center justify-center gap-2 transition-all h-[46px]">
                          @if(cert.get('fileUrl')?.value) { <i class="ri-check-line"></i> Attached } 
                          @else { <i class="ri-upload-cloud-line"></i> Upload Proof }
                        </button>
                    </div>
                    <div class="grid grid-cols-2 gap-2">
                        <div class="space-y-1">
                            <label class="text-[10px] font-bold uppercase text-gray-500 dark:text-gray-400 mb-1 block">Issued Date</label>
                            <input type="date" formControlName="issueDate" class="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white p-3 rounded-xl text-sm outline-none focus:border-blue-500">
                        </div>
                        <div class="space-y-1">
                            <label class="text-[10px] font-bold uppercase text-gray-500 dark:text-gray-400 mb-1 block">Expiry (Opt)</label>
                            <input type="date" formControlName="expiryDate" class="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white p-3 rounded-xl text-sm outline-none focus:border-blue-500">
                        </div>
                    </div>
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
      }
    </div>
  `
})
export class InterpreterApplyComponent implements OnInit {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private sanitizer = inject(DomSanitizer);

  private readonly API_URL = environment.apiUrl;

  availableSpecializations = signal<Metadata[]>([]);
  availableLanguages = signal<Metadata[]>([]);
  proficiencyLevels = signal<any[]>([]);

  applyForm!: FormGroup;
  
  isReapplying = signal(false);
  loadingData = signal(false); 
  isSubmitting = signal(false);
  isUploadingPic = signal(false);
  isUploadingDoc = signal(false);
  videoPreviewUrl = signal<SafeResourceUrl | null>(null);

  ngOnInit() {
    this.initForm();
    this.loadMetadata();
    
    // --- AUTO-DETECT APPLICATION ---
    // Instead of waiting for queryParams, we always try to fetch the existing application.
    // If it exists, we fill the form. If not, we leave it blank.
    this.autoDetectApplication();

    this.applyForm.get('introVideoUrl')?.valueChanges.subscribe(url => {
        this.updateVideoPreview(url);
    });
  }

  // --- 1. Form Initialization ---
  private initForm() {
    this.applyForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      bio: ['', [Validators.required, Validators.minLength(50)]],
      profilePictureUrl: ['', Validators.required],
      governmentIdUrl: ['', Validators.required],
      governmentIdType: ['', Validators.required],
      governmentIdDetails: ['', Validators.required],
      introVideoUrl: ['', [Validators.required]],
      experienceYears: [0, [Validators.required, Validators.min(0)]],
      experienceMonths: [0, [Validators.required, Validators.min(0), Validators.max(11)]],
      consultationFee: [null, [Validators.required, Validators.min(0)]],
      serviceAgreementFee: [null, [Validators.required, Validators.min(0)]],
      specializations: [[], [Validators.required, Validators.minLength(1)]],
      languageAbilities: this.fb.array([this.createLanguageGroup()]),
      certifications: this.fb.array([])
    });
  }

  // --- 2. Load Existing Application (Auto-Detect Logic) ---
  autoDetectApplication() {
    this.loadingData.set(true);

    this.http.get<any>(`${this.API_URL}/interpreters/me/application`, { headers: this.getAuthHeaders() })
        .pipe(finalize(() => this.loadingData.set(false)))
        .subscribe({
            next: (data) => {
                console.log('Existing Application Found:', data); 
                this.isReapplying.set(true); // If we found data, we are in re-apply mode!

                // Patch Simple Fields
                this.applyForm.patchValue({
                    firstName: data.firstName || '',
                    lastName: data.lastName || '',
                    bio: data.bio || '',
                    profilePictureUrl: data.profilePictureUrl || '',
                    governmentIdUrl: data.governmentIdUrl || '',
                    governmentIdType: data.governmentIdType || '',
                    governmentIdDetails: data.governmentIdDetails || '',
                    introVideoUrl: data.introVideoUrl || '',
                    experienceYears: data.experienceYears ?? 0,
                    experienceMonths: data.experienceMonths ?? 0,
                    consultationFee: data.consultationFee ?? null,
                    serviceAgreementFee: data.serviceAgreementFee ?? null,
                    specializations: data.specializations || []
                });

                if (data.introVideoUrl) this.updateVideoPreview(data.introVideoUrl);

                // Patch Language Array
                const langArray = this.languageAbilities;
                langArray.clear(); 
                if (data.languageAbilities && data.languageAbilities.length > 0) {
                    data.languageAbilities.forEach((lang: any) => {
                        const group = this.createLanguageGroup();
                        group.patchValue({
                           language: lang.language,
                           proficiency: lang.proficiency,
                           proofUrl: lang.proofUrl || ''
                        });
                        langArray.push(group);
                    });
                } else {
                    langArray.push(this.createLanguageGroup());
                }

                // Patch Certification Array
                const certArray = this.certifications;
                certArray.clear();
                if (data.certifications && data.certifications.length > 0) {
                    data.certifications.forEach((cert: any) => {
                         const group = this.fb.group({
                            name: [cert.name, Validators.required],
                            issuingOrganization: [cert.issuingOrganization, Validators.required],
                            description: [cert.description || ''],
                            fileUrl: [cert.fileUrl, Validators.required],
                            issueDate: [cert.issueDate, Validators.required],
                            expiryDate: [cert.expiryDate || null]
                         });
                         certArray.push(group);
                    });
                }
            },
            error: (err) => {
                // If 404, it means no application exists. That's fine! 
                // We just let the form be blank for a new application.
                console.log("No existing application found (Fresh Start).");
                this.isReapplying.set(false);
            }
        });
  }

  // --- 3. Form Helpers ---

  get languageAbilities() { return this.applyForm.get('languageAbilities') as FormArray; }
  get certifications() { return this.applyForm.get('certifications') as FormArray; }

  createLanguageGroup() {
    return this.fb.group({
      language: ['', Validators.required],
      proficiency: ['', Validators.required],
      proofUrl: ['']
    });
  }
  
  addLanguage() { this.languageAbilities.push(this.createLanguageGroup()); }
  removeLanguage(i: number) { if (this.languageAbilities.length > 1) this.languageAbilities.removeAt(i); }

  addCertification() {
    this.certifications.push(this.fb.group({
      name: ['', Validators.required],
      issuingOrganization: ['', Validators.required],
      description: [''],
      fileUrl: ['', Validators.required],
      issueDate: ['', Validators.required],
      expiryDate: [null]
    }));
  }
  removeCertification(i: number) { this.certifications.removeAt(i); }

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

  // --- 4. Submissions & Uploads ---

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token'); 
    let headers = new HttpHeaders();
    if (token) headers = headers.set('Authorization', `Bearer ${token}`);
    return headers;
  }

  onFileUpload(event: Event, field: string) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const formData = new FormData();
    formData.append('file', input.files[0]);

    if (field === 'profilePictureUrl') this.isUploadingPic.set(true);
    if (field === 'governmentIdUrl') this.isUploadingDoc.set(true);

    this.http.post<{ url: string }>(`${this.API_URL}/files/upload`, formData, { headers: this.getAuthHeaders() })
      .pipe(finalize(() => {
         if (field === 'profilePictureUrl') this.isUploadingPic.set(false);
         if (field === 'governmentIdUrl') this.isUploadingDoc.set(false);
      }))
      .subscribe({
        next: (res) => this.applyForm.patchValue({ [field]: res.url }),
        error: (err) => console.error('Upload failed', err)
      });
  }

  onLanguageProofUpload(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const formData = new FormData();
    formData.append('file', input.files[0]);

    this.http.post<{ url: string }>(`${this.API_URL}/files/upload`, formData, { headers: this.getAuthHeaders() })
      .subscribe(res => {
        this.languageAbilities.at(index).patchValue({ proofUrl: res.url });
      });
  }

  onCertFileUpload(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const formData = new FormData();
    formData.append('file', input.files[0]);
    
    this.http.post<{ url: string }>(`${this.API_URL}/files/upload`, formData, { headers: this.getAuthHeaders() })
      .subscribe(res => {
        this.certifications.at(index).patchValue({ fileUrl: res.url });
      });
  }

  onSubmit() {
    if (this.applyForm.invalid) return;
    this.isSubmitting.set(true);
    
    const formValue = this.applyForm.value;
    const payload = { 
        ...formValue,
        certifications: formValue.certifications.map((cert: any) => ({
            ...cert,
            expiryDate: cert.expiryDate ? cert.expiryDate : null,
            description: cert.description || ''
        }))
    };

    const url = this.isReapplying()
      ? `${this.API_URL}/interpreters/re-apply`
      : `${this.API_URL}/interpreters/apply`;

    const request$ = this.isReapplying() 
      ? this.http.put(url, payload, { headers: this.getAuthHeaders() }) 
      : this.http.post(url, payload, { headers: this.getAuthHeaders() });

    request$.subscribe({
      next: () => {
        this.router.navigate(['/dashboard/client']);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        console.error('Application failed', err);
        alert('Application submission failed. Please check your inputs or try again.');
      }
    });
  }

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