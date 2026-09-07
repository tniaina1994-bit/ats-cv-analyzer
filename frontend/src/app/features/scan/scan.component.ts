import { Component, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ApiService, ScanResult } from '../../services/api.service';

@Component({
  selector: 'app-scan',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatChipsModule,
    MatTooltipModule,
  ],
  template: `
    <div class="scan-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Analyser un CV</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <!-- Upload CV -->
          <div class="upload-section">
            <div class="upload-area" 
                 (dragover)="onDragOver($event)" 
                 (drop)="onDrop($event)"
                 [class.has-file]="selectedFile">
              <mat-icon>cloud_upload</mat-icon>
              <p *ngIf="!selectedFile">Glissez-déposez votre CV ici</p>
              <p *ngIf="selectedFile" class="file-name">{{ selectedFile.name }}</p>
              <input type="file" 
                     #fileInput 
                     (change)="onFileSelected($event)" 
                     accept=".pdf,.docx"
                     hidden>
              <button mat-stroked-button (click)="fileInput.click()">
                {{ selectedFile ? 'Changer de fichier' : 'Sélectionner un fichier' }}
              </button>
              <p class="hint">Formats : PDF, DOCX (max 10MB)</p>
            </div>
          </div>

          <!-- Job Offer Section -->
          <div class="job-offer-section">
            <div class="job-offer-header">
              <mat-icon>work</mat-icon>
              <span>Offre d'emploi</span>
              <div class="header-spacer"></div>
              <button mat-icon-button 
                      matTooltip="Effacer" 
                      (click)="clearEditor()">
                <mat-icon>delete_outline</mat-icon>
              </button>
            </div>

            <!-- Quick Templates -->
            <div class="templates">
              <span class="templates-label">Modèles :</span>
              <button *ngFor="let tpl of templates" 
                      mat-stroked-button 
                      class="template-btn"
                      (click)="applyTemplate(tpl)">
                {{ tpl.name }}
              </button>
            </div>

            <!-- Rich Text Editor -->
            <div class="editor-wrapper">
              <!-- Toolbar -->
              <div class="toolbar">
                <button mat-icon-button 
                        matTooltip="Gras (Ctrl+B)" 
                        (click)="execCommand('bold')">
                  <mat-icon>format_bold</mat-icon>
                </button>
                <button mat-icon-button 
                        matTooltip="Italique (Ctrl+I)" 
                        (click)="execCommand('italic')">
                  <mat-icon>format_italic</mat-icon>
                </button>
                <button mat-icon-button 
                        matTooltip="Souligné (Ctrl+U)" 
                        (click)="execCommand('underline')">
                  <mat-icon>format_underlined</mat-icon>
                </button>
                <div class="toolbar-divider"></div>
                <button mat-icon-button 
                        matTooltip="Titre 1" 
                        (click)="execFormatBlock('h2')">
                  <mat-icon>title</mat-icon>
                </button>
                <button mat-icon-button 
                        matTooltip="Titre 2" 
                        (click)="execFormatBlock('h3')">
                  <mat-icon>text_fields</mat-icon>
                </button>
                <button mat-icon-button 
                        matTooltip="Paragraphe" 
                        (click)="execFormatBlock('p')">
                  <mat-icon>notes</mat-icon>
                </button>
                <div class="toolbar-divider"></div>
                <button mat-icon-button 
                        matTooltip="Liste à puces" 
                        (click)="execCommand('insertUnorderedList')">
                  <mat-icon>format_list_bulleted</mat-icon>
                </button>
                <button mat-icon-button 
                        matTooltip="Liste numérotée" 
                        (click)="execCommand('insertOrderedList')">
                  <mat-icon>format_list_numbered</mat-icon>
                </button>
                <div class="toolbar-divider"></div>
                <button mat-icon-button 
                        matTooltip="Code" 
                        (click)="execFormatBlock('pre')">
                  <mat-icon>code</mat-icon>
                </button>
                <div class="toolbar-spacer"></div>
                <span class="char-count" [class.warning]="charCount > 10000">
                  {{ charCount }} / 10000
                </span>
              </div>

              <!-- Contenteditable div -->
              <div #richEditor
                   class="rich-editor"
                   contenteditable="true"
                   [attr.data-placeholder]="'Collez ou écrivez la description du poste ici... (compétences, exigences, missions)'"
                   (input)="onEditorInput()"
                   (paste)="onPaste($event)"
                   (keydown)="onKeyDown($event)">
              </div>
            </div>

            <!-- Footer -->
            <div class="editor-footer">
              <div class="footer-left">
                <button mat-icon-button 
                        matTooltip="Joindre une pièce" 
                        disabled>
                  <mat-icon>attach_file</mat-icon>
                </button>
              </div>
              <div class="footer-right">
                <button mat-raised-button 
                        color="primary" 
                        (click)="scanCv()"
                        [disabled]="!selectedFile || loading"
                        class="scan-btn">
                  <mat-icon>search</mat-icon>
                  Scanner
                </button>
              </div>
            </div>
          </div>

          <!-- Error Message -->
          <div *ngIf="errorMessage" class="error-message">
            <mat-icon>error</mat-icon>
            <span>{{ errorMessage }}</span>
          </div>

          <!-- Loading -->
          <mat-progress-bar *ngIf="loading" mode="indeterminate" class="loading-bar"></mat-progress-bar>

          <!-- Results -->
          <div *ngIf="result" class="results">
            <mat-card class="score-card">
              <mat-card-header>
                <mat-card-title>Score de compatibilité</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="score-circle" [class]="getScoreClass()">
                  {{ result?.analysis?.global_score ?? 0 }}%
                </div>
              </mat-card-content>
            </mat-card>

            <!-- ATS Checks -->
            <mat-card *ngIf="result?.analysis?.ats_checks">
              <mat-card-header>
                <mat-card-title>Vérifications ATS</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="ats-checks">
                  <div class="check-item" [class.pass]="result.analysis.ats_checks.text_extractable" [class.fail]="!result.analysis.ats_checks.text_extractable">
                    <mat-icon>{{ result.analysis.ats_checks.text_extractable ? 'check_circle' : 'cancel' }}</mat-icon>
                    <span>Texte extractible</span>
                  </div>
                  <div class="check-item" [class.pass]="result.analysis.ats_checks.has_email" [class.fail]="!result.analysis.ats_checks.has_email">
                    <mat-icon>{{ result.analysis.ats_checks.has_email ? 'check_circle' : 'cancel' }}</mat-icon>
                    <span>Email détecté</span>
                  </div>
                  <div class="check-item" [class.pass]="result.analysis.ats_checks.has_phone" [class.fail]="!result.analysis.ats_checks.has_phone">
                    <mat-icon>{{ result.analysis.ats_checks.has_phone ? 'check_circle' : 'cancel' }}</mat-icon>
                    <span>Téléphone détecté</span>
                  </div>
                  <div class="check-item" [class.pass]="result.analysis.ats_checks.has_sections" [class.fail]="!result.analysis.ats_checks.has_sections">
                    <mat-icon>{{ result.analysis.ats_checks.has_sections ? 'check_circle' : 'cancel' }}</mat-icon>
                    <span>Sections structurées</span>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>

            <!-- Personal Info -->
            <mat-card *ngIf="result?.analysis?.personal_info" class="personal-info-card">
              <mat-card-header>
                <mat-card-title><mat-icon>person</mat-icon> Informations personnelles</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="info-grid">
                  <div class="info-item" *ngIf="result.analysis.personal_info.name">
                    <mat-icon>badge</mat-icon>
                    <div>
                      <span class="info-label">Nom</span>
                      <span class="info-value">{{ result.analysis.personal_info.name }}</span>
                    </div>
                  </div>
                  <div class="info-item" *ngIf="result.analysis.personal_info.email">
                    <mat-icon>email</mat-icon>
                    <div>
                      <span class="info-label">Email</span>
                      <span class="info-value">{{ result.analysis.personal_info.email }}</span>
                    </div>
                  </div>
                  <div class="info-item" *ngIf="result.analysis.personal_info.phone">
                    <mat-icon>phone</mat-icon>
                    <div>
                      <span class="info-label">Téléphone</span>
                      <span class="info-value">{{ result.analysis.personal_info.phone }}</span>
                    </div>
                  </div>
                  <div class="info-item" *ngIf="result.analysis.personal_info.location">
                    <mat-icon>location_on</mat-icon>
                    <div>
                      <span class="info-label">Localisation</span>
                      <span class="info-value">{{ result.analysis.personal_info.location }}</span>
                    </div>
                  </div>
                  <div class="info-item" *ngIf="result.analysis.personal_info.nationality">
                    <mat-icon>flag</mat-icon>
                    <div>
                      <span class="info-label">Nationalité</span>
                      <span class="info-value">{{ result.analysis.personal_info.nationality }}</span>
                    </div>
                  </div>
                  <div class="info-item" *ngIf="result.analysis.personal_info.linkedin">
                    <mat-icon>work</mat-icon>
                    <div>
                      <span class="info-label">LinkedIn</span>
                      <span class="info-value">{{ result.analysis.personal_info.linkedin }}</span>
                    </div>
                  </div>
                  <div class="info-item" *ngIf="result.analysis.personal_info.github">
                    <mat-icon>code</mat-icon>
                    <div>
                      <span class="info-label">GitHub</span>
                      <span class="info-value">{{ result.analysis.personal_info.github }}</span>
                    </div>
                  </div>
                  <div class="info-item" *ngIf="result.analysis.personal_info.website">
                    <mat-icon>language</mat-icon>
                    <div>
                      <span class="info-label">Site web</span>
                      <span class="info-value">{{ result.analysis.personal_info.website }}</span>
                    </div>
                  </div>
                  <div class="info-item" *ngIf="result.analysis.personal_info.languages?.length">
                    <mat-icon>translate</mat-icon>
                    <div>
                      <span class="info-label">Langues</span>
                      <span class="info-value">{{ result.analysis.personal_info.languages.join(', ') }}</span>
                    </div>
                  </div>
                  <div class="info-item" *ngIf="result.analysis.personal_info.has_driving_license">
                    <mat-icon>directions_car</mat-icon>
                    <div>
                      <span class="info-label">Permis de conduire</span>
                      <span class="info-value">Oui</span>
                    </div>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>

            <!-- Detailed Scores -->
            <mat-card *ngIf="result?.analysis?.scores">
              <mat-card-header>
                <mat-card-title>Scores détaillés</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="scores-grid">
                  <div class="score-item">
                    <span class="score-label">Compétences</span>
                    <span class="score-value">{{ result.analysis.scores.skills }}%</span>
                  </div>
                  <div class="score-item">
                    <span class="score-label">Expérience</span>
                    <span class="score-value">{{ result.analysis.scores.experience }}%</span>
                  </div>
                  <div class="score-item">
                    <span class="score-label">Formation</span>
                    <span class="score-value">{{ result.analysis.scores.education }}%</span>
                  </div>
                  <div class="score-item">
                    <span class="score-label">Qualité ATS</span>
                    <span class="score-value">{{ result.analysis.scores.ats_quality }}%</span>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>

            <!-- CV Analysis -->
            <mat-card *ngIf="result?.analysis" class="cv-analysis-card">
              <mat-card-header>
                <mat-card-title>CV Analyse</mat-card-title>
                <mat-card-subtitle>Ce que le système a détecté dans votre CV</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <div class="cv-section">
                  <h4><mat-icon>code</mat-icon> Compétences détectées ({{ result.analysis.cv_skills_detected?.length ?? 0 }})</h4>
                  <mat-chip-listbox *ngIf="result.analysis.cv_skills_detected?.length">
                    <mat-chip *ngFor="let skill of result.analysis.cv_skills_detected" class="cv-skill-chip">
                      {{ skill }}
                    </mat-chip>
                  </mat-chip-listbox>
                  <p *ngIf="!result.analysis.cv_skills_detected?.length" class="no-data">Aucune compétence technique détectée</p>
                </div>

                <div class="cv-section">
                  <h4><mat-icon>work</mat-icon> Expérience</h4>
                  <p *ngIf="result.analysis.experience_years > 0" class="cv-info">
                    <strong>{{ result.analysis.experience_years }} ans</strong> d'expérience détectés
                  </p>
                  <p *ngIf="!result.analysis.experience_years" class="no-data">Aucune durée d'expérience détectée</p>
                </div>

                <div class="cv-section">
                  <h4><mat-icon>school</mat-icon> Formation</h4>
                  <p *ngIf="result.analysis.education_found?.length" class="cv-info">
                    Mots-clés trouvés : <strong>{{ result.analysis.education_found.join(', ') }}</strong>
                  </p>
                  <p *ngIf="!result.analysis.education_found?.length" class="no-data">Aucun diplôme détecté</p>
                </div>
              </mat-card-content>
            </mat-card>

            <mat-card *ngIf="result?.analysis?.matched_skills?.length">
              <mat-card-header>
                <mat-card-title>Compétences correspondantes ({{ result.analysis.matched_skills.length }})</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <mat-chip-listbox>
                  <mat-chip *ngFor="let skill of result.analysis.matched_skills" color="primary">
                    {{ skill }}
                  </mat-chip>
                </mat-chip-listbox>
              </mat-card-content>
            </mat-card>

            <mat-card *ngIf="result?.analysis?.missing_skills?.length">
              <mat-card-header>
                <mat-card-title>Compétences manquantes ({{ result.analysis.missing_skills.length }})</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <mat-chip-listbox>
                  <mat-chip *ngFor="let skill of result.analysis.missing_skills" color="warn">
                    {{ skill }}
                  </mat-chip>
                </mat-chip-listbox>
              </mat-card-content>
            </mat-card>

            <mat-card *ngIf="result?.analysis?.recommendations?.length">
              <mat-card-header>
                <mat-card-title>Recommandations</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <ul>
                  <li *ngFor="let rec of result.analysis.recommendations">{{ rec }}</li>
                </ul>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .scan-container {
      padding: 2rem;
      max-width: 800px;
      margin: 0 auto;
    }
    .upload-section {
      margin-bottom: 1.5rem;
    }
    .upload-area {
      border: 2px dashed #ccc;
      border-radius: 8px;
      padding: 2rem;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s;
    }
    .upload-area:hover, .upload-area.has-file {
      border-color: #3f51b5;
      background: #f5f5f5;
    }
    .file-name {
      font-weight: 500;
      color: #3f51b5;
    }
    .hint {
      color: #666;
      font-size: 0.875rem;
      margin-top: 0.5rem;
    }

    /* Job Offer Section */
    .job-offer-section {
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      overflow: hidden;
      margin-top: 1.5rem;
    }
    .job-offer-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1rem;
      background: #f5f5f5;
      border-bottom: 1px solid #e0e0e0;
      font-weight: 500;
      color: #333;
    }
    .header-spacer {
      flex: 1;
    }

    /* Templates */
    .templates {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background: #fafafa;
      border-bottom: 1px solid #e0e0e0;
      flex-wrap: wrap;
    }
    .templates-label {
      font-size: 0.8rem;
      color: #666;
    }
    .template-btn {
      font-size: 0.75rem;
      padding: 0 0.5rem;
      height: 24px;
      line-height: 24px;
    }

    /* Editor Wrapper */
    .editor-wrapper {
      background: white;
    }
    .toolbar {
      display: flex;
      align-items: center;
      padding: 0.25rem 0.5rem;
      border-bottom: 1px solid #e0e0e0;
      background: #fafafa;
    }
    .toolbar-divider {
      width: 1px;
      height: 20px;
      background: #e0e0e0;
      margin: 0 0.25rem;
    }
    .toolbar-spacer {
      flex: 1;
    }
    .char-count {
      font-size: 0.7rem;
      color: #999;
    }
    .char-count.warning {
      color: #f44336;
    }

    /* Rich Text Editor */
    .rich-editor {
      min-height: 300px;
      max-height: 500px;
      overflow-y: auto;
      padding: 1rem;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
      font-size: 0.95rem;
      line-height: 1.6;
      color: #333;
      outline: none;
      cursor: text;
    }
    .rich-editor:empty::before {
      content: attr(data-placeholder);
      color: #999;
      pointer-events: none;
    }
    .rich-editor:focus {
      background: #fefefe;
    }

    /* Rich text content styles */
    .rich-editor h1 { font-size: 1.5rem; font-weight: 600; margin: 0.5rem 0; color: #1a1a1a; }
    .rich-editor h2 { font-size: 1.3rem; font-weight: 600; margin: 0.5rem 0; color: #1a1a1a; border-bottom: 1px solid #eaecef; padding-bottom: 0.3rem; }
    .rich-editor h3 { font-size: 1.15rem; font-weight: 600; margin: 0.5rem 0; color: #1a1a1a; }
    .rich-editor p { margin: 0.3rem 0; }
    .rich-editor ul, .rich-editor ol { padding-left: 2rem; margin: 0.3rem 0; }
    .rich-editor li { margin-bottom: 0.15rem; }
    .rich-editor li::marker { color: #3f51b5; }
    .rich-editor strong { font-weight: 600; color: #1a1a1a; }
    .rich-editor em { font-style: italic; }
    .rich-editor u { text-decoration: underline; }
    .rich-editor code {
      background: #f0f0f0;
      padding: 0.15em 0.4em;
      border-radius: 3px;
      font-size: 0.85em;
      font-family: 'Fira Code', 'Consolas', monospace;
      color: #e83e8c;
    }
    .rich-editor pre {
      background: #282c34;
      color: #abb2bf;
      padding: 1rem;
      border-radius: 6px;
      overflow-x: auto;
      margin: 0.5rem 0;
    }
    .rich-editor pre code {
      background: none;
      padding: 0;
      color: inherit;
    }
    .rich-editor blockquote {
      border-left: 4px solid #3f51b5;
      margin: 0.5rem 0;
      padding: 0.5rem 1rem;
      color: #555;
      background: #f8f9fa;
    }

    /* Editor Footer */
    .editor-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.5rem 1rem;
      border-top: 1px solid #e0e0e0;
      background: #fafafa;
    }
    .footer-left {
      display: flex;
      gap: 0.25rem;
    }
    .scan-btn {
      border-radius: 20px;
    }

    /* Error */
    .error-message {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1rem;
      margin-top: 1rem;
      background: #ffebee;
      color: #c62828;
      border-radius: 4px;
      border: 1px solid #ef9a9a;
    }
    .error-message mat-icon {
      color: #c62828;
    }

    /* Loading */
    .loading-bar {
      margin-top: 1rem;
    }

    /* Results */
    .results {
      margin-top: 2rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .score-card {
      text-align: center;
    }
    .score-circle {
      font-size: 3rem;
      font-weight: bold;
      padding: 1rem;
      border-radius: 50%;
      width: 100px;
      height: 100px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto;
    }
    .score-high {
      background: #4caf50;
      color: white;
    }
    .score-medium {
      background: #ff9800;
      color: white;
    }
    .score-low {
      background: #f44336;
      color: white;
    }
    ul {
      margin: 0;
      padding-left: 1.5rem;
    }

    /* Personal Info Card */
    .personal-info-card mat-card-title {
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }
    .personal-info-card mat-card-title mat-icon {
      color: #1976d2;
    }
    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.75rem;
    }
    .info-item {
      display: flex;
      align-items: flex-start;
      gap: 0.6rem;
      padding: 0.5rem;
      background: #f8f9fa;
      border-radius: 6px;
      border-left: 3px solid #1976d2;
    }
    .info-item mat-icon {
      font-size: 1.1rem;
      width: 1.1rem;
      height: 1.1rem;
      color: #1976d2;
      margin-top: 2px;
    }
    .info-item div {
      display: flex;
      flex-direction: column;
    }
    .info-label {
      font-size: 0.7rem;
      color: #999;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .info-value {
      font-size: 0.9rem;
      color: #333;
      font-weight: 500;
      word-break: break-word;
    }

    /* Scores Grid */
    .scores-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
    }
    .score-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem;
      background: #f5f5f5;
      border-radius: 4px;
    }
    .score-label {
      font-size: 0.875rem;
      color: #666;
    }
    .score-value {
      font-weight: bold;
      font-size: 1.1rem;
      color: #3f51b5;
    }

    /* ATS Checks */
    .ats-checks {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.75rem;
    }
    .check-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem;
      border-radius: 4px;
    }
    .check-item.pass {
      background: #e8f5e9;
      color: #2e7d32;
    }
    .check-item.fail {
      background: #ffebee;
      color: #c62828;
    }
    .check-item mat-icon {
      font-size: 1.2rem;
      width: 1.2rem;
      height: 1.2rem;
    }

    /* Experience Badge */
    .experience-badge {
      display: inline-block;
      padding: 0.5rem 1rem;
      background: #e3f2fd;
      color: #1565c0;
      border-radius: 20px;
      font-weight: bold;
      font-size: 1.1rem;
    }

    /* CV Analysis Card */
    .cv-analysis-card mat-card-subtitle {
      font-size: 0.85rem;
    }
    .cv-section {
      margin-bottom: 1.25rem;
    }
    .cv-section h4 {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      margin-bottom: 0.5rem;
      font-size: 0.95rem;
      color: #333;
    }
    .cv-section h4 mat-icon {
      font-size: 1.1rem;
      width: 1.1rem;
      height: 1.1rem;
      color: #1976d2;
    }
    .cv-skill-chip {
      margin: 2px !important;
      font-size: 0.8rem;
    }
    .cv-info {
      color: #555;
      font-size: 0.9rem;
    }
    .no-data {
      color: #999;
      font-style: italic;
      font-size: 0.85rem;
    }
  `]
})
export class ScanComponent implements AfterViewInit {
  @ViewChild('richEditor') richEditor!: ElementRef<HTMLDivElement>;

