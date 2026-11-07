import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { PrismaService } from '@modules/shared';
import { v7 as uuidv7 } from 'uuid';
import { officialMathematicsCatalog } from './official-mathematics-catalog.seed.data';

const OFFICIAL_MATHEMATICS_SEED_KEY = 'official-mathematics-catalog-v1';

/** Runs in the application pod after the migration init-container completes. */
@Injectable()
export class CurriculumTreeSeederService implements OnApplicationBootstrap {
  private readonly logger = new Logger(CurriculumTreeSeederService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onApplicationBootstrap(): Promise<void> {
    if (process.env.CURRICULUM_CATALOG_SEED_ENABLED !== 'true') {
      this.logger.debug('Curriculum catalogue deployment seed is disabled for this environment.');
      return;
    }
    await this.seedCurrentCatalog();
  }

  async seedCurrentCatalog(): Promise<{ skipped: boolean; profileCount: number }> {
    const alreadySeeded = await this.prisma.platformSeedRun.findUnique({
      where: { key: OFFICIAL_MATHEMATICS_SEED_KEY },
    });
    if (alreadySeeded) {
      this.logger.log(`Curriculum catalogue ${OFFICIAL_MATHEMATICS_SEED_KEY} already seeded; skipping.`);
      return { skipped: true, profileCount: officialMathematicsCatalog.length };
    }

    this.logger.warn(`Seeding ${OFFICIAL_MATHEMATICS_SEED_KEY}; replacing the prior platform catalogue.`);
    await this.prisma.$transaction(async (tx) => {
      const mathematics = await tx.platformSubject.upsert({
        where: { shortCode: 'MAT' },
        create: {
          id: uuidv7(),
          shortCode: 'MAT',
          name: 'Mathematics',
          description: 'Mathematics platform subject.',
          isActive: true,
        },
        update: { isActive: true },
      });

      await tx.subjectCurriculumMapping.deleteMany();
      await tx.curriculumProfile.deleteMany();

      for (const profile of officialMathematicsCatalog) {
        const curriculumId = uuidv7();
        let platformSubjectMapped = false;
        await tx.curriculumProfile.create({
          data: {
            id: curriculumId,
            name: profile.name,
            shortCode: profile.shortCode,
            countryCode: profile.countryCode,
            jurisdictionCode: profile.jurisdictionCode,
            description: `Platform-owned ${profile.name} catalogue. Source-backed headings only.`,
            authority: profile.authority,
            isActive: true,
            version: profile.version,
            sourceUrl: profile.sourceUrl,
          },
        });

        const nodesByCode = new Map<string, { id: string; path: string }>();
        for (const node of profile.nodes) {
          const id = uuidv7();
          const parent = node.parentCode ? nodesByCode.get(node.parentCode) : undefined;
          if (node.parentCode && !parent) throw new Error(`Missing parent ${node.parentCode} for ${node.code}`);
          const path = parent ? `${parent.path}${id}/` : `/${id}/`;
          const depth = parent ? parent.path.split('/').filter(Boolean).length : 0;
          await tx.curriculumNode.create({
            data: {
              id,
              curriculumId,
              parentNodeId: parent?.id ?? null,
              nodeType: node.nodeType,
              name: node.name,
              code: node.code,
              gradeLevel: node.gradeLevel ?? null,
              depth,
              path,
              isLeaf: false,
              isActive: true,
            },
          });
          nodesByCode.set(node.code, { id, path });
          // A platform subject maps once to a curriculum profile. A profile can
          // contain several stages (for example England KS3 and KS4) of Mathematics.
          if (node.platformSubjectCode === 'MAT' && !platformSubjectMapped) {
            await tx.subjectCurriculumMapping.create({
              data: {
                id: uuidv7(),
                platformSubjectId: mathematics.id,
                curriculumId,
                subjectNodeId: id,
              },
            });
            platformSubjectMapped = true;
          }
        }
      }
      await tx.platformSeedRun.create({
        data: { id: uuidv7(), key: OFFICIAL_MATHEMATICS_SEED_KEY },
      });
    });

    this.logger.log(`Seeded ${officialMathematicsCatalog.length} official mathematics curricula.`);
    return { skipped: false, profileCount: officialMathematicsCatalog.length };
  }
}
