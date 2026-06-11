import slugify from 'slugify';

export function generateCourseSlug(universityId: string, courseCode: string, courseName: string): string {
  // Using standard concatenation to avoid PowerShell backtick mangling
  const rawString = universityId + '-' + courseCode + '-' + courseName;
  return slugify(rawString, {
    lower: true,
    strict: true,
    trim: true
  });
}
