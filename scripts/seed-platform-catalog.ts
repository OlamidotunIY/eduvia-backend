import 'dotenv/config';
import mariadb from 'mariadb';
import { v7 as uuidv7 } from 'uuid';
import { inspect } from 'node:util';

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

const url = process.env.DATABASE_URL;

if (!url) {
  throw new Error('DATABASE_URL is missing');
}

const parsed = new URL(url);

const connectionOptions = {
  host: parsed.hostname,
  port: Number(parsed.port || 3306),
  user: decodeURIComponent(parsed.username),
  password: decodeURIComponent(parsed.password),
  database: decodeURIComponent(parsed.pathname.slice(1)),
  connectionLimit: 5,
  connectTimeout: 5000,
  acquireTimeout: 15000,
  allowPublicKeyRetrieval: true,
};

async function main(): Promise<void> {
  const connection = await mariadb.createConnection(connectionOptions);

  try {
    for (const [shortCode, name, description] of platformSubjects) {
      await connection.query(
        `INSERT INTO platform_subjects (id, shortCode, name, description, isActive, createdAt)
         VALUES (?, ?, ?, ?, true, NOW())
         ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description), isActive = true`,
        [uuidv7(), shortCode, name, description],
      );
    }

    for (const [
      shortCode,
      name,
      countryCode,
      authority,
      description,
    ] of curricula) {
      await connection.query(
        `INSERT INTO curriculum_profiles (id, shortCode, name, countryCode, authority, description, isActive, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, true, NOW(), NOW())
         ON DUPLICATE KEY UPDATE name = VALUES(name), countryCode = VALUES(countryCode), authority = VALUES(authority), description = VALUES(description), isActive = true, updatedAt = NOW()`,
        [uuidv7(), shortCode, name, countryCode, authority, description],
      );
    }

    console.log(
      `Platform catalog is ready: ${platformSubjects.length} subjects and ${curricula.length} curriculum profiles.`,
    );
  } finally {
    await connection.end();
  }
}

main().catch((error: unknown) => {
  console.error(inspect(error, { depth: 10, colors: true }));
  process.exitCode = 1;
});
