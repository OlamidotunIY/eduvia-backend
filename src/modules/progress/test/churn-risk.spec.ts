import { ChurnRiskDomainService } from '../domain';

describe('ChurnRiskDomainService', () => {
  const baseDate = new Date('2026-10-15T12:00:00Z');

  it('should calculate zero risk for active engaged student', () => {
    const result = ChurnRiskDomainService.calculate(
      {
        studentId: 'student-1',
        studentName: 'Alice',
        consecutiveAbsences: 0,
        recentScores: [70, 75, 80, 85],
        lastLessonAt: new Date('2026-10-14T10:00:00Z'), // 1 day ago
        lastParentViewAt: new Date('2026-10-14T12:00:00Z'), // 1 day ago
      },
      baseDate,
    );

    expect(result.riskScore).toBe(0.0);
    expect(result.riskFactors.length).toBe(0);
  });

  it('should accumulate risk score for consecutive absences and declining scores', () => {
    const result = ChurnRiskDomainService.calculate(
      {
        studentId: 'student-2',
        studentName: 'Bob',
        consecutiveAbsences: 3,
        recentScores: [85, 80, 75, 70], // declining scores
        lastLessonAt: new Date('2026-10-14T10:00:00Z'),
        lastParentViewAt: new Date('2026-10-14T12:00:00Z'),
      },
      baseDate,
    );

    // 0.3 for absences + 0.3 for declining scores = 0.6
    expect(result.riskScore).toBe(0.6);
    expect(result.riskFactors).toContain('3 consecutive absences');
    expect(result.riskFactors).toContain(
      'Declining assessment scores across recent lessons',
    );
  });

  it('should increase risk score when student and parent are inactive for >14 days', () => {
    const result = ChurnRiskDomainService.calculate(
      {
        studentId: 'student-3',
        studentName: 'Charlie',
        consecutiveAbsences: 0,
        recentScores: [80, 80],
        lastLessonAt: new Date('2026-09-20T10:00:00Z'), // 25 days ago
        lastParentViewAt: new Date('2026-09-20T10:00:00Z'), // 25 days ago
      },
      baseDate,
    );

    // 0.25 (no lesson in 14 days) + 0.15 (parent not viewed in 14 days) = 0.4
    expect(result.riskScore).toBe(0.4);
    expect(result.riskFactors).toContain('No lesson attended in the past 14 days');
    expect(result.riskFactors).toContain(
      'Parent has not viewed reports in the past 14 days',
    );
  });
});
