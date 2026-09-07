import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ScanResult {
  filename: string;
  ocr_used: boolean;
  cv_text_preview: string;
  job_skills_found: string[];
  analysis: {
    global_score: number;
    scores: {
      skills: number;
      experience: number;
      education: number;
      ats_quality: number;
    };
    personal_info: {
      name: string;
      email: string;
      phone: string;
      linkedin: string;
      github: string;
      website: string;
      location: string;
      languages: string[];
      has_driving_license: boolean;
      nationality: string;
    };
    cv_skills_detected: string[];
    matched_skills: string[];
    matched_types: { [key: string]: string };
    semantic_matches: { skill: string; similarity: number; match_type: string }[];
    missing_skills: string[];
    ats_checks: {
      text_extractable: boolean;
      has_email: boolean;
      has_phone: boolean;
      has_sections: boolean;
    };
    experience_years: number;
    education_found: string[];
    recommendations: string[];
  };
}

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private apiUrl = '/api';

  constructor(private http: HttpClient) {}

  scanCv(file: File, jobOffer: string): Observable<ScanResult> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('job_offer', jobOffer);

    return this.http.post<ScanResult>(`${this.apiUrl}/scan`, formData);
  }
}