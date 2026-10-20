export const orgIndexMapping = {
  mappings: {
    properties: {
      id: { type: 'keyword' },
      name: {
        type: 'text',
        fields: { keyword: { type: 'keyword' } },
      },
      slug: { type: 'keyword' },
      description: { type: 'text' },
      country: { type: 'keyword' },
      subjects: { type: 'keyword' },
      status: { type: 'keyword' },
      marketplaceListed: { type: 'boolean' },
      acceptingTeachers: { type: 'boolean' },
      timezone: { type: 'keyword' },
      createdAt: { type: 'date' },
    },
  },
};

export const questionIndexMapping = {
  mappings: {
    properties: {
      id: { type: 'keyword' },
      stem: { type: 'text' },
      type: { type: 'keyword' },
      ownerType: { type: 'keyword' },
      orgId: { type: 'keyword' },
      teacherId: { type: 'keyword' },
      subject: { type: 'keyword' },
      curriculumNodeId: { type: 'keyword' },
      curriculumNodePath: { type: 'keyword' },
      difficultyLevel: { type: 'integer' },
      tags: { type: 'keyword' },
      examBoard: { type: 'keyword' },
      yearGroup: { type: 'keyword' },
      isPublished: { type: 'boolean' },
      usageCount: { type: 'integer' },
      avgScore: { type: 'float' },
      correctRate: { type: 'float' },
      createdAt: { type: 'date' },
    },
  },
};

export const curriculumNodeIndexMapping = {
  mappings: {
    properties: {
      id: { type: 'keyword' },
      curriculumId: { type: 'keyword' },
      name: { type: 'text', fields: { keyword: { type: 'keyword' } } },
      code: { type: 'keyword' },
      description: { type: 'text' },
      nodeType: { type: 'keyword' },
      gradeLevel: { type: 'keyword' },
      depth: { type: 'integer' },
      path: { type: 'keyword' },
      isLeaf: { type: 'boolean' },
      isActive: { type: 'boolean' },
    },
  },
};

export const teacherIndexMapping = {
  mappings: {
    properties: {
      userId: { type: 'keyword' },
      orgId: { type: 'keyword' },
      membershipId: { type: 'keyword' },
      firstName: { type: 'text', fields: { keyword: { type: 'keyword' } } },
      lastName: { type: 'text', fields: { keyword: { type: 'keyword' } } },
      email: { type: 'keyword' },
      subjects: { type: 'keyword' },
      role: { type: 'keyword' },
      status: { type: 'keyword' },
      joinedAt: { type: 'date' },
    },
  },
};