  selectedFile: File | null = null;
  jobOffer = '';
  loading = false;
  result: any = null;
  errorMessage = '';
  charCount = 0;

  templates = [
    {
      name: 'Support IT',
      html: '<h2>Support Technique Informatique & Administration Réseau Système</h2><h3>Compétences requises</h3><ul><li>Windows Server</li><li>Active Directory</li><li>Linux (Ubuntu, Debian)</li><li>TCP/IP</li><li>DNS</li><li>DHCP</li><li>VPN</li><li>Firewall</li><li>Virtualisation (VMware, Hyper-V)</li><li>Cisco</li><li>MikroTik</li><li>Migration de données</li></ul><h3>Missions</h3><ul><li>Installation et configuration de postes de travail</li><li>Gestion des comptes utilisateurs et des droits d\'accès</li><li>Maintenance des serveurs et infrastructures réseau</li><li>Dépannage et résolution des incidents techniques</li><li>Mise en place et administration des équipements réseau</li><li>Sauvegarde et restauration des données</li><li>Suivi des performances du réseau</li><li>Documentation technique et reporting</li></ul>'
    },
    {
      name: 'Développeur',
      html: '<h2>Développeur Full Stack</h2><h3>Compétences requises</h3><ul><li>Python</li><li>JavaScript</li><li>React</li><li>Node.js</li><li>PostgreSQL</li><li>Git</li></ul><h3>Missions</h3><ul><li>Développement d\'applications web</li><li>Maintenance du code existant</li><li>Participation aux revues de code</li></ul>'
    },
    {
      name: 'DevOps',
      html: '<h2>Ingénieur DevOps</h2><h3>Compétences requises</h3><ul><li>Docker</li><li>Kubernetes</li><li>CI/CD</li><li>AWS ou Azure</li><li>Linux</li><li>Terraform</li></ul><h3>Missions</h3><ul><li>Mise en place de pipelines CI/CD</li><li>Gestion de l\'infrastructure cloud</li><li>Automatisation du déploiement</li></ul>'
    },
    {
      name: 'Data',
      html: '<h2>Data Engineer</h2><h3>Compétences requises</h3><ul><li>Python</li><li>SQL</li><li>Apache Spark</li><li>Airflow</li><li>AWS/GCP</li><li>ETL</li></ul><h3>Missions</h3><ul><li>Conception de pipelines de données</li><li>Optimisation des performances</li><li>Qualité des données</li></ul>'
    },
  ];

  constructor(private apiService: ApiService, private cdr: ChangeDetectorRef) {}

  ngAfterViewInit() {
    if (this.richEditor?.nativeElement) {
      this.richEditor.nativeElement.focus();
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.selectedFile = files[0];
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  applyTemplate(template: { html: string }) {
    if (this.richEditor?.nativeElement) {
      this.richEditor.nativeElement.innerHTML = template.html;
      this.onEditorInput();
    }
  }

  clearEditor() {
    if (this.richEditor?.nativeElement) {
      this.richEditor.nativeElement.innerHTML = '';
      this.onEditorInput();
    }
  }

  execCommand(command: string) {
    document.execCommand(command, false);
    this.richEditor?.nativeElement.focus();
  }

  execFormatBlock(tag: string) {
    document.execCommand('formatBlock', false, tag);
    this.richEditor?.nativeElement.focus();
  }

  onEditorInput() {
    if (this.richEditor?.nativeElement) {
      this.jobOffer = this.richEditor.nativeElement.innerText ?? '';
      this.charCount = this.jobOffer.trim().length;
    }
  }

  getEditorText(): string {
    return this.richEditor?.nativeElement?.innerText?.trim() ?? '';
  }

  onPaste(_event: ClipboardEvent) {
    setTimeout(() => this.onEditorInput(), 10);
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.ctrlKey && event.key === 'Enter') {
      event.preventDefault();
      this.scanCv();
    }
  }

  scanCv() {
    const text = this.getEditorText();
    if (!this.selectedFile || !text) return;

    this.loading = true;
    this.result = null;
    this.errorMessage = '';
    this.cdr.detectChanges();

    this.apiService.scanCv(this.selectedFile, text).subscribe({
      next: (response: ScanResult) => {
        this.result = response;
        this.loading = false;
        this.cdr.detectChanges();

        console.log('📋 Compétences extraites de l\'offre d\'emploi:', response.job_skills_found);
        console.log('📄 Compétences détectées dans le CV:', response.analysis.cv_skills_detected);
      },
      error: (error: any) => {
        console.error('Scan error:', error);
        this.errorMessage = error?.error?.error || error?.message || 'Erreur lors de l\'analyse.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  getScoreClass(): string {
    if (!this.result) return '';
    const score = this.result.analysis.global_score;
    if (score >= 70) return 'score-high';
    if (score >= 40) return 'score-medium';
    return 'score-low';
  }
}
