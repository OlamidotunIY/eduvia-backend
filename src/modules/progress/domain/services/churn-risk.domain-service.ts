import { StudentChurnRisk } from '../value-objects';

export interface StudentChurnEvaluationInput {
  studentId: string;
  studentName: string;
  consecutiveAbsences: number;
  recentScores: number[]; // chronologically ordered scores, e.g. last 4 lessons
  lastLessonAt: Date | null;
  lastParentViewAt: Date | null;
}

export class ChurnRiskDomainService {
  public static calculate(input: StudentChurnEvaluationInput, referenceDate = new Date()): StudentChurnRisk {
    let riskScore = 0.0;
    const riskFactors: string[] = [];

    // Factor 1: 2+ consecutive absences (+0.3)
    if (input.consecutiveAbsences >= 2) {
      riskScore += 0.3;
      riskFactors.push(`${input.consecutiveAbsences} consecutive absences`);
    }

    // Factor 2: declining scores over last 4 lessons (+0.3)
    if (input.recentScores.length >= 3) {
      let isDeclining = true;
      for (let i = 1; i < input.recentScores.length; i++) {
        if (input.recentScores[i] >= input.recentScores[i - 1]) {
          isDeclining = false;
          break;
        }
      }
      if (isDeclining) {
        riskScore += 0.3;
        riskFactors.push('Declining assessment scores across recent lessons');
      }
    }

    const fourteenDaysMs = 14 * 24 * 60 * 60 * 1000;

    // Factor 3: No lesson in past 14 days (+0.25)
    if (input.lastLessonAt) {
      const daysSinceLastLesson = referenceDate.getTime() - input.lastLessonAt.getTime();
      if (daysSinceLastLesson > fourteenDaysMs) {
        riskScore += 0.25;
        riskFactors.push('No lesson attended in the past 14 days');
      }
    } else {
      riskScore += 0.2;
      riskFactors.push('No recorded lessons attended');
    }

    // Factor 4: Parent has not viewed reports in 14 days (+0.15)
    if (input.lastParentViewAt) {
      const daysSinceParentView = referenceDate.getTime() - input.lastParentViewAt.getTime();
      if (daysSinceParentView > fourteenDaysMs) {
        riskScore += 0.15;
        riskFactors.push('Parent has not viewed reports in the past 14 days');
      }
    } else {
      riskScore += 0.15;
      riskFactors.push('Parent has never viewed lesson reports');
    }

    return StudentChurnRisk.create({
      studentId: input.studentId,
      studentName: input.studentName,
      riskScore,
      riskFactors,
      lastLessonAt: input.lastLessonAt,
    });
  }
}
