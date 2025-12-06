import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SettingsService } from '../../services/settings.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  settingsForm: FormGroup;
  emailConfigForm: FormGroup;
  apiKeyForm: FormGroup;
  settings: any = {};
  isLoading = false;
  selectedTab = 0;

  constructor(
    private fb: FormBuilder,
    private settingsService: SettingsService,
    private snackBar: MatSnackBar
  ) {
    this.settingsForm = this.fb.group({
      maintenanceMode: [false],
      maintenanceMessage: [''],
      theme: ['light'],
      siteName: [''],
      siteUrl: [''],
      contactEmail: ['']
    });

    this.emailConfigForm = this.fb.group({
      host: ['', Validators.required],
      port: [587, [Validators.required, Validators.min(1), Validators.max(65535)]],
      secure: [false],
      user: ['', Validators.required],
      password: ['']
    });

    this.apiKeyForm = this.fb.group({
      name: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.loadSettings();
  }

  loadSettings() {
    this.isLoading = true;
    this.settingsService.getSettings().subscribe({
      next: (response) => {
        this.settings = response.settings || {};
        this.settingsForm.patchValue({
          maintenanceMode: this.settings.maintenanceMode || false,
          maintenanceMessage: this.settings.maintenanceMessage || '',
          theme: this.settings.theme || 'light',
          siteName: this.settings.siteSettings?.siteName || '',
          siteUrl: this.settings.siteSettings?.siteUrl || '',
          contactEmail: this.settings.siteSettings?.contactEmail || ''
        });
        
        // Load email config if exists
        if (this.settings.emailConfig) {
          this.emailConfigForm.patchValue({
            host: this.settings.emailConfig.host || '',
            port: this.settings.emailConfig.port || 587,
            secure: this.settings.emailConfig.secure || false,
            user: this.settings.emailConfig.user || '',
            password: '' // Don't load password
          });
        }
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading settings:', error);
        // Initialize with defaults if API fails
        this.settings = {};
        this.snackBar.open('Error loading settings. Using defaults.', 'Close', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  saveSettings() {
    if (this.settingsForm.valid) {
      const formValue = this.settingsForm.value;
      const settingsData = {
        maintenanceMode: formValue.maintenanceMode,
        maintenanceMessage: formValue.maintenanceMessage,
        theme: formValue.theme,
        siteSettings: {
          siteName: formValue.siteName,
          siteUrl: formValue.siteUrl,
          contactEmail: formValue.contactEmail
        }
      };

      this.settingsService.updateSettings(settingsData).subscribe({
        next: () => {
          this.snackBar.open('Settings saved successfully', 'Close', { duration: 3000 });
        },
        error: (error) => {
          this.snackBar.open(error.error?.message || 'Error saving settings', 'Close', { duration: 3000 });
        }
      });
    }
  }

  saveEmailConfig() {
    if (this.emailConfigForm.valid) {
      this.settingsService.updateEmailConfig(this.emailConfigForm.value).subscribe({
        next: () => {
          this.snackBar.open('Email configuration saved', 'Close', { duration: 3000 });
        },
        error: (error) => {
          this.snackBar.open(error.error?.message || 'Error saving email config', 'Close', { duration: 3000 });
        }
      });
    }
  }

  createApiKey() {
    if (this.apiKeyForm.valid) {
      this.settingsService.createApiKey(this.apiKeyForm.value.name).subscribe({
        next: (response: any) => {
          this.snackBar.open('API key created successfully', 'Close', { duration: 5000 });
          if (response.apiKey) {
            alert(`API Key: ${response.apiKey}\n\nSave this key - it won't be shown again!`);
          }
          this.apiKeyForm.reset();
          this.loadSettings();
        },
        error: (error) => {
          this.snackBar.open(error.error?.message || 'Error creating API key', 'Close', { duration: 3000 });
        }
      });
    }
  }

  deleteApiKey(id: string) {
    if (confirm('Are you sure you want to delete this API key?')) {
      this.settingsService.deleteApiKey(id).subscribe({
        next: () => {
          this.snackBar.open('API key deleted', 'Close', { duration: 3000 });
          this.loadSettings();
        },
        error: (error) => {
          this.snackBar.open('Error deleting API key', 'Close', { duration: 3000 });
        }
      });
    }
  }
}

