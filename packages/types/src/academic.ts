export interface University {
  id: string;
  domain: string;
  name: string;
  countryCode: string;
  region: string;
  isAlumniEnabled: boolean;
  metadata?: Record<string, any>;
}

export interface Faculty {
  id: string;
  universityId: string;
  name: string; // e.g., 'Faculty of Engineering'
  slug: string;
}

export interface GlobalCourse {
  id: string;
  standardizedName: string; // e.g., 'Linear Algebra 1'
  description: string;
}

export interface LocalCourse {
  id: string;
  globalCourseId?: string; // Links to global pool if equivalency exists
  facultyId: string;
  courseCode: string;
  name: string;
  semesterOffered: 'FALL' | 'SPRING' | 'SUMMER' | 'ALL';
  year: number;
}
