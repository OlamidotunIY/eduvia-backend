import 'dotenv/config';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../src/generated/prisma/client';
import { v7 as uuidv7 } from 'uuid';

/**
 * Seeds the small, neutral platform catalog needed while the platform-admin
 * CMS is not available. It is safe to run repeatedly: short codes are the
 * stable natural keys and existing records are updated in place.
 *
 * This intentionally does not seed curriculum trees or platform questions.
 * Those records need academically reviewed content and subject-to-node
 * mappings, rather than placeholder data.
 */

const platformSubjects = [
  [
    'MAT',
    'Mathematics',
    'Numeracy, algebra, geometry, statistics, and problem solving.',
  ],
  [
    'ENG',
    'English Language',
    'Reading, writing, grammar, speaking, and listening.',
  ],
  [
    'LIT',
    'Literature in English',
    'Literary study, analysis, and critical writing.',
  ],
  ['BIO', 'Biology', 'Living systems, ecology, genetics, and human biology.'],
  ['CHEM', 'Chemistry', 'Matter, chemical change, and practical chemistry.'],
  [
    'PHY',
    'Physics',
    'Forces, energy, waves, electricity, and practical physics.',
  ],
  [
    'CSC',
    'Computer Science',
    'Computing, programming, digital literacy, and data.',
  ],
  ['ECO', 'Economics', 'Economic systems, markets, and decision making.'],
  [
    'ACC',
    'Accounting',
    'Financial records, reporting, and business accounting.',
  ],
  [
    'GOV',
    'Government',
    'Civics, governance, public institutions, and citizenship.',
  ],
  ['GEO', 'Geography', 'Places, environments, people, and spatial systems.'],
  [
    'HIS',
    'History',
    'Historical inquiry, events, evidence, and interpretation.',
  ],
  [
    'CVE',
    'Civic Education',
    'Citizenship, rights, responsibilities, and values.',
  ],
  ['AGR', 'Agricultural Science', 'Crop, animal, and agricultural systems.'],
  [
    'FRE',
    'French',
    'French language communication and cultural understanding.',
  ],
  ['YOR', 'Yoruba', 'Yoruba language, literature, and cultural understanding.'],
  [
    'ART',
    'Art and Design',
    'Visual arts, design practice, and creative expression.',
  ],
  ['MUS', 'Music', 'Music theory, performance, composition, and listening.'],
] as const;

const curricula = [
  [
    'NG-BEC',
    'Nigeria Basic Education Curriculum',
    'NG',
    'Nigerian Educational Research and Development Council',
    'Basic education curriculum framework.',
  ],
  [
    'NG-SSS',
    'Nigeria Senior Secondary Curriculum',
    'NG',
    'Nigerian Educational Research and Development Council',
    'Senior secondary curriculum framework.',
  ],
  [
    'GB-NC',
    'England National Curriculum',
    'GB',
    'Department for Education',
    'National Curriculum for England.',
  ],
  [
    'IB-DP',
    'International Baccalaureate Diploma Programme',
    'INT',
    'International Baccalaureate Organization',
    'International Baccalaureate Diploma Programme framework.',
  ],
  [
    'CA-ON',
    'Ontario Curriculum',
    'CA',
    'Ontario Ministry of Education',
    'Provincial curriculum framework for Ontario.',
  ],
] as const;

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error(
    'DATABASE_URL must be set before seeding the platform catalog.',
  );
}

const prisma = new PrismaClient({
  adapter: new PrismaMariaDb(connectionString),
});

async function main(): Promise<void> {
  for (const [shortCode, name, description] of platformSubjects) {
    await prisma.platformSubject.upsert({
      where: { shortCode },
      create: { id: uuidv7(), shortCode, name, description, isActive: true },
      update: { name, description, isActive: true },
    });
  }

  for (const [
    shortCode,
    name,
    countryCode,
    authority,
    description,
  ] of curricula) {
    await prisma.curriculumProfile.upsert({
      where: { shortCode },
      create: {
        id: uuidv7(),
        shortCode,
        name,
        countryCode,
        authority,
        description,
        isActive: true,
      },
      update: { name, countryCode, authority, description, isActive: true },
    });
  }

  console.log(
    `Platform catalog is ready: ${platformSubjects.length} subjects and ${curricula.length} curriculum profiles.`,
  );
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
