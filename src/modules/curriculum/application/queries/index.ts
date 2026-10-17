export * from './list-curricula';
export * from './get-curriculum-by-id';
export * from './get-curriculum-tree';
export * from './list-curriculum-nodes';
export * from './get-curriculum-node-by-id';
export * from './search-curriculum-nodes';
export * from './list-platform-subjects';
export * from './resolve-student-curriculum';

import { ListCurriculaHandler } from './list-curricula';
import { GetCurriculumByIdHandler } from './get-curriculum-by-id';
import { GetCurriculumTreeHandler } from './get-curriculum-tree';
import { ListCurriculumNodesHandler } from './list-curriculum-nodes';
import { GetCurriculumNodeByIdHandler } from './get-curriculum-node-by-id';
import { SearchCurriculumNodesHandler } from './search-curriculum-nodes';
import { ListPlatformSubjectsHandler } from './list-platform-subjects';
import { ResolveStudentCurriculumHandler } from './resolve-student-curriculum';

export const CURRICULUM_QUERY_HANDLERS = [
  ListCurriculaHandler,
  GetCurriculumByIdHandler,
  GetCurriculumTreeHandler,
  ListCurriculumNodesHandler,
  GetCurriculumNodeByIdHandler,
  SearchCurriculumNodesHandler,
  ListPlatformSubjectsHandler,
  ResolveStudentCurriculumHandler,
];
