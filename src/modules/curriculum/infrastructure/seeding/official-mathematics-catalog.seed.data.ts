/**
 * Deliberately small, source-backed starter catalogue. We only publish stable
 * headings and course identifiers verified against the linked first-party
 * sources; detailed expectations are imported after editorial review.
 */
export interface OfficialCurriculumProfileSeed {
  shortCode: string;
  name: string;
  countryCode: string;
  jurisdictionCode: string;
  authority: string;
  version: string;
  sourceUrl: string;
  nodes: OfficialCurriculumNodeSeed[];
}

export interface OfficialCurriculumNodeSeed {
  code: string;
  name: string;
  nodeType: 'keystage' | 'discipline' | 'course' | 'strand';
  gradeLevel?: string;
  parentCode?: string;
  platformSubjectCode?: 'MAT';
}

export const officialMathematicsCatalog: OfficialCurriculumProfileSeed[] = [
  {
    shortCode: 'CA-ON-MATH',
    name: 'Ontario Mathematics Curriculum',
    countryCode: 'CA',
    jurisdictionCode: 'CA-ON',
    authority: 'Ontario Ministry of Education',
    version: 'Grade 9 Mathematics, 2021',
    sourceUrl:
      'https://www.ontario.ca/laws/regulation/240348/v2',
    nodes: [
      { code: 'CA-ON-SEC', name: 'Secondary Education', nodeType: 'keystage', gradeLevel: 'Grades 9-12' },
      { code: 'CA-ON-SEC-MAT', name: 'Mathematics', nodeType: 'discipline', parentCode: 'CA-ON-SEC', platformSubjectCode: 'MAT' },
      { code: 'CA-ON-MTH1W', name: 'Mathematics, Grade 9, De-streamed', nodeType: 'course', gradeLevel: 'Grade 9', parentCode: 'CA-ON-SEC-MAT' },
      { code: 'CA-ON-MTH1W-NUM', name: 'Number', nodeType: 'strand', parentCode: 'CA-ON-MTH1W' },
      { code: 'CA-ON-MTH1W-ALG', name: 'Algebra', nodeType: 'strand', parentCode: 'CA-ON-MTH1W' },
      { code: 'CA-ON-MTH1W-DATA', name: 'Data', nodeType: 'strand', parentCode: 'CA-ON-MTH1W' },
      { code: 'CA-ON-MTH1W-GEO', name: 'Geometry and Measurement', nodeType: 'strand', parentCode: 'CA-ON-MTH1W' },
      { code: 'CA-ON-MTH1W-FIN', name: 'Financial Literacy', nodeType: 'strand', parentCode: 'CA-ON-MTH1W' },
      { code: 'CA-ON-MTH1W-COD', name: 'Coding', nodeType: 'strand', parentCode: 'CA-ON-MTH1W' },
    ],
  },
  {
    shortCode: 'GB-ENG-NC-MATH',
    name: 'National Curriculum in England: Mathematics',
    countryCode: 'GB',
    jurisdictionCode: 'GB-ENG',
    authority: 'Department for Education',
    version: '2013 (updated 2021)',
    sourceUrl:
      'https://www.gov.uk/government/publications/national-curriculum-in-england-mathematics-programmes-of-study',
    nodes: [
      { code: 'GB-ENG-KS3', name: 'Key Stage 3', nodeType: 'keystage', gradeLevel: 'Years 7-9' },
      { code: 'GB-ENG-KS3-MAT', name: 'Mathematics', nodeType: 'discipline', parentCode: 'GB-ENG-KS3', platformSubjectCode: 'MAT' },
      { code: 'GB-ENG-KS3-MAT-COURSE', name: 'Mathematics', nodeType: 'course', gradeLevel: 'Years 7-9', parentCode: 'GB-ENG-KS3-MAT' },
      { code: 'GB-ENG-KS3-NUM', name: 'Number', nodeType: 'strand', parentCode: 'GB-ENG-KS3-MAT-COURSE' },
      { code: 'GB-ENG-KS3-ALG', name: 'Algebra', nodeType: 'strand', parentCode: 'GB-ENG-KS3-MAT-COURSE' },
      { code: 'GB-ENG-KS3-RATIO', name: 'Ratio, proportion and rates of change', nodeType: 'strand', parentCode: 'GB-ENG-KS3-MAT-COURSE' },
      { code: 'GB-ENG-KS3-GEO', name: 'Geometry and measures', nodeType: 'strand', parentCode: 'GB-ENG-KS3-MAT-COURSE' },
      { code: 'GB-ENG-KS3-PROB', name: 'Probability', nodeType: 'strand', parentCode: 'GB-ENG-KS3-MAT-COURSE' },
      { code: 'GB-ENG-KS3-STAT', name: 'Statistics', nodeType: 'strand', parentCode: 'GB-ENG-KS3-MAT-COURSE' },
      { code: 'GB-ENG-KS4', name: 'Key Stage 4', nodeType: 'keystage', gradeLevel: 'Years 10-11' },
      { code: 'GB-ENG-KS4-MAT', name: 'Mathematics', nodeType: 'discipline', parentCode: 'GB-ENG-KS4', platformSubjectCode: 'MAT' },
      { code: 'GB-ENG-KS4-MAT-COURSE', name: 'Mathematics', nodeType: 'course', gradeLevel: 'Years 10-11', parentCode: 'GB-ENG-KS4-MAT' },
      { code: 'GB-ENG-KS4-NUM', name: 'Number', nodeType: 'strand', parentCode: 'GB-ENG-KS4-MAT-COURSE' },
      { code: 'GB-ENG-KS4-ALG', name: 'Algebra', nodeType: 'strand', parentCode: 'GB-ENG-KS4-MAT-COURSE' },
      { code: 'GB-ENG-KS4-RATIO', name: 'Ratio, proportion and rates of change', nodeType: 'strand', parentCode: 'GB-ENG-KS4-MAT-COURSE' },
      { code: 'GB-ENG-KS4-GEO', name: 'Geometry and measures', nodeType: 'strand', parentCode: 'GB-ENG-KS4-MAT-COURSE' },
      { code: 'GB-ENG-KS4-PROB', name: 'Probability', nodeType: 'strand', parentCode: 'GB-ENG-KS4-MAT-COURSE' },
      { code: 'GB-ENG-KS4-STAT', name: 'Statistics', nodeType: 'strand', parentCode: 'GB-ENG-KS4-MAT-COURSE' },
    ],
  },
  {
    shortCode: 'NG-NERDC-MATH',
    name: 'Nigeria Mathematics Curriculum',
    countryCode: 'NG',
    jurisdictionCode: 'NG',
    authority: 'Nigerian Educational Research and Development Council',
    version: 'New Revised Senior Secondary Education Curriculum',
    sourceUrl:
      'https://nerdc.gov.ng/content_manager/new_senior_curriculum_home.html',
    nodes: [
      { code: 'NG-SSEC', name: 'Senior Secondary Education', nodeType: 'keystage', gradeLevel: 'SSS 1-3' },
      { code: 'NG-SSEC-MAT', name: 'Mathematics', nodeType: 'discipline', parentCode: 'NG-SSEC', platformSubjectCode: 'MAT' },
      { code: 'NG-SSEC-MAT-SS1', name: 'Mathematics', nodeType: 'course', gradeLevel: 'SSS 1', parentCode: 'NG-SSEC-MAT' },
    ],
  },
];
