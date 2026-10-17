export * from './create-curriculum-profile';
export * from './update-curriculum-profile';
export * from './activate-curriculum-profile';
export * from './deactivate-curriculum-profile';
export * from './create-curriculum-node';
export * from './update-curriculum-node';
export * from './deactivate-curriculum-node';
export * from './create-platform-subject';
export * from './create-subject-curriculum-mapping';

import { CreateCurriculumProfileHandler } from './create-curriculum-profile';
import { UpdateCurriculumProfileHandler } from './update-curriculum-profile';
import { ActivateCurriculumProfileHandler } from './activate-curriculum-profile';
import { DeactivateCurriculumProfileHandler } from './deactivate-curriculum-profile';
import { CreateCurriculumNodeHandler } from './create-curriculum-node';
import { UpdateCurriculumNodeHandler } from './update-curriculum-node';
import { DeactivateCurriculumNodeHandler } from './deactivate-curriculum-node';
import { CreatePlatformSubjectHandler } from './create-platform-subject';
import { CreateSubjectCurriculumMappingHandler } from './create-subject-curriculum-mapping';

export const CURRICULUM_COMMAND_HANDLERS = [
  CreateCurriculumProfileHandler,
  UpdateCurriculumProfileHandler,
  ActivateCurriculumProfileHandler,
  DeactivateCurriculumProfileHandler,
  CreateCurriculumNodeHandler,
  UpdateCurriculumNodeHandler,
  DeactivateCurriculumNodeHandler,
  CreatePlatformSubjectHandler,
  CreateSubjectCurriculumMappingHandler,
];
