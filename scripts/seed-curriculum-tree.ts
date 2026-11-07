import 'dotenv/config';
import mariadb from 'mariadb';
import { inspect } from 'node:util';
import { v7 as uuidv7 } from 'uuid';
import { officialMathematicsCatalog } from '../src/modules/curriculum/infrastructure/seeding/official-mathematics-catalog.seed.data';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('DATABASE_URL is missing');
if (process.env.CURRICULUM_RESET_CONFIRM !== 'RESET_PLATFORM_CURRICULUM') {
  throw new Error('Refusing destructive reset. Set CURRICULUM_RESET_CONFIRM=RESET_PLATFORM_CURRICULUM.');
}

const parsed = new URL(databaseUrl);
if (
  ['localhost', '127.0.0.1', '::1'].includes(parsed.hostname) &&
  process.env.DEPLOYED_DATABASE_TUNNEL !== 'true'
) {
  throw new Error(
    'Refusing localhost. When DATABASE_URL is an intentional deployed-database tunnel, set DEPLOYED_DATABASE_TUNNEL=true.',
  );
}

async function main(): Promise<void> {
  const connection = await mariadb.createConnection({
    host: parsed.hostname,
    port: Number(parsed.port || 3306),
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    database: decodeURIComponent(parsed.pathname.slice(1)),
    connectTimeout: 10_000,
    allowPublicKeyRetrieval: true,
  });
  try {
    const [target] = await connection.query<{ database: string }[]>('SELECT DATABASE() AS database');
    console.log(`Resetting platform curriculum in database: ${target?.database ?? '<unknown>'}`);
    const [mathematics] = await connection.query<{ id: string }[]>(
      'SELECT id FROM platform_subjects WHERE shortCode = ? LIMIT 1', ['MAT'],
    );
    if (!mathematics) throw new Error('Platform subject MAT is required. Run pnpm seed:platform-catalog first.');

    await connection.beginTransaction();
    await connection.query('DELETE FROM subject_curriculum_mappings');
    await connection.query('DELETE FROM curriculum_profiles');

    for (const profile of officialMathematicsCatalog) {
      const curriculumId = uuidv7();
      await connection.query(
        `INSERT INTO curriculum_profiles
         (id, name, shortCode, countryCode, jurisdictionCode, description, authority, isActive, version, sourceUrl, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, true, ?, ?, NOW(), NOW())`,
        [curriculumId, profile.name, profile.shortCode, profile.countryCode, profile.jurisdictionCode, `Platform-owned ${profile.name} catalogue. Source-backed headings only.`, profile.authority, profile.version, profile.sourceUrl],
      );

      const nodesByCode = new Map<string, { id: string; path: string }>();
      for (const node of profile.nodes) {
        const id = uuidv7();
        const parent = node.parentCode ? nodesByCode.get(node.parentCode) : undefined;
        if (node.parentCode && !parent) throw new Error(`Missing parent ${node.parentCode} for ${node.code}`);
        const path = parent ? `${parent.path}${id}/` : `/${id}/`;
        const depth = parent ? parent.path.split('/').filter(Boolean).length : 0;
        await connection.query(
          `INSERT INTO curriculum_nodes
           (id, curriculumId, parentNodeId, nodeType, name, code, gradeLevel, depth, path, isLeaf, isActive, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, false, true, NOW(), NOW())`,
          [id, curriculumId, parent?.id ?? null, node.nodeType, node.name, node.code, node.gradeLevel ?? null, depth, path],
        );
        nodesByCode.set(node.code, { id, path });
        if (node.platformSubjectCode === 'MAT') {
          await connection.query(
            `INSERT INTO subject_curriculum_mappings (id, platformSubjectId, curriculumId, subjectNodeId, createdAt)
             VALUES (?, ?, ?, ?, NOW())`,
            [uuidv7(), mathematics.id, curriculumId, id],
          );
        }
      }
    }
    await connection.commit();
    console.log(`Seeded ${officialMathematicsCatalog.length} verified mathematics curricula.`);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    await connection.end();
  }
}

main().catch((error: unknown) => {
  console.error(inspect(error, { depth: 10, colors: true }));
  process.exitCode = 1;
});
