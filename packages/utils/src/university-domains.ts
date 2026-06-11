import { University } from '@studymarket/types';

export const UNIVERSITY_REGISTRY: Record<string, University> = {
  // Beachhead: Middle East (.ac.il)
  'technion.ac.il': { id: 'uni_tech_01', name: 'Technion', domain: 'technion.ac.il', countryCode: 'IL', region: 'Middle East', isAlumniEnabled: false },
  'alumni.technion.ac.il': { id: 'uni_tech_01_alumni', name: 'Technion (Alumni)', domain: 'alumni.technion.ac.il', countryCode: 'IL', region: 'Middle East', isAlumniEnabled: true },
  'tau.ac.il': { id: 'uni_tau_01', name: 'Tel Aviv University', domain: 'tau.ac.il', countryCode: 'IL', region: 'Middle East', isAlumniEnabled: false },
  'bgu.ac.il': { id: 'uni_bgu_01', name: 'Ben-Gurion University', domain: 'bgu.ac.il', countryCode: 'IL', region: 'Middle East', isAlumniEnabled: false },
  'biu.ac.il': { id: 'uni_biu_01', name: 'Bar-Ilan University', domain: 'biu.ac.il', countryCode: 'IL', region: 'Middle East', isAlumniEnabled: false },
  
  // Phase 3 Prep: Global Domains
  'mit.edu': { id: 'uni_mit_01', name: 'Massachusetts Institute of Technology', domain: 'mit.edu', countryCode: 'US', region: 'North America', isAlumniEnabled: false },
  'cam.ac.uk': { id: 'uni_cam_01', name: 'University of Cambridge', domain: 'cam.ac.uk', countryCode: 'UK', region: 'Europe', isAlumniEnabled: false }
};

export function getUniversityByEmail(email: string): University | null {
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) return null;
  
  // 1. Check exact match
  if (UNIVERSITY_REGISTRY[domain]) return UNIVERSITY_REGISTRY[domain];

  // 2. Dynamic Subdomain Matching
  const domainParts = domain.split('.');
  for (let i = domainParts.length - 2; i >= 0; i--) {
    const potentialRoot = domainParts.slice(i).join('.');
    if (UNIVERSITY_REGISTRY[potentialRoot]) {
      return UNIVERSITY_REGISTRY[potentialRoot];
    }
  }

  return null;
}
