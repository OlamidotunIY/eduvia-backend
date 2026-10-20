import { BaseRepository } from "@modules/shared";
import { StudentProfile } from "../model/StudentProfile";
import { StudentProfileId } from "../value-objects/student-profile-id.v0";

abstract class IStudentProfileRepository extends BaseRepository<StudentProfile, StudentProfileId>{}

export { IStudentProfileRepository}