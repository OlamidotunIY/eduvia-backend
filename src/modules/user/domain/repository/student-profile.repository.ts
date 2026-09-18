import { BaseRepository } from "@modules/shared";
import { StudentProfile } from "../entities/student-profile-entities";
import { StudentProfileId } from "../value-objects/student-profile-id.v0";

abstract class IStudentProfileRepository extends BaseRepository<StudentProfile, StudentProfileId>{}

export { IStudentProfileRepository}