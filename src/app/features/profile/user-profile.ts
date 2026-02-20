import { Component, inject, OnInit, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Navbar } from '../../layout/navbar/navbar';
import { UserDevice, UserProfileService, UserProfileUpdateRequest } from '../../core/services/user-profile.service';
import { AuthService } from '../../core/auth/auth.service';
import { ImageCropperComponent, ImageCroppedEvent, LoadedImage } from 'ngx-image-cropper';

type ProfileTab = 'personal' | 'preferences' | 'security';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Navbar, DatePipe, ImageCropperComponent],
  template: `
    <app-navbar></app-navbar>

    <div class="min-h-screen bg-[#f8fafc] dark:bg-[#0b0c0f] pt-24 pb-12 px-4 sm:px-6 transition-colors duration-300 relative">
      <div class="max-w-6xl mx-auto">

        <div class="mb-8 animate-fade-in">
          <h1 class="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Account Settings
          </h1>
          <p class="text-gray-500 dark:text-gray-400 mt-1 text-sm sm:text-base">
            Manage your profile, preferences, and security.
          </p>
        </div>

        <div class="flex flex-col md:flex-row gap-8 animate-slide-up">

          <aside class="w-full md:w-64 shrink-0">
            <nav class="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-4 md:pb-0 no-scrollbar">
              <button (click)="activeTab.set('personal')"
                      [class.bg-white]="activeTab() === 'personal'" [class.dark:bg-[#181a1f]]="activeTab() === 'personal'"
                      [class.shadow-sm]="activeTab() === 'personal'" [class.text-blue-600]="activeTab() === 'personal'" [class.dark:text-blue-400]="activeTab() === 'personal'"
                      class="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all whitespace-nowrap">
                <i class="ri-user-line text-lg"></i> Personal Info
              </button>

              <button (click)="activeTab.set('preferences')"
                      [class.bg-white]="activeTab() === 'preferences'" [class.dark:bg-[#181a1f]]="activeTab() === 'preferences'"
                      [class.shadow-sm]="activeTab() === 'preferences'" [class.text-blue-600]="activeTab() === 'preferences'" [class.dark:text-blue-400]="activeTab() === 'preferences'"
                      class="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all whitespace-nowrap">
                <i class="ri-settings-3-line text-lg"></i> Preferences
              </button>

              <button (click)="activeTab.set('security')"
                      [class.bg-white]="activeTab() === 'security'" [class.dark:bg-[#181a1f]]="activeTab() === 'security'"
                      [class.shadow-sm]="activeTab() === 'security'" [class.text-blue-600]="activeTab() === 'security'" [class.dark:text-blue-400]="activeTab() === 'security'"
                      class="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all whitespace-nowrap">
                <i class="ri-shield-keyhole-line text-lg"></i> Security
              </button>
            </nav>
          </aside>

          <div class="flex-1 bg-white dark:bg-[#181a1f] border border-gray-200 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm min-h-[500px]">

            @if (activeTab() === 'personal') {
              <div class="animate-fade-in space-y-8">

                <div class="flex justify-between items-start">
                  <div>
                    <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-4">Profile Picture</h2>
                    <div class="flex items-center gap-6">
                      @if (profileService.profile()?.profilePictureUrl) {
                        <img [src]="profileService.profile()?.profilePictureUrl" alt="Avatar"
                             class="h-24 w-24 rounded-full object-cover shadow-sm border-2 border-blue-200 dark:border-blue-800 bg-gray-50 dark:bg-gray-800">
                      } @else {
                        <div class="h-24 w-24 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-3xl shadow-sm border-2 border-dashed border-blue-200 dark:border-blue-800">
                          {{ userInitials() }}
                        </div>
                      }

                      <div class="space-y-2">
                        <input type="file" #fileInput (change)="fileChangeEvent($event)" accept="image/png, image/jpeg, image/gif" class="hidden">

                        <button type="button" (click)="fileInput.click()" [disabled]="isUploadingAvatar()"
                                class="px-4 py-2 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-500 dark:bg-white dark:hover:bg-gray-100 dark:disabled:bg-gray-600 text-white dark:text-gray-900 text-sm font-bold rounded-xl transition-colors shadow-sm flex items-center gap-2">
                          @if (isUploadingAvatar()) {
                            <i class="ri-loader-4-line animate-spin"></i> Uploading...
                          } @else {
                            Upload New
                          }
                        </button>
                        <p class="text-xs text-gray-500 dark:text-gray-400">JPG, GIF or PNG. Max size of 2MB.</p>
                      </div>
                    </div>
                  </div>

                  @if (!isEditingProfile()) {
                    <button (click)="toggleEditMode()" class="p-2.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-xl transition-colors" title="Edit Profile">
                      <i class="ri-pencil-line text-lg"></i>
                    </button>
                  }
                </div>

                <hr class="border-gray-200 dark:border-gray-800">

                @if (!isEditingProfile()) {
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-fade-in">
                    <div>
                      <p class="text-sm font-bold text-gray-500 dark:text-gray-400">First Name</p>
                      <p class="text-base text-gray-900 dark:text-white mt-1">{{ profileForm.value.firstName || '-' }}</p>
                    </div>
                    <div>
                      <p class="text-sm font-bold text-gray-500 dark:text-gray-400">Last Name</p>
                      <p class="text-base text-gray-900 dark:text-white mt-1">{{ profileForm.value.lastName || '-' }}</p>
                    </div>
                    <div>
                      <p class="text-sm font-bold text-gray-500 dark:text-gray-400">Email Address</p>
                      <p class="text-base text-gray-900 dark:text-white mt-1">{{ profileForm.value.email || '-' }}</p>
                    </div>
                    <div>
                      <p class="text-sm font-bold text-gray-500 dark:text-gray-400">Phone Number</p>
                      <p class="text-base text-gray-900 dark:text-white mt-1">
                        {{ profileForm.value.phone ? (profileForm.value.phoneCode + ' ' + profileForm.value.phone) : '-' }}
                      </p>
                    </div>
                  </div>
                }
                @else {
                  <form [formGroup]="profileForm" (ngSubmit)="saveProfile()" class="space-y-5 animate-slide-up">
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div class="space-y-1.5">
                        <label class="block text-sm font-bold text-gray-700 dark:text-gray-300">First Name</label>
                        <input type="text" formControlName="firstName" class="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#0b0c0f] border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all">
                      </div>
                      <div class="space-y-1.5">
                        <label class="block text-sm font-bold text-gray-700 dark:text-gray-300">Last Name</label>
                        <input type="text" formControlName="lastName" class="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#0b0c0f] border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all">
                      </div>
                    </div>

                    <div class="space-y-1.5">
                      <label class="block text-sm font-bold text-gray-700 dark:text-gray-300">Email Address</label>
                      <input type="email" formControlName="email" class="w-full px-4 py-2.5 bg-gray-100 dark:bg-[#0b0c0f]/50 border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-gray-500 cursor-not-allowed outline-none" readonly>
                      <p class="text-xs text-gray-500 mt-1">Contact support to change your email address.</p>
                    </div>

                    <div class="space-y-1.5">
                      <label class="block text-sm font-bold text-gray-700 dark:text-gray-300">Phone Number</label>
                      <div class="flex gap-2">
                        <select formControlName="phoneCode" class="w-1/3 px-3 py-2.5 bg-gray-50 dark:bg-[#0b0c0f] border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all">
                          @for (country of countryCodes; track country.code) {
                            <option [value]="country.dialCode">{{ country.name }} ({{ country.dialCode }})</option>
                          }
                        </select>
                        <input type="tel" formControlName="phone" class="w-2/3 px-4 py-2.5 bg-gray-50 dark:bg-[#0b0c0f] border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="555-000-0000">
                      </div>
                    </div>

                    <div class="pt-4 flex flex-col items-end gap-3">
                      @if (profileMessage(); as msg) {
                        <div class="text-xs font-bold px-3 py-2 rounded-lg"
                             [ngClass]="msg.type === 'success' ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'">
                          {{ msg.text }}
                        </div>
                      }

                      <div class="flex gap-3">
                        <button type="button" (click)="cancelEdit()" class="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-bold transition-all">
                          Cancel
                        </button>
                        <button type="submit" [disabled]="profileForm.invalid || !profileForm.dirty || isSaving()"
                                class="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 dark:disabled:bg-blue-800 text-white rounded-xl font-bold shadow-md shadow-blue-500/20 transition-all flex items-center gap-2">
                          @if (isSaving()) {
                            <i class="ri-loader-4-line animate-spin"></i> Saving...
                          } @else {
                            Save Changes
                          }
                        </button>
                      </div>
                    </div>
                  </form>
                }
              </div>
            }

            @if (activeTab() === 'preferences') {
              <div class="animate-fade-in space-y-8">
                <form [formGroup]="preferencesForm" class="space-y-6">
                  <div>
                    <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">Notifications</h3>
                    <div class="space-y-4">
                      <label class="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-800 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <div>
                          <p class="font-bold text-sm text-gray-900 dark:text-white">Email Notifications</p>
                          <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Receive updates about your consultations via email.</p>
                        </div>
                        <input type="checkbox" formControlName="emailNotifs" class="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                      </label>
                      <label class="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-800 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <div>
                          <p class="font-bold text-sm text-gray-900 dark:text-white">SMS Alerts</p>
                          <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Get text messages for urgent consultation requests.</p>
                        </div>
                        <input type="checkbox" formControlName="smsNotifs" class="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                      </label>
                    </div>
                  </div>
                  <div class="pt-4 border-t border-gray-100 dark:border-gray-800">
                    <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">Localization</h3>
                    <div class="space-y-1.5 max-w-md">
                      <label class="block text-sm font-bold text-gray-700 dark:text-gray-300">Timezone</label>
                      <select formControlName="timezone" class="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#0b0c0f] border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all">
                        <option value="America/New_York">Eastern Time (ET)</option>
                        <option value="America/Chicago">Central Time (CT)</option>
                        <option value="America/Denver">Mountain Time (MT)</option>
                        <option value="America/Los_Angeles">Pacific Time (PT)</option>
                        <option value="Europe/London">London (GMT)</option>
                        <option value="Asia/Kolkata">India (IST)</option>
                      </select>
                    </div>
                  </div>
                  <div class="pt-4 flex justify-end">
                    <button type="button" class="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md shadow-blue-500/20 transition-all">
                      Update Preferences
                    </button>
                  </div>
                </form>
              </div>
            }

            @if (activeTab() === 'security') {
              <div class="animate-fade-in space-y-10 max-w-2xl">
                <div>
                  <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-2">Change Password</h2>
                  <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">Ensure your account is using a long, random password to stay secure.</p>

                  <form [formGroup]="securityForm" (ngSubmit)="updatePassword()" class="space-y-4">
                    <div class="space-y-1.5">
                      <label class="block text-sm font-bold text-gray-700 dark:text-gray-300">Current Password</label>
                      <input type="password" formControlName="currentPassword" class="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#0b0c0f] border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all">
                    </div>
                    <div class="space-y-1.5">
                      <label class="block text-sm font-bold text-gray-700 dark:text-gray-300">New Password</label>
                      <input type="password" formControlName="newPassword" class="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#0b0c0f] border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all">
                    </div>
                    <div class="space-y-1.5">
                      <label class="block text-sm font-bold text-gray-700 dark:text-gray-300">Confirm New Password</label>
                      <input type="password" formControlName="confirmPassword" class="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#0b0c0f] border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all">
                    </div>

                    <div class="pt-4 flex flex-col gap-3">
                      @if (passwordMessage(); as msg) {
                        <div class="text-xs font-bold px-3 py-2 rounded-lg"
                             [ngClass]="msg.type === 'success' ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'">
                          {{ msg.text }}
                        </div>
                      }
                      <button type="submit" [disabled]="securityForm.invalid || isUpdatingPassword()"
                              class="px-6 py-2.5 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 dark:bg-white dark:hover:bg-gray-100 dark:disabled:bg-gray-700 text-white dark:text-gray-900 rounded-xl font-bold shadow-sm transition-all flex items-center justify-center gap-2">
                        @if (isUpdatingPassword()) {
                          <i class="ri-loader-4-line animate-spin"></i> Updating...
                        } @else {
                          Update Password
                        }
                      </button>
                    </div>
                  </form>
                </div>

                <hr class="border-gray-200 dark:border-gray-800">

                <div>
                  <div class="flex items-center justify-between mb-6 border-b border-gray-100 dark:border-gray-800 pb-3">
                    <div>
                      <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-1">Active Sessions</h2>
                      <p class="text-sm text-gray-500 dark:text-gray-400">Manage devices logged into your account.</p>
                    </div>
                    @if (activeDevices().length > 0) {
                      <button (click)="promptRevokeAll()"
                              class="px-4 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-900/10 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-bold rounded-lg transition-colors flex items-center gap-2">
                        <i class="ri-alert-line"></i> Sign out all
                      </button>
                    }
                  </div>

                  @if (isLoadingDevices()) {
                    <div class="space-y-3">
                      @for (i of [1,2]; track i) {
                        <div class="h-20 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse border border-gray-200 dark:border-gray-800"></div>
                      }
                    </div>
                  } @else {
                    <div class="space-y-3">
                      @for (device of activeDevices(); track device.id) {
                        <div class="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-[#181a1f] hover:bg-gray-50 dark:hover:bg-[#1c1e24] transition-colors shadow-sm">
                          <div class="flex items-center gap-4">

                            <div class="h-10 w-10 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xl shrink-0">
                              <i [class]="device.deviceDetails.toLowerCase().includes('mobile') ? 'ri-smartphone-line' : 'ri-computer-line'"></i>
                            </div>

                            <div class="min-w-0">
                              <p class="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 truncate">
                                {{ device.deviceDetails || 'Unknown Device' }}
                                @if (device.isVerified) {
                                  <i class="ri-shield-check-fill text-green-500 text-xs" title="Trusted Device"></i>
                                }
                              </p>
                              <div class="text-xs text-gray-500 dark:text-gray-400 mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
                                <span class="flex items-center gap-1"><i class="ri-map-pin-line"></i> {{ device.location || 'Unknown Location' }}</span>
                                <span class="flex items-center gap-1"><i class="ri-global-line"></i> {{ device.ipAddress }}</span>
                                <span class="flex items-center gap-1"><i class="ri-time-line"></i> Last seen: {{ device.lastLogin | date:'mediumDate' }}</span>
                              </div>
                            </div>
                          </div>

                          <button (click)="promptRevokeDevice(device.id)"
                                  class="p-2 ml-4 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors group shrink-0" title="Revoke Access">
                            <i class="ri-logout-box-r-line group-hover:hidden text-xl"></i>
                            <i class="ri-delete-bin-line hidden group-hover:block text-xl"></i>
                          </button>
                        </div>
                      }

                      @if (activeDevices().length === 0) {
                        <div class="text-center p-8 text-gray-500 text-sm border border-dashed border-gray-300 dark:border-gray-700 rounded-xl">
                          No active sessions found.
                        </div>
                      }
                    </div>
                  }
                </div>

              </div>
            }

          </div>
        </div>
      </div>

      @if (confirmAction() !== null) {
        <div class="fixed inset-0 z-[2000] bg-black/50 backdrop-blur-[2px] flex items-center justify-center p-4 animate-fade-in">
          <div class="bg-white dark:bg-[#181a1f] rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-gray-200 dark:border-gray-800 animate-slide-up">
            <div class="flex items-center gap-3 mb-4 text-red-600 dark:text-red-400">
              <div class="w-10 h-10 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center shrink-0">
                <i class="ri-error-warning-fill text-xl"></i>
              </div>
              <h3 class="text-lg font-bold text-gray-900 dark:text-white">
                {{ confirmAction() === 'ALL' ? 'Sign out everywhere?' : 'Revoke device access?' }}
              </h3>
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
              {{ confirmAction() === 'ALL'
              ? 'This will instantly sign you out of all devices, including this current session. You will be required to log in again.'
              : 'Are you sure you want to sign out of this specific device? It will immediately lose access to your account.' }}
            </p>
            <div class="flex items-center justify-end gap-3">
              <button (click)="cancelRevoke()"
                      class="px-4 py-2.5 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                Cancel
              </button>
              <button (click)="executeRevoke()"
                      class="px-5 py-2.5 rounded-xl text-sm font-bold bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-500/20 transition-all flex items-center gap-2">
                {{ confirmAction() === 'ALL' ? 'Sign Out All' : 'Revoke Access' }}
              </button>
            </div>
          </div>
        </div>
      }

      @if (showCropperModal()) {
        <div class="fixed inset-0 z-[3000] bg-black/70 backdrop-blur-[2px] flex items-center justify-center p-4 animate-fade-in">
          <div class="bg-white dark:bg-[#181a1f] rounded-2xl p-6 w-full max-w-md shadow-2xl border border-gray-200 dark:border-gray-800 animate-slide-up">
            <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">Crop Profile Picture</h3>

            <div class="w-full h-64 bg-gray-100 dark:bg-gray-900 rounded-xl overflow-hidden mb-4 relative">
              <image-cropper
                [imageChangedEvent]="imageChangedEvent()"
                [maintainAspectRatio]="true"
                [aspectRatio]="1 / 1"
                format="png"
                (imageCropped)="imageCropped($event)"
                (imageLoaded)="imageLoaded()"
                (cropperReady)="cropperReady()"
                (loadImageFailed)="loadImageFailed()">
              </image-cropper>
            </div>

            <div class="flex items-center justify-end gap-3">
              <button (click)="cancelCrop()" class="px-4 py-2.5 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                Cancel
              </button>
              <button (click)="uploadCroppedImage()" [disabled]="!croppedImageBlob() || isUploadingAvatar()" class="px-5 py-2.5 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white shadow-md transition-all flex items-center gap-2">
                @if (isUploadingAvatar()) {
                  <i class="ri-loader-4-line animate-spin"></i> Processing...
                } @else {
                  Save Image
                }
              </button>
            </div>
          </div>
        </div>
      }

    </div>
  `,
  styles: [`
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { scrollbar-width: none; }
    .animate-fade-in { animation: fadeIn 0.2s ease-out; }
    .animate-slide-up { animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) backwards; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class UserProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  public profileService = inject(UserProfileService);
  private authService = inject(AuthService);
  private router = inject(Router);

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  activeTab = signal<ProfileTab>('personal');
  isEditingProfile = signal(false);
  isSaving = signal(false);
  isUpdatingPassword = signal(false);
  isUploadingAvatar = signal(false);

  // Modal State Signals
  confirmAction = signal<'DEVICE' | 'ALL' | null>(null);
  targetDeviceId = signal<number | null>(null);

  // Cropper State Signals
  showCropperModal = signal(false);
  imageChangedEvent = signal<Event | null>(null);
  croppedImageBlob = signal<Blob | null>(null);
  currentSelectedFile = signal<File | null>(null);

  profileMessage = signal<{text: string, type: 'success' | 'error'} | null>(null);
  passwordMessage = signal<{text: string, type: 'success' | 'error'} | null>(null);

  profileForm!: FormGroup;
  preferencesForm!: FormGroup;
  securityForm!: FormGroup;

  activeDevices = signal<UserDevice[]>([]);
  isLoadingDevices = signal(true);

  userInitials = signal('U');

  // Country Codes List (Truncated for readability, expand as needed)
  countryCodes = [
    { name: 'United States', code: 'US', dialCode: '+1' },
    { name: 'United Kingdom', code: 'GB', dialCode: '+44' },
    { name: 'India', code: 'IN', dialCode: '+91' },
    { name: 'Australia', code: 'AU', dialCode: '+61' },
    { name: 'Canada', code: 'CA', dialCode: '+1' },
    { name: 'Germany', code: 'DE', dialCode: '+49' },
    { name: 'France', code: 'FR', dialCode: '+33' },
    { name: 'Brazil', code: 'BR', dialCode: '+55' },
    { name: 'Japan', code: 'JP', dialCode: '+81' },
    { name: 'South Africa', code: 'ZA', dialCode: '+27' },
  ];

  ngOnInit() {
    this.initForms();
    this.fetchActualProfileData();
    this.loadDevices();
  }

  private initForms() {
    this.profileForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: [''], // Read-only
      phoneCode: ['+1'], // Default
      phone: ['']
    });

    this.preferencesForm = this.fb.group({
      emailNotifs: [true],
      smsNotifs: [false],
      timezone: ['America/New_York']
    });

    this.securityForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    });
  }

  private fetchActualProfileData() {
    this.profileService.getProfile().subscribe({
      next: (data) => {
        let phoneCode = '+1';
        let phoneNum = data.phone || '';

        if (data.phone && data.phone.startsWith('+')) {
          const match = this.countryCodes.find(c => data.phone!.startsWith(c.dialCode));
          if (match) {
            phoneCode = match.dialCode;
            phoneNum = data.phone.substring(match.dialCode.length).trim();
          }
        }

        this.profileForm.patchValue({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phoneCode: phoneCode,
          phone: phoneNum
        });

        const fName = data.firstName || 'User';
        const lName = data.lastName || '';
        this.userInitials.set(`${fName.charAt(0)}${lName.charAt(0)}`.toUpperCase());
      },
      error: (err) => console.error('Failed to load profile', err)
    });
  }

  loadDevices() {
    this.isLoadingDevices.set(true);
    this.profileService.getActiveDevices().subscribe({
      next: (devices) => {
        this.activeDevices.set(devices);
        this.isLoadingDevices.set(false);
      },
      error: (err) => {
        console.error('Failed to load devices', err);
        this.isLoadingDevices.set(false);
      }
    });
  }

  // --- EDIT MODE LOGIC ---
  toggleEditMode() {
    this.isEditingProfile.set(true);
  }

  cancelEdit() {
    this.fetchActualProfileData();
    this.isEditingProfile.set(false);
    this.profileMessage.set(null);
  }

  saveProfile() {
    if (this.profileForm.invalid) return;

    this.isSaving.set(true);
    this.profileMessage.set(null);

    const currentProfile = this.profileService.profile();

    const updatedFirstName = this.profileForm.value.firstName || currentProfile?.firstName || '';
    const updatedLastName = this.profileForm.value.lastName || currentProfile?.lastName || '';
    const phoneVal = this.profileForm.value.phone ? `${this.profileForm.value.phoneCode}${this.profileForm.value.phone}` : '';

    const updateRequest: UserProfileUpdateRequest = {
      firstName: updatedFirstName,
      lastName: updatedLastName,
      phone: phoneVal || currentProfile?.phone || '',
      profilePictureUrl: currentProfile?.profilePictureUrl
    };

    this.profileService.updateProfile(updateRequest).subscribe({
      next: (updatedData) => {
        this.isSaving.set(false);
        this.isEditingProfile.set(false);
        this.profileForm.markAsPristine();
        this.profileMessage.set({ text: 'Profile updated successfully!', type: 'success' });

        this.userInitials.set(`${updatedData.firstName.charAt(0)}${updatedData.lastName.charAt(0)}`.toUpperCase());
        setTimeout(() => this.profileMessage.set(null), 3000);
      },
      error: () => {
        this.isSaving.set(false);
        this.profileMessage.set({ text: 'Failed to update profile. Try again.', type: 'error' });
      }
    });
  }

  // --- IMAGE CROPPER LOGIC ---
  fileChangeEvent(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      if (file.size > 2 * 1024 * 1024) {
        this.profileMessage.set({ text: 'File exceeds 2MB limit.', type: 'error' });
        input.value = '';
        return;
      }

      this.currentSelectedFile.set(file);
      this.imageChangedEvent.set(event);
      this.showCropperModal.set(true);
    }
  }

  imageCropped(event: ImageCroppedEvent) {
    if (event.blob) {
      this.croppedImageBlob.set(event.blob);
    }
  }

  imageLoaded() {}
  cropperReady() {}
  loadImageFailed() {
    this.profileMessage.set({ text: 'Failed to load image for cropping.', type: 'error' });
    this.cancelCrop();
  }

  cancelCrop() {
    this.showCropperModal.set(false);
    this.imageChangedEvent.set(null);
    this.croppedImageBlob.set(null);
    this.currentSelectedFile.set(null);
    if (this.fileInput?.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
  }

  uploadCroppedImage() {
    const blob = this.croppedImageBlob();
    const originalFile = this.currentSelectedFile();

    if (!blob || !originalFile) return;

    this.isUploadingAvatar.set(true);

    const croppedFile = new File([blob], originalFile.name, { type: 'image/png' });

    this.profileService.uploadFile(croppedFile).subscribe({
      next: (response) => {
        const currentProfile = this.profileService.profile();

        const updateReq: UserProfileUpdateRequest = {
          firstName: currentProfile?.firstName || '',
          lastName: currentProfile?.lastName || '',
          phone: currentProfile?.phone || '',
          profilePictureUrl: response.url
        };

        this.profileService.updateProfile(updateReq).subscribe({
          next: () => {
            this.isUploadingAvatar.set(false);
            this.cancelCrop();
            this.profileMessage.set({ text: 'Profile picture successfully updated!', type: 'success' });
            setTimeout(() => this.profileMessage.set(null), 3000);
          },
          error: () => {
            this.isUploadingAvatar.set(false);
            this.profileMessage.set({ text: 'Failed to save updated picture URL.', type: 'error' });
          }
        });
      },
      error: () => {
        this.isUploadingAvatar.set(false);
        this.profileMessage.set({ text: 'Failed to upload cropped image.', type: 'error' });
      }
    });
  }

  // --- DEVICE MODAL LOGIC ---
  promptRevokeDevice(deviceId: number) {
    this.targetDeviceId.set(deviceId);
    this.confirmAction.set('DEVICE');
  }

  promptRevokeAll() {
    this.confirmAction.set('ALL');
  }

  cancelRevoke() {
    this.confirmAction.set(null);
    this.targetDeviceId.set(null);
  }

  executeRevoke() {
    const action = this.confirmAction();
    const deviceId = this.targetDeviceId();

    this.confirmAction.set(null);
    this.targetDeviceId.set(null);

    if (action === 'DEVICE' && deviceId !== null) {
      this.profileService.removeDevice(deviceId).subscribe({
        next: () => {
          this.activeDevices.update(devices => devices.filter(d => d.id !== deviceId));
          this.passwordMessage.set({ text: 'Device successfully removed.', type: 'success' });
          setTimeout(() => this.passwordMessage.set(null), 3000);
        },
        error: () => {
          this.passwordMessage.set({ text: 'Failed to remove device.', type: 'error' });
        }
      });
    } else if (action === 'ALL') {
      this.authService.logoutAll().subscribe({
        next: () => {
          this.profileService.clear();
        },
        error: () => {
          this.passwordMessage.set({ text: 'Failed to sign out of all devices.', type: 'error' });
        }
      });
    }
  }

  // --- SECURITY LOGIC ---
  updatePassword() {
    if (this.securityForm.invalid) return;

    const { currentPassword, newPassword, confirmPassword } = this.securityForm.value;

    if (newPassword !== confirmPassword) {
      this.passwordMessage.set({ text: 'New passwords do not match.', type: 'error' });
      return;
    }

    this.isUpdatingPassword.set(true);
    this.passwordMessage.set(null);

    this.profileService.updatePassword({ currentPassword, newPassword }).subscribe({
      next: () => {
        this.isUpdatingPassword.set(false);
        this.securityForm.reset();
        this.passwordMessage.set({ text: 'Password successfully updated!', type: 'success' });
        setTimeout(() => this.passwordMessage.set(null), 4000);
      },
      error: (err) => {
        this.isUpdatingPassword.set(false);
        const errorMsg = err.error?.message || 'Failed to update password. Check your current password.';
        this.passwordMessage.set({ text: errorMsg, type: 'error' });
      }
    });
  }
}




