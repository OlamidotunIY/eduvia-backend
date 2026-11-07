import 'dotenv/config';
import mariadb from 'mariadb';
import { v7 as uuidv7 } from 'uuid';
import { inspect } from 'node:util';
import { seedData } from '../src/modules/curriculum/infrastructure/seeding/curriculum-tree-seed.data';

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
    // 1. Fetch all platform subjects to index by shortCode
    const rawPlatformSubjects: Array<{ id: string; shortCode: string }> =
      await connection.query('SELECT id, shortCode FROM platform_subjects');
    const platformSubjectMap = new Map<string, string>();
    for (const ps of rawPlatformSubjects) {
      platformSubjectMap.set(ps.shortCode, ps.id);
    }

    let totalNodesInserted = 0;
    let totalNodesUpdated = 0;
    let totalMappingsInserted = 0;

    for (const curriculum of seedData) {
      // Find curriculum profile
      const [profile]: Array<{ id: string }> = await connection.query(
        'SELECT id FROM curriculum_profiles WHERE shortCode = ?',
        [curriculum.curriculumCode],
      );

      if (!profile) {
        console.warn(`Curriculum profile ${curriculum.curriculumCode} not found in DB. Skipping.`);
        continue;
      }

      const curriculumId = profile.id;
      const codeToNodeMap = new Map<string, { id: string; path: string }>();

      // Fetch existing nodes for this curriculum to preserve IDs
      const existingNodes: Array<{ id: string; code: string; path: string }> =
        await connection.query(
          'SELECT id, code, path FROM curriculum_nodes WHERE curriculumId = ?',
          [curriculumId],
        );
      for (const en of existingNodes) {
        if (en.code) {
          codeToNodeMap.set(en.code, { id: en.id, path: en.path });
        }
      }

      // Sort nodes by depth (0, 1, 2, 3, 4) to ensure parents are inserted first
      const sortedNodes = [...curriculum.nodes].sort((a, b) => a.depth - b.depth);

      for (const node of sortedNodes) {
        let nodeId: string;
        let parentNodeId: string | null = null;
        let materializedPath: string;

        if (node.parentCode) {
          const parent = codeToNodeMap.get(node.parentCode);
          if (!parent) {
            throw new Error(
              `Parent node with code "${node.parentCode}" not found for "${node.code}"`,
            );
          }
          parentNodeId = parent.id;
        }

        const existing = codeToNodeMap.get(node.code);
        if (existing) {
          nodeId = existing.id;
          materializedPath = parentNodeId
            ? `${codeToNodeMap.get(node.parentCode!)!.path}${nodeId}/`
            : `/${nodeId}/`;

          await connection.query(
            `UPDATE curriculum_nodes
             SET parentNodeId = ?, name = ?, description = ?, gradeLevel = ?, depth = ?, path = ?, isLeaf = ?, isActive = true, updatedAt = NOW()
             WHERE id = ?`,
            [
              parentNodeId,
              node.name,
              node.description ?? null,
              node.gradeLevel ?? null,
              node.depth,
              materializedPath,
              node.isLeaf ? 1 : 0,
              nodeId,
            ],
          );
          totalNodesUpdated++;
        } else {
          nodeId = uuidv7();
          materializedPath = parentNodeId
            ? `${codeToNodeMap.get(node.parentCode!)!.path}${nodeId}/`
            : `/${nodeId}/`;

          await connection.query(
            `INSERT INTO curriculum_nodes (id, curriculumId, parentNodeId, nodeType, name, code, description, gradeLevel, depth, path, isLeaf, isActive, createdAt, updatedAt)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, true, NOW(), NOW())`,
            [
              nodeId,
              curriculumId,
              parentNodeId,
              node.nodeType,
              node.name,
              node.code,
              node.description ?? null,
              node.gradeLevel ?? null,
              node.depth,
              materializedPath,
              node.isLeaf ? 1 : 0,
            ],
          );
          totalNodesInserted++;
        }

        codeToNodeMap.set(node.code, { id: nodeId, path: materializedPath });

        // If this node represents a platform subject mapping
        if (node.platformSubjectCode && node.nodeType === 'subject') {
          const platformSubjectId = platformSubjectMap.get(node.platformSubjectCode);
          if (platformSubjectId) {
            await connection.query(
              `INSERT INTO subject_curriculum_mappings (id, platformSubjectId, curriculumId, subjectNodeId, createdAt)
               VALUES (?, ?, ?, ?, NOW())
               ON DUPLICATE KEY UPDATE subjectNodeId = VALUES(subjectNodeId)`,
              [uuidv7(), platformSubjectId, curriculumId, nodeId],
            );
            totalMappingsInserted++;
          }
        }
      }

      console.log(`✓ Seeded curriculum ${curriculum.curriculumCode}: ${curriculum.nodes.length} nodes processed.`);
    }

    console.log(
      `Done! Total new nodes inserted: ${totalNodesInserted}, updated: ${totalNodesUpdated}, mappings updated: ${totalMappingsInserted}.`,
    );
  } finally {
    await connection.end();
  }
}

main().catch((error: unknown) => {
  console.error(inspect(error, { depth: 10, colors: true }));
  process.exitCode = 1;
});
