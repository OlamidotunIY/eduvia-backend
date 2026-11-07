import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { PrismaService } from '@modules/shared';
import { v7 as uuidv7 } from 'uuid';
import { seedData } from './curriculum-tree-seed.data';

@Injectable()
export class CurriculumTreeSeederService implements OnApplicationBootstrap {
  private readonly logger = new Logger(CurriculumTreeSeederService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onApplicationBootstrap() {
    try {
      await this.seed(false);
    } catch (err: any) {
      this.logger.error(
        'Failed to auto-seed curriculum tree:',
        err?.stack || err,
      );
    }
  }

  async seed(force = false) {
    const existingCount = await this.prisma.curriculumNode.count();
    if (!force && existingCount > 0) {
      this.logger.debug(
        `Curriculum nodes already populated (${existingCount} records). Skipping auto-seed.`,
      );
      return { skipped: true, nodeCount: existingCount };
    }

    this.logger.log(
      `Starting curriculum tree auto-seed (${force ? 'forced' : 'empty table detected'})...`,
    );

    // 1. Load curriculum profiles
    const profiles = await this.prisma.curriculumProfile.findMany();
    const profileMap = new Map<string, string>();
    for (const p of profiles) {
      profileMap.set(p.shortCode, p.id);
    }

    // Default metadata for known curriculum profiles if not created yet
    const defaultProfiles: Record<
      string,
      { name: string; authority: string; countryCode: string }
    > = {
      'CA-ON': {
        name: 'Ontario Curriculum',
        authority: 'Ontario Ministry of Education',
        countryCode: 'CA',
      },
      'NG-BEC': {
        name: 'Nigeria Basic Education Curriculum',
        authority: 'NERDC',
        countryCode: 'NG',
      },
      'NG-SSS': {
        name: 'Nigeria Senior Secondary Curriculum',
        authority: 'NERDC',
        countryCode: 'NG',
      },
      'GB-NC': {
        name: 'England National Curriculum',
        authority: 'Department for Education',
        countryCode: 'GB',
      },
      'IB-DP': {
        name: 'International Baccalaureate Diploma Programme',
        authority: 'International Baccalaureate Organization',
        countryCode: 'INT',
      },
    };

    // Ensure profiles exist
    for (const cur of seedData) {
      if (!profileMap.has(cur.curriculumCode)) {
        const meta = defaultProfiles[cur.curriculumCode] || {
          name: cur.curriculumCode,
          authority: 'Educational Authority',
          countryCode: 'INT',
        };
        const id = uuidv7();
        await this.prisma.curriculumProfile.create({
          data: {
            id,
            shortCode: cur.curriculumCode,
            name: meta.name,
            authority: meta.authority,
            countryCode: meta.countryCode,
            isActive: true,
          },
        });
        profileMap.set(cur.curriculumCode, id);
      }
    }

    // 2. Load platform subjects
    const platformSubjects = await this.prisma.platformSubject.findMany();
    const platformSubjectMap = new Map<string, string>();
    for (const s of platformSubjects) {
      platformSubjectMap.set(s.code, s.id);
    }

    let totalNodesInserted = 0;
    let totalNodesUpdated = 0;
    let totalMappings = 0;

    for (const cur of seedData) {
      const curriculumId = profileMap.get(cur.curriculumCode);
      if (!curriculumId) continue;

      // Map existing nodes by code
      const existingNodes = await this.prisma.curriculumNode.findMany({
        where: { curriculumId },
        select: { id: true, code: true, path: true },
      });
      const codeToNodeMap = new Map<string, { id: string; path: string }>();
      for (const n of existingNodes) {
        if (n.code) {
          codeToNodeMap.set(n.code, { id: n.id, path: n.path });
        }
      }

      // Sort by depth (0, 1, 2, 3, 4)
      const sorted = [...cur.nodes].sort((a, b) => a.depth - b.depth);

      for (const node of sorted) {
        let nodeId: string;
        let parentNodeId: string | null = null;
        let materializedPath: string;

        if (node.parentCode) {
          const parent = codeToNodeMap.get(node.parentCode);
          if (parent) {
            parentNodeId = parent.id;
          }
        }

        const existing = codeToNodeMap.get(node.code);
        if (existing) {
          nodeId = existing.id;
          materializedPath = parentNodeId
            ? `${codeToNodeMap.get(node.parentCode!)!.path}${nodeId}/`
            : `/${nodeId}/`;

          await this.prisma.curriculumNode.update({
            where: { id: nodeId },
            data: {
              parentNodeId,
              name: node.name,
              description: node.description ?? null,
              gradeLevel: node.gradeLevel ?? null,
              depth: node.depth,
              path: materializedPath,
              isLeaf: node.isLeaf,
              isActive: true,
            },
          });
          totalNodesUpdated++;
        } else {
          nodeId = uuidv7();
          materializedPath = parentNodeId
            ? `${codeToNodeMap.get(node.parentCode!)!.path}${nodeId}/`
            : `/${nodeId}/`;

          await this.prisma.curriculumNode.create({
            data: {
              id: nodeId,
              curriculumId,
              parentNodeId,
              nodeType: node.nodeType as any,
              name: node.name,
              code: node.code,
              description: node.description ?? null,
              gradeLevel: node.gradeLevel ?? null,
              depth: node.depth,
              path: materializedPath,
              isLeaf: node.isLeaf,
              isActive: true,
            },
          });
          totalNodesInserted++;
        }

        codeToNodeMap.set(node.code, { id: nodeId, path: materializedPath });

        // Map platform subject if applicable
        if (node.platformSubjectCode && node.nodeType === 'subject') {
          const platformSubjectId = platformSubjectMap.get(
            node.platformSubjectCode,
          );
          if (platformSubjectId) {
            const existingMapping =
              await this.prisma.subjectCurriculumMapping.findFirst({
                where: {
                  platformSubjectId,
                  curriculumId,
                },
              });

            if (existingMapping) {
              await this.prisma.subjectCurriculumMapping.update({
                where: { id: existingMapping.id },
                data: { subjectNodeId: nodeId },
              });
            } else {
              await this.prisma.subjectCurriculumMapping.create({
                data: {
                  id: uuidv7(),
                  platformSubjectId,
                  curriculumId,
                  subjectNodeId: nodeId,
                },
              });
            }
            totalMappings++;
          }
        }
      }
    }

    this.logger.log(
      `✓ Curriculum tree seeder completed: ${totalNodesInserted} inserted, ${totalNodesUpdated} updated, ${totalMappings} mappings linked.`,
    );

    return {
      success: true,
      inserted: totalNodesInserted,
      updated: totalNodesUpdated,
      mappings: totalMappings,
    };
  }
}
