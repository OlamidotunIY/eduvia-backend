import { Query } from '@nestjs/cqrs';
import { ClassroomStudentDTO } from './get-classroom-students.dto';

export class GetClassroomStudentsQuery extends Query<ClassroomStudentDTO[]> {
  constructor(
    public readonly classroomId: string,
    public readonly orgId: string,
  ) {
    super();
  }
}
