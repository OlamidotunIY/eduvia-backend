import 'dotenv/config';
import mariadb from 'mariadb';
import { v7 as uuidv7 } from 'uuid';
import { inspect } from 'node:util';

interface SeedNode {
  code: string;
  name: string;
  nodeType: 'keystage' | 'subject' | 'strand' | 'topic' | 'learning_objective';
  depth: number;
  gradeLevel?: string;
  description?: string;
  isLeaf: boolean;
  parentCode?: string;
  platformSubjectCode?: string; // used for mapping to platform_subjects
}

interface SeedCurriculum {
  curriculumCode: string; // e.g. 'CA-ON', 'NG-BEC', 'NG-SSS', 'GB-NC'
  nodes: SeedNode[];
}

const seedData: SeedCurriculum[] = [
  // =========================================================================
  // 1. CANADA: Ontario Curriculum (CA-ON)
  // Governing Authority: Ontario Ministry of Education
  // =========================================================================
  {
    curriculumCode: 'CA-ON',
    nodes: [
      // -----------------------------------------------------------------------
      // Panel 1: Elementary Education (Grades 1-8)
      // -----------------------------------------------------------------------
      {
        code: 'CA-ON-ELEM',
        name: 'Elementary Education (Grades 1-8)',
        nodeType: 'keystage',
        depth: 0,
        gradeLevel: 'Grades 1-8',
        description: 'Ontario Ministry of Education elementary academic framework for foundational competencies.',
        isLeaf: false,
      },

      // Subject: Mathematics (Grades 1-8)
      {
        code: 'CA-ON-ELEM-MAT',
        name: 'Mathematics (Grades 1-8)',
        nodeType: 'subject',
        depth: 1,
        gradeLevel: 'Grades 1-8',
        description: 'Ontario elementary mathematics curriculum (2020) focusing on foundational number skills, spatial sense, and financial literacy.',
        isLeaf: false,
        parentCode: 'CA-ON-ELEM',
        platformSubjectCode: 'MAT',
      },
      // Strand: Number
      {
        code: 'CA-ON-ELEM-MAT-NUM',
        name: 'Strand B: Number',
        nodeType: 'strand',
        depth: 2,
        gradeLevel: 'Grades 1-8',
        description: 'Number sense, operations, mental math, fractions, decimals, ratios, and integers.',
        isLeaf: false,
        parentCode: 'CA-ON-ELEM-MAT',
      },
      {
        code: 'CA-ON-ELEM-MAT-NUM-01',
        name: 'Whole Numbers, Operations & Estimation',
        nodeType: 'topic',
        depth: 3,
        gradeLevel: 'Grades 1-8',
        description: 'Compose and decompose whole numbers up to 1,000,000 and apply standard multi-digit algorithms.',
        isLeaf: false,
        parentCode: 'CA-ON-ELEM-MAT-NUM',
      },
      {
        code: 'CA-ON-ELEM-MAT.1.1',
        name: 'Read, represent, compose, and decompose numbers up to 1,000,000',
        nodeType: 'learning_objective',
        depth: 4,
        gradeLevel: 'Grades 1-8',
        description: 'Demonstrate place value understanding across whole numbers, standard and expanded forms.',
        isLeaf: true,
        parentCode: 'CA-ON-ELEM-MAT-NUM-01',
      },
      {
        code: 'CA-ON-ELEM-MAT.1.2',
        name: 'Apply standard algorithms and mental math for multiplication and long division',
        nodeType: 'learning_objective',
        depth: 4,
        gradeLevel: 'Grades 1-8',
        description: 'Fluently multiply 3-digit by 2-digit numbers and divide multi-digit numbers with and without remainders.',
        isLeaf: true,
        parentCode: 'CA-ON-ELEM-MAT-NUM-01',
      },
      {
        code: 'CA-ON-ELEM-MAT-NUM-02',
        name: 'Fractions, Decimals, Ratios and Integers',
        nodeType: 'topic',
        depth: 3,
        gradeLevel: 'Grades 1-8',
        description: 'Equivalence, comparison, operations with rational numbers and positive/negative integers.',
        isLeaf: false,
        parentCode: 'CA-ON-ELEM-MAT-NUM',
      },
      {
        code: 'CA-ON-ELEM-MAT.1.3',
        name: 'Compare and order fractions, equivalent decimals, and percentages in contextual scenarios',
        nodeType: 'learning_objective',
        depth: 4,
        gradeLevel: 'Grades 1-8',
        description: 'Solve multi-step real-world problems involving fractional parts, rate conversions, and percents.',
        isLeaf: true,
        parentCode: 'CA-ON-ELEM-MAT-NUM-02',
      },

      // Strand: Algebra
      {
        code: 'CA-ON-ELEM-MAT-ALG',
        name: 'Strand C: Algebra and Coding',
        nodeType: 'strand',
        depth: 2,
        gradeLevel: 'Grades 1-8',
        description: 'Patterns, variables, linear expressions, equations, inequalities, and computational coding skills.',
        isLeaf: false,
        parentCode: 'CA-ON-ELEM-MAT',
      },
      {
        code: 'CA-ON-ELEM-MAT-ALG-01',
        name: 'Patterns, Equations and Inequalities',
        nodeType: 'topic',
        depth: 3,
        gradeLevel: 'Grades 1-8',
        description: 'Identify arithmetic and geometric patterns, formulate equations, and solve for unknowns.',
        isLeaf: false,
        parentCode: 'CA-ON-ELEM-MAT-ALG',
      },
      {
        code: 'CA-ON-ELEM-MAT.2.1',
        name: 'Model linear relations using tables of values, coordinate graphs, and algebraic equations',
        nodeType: 'learning_objective',
        depth: 4,
        gradeLevel: 'Grades 1-8',
        description: 'Translate patterns into algebraic equations of the form y = mx + b and interpret rate of change.',
        isLeaf: true,
        parentCode: 'CA-ON-ELEM-MAT-ALG-01',
      },
      {
        code: 'CA-ON-ELEM-MAT-ALG-02',
        name: 'Coding Concepts and Computational Thinking',
        nodeType: 'topic',
        depth: 3,
        gradeLevel: 'Grades 1-8',
        description: 'Design, write, alter, and debug code utilizing control structures, loops, and conditional statements.',
        isLeaf: false,
        parentCode: 'CA-ON-ELEM-MAT-ALG',
      },
      {
        code: 'CA-ON-ELEM-MAT.2.2',
        name: 'Execute, alter, and debug code involving nested conditional statements and repeated loops',
        nodeType: 'learning_objective',
        depth: 4,
        gradeLevel: 'Grades 1-8',
        description: 'Implement computational solutions to automated mathematical algorithms and data sorting.',
        isLeaf: true,
        parentCode: 'CA-ON-ELEM-MAT-ALG-02',
      },

      // Strand: Spatial Sense
      {
        code: 'CA-ON-ELEM-MAT-SPA',
        name: 'Strand E: Spatial Sense and Measurement',
        nodeType: 'strand',
        depth: 2,
        gradeLevel: 'Grades 1-8',
        description: 'Geometric properties, transformations, area, perimeter, surface area, and volume of composite objects.',
        isLeaf: false,
        parentCode: 'CA-ON-ELEM-MAT',
      },
      {
        code: 'CA-ON-ELEM-MAT-SPA-01',
        name: 'Geometric Reasoning and 3D Measurement',
        nodeType: 'topic',
        depth: 3,
        gradeLevel: 'Grades 1-8',
        description: 'Properties of polygons, circles, cylinders, prisms, and Pythagorean theorem applications.',
        isLeaf: false,
        parentCode: 'CA-ON-ELEM-MAT-SPA',
      },
      {
        code: 'CA-ON-ELEM-MAT.3.1',
        name: 'Calculate surface area and volume of prisms, pyramids, and cylinders',
        nodeType: 'learning_objective',
        depth: 4,
        gradeLevel: 'Grades 1-8',
        description: 'Apply metric formulas to decompose composite 3D objects and determine capacities.',
        isLeaf: true,
        parentCode: 'CA-ON-ELEM-MAT-SPA-01',
      },

      // Subject: Science & Technology (Grades 1-8)
      {
        code: 'CA-ON-ELEM-SCI',
        name: 'Science and Technology (Grades 1-8)',
        nodeType: 'subject',
        depth: 1,
        gradeLevel: 'Grades 1-8',
        description: 'Ontario elementary science curriculum (2022) with integrated STEM inquiry and engineering design.',
        isLeaf: false,
        parentCode: 'CA-ON-ELEM',
      },
      {
        code: 'CA-ON-ELEM-SCI-LIFE',
        name: 'Strand B: Life Systems',
        nodeType: 'strand',
        depth: 2,
        gradeLevel: 'Grades 1-8',
        description: 'Biodiversity, cell biology, plant and animal systems, and ecological sustainability.',
        isLeaf: false,
        parentCode: 'CA-ON-ELEM-SCI',
      },
      {
        code: 'CA-ON-ELEM-SCI-LIFE-01',
        name: 'Cells, Tissues and Human Organ Systems',
        nodeType: 'topic',
        depth: 3,
        gradeLevel: 'Grades 1-8',
        description: 'Structure and function of animal and plant cells, organ systems, and healthy development.',
        isLeaf: false,
        parentCode: 'CA-ON-ELEM-SCI-LIFE',
      },
      {
        code: 'CA-ON-ELEM-SCI.1.1',
        name: 'Compare organelle structures in animal and plant cells and explain specialized organ system functions',
        nodeType: 'learning_objective',
        depth: 4,
        gradeLevel: 'Grades 1-8',
        description: 'Investigate cell organelles under microscopes and model interactions in the circulatory and respiratory systems.',
        isLeaf: true,
        parentCode: 'CA-ON-ELEM-SCI-LIFE-01',
      },

      // Subject: Language / English (Grades 1-8)
      {
        code: 'CA-ON-ELEM-ENG',
        name: 'Language / English (Grades 1-8)',
        nodeType: 'subject',
        depth: 1,
        gradeLevel: 'Grades 1-8',
        description: 'Ontario Language curriculum (2023) focusing on foundational literacy, comprehension, and critical composition.',
        isLeaf: false,
        parentCode: 'CA-ON-ELEM',
        platformSubjectCode: 'ENG',
      },
      {
        code: 'CA-ON-ELEM-ENG-COMP',
        name: 'Strand D: Composition and Expressive Craft',
        nodeType: 'strand',
        depth: 2,
        gradeLevel: 'Grades 1-8',
        description: 'Expressing ideas through structured drafting, revision, rhetorical voice, and conventions.',
        isLeaf: false,
        parentCode: 'CA-ON-ELEM-ENG',
      },
      {
        code: 'CA-ON-ELEM-ENG-COMP-01',
        name: 'Writing Process and Rhetorical Conventions',
        nodeType: 'topic',
        depth: 3,
        gradeLevel: 'Grades 1-8',
        description: 'Drafting multi-paragraph expository, persuasive, and narrative texts with clear cohesion.',
        isLeaf: false,
        parentCode: 'CA-ON-ELEM-ENG-COMP',
      },
      {
        code: 'CA-ON-ELEM-ENG.1.1',
        name: 'Produce structured expository and persuasive texts utilizing transitions and standard conventions',
        nodeType: 'learning_objective',
        depth: 4,
        gradeLevel: 'Grades 1-8',
        description: 'Synthesize research evidence into reasoned multi-paragraph essays following grammatical accuracy.',
        isLeaf: true,
        parentCode: 'CA-ON-ELEM-ENG-COMP-01',
      },

      // -----------------------------------------------------------------------
      // Panel 2: Secondary Education (Grades 9-12)
      // -----------------------------------------------------------------------
      {
        code: 'CA-ON-SEC',
        name: 'Secondary Education (Grades 9-12)',
        nodeType: 'keystage',
        depth: 0,
        gradeLevel: 'Grades 9-12',
        description: 'Ontario Secondary School Diploma (OSSD) framework preparing students for post-secondary and careers.',
        isLeaf: false,
      },

      // Subject: Grade 9 Mathematics (MTH1W)
      {
        code: 'CA-ON-MTH1W',
        name: 'Mathematics, Grade 9 (De-streamed MTH1W)',
        nodeType: 'subject',
        depth: 1,
        gradeLevel: 'Grade 9',
        description: 'Ontario Ministry of Education Grade 9 de-streamed mathematics course focusing on algebraic reasoning and modelling.',
        isLeaf: false,
        parentCode: 'CA-ON-SEC',
        platformSubjectCode: 'MAT',
      },
      {
        code: 'CA-ON-MTH1W-ALG',
        name: 'Algebra, Coding and Linear Relations',
        nodeType: 'strand',
        depth: 2,
        gradeLevel: 'Grade 9',
        description: 'Development and application of algebraic reasoning, computational models, and equations.',
        isLeaf: false,
        parentCode: 'CA-ON-MTH1W',
      },
      {
        code: 'CA-ON-MTH1W-ALG-01',
        name: 'Linear and Non-Linear Relations',
        nodeType: 'topic',
        depth: 3,
        gradeLevel: 'Grade 9',
        description: 'Comparing linear and non-linear patterns through multiple representations.',
        isLeaf: false,
        parentCode: 'CA-ON-MTH1W-ALG',
      },
      {
        code: 'CA-ON-MTH1W.1.1',
        name: 'Model linear and non-linear scenarios using equations, tables, and graphs',
        nodeType: 'learning_objective',
        depth: 4,
        gradeLevel: 'Grade 9',
        description: 'Determine rates of change, initial values, and intercepts across varying representations.',
        isLeaf: true,
        parentCode: 'CA-ON-MTH1W-ALG-01',
      },
      {
        code: 'CA-ON-MTH1W.1.2',
        name: 'Solve first-degree linear equations with rational coefficients and rearrange formulas',
        nodeType: 'learning_objective',
        depth: 4,
        gradeLevel: 'Grade 9',
        description: 'Apply inverse operations and distributive laws to isolate unknown variables in applied problems.',
        isLeaf: true,
        parentCode: 'CA-ON-MTH1W-ALG-01',
      },

      // Subject: Grade 10 Principles of Mathematics (MPM2D)
      {
        code: 'CA-ON-MPM2D',
        name: 'Principles of Mathematics, Grade 10 (MPM2D)',
        nodeType: 'subject',
        depth: 1,
        gradeLevel: 'Grade 10',
        description: 'Academic grade 10 mathematics course exploring quadratic relations, analytic geometry, and trigonometry.',
        isLeaf: false,
        parentCode: 'CA-ON-SEC',
      },
      {
        code: 'CA-ON-MPM2D-QUAD',
        name: 'Quadratic Relations of the Form y = ax² + bx + c',
        nodeType: 'strand',
        depth: 2,
        gradeLevel: 'Grade 10',
        description: 'Properties of parabolas, algebraic expansion, factoring trinomials, and solving second-degree equations.',
        isLeaf: false,
        parentCode: 'CA-ON-MPM2D',
      },
      {
        code: 'CA-ON-MPM2D-QUAD-01',
        name: 'Factoring Trinomials and Quadratic Graphing',
        nodeType: 'topic',
        depth: 3,
        gradeLevel: 'Grade 10',
        description: 'Factoring quadratic expressions, finding zeros, and determining vertices in standard and vertex forms.',
        isLeaf: false,
        parentCode: 'CA-ON-MPM2D-QUAD',
      },
      {
        code: 'CA-ON-MPM2D.1.1',
        name: 'Factor difference of squares, perfect square trinomials, and general quadratic polynomials',
        nodeType: 'learning_objective',
        depth: 4,
        gradeLevel: 'Grade 10',
        description: 'Demonstrate proficiency factoring quadratics of the form ax² + bx + c using decomposition and inspection.',
        isLeaf: true,
        parentCode: 'CA-ON-MPM2D-QUAD-01',
      },
      {
        code: 'CA-ON-MPM2D.1.2',
        name: 'Graph quadratic relations and determine vertex, axis of symmetry, domain, and range',
        nodeType: 'learning_objective',
        depth: 4,
        gradeLevel: 'Grade 10',
        description: 'Complete the square to convert quadratic functions from standard to vertex form and sketch parabolas.',
        isLeaf: true,
        parentCode: 'CA-ON-MPM2D-QUAD-01',
      },

      // Subject: Grade 11 Functions (MCR3U)
      {
        code: 'CA-ON-MCR3U',
        name: 'Functions, Grade 11 (MCR3U)',
        nodeType: 'subject',
        depth: 1,
        gradeLevel: 'Grade 11',
        description: 'University preparation course exploring function notation, transformations, inverse functions, and trigonometry.',
        isLeaf: false,
        parentCode: 'CA-ON-SEC',
      },
      {
        code: 'CA-ON-MCR3U-FUNC',
        name: 'Function Properties and Transformations',
        nodeType: 'strand',
        depth: 2,
        gradeLevel: 'Grade 11',
        description: 'Characteristics of functions, domain, range, inverse functions, and graphical transformations.',
        isLeaf: false,
        parentCode: 'CA-ON-MCR3U',
      },
      {
        code: 'CA-ON-MCR3U-FUNC-01',
        name: 'Transformations of Functions y = a f(k(x - d)) + c',
        nodeType: 'topic',
        depth: 3,
        gradeLevel: 'Grade 11',
        description: 'Vertical and horizontal stretches, compressions, reflections, and translations.',
        isLeaf: false,
        parentCode: 'CA-ON-MCR3U-FUNC',
      },
      {
        code: 'CA-ON-MCR3U.1.1',
        name: 'Apply stretches, reflections, and translations to graph base functions and state domain/range',
        nodeType: 'learning_objective',
        depth: 4,
        gradeLevel: 'Grade 11',
        description: 'Determine exact coordinates of transformed points on radical, quadratic, and rational parent functions.',
        isLeaf: true,
        parentCode: 'CA-ON-MCR3U-FUNC-01',
      },

      // Subject: Grade 12 Advanced Functions & Calculus (MCV4U)
      {
        code: 'CA-ON-MCV4U',
        name: 'Calculus and Vectors, Grade 12 (MCV4U)',
        nodeType: 'subject',
        depth: 1,
        gradeLevel: 'Grade 12',
        description: 'Grade 12 university preparation calculus and vectors course for STEM programs.',
        isLeaf: false,
        parentCode: 'CA-ON-SEC',
      },
      {
        code: 'CA-ON-MCV4U-DERIV',
        name: 'Rates of Change and Differential Calculus',
        nodeType: 'strand',
        depth: 2,
        gradeLevel: 'Grade 12',
        description: 'Limits, first principles, derivative rules, optimization, and velocity/acceleration applications.',
        isLeaf: false,
        parentCode: 'CA-ON-MCV4U',
      },
      {
        code: 'CA-ON-MCV4U-DERIV-01',
        name: 'Limits and Derivative Theorems',
        nodeType: 'topic',
        depth: 3,
        gradeLevel: 'Grade 12',
        description: 'Evaluate limits analytically and apply power, product, quotient, and chain rules.',
        isLeaf: false,
        parentCode: 'CA-ON-MCV4U-DERIV',
      },
      {
        code: 'CA-ON-MCV4U.1.1',
        name: 'Differentiate polynomial and rational functions using product, quotient, and chain rules',
        nodeType: 'learning_objective',
        depth: 4,
        gradeLevel: 'Grade 12',
        description: 'Calculate instantaneous rate of change and find equations of tangent lines to algebraic curves.',
        isLeaf: true,
        parentCode: 'CA-ON-MCV4U-DERIV-01',
      },

      // Subject: Physics (Grades 11-12)
      {
        code: 'CA-ON-SPH',
        name: 'Physics (Grades 11-12, SPH3U/4U)',
        nodeType: 'subject',
        depth: 1,
        gradeLevel: 'Grades 11-12',
        description: 'Ontario secondary physics curriculum exploring kinematics, dynamics, energy, fields, and wave optics.',
        isLeaf: false,
        parentCode: 'CA-ON-SEC',
        platformSubjectCode: 'PHY',
      },
      {
        code: 'CA-ON-SPH-KIN',
        name: 'Kinematics and Dynamics',
        nodeType: 'strand',
        depth: 2,
        gradeLevel: 'Grades 11-12',
        description: 'Motion in two dimensions, vector analysis, Newton’s laws of motion, and frictional forces.',
        isLeaf: false,
        parentCode: 'CA-ON-SPH',
      },
      {
        code: 'CA-ON-SPH-KIN-01',
        name: 'Projectile Motion and Vector Kinematics',
        nodeType: 'topic',
        depth: 3,
        gradeLevel: 'Grades 11-12',
        description: 'Analyze horizontal and vertical components of objects launched under constant gravitational acceleration.',
        isLeaf: false,
        parentCode: 'CA-ON-SPH-KIN',
      },
      {
        code: 'CA-ON-SPH.1.1',
        name: 'Calculate maximum altitude, total flight time, and range for two-dimensional projectile motion',
        nodeType: 'learning_objective',
        depth: 4,
        gradeLevel: 'Grades 11-12',
        description: 'Decompose initial velocity vectors and apply kinematic equations to solve launch trajectory scenarios.',
        isLeaf: true,
        parentCode: 'CA-ON-SPH-KIN-01',
      },

      // Subject: Chemistry (Grades 11-12)
      {
        code: 'CA-ON-SCH',
        name: 'Chemistry (Grades 11-12, SCH3U/4U)',
        nodeType: 'subject',
        depth: 1,
        gradeLevel: 'Grades 11-12',
        description: 'Ontario secondary chemistry curriculum focusing on structure, stoichiometry, equilibrium, and organic chemistry.',
        isLeaf: false,
        parentCode: 'CA-ON-SEC',
        platformSubjectCode: 'CHEM',
      },
      {
        code: 'CA-ON-SCH-STOICH',
        name: 'Chemical Quantities and Stoichiometry',
        nodeType: 'strand',
        depth: 2,
        gradeLevel: 'Grades 11-12',
        description: 'The mole concept, empirical formulas, molarity, limiting reagents, and percentage yield.',
        isLeaf: false,
        parentCode: 'CA-ON-SCH',
      },
      {
        code: 'CA-ON-SCH-STOICH-01',
        name: 'The Mole Concept and Limiting Reagents',
        nodeType: 'topic',
        depth: 3,
        gradeLevel: 'Grades 11-12',
        description: 'Solve stoichiometric equations to predict yields and identify excess reactants in chemical syntheses.',
        isLeaf: false,
        parentCode: 'CA-ON-SCH-STOICH',
      },
      {
        code: 'CA-ON-SCH.1.1',
        name: 'Calculate theoretical yields, actual yields, and percentage yields in aqueous reactions',
        nodeType: 'learning_objective',
        depth: 4,
        gradeLevel: 'Grades 11-12',
        description: 'Apply molar ratios from balanced equations to calculate masses of products formed from limiting reactants.',
        isLeaf: true,
        parentCode: 'CA-ON-SCH-STOICH-01',
      },

      // Subject: Biology (Grades 11-12)
      {
        code: 'CA-ON-SBI',
        name: 'Biology (Grades 11-12, SBI3U/4U)',
        nodeType: 'subject',
        depth: 1,
        gradeLevel: 'Grades 11-12',
        description: 'Ontario secondary biology curriculum covering cellular metabolism, genetics, evolution, and physiology.',
        isLeaf: false,
        parentCode: 'CA-ON-SEC',
        platformSubjectCode: 'BIO',
      },
      {
        code: 'CA-ON-SBI-GEN',
        name: 'Molecular Genetics and Heredity',
        nodeType: 'strand',
        depth: 2,
        gradeLevel: 'Grades 11-12',
        description: 'DNA structure, replication mechanisms, transcription, translation, and genetic engineering.',
        isLeaf: false,
        parentCode: 'CA-ON-SBI',
      },
      {
        code: 'CA-ON-SBI-GEN-01',
        name: 'DNA Replication, Transcription and Translation',
        nodeType: 'topic',
        depth: 3,
        gradeLevel: 'Grades 11-12',
        description: 'Examine enzymatic processes of helicase, DNA polymerase, and ribosome polypeptide assembly.',
        isLeaf: false,
        parentCode: 'CA-ON-SBI-GEN',
      },
      {
        code: 'CA-ON-SBI.1.1',
        name: 'Model semi-conservative DNA replication and the steps of protein synthesis',
        nodeType: 'learning_objective',
        depth: 4,
        gradeLevel: 'Grades 11-12',
        description: 'Translate mRNA codons into amino acid sequences using standard genetic code tables.',
        isLeaf: true,
        parentCode: 'CA-ON-SBI-GEN-01',
      },

      // Subject: Computer Studies (Grades 10-12)
      {
        code: 'CA-ON-ICS',
        name: 'Computer Studies (Grades 10-12, ICS3U/4U)',
        nodeType: 'subject',
        depth: 1,
        gradeLevel: 'Grades 10-12',
        description: 'Ontario computer studies curriculum emphasizing object-oriented design, algorithms, and software development.',
        isLeaf: false,
        parentCode: 'CA-ON-SEC',
        platformSubjectCode: 'CSC',
      },
      {
        code: 'CA-ON-ICS-DEV',
        name: 'Software Development and Algorithms',
        nodeType: 'strand',
        depth: 2,
        gradeLevel: 'Grades 10-12',
        description: 'Object-oriented programming, encapsulation, inheritance, polymorphism, arrays, and sorting algorithms.',
        isLeaf: false,
        parentCode: 'CA-ON-ICS',
      },
      {
        code: 'CA-ON-ICS-DEV-01',
        name: 'Object-Oriented Programming and Data Structures',
        nodeType: 'topic',
        depth: 3,
        gradeLevel: 'Grades 10-12',
        description: 'Architecting classes, modular algorithms, array manipulation, and linear versus binary search.',
        isLeaf: false,
        parentCode: 'CA-ON-ICS-DEV',
      },
      {
        code: 'CA-ON-ICS.1.1',
        name: 'Design and implement classes with encapsulation, inheritance, and array processing algorithms',
        nodeType: 'learning_objective',
        depth: 4,
        gradeLevel: 'Grades 10-12',
        description: 'Construct maintainable modular applications adhering to code documentation and object-oriented principles.',
        isLeaf: true,
        parentCode: 'CA-ON-ICS-DEV-01',
      },
    ],
  },

  // =========================================================================
  // 2. NIGERIA: Basic Education Curriculum (NG-BEC)
  // Governing Authority: Nigerian Educational Research and Development Council (NERDC)
  // =========================================================================
  {
    curriculumCode: 'NG-BEC',
    nodes: [
      // -----------------------------------------------------------------------
      // Level 1: Middle Basic Education (Primary 4-6)
      // -----------------------------------------------------------------------
      {
        code: 'NG-BEC-MID',
        name: 'Middle Basic Education (Primary 4-6)',
        nodeType: 'keystage',
        depth: 0,
        gradeLevel: 'Primary 4-6',
        description: 'NERDC national curriculum for Nigerian middle basic education (Ages 9-12).',
        isLeaf: false,
      },
      // Subject: Mathematics (Primary 4-6)
      {
        code: 'NG-BEC-MID-MAT',
        name: 'Mathematics (Primary 4-6)',
        nodeType: 'subject',
        depth: 1,
        gradeLevel: 'Primary 4-6',
        description: 'Middle basic mathematics establishing numerical fluency, fractions, and everyday mensuration.',
        isLeaf: false,
        parentCode: 'NG-BEC-MID',
        platformSubjectCode: 'MAT',
      },
      {
        code: 'NG-BEC-MID-MAT-NUM',
        name: 'Theme: Number and Numeration',
        nodeType: 'strand',
        depth: 2,
        gradeLevel: 'Primary 4-6',
        description: 'Counting, place value up to 1,000,000, LCM, HCF, fractions, and decimal conversions.',
        isLeaf: false,
        parentCode: 'NG-BEC-MID-MAT',
      },
      {
        code: 'NG-BEC-MID-MAT-NUM-01',
        name: 'Place Value, Four Operations and Fractions',
        nodeType: 'topic',
        depth: 3,
        gradeLevel: 'Primary 4-6',
        description: 'Operations on multi-digit numbers, equivalent fractions, and practical decimal usage.',
        isLeaf: false,
        parentCode: 'NG-BEC-MID-MAT-NUM',
      },
      {
        code: 'NG-BEC-MID-MAT.1.1',
        name: 'Read, write, and compute operations on whole numbers up to one million',
        nodeType: 'learning_objective',
        depth: 4,
        gradeLevel: 'Primary 4-6',
        description: 'Solve addition, subtraction, multiplication, and division problems with whole numbers and money.',
        isLeaf: true,
        parentCode: 'NG-BEC-MID-MAT-NUM-01',
      },

      // Subject: English Studies (Primary 4-6)
      {
        code: 'NG-BEC-MID-ENG',
        name: 'English Studies (Primary 4-6)',
        nodeType: 'subject',
        depth: 1,
        gradeLevel: 'Primary 4-6',
        description: 'NERDC middle basic English curriculum covering reading comprehension, grammar, and writing.',
        isLeaf: false,
        parentCode: 'NG-BEC-MID',
        platformSubjectCode: 'ENG',
      },
      {
        code: 'NG-BEC-MID-ENG-GRAM',
        name: 'Theme: Grammatical Structure and Composition',
        nodeType: 'strand',
        depth: 2,
        gradeLevel: 'Primary 4-6',
        description: 'Parts of speech, tense agreements, punctuation, and continuous descriptive writing.',
        isLeaf: false,
        parentCode: 'NG-BEC-MID-ENG',
      },
      {
        code: 'NG-BEC-MID-ENG-GRAM-01',
        name: 'Sentence Types, Tenses and Concord',
        nodeType: 'topic',
        depth: 3,
        gradeLevel: 'Primary 4-6',
        description: 'Mastery of regular/irregular verbs, subject-verb agreement, and paragraph writing.',
        isLeaf: false,
        parentCode: 'NG-BEC-MID-ENG-GRAM',
      },
      {
        code: 'NG-BEC-MID-ENG.1.1',
        name: 'Construct grammatically accurate compound sentences applying correct tense concord',
        nodeType: 'learning_objective',
        depth: 4,
        gradeLevel: 'Primary 4-6',
        description: 'Apply past, present continuous, and future tenses accurately in written essays and letters.',
        isLeaf: true,
        parentCode: 'NG-BEC-MID-ENG-GRAM-01',
      },

      // -----------------------------------------------------------------------
      // Level 2: Upper Basic Education (Junior Secondary JSS 1-3)
      // -----------------------------------------------------------------------
      {
        code: 'NG-BEC-JSS',
        name: 'Upper Basic Education (Junior Secondary JSS 1-3)',
        nodeType: 'keystage',
        depth: 0,
        gradeLevel: 'JSS 1-3',
        description: 'NERDC national curriculum for Junior Secondary Education preparing students for the BECE.',
        isLeaf: false,
      },

      // Subject: General Mathematics (JSS 1-3)
      {
        code: 'NG-BEC-JSS-MAT',
        name: 'General Mathematics (JSS 1-3)',
        nodeType: 'subject',
        depth: 1,
        gradeLevel: 'JSS 1-3',
        description: 'Junior secondary mathematics curriculum covering algebra, geometry, mensuration, and statistics.',
        isLeaf: false,
        parentCode: 'NG-BEC-JSS',
        platformSubjectCode: 'MAT',
      },
      // Strand: Number and Numeration
      {
        code: 'NG-BEC-JSS-MAT-NUM',
        name: 'Theme: Number and Numeration',
        nodeType: 'strand',
        depth: 2,
        gradeLevel: 'JSS 1-3',
        description: 'Whole numbers, fractions, directed numbers, standard form, indices, and approximations.',
        isLeaf: false,
        parentCode: 'NG-BEC-JSS-MAT',
      },
      {
        code: 'NG-BEC-JSS-MAT-NUM-01',
        name: 'Standard Form, Directed Numbers and Indices',
        nodeType: 'topic',
        depth: 3,
        gradeLevel: 'JSS 1-3',
        description: 'Expressing numbers in standard form A x 10^n and arithmetic with positive and negative integers.',
        isLeaf: false,
        parentCode: 'NG-BEC-JSS-MAT-NUM',
      },
      {
        code: 'NG-BEC-JSS-MAT.1.1',
        name: 'Express numbers in standard scientific notation and compute operations on directed integers',
        nodeType: 'learning_objective',
        depth: 4,
        gradeLevel: 'JSS 1-3',
        description: 'Apply rules of standard form and solve integer expressions using number line representations.',
        isLeaf: true,
        parentCode: 'NG-BEC-JSS-MAT-NUM-01',
      },

      // Strand: Algebraic Processes
      {
        code: 'NG-BEC-JSS-MAT-ALG',
        name: 'Theme: Algebraic Processes',
        nodeType: 'strand',
        depth: 2,
        gradeLevel: 'JSS 1-3',
        description: 'Expansion of algebraic terms, factorization, linear equations, and linear inequalities.',
        isLeaf: false,
        parentCode: 'NG-BEC-JSS-MAT',
      },
      {
        code: 'NG-BEC-JSS-MAT-ALG-01',
        name: 'Expansion, Factorization and Linear Equations',
        nodeType: 'topic',
        depth: 3,
        gradeLevel: 'JSS 1-3',
        description: 'Multiply binomial expressions, factorize algebraic statements, and solve first-degree equations.',
        isLeaf: false,
        parentCode: 'NG-BEC-JSS-MAT-ALG',
      },
      {
        code: 'NG-BEC-JSS-MAT.2.1',
        name: 'Expand and factorize binomial expressions and solve linear equations in one variable',
        nodeType: 'learning_objective',
        depth: 4,
        gradeLevel: 'JSS 1-3',
        description: 'Expand expressions of the form (a + b)(c + d) and solve linear equations with brackets and fractions.',
        isLeaf: true,
        parentCode: 'NG-BEC-JSS-MAT-ALG-01',
      },
      {
        code: 'NG-BEC-JSS-MAT.2.2',
        name: 'Solve linear inequalities in one variable and plot solution intervals on a number line',
        nodeType: 'learning_objective',
        depth: 4,
        gradeLevel: 'JSS 1-3',
        description: 'Perform inequality operations taking into account sign reversals when multiplying by negatives.',
        isLeaf: true,
        parentCode: 'NG-BEC-JSS-MAT-ALG-01',
      },

      // Strand: Geometry and Mensuration
      {
        code: 'NG-BEC-JSS-MAT-GEO',
        name: 'Theme: Geometry and Mensuration',
        nodeType: 'strand',
        depth: 2,
        gradeLevel: 'JSS 1-3',
        description: 'Angles, convex polygons, geometric constructions, and area and volume of three-dimensional solids.',
        isLeaf: false,
        parentCode: 'NG-BEC-JSS-MAT',
      },
      {
        code: 'NG-BEC-JSS-MAT-GEO-01',
        name: 'Angles, Polygons and Geometric Construction',
        nodeType: 'topic',
        depth: 3,
        gradeLevel: 'JSS 1-3',
        description: 'Properties of parallel lines, sum of angles in polygons, and ruler-and-compass constructions.',
        isLeaf: false,
        parentCode: 'NG-BEC-JSS-MAT-GEO',
      },
      {
        code: 'NG-BEC-JSS-MAT.3.1',
        name: 'Calculate sum of angles in convex polygons and construct 60°, 90°, and 45° angles',
        nodeType: 'learning_objective',
        depth: 4,
        gradeLevel: 'JSS 1-3',
        description: 'Apply (2n - 4) x 90° formula and bisect lines and angles using pairs of compasses.',
        isLeaf: true,
        parentCode: 'NG-BEC-JSS-MAT-GEO-01',
      },

      // Strand: Everyday Statistics
      {
        code: 'NG-BEC-JSS-MAT-STAT',
        name: 'Theme: Everyday Statistics and Probability',
        nodeType: 'strand',
        depth: 2,
        gradeLevel: 'JSS 1-3',
        description: 'Data collection, frequency tables, bar charts, pie charts, mean, median, mode, and simple probability.',
        isLeaf: false,
        parentCode: 'NG-BEC-JSS-MAT',
      },
      {
        code: 'NG-BEC-JSS-MAT-STAT-01',
        name: 'Data Presentation, Central Tendency and Probability',
        nodeType: 'topic',
        depth: 3,
        gradeLevel: 'JSS 1-3',
        description: 'Organize raw data into frequency distributions and calculate measures of central tendency.',
        isLeaf: false,
        parentCode: 'NG-BEC-JSS-MAT-STAT',
      },
      {
        code: 'NG-BEC-JSS-MAT.4.1',
        name: 'Construct frequency distributions and calculate mean, median, and mode for ungrouped data',
        nodeType: 'learning_objective',
        depth: 4,
        gradeLevel: 'JSS 1-3',
        description: 'Plot bar charts, pie charts, and determine the probability of mutually exclusive single events.',
        isLeaf: true,
        parentCode: 'NG-BEC-JSS-MAT-STAT-01',
      },

      // Subject: English Studies (JSS 1-3)
      {
        code: 'NG-BEC-JSS-ENG',
        name: 'English Studies (JSS 1-3)',
        nodeType: 'subject',
        depth: 1,
        gradeLevel: 'JSS 1-3',
        description: 'Upper basic English language curriculum covering comprehension, literature, syntax, and letter writing.',
        isLeaf: false,
        parentCode: 'NG-BEC-JSS',
        platformSubjectCode: 'ENG',
      },
      {
        code: 'NG-BEC-JSS-ENG-READ',
        name: 'Theme: Reading Comprehension and Literature',
        nodeType: 'strand',
        depth: 2,
        gradeLevel: 'JSS 1-3',
        description: 'Comprehending prose, poetry, drama, figures of speech, and vocabulary development.',
        isLeaf: false,
        parentCode: 'NG-BEC-JSS-ENG',
      },
      {
        code: 'NG-BEC-JSS-ENG-READ-01',
        name: 'Literary Appreciation and Critical Reading',
        nodeType: 'topic',
        depth: 3,
        gradeLevel: 'JSS 1-3',
        description: 'Identify themes, character traits, and literary devices in recommended Nigerian African literature.',
        isLeaf: false,
        parentCode: 'NG-BEC-JSS-ENG-READ',
      },
      {
        code: 'NG-BEC-JSS-ENG.1.1',
        name: 'Analyze theme, characterization, and figurative language in selected prose and poetry texts',
        nodeType: 'learning_objective',
        depth: 4,
        gradeLevel: 'JSS 1-3',
        description: 'Extract central messages and identify similes, metaphors, personifications, and irony in African literature.',
        isLeaf: true,
        parentCode: 'NG-BEC-JSS-ENG-READ-01',
      },

      // Subject: Basic Science & Technology (JSS 1-3)
      {
        code: 'NG-BEC-JSS-BST',
        name: 'Basic Science & Technology (JSS 1-3)',
        nodeType: 'subject',
        depth: 1,
        gradeLevel: 'JSS 1-3',
        description: 'Integrated upper basic science covering life processes, energy, machines, and digital technologies.',
        isLeaf: false,
        parentCode: 'NG-BEC-JSS',
      },
      {
        code: 'NG-BEC-JSS-BST-SCI',
        name: 'Theme: Energy, Work and Simple Machines',
        nodeType: 'strand',
        depth: 2,
        gradeLevel: 'JSS 1-3',
        description: 'Forms of energy, work done, gravitational potential and kinetic energy, and mechanical efficiency.',
        isLeaf: false,
        parentCode: 'NG-BEC-JSS-BST',
      },
      {
        code: 'NG-BEC-JSS-BST-SCI-01',
        name: 'Work, Energy, Power and Simple Machines',
        nodeType: 'topic',
        depth: 3,
        gradeLevel: 'JSS 1-3',
        description: 'Definitions, units (Joules, Watts), conversion of energy, and mechanical advantage of levers and pulleys.',
        isLeaf: false,
        parentCode: 'NG-BEC-JSS-BST-SCI',
      },
      {
        code: 'NG-BEC-JSS-BST.1.1',
        name: 'Calculate kinetic energy, potential energy, and mechanical advantage of simple machines',
        nodeType: 'learning_objective',
        depth: 4,
        gradeLevel: 'JSS 1-3',
        description: 'Apply work = force x distance, KE = 1/2 mv², and calculate efficiency in practical setups.',
        isLeaf: true,
        parentCode: 'NG-BEC-JSS-BST-SCI-01',
      },
      {
        code: 'NG-BEC-JSS-BST-ICT',
        name: 'Theme: Digital Technologies and Computer Studies',
        nodeType: 'strand',
        depth: 2,
        gradeLevel: 'JSS 1-3',
        description: 'Computer hardware, software classification, operating systems, and safe internet usage.',
        isLeaf: false,
        parentCode: 'NG-BEC-JSS-BST',
      },
      {
        code: 'NG-BEC-JSS-BST-ICT-01',
        name: 'System Unit Components and File Operations',
        nodeType: 'topic',
        depth: 3,
        gradeLevel: 'JSS 1-3',
        description: 'Identify CPU, RAM, ROM, storage devices, and perform file/folder directory management.',
        isLeaf: false,
        parentCode: 'NG-BEC-JSS-BST-ICT',
      },
      {
        code: 'NG-BEC-JSS-BST.2.1',
        name: 'Identify internal CPU hardware components and demonstrate directory management',
        nodeType: 'learning_objective',
        depth: 4,
        gradeLevel: 'JSS 1-3',
        description: 'Classify system software vs application software and practice safe digital ethics.',
        isLeaf: true,
        parentCode: 'NG-BEC-JSS-BST-ICT-01',
      },

      // Subject: Civic Education (JSS 1-3)
      {
        code: 'NG-BEC-JSS-CVE',
        name: 'Civic Education (JSS 1-3)',
        nodeType: 'subject',
        depth: 1,
        gradeLevel: 'JSS 1-3',
        description: 'National values, democratic governance, constitutional rights, and citizen duties in Nigeria.',
        isLeaf: false,
        parentCode: 'NG-BEC-JSS',
        platformSubjectCode: 'CVE',
      },
      {
        code: 'NG-BEC-JSS-CVE-VAL',
        name: 'Theme: National Values, Citizenship and Rule of Law',
        nodeType: 'strand',
        depth: 2,
        gradeLevel: 'JSS 1-3',
        description: 'Integrity, discipline, national symbols, pillars of democracy, and human rights protection.',
        isLeaf: false,
        parentCode: 'NG-BEC-JSS-CVE',
      },
      {
        code: 'NG-BEC-JSS-CVE-VAL-01',
        name: 'Democratic Principles and Constitutional Rights',
        nodeType: 'topic',
        depth: 3,
        gradeLevel: 'JSS 1-3',
        description: 'Examine constitutional rights and civic duties enshrined in the 1999 Constitution of Nigeria.',
        isLeaf: false,
        parentCode: 'NG-BEC-JSS-CVE-VAL',
      },
      {
        code: 'NG-BEC-JSS-CVE.1.1',
        name: 'Explain fundamental human rights, citizen duties, and democratic rule of law in Nigeria',
        nodeType: 'learning_objective',
        depth: 4,
        gradeLevel: 'JSS 1-3',
        description: 'Analyze fundamental human rights, constitutional limitations, and voting procedures in free elections.',
        isLeaf: true,
        parentCode: 'NG-BEC-JSS-CVE-VAL-01',
      },
    ],
  },

  // =========================================================================
  // 3. NIGERIA: Senior Secondary Education Curriculum (NG-SSS)
  // Governing Authority: Nigerian Educational Research and Development Council (NERDC)
  // =========================================================================
  {
    curriculumCode: 'NG-SSS',
    nodes: [
      // -----------------------------------------------------------------------
      // Level: Senior Secondary Education (SSS 1-3)
      // -----------------------------------------------------------------------
      {
        code: 'NG-SSS-MAIN',
        name: 'Senior Secondary Education (SSS 1-3)',
        nodeType: 'keystage',
        depth: 0,
        gradeLevel: 'SSS 1-3',
        description: 'NERDC national Senior Secondary curriculum preparing learners for WASSCE, SSCE, and university matriculation.',
        isLeaf: false,
      },

      // ==================== Subject 1: General Mathematics ====================
      {
        code: 'NG-SSS-MAT',
        name: 'General Mathematics (SSS 1-3)',
        nodeType: 'subject',
        depth: 1,
        gradeLevel: 'SSS 1-3',
        description: 'Core mathematics curriculum approved by NERDC for Nigerian Senior Secondary schools.',
        isLeaf: false,
        parentCode: 'NG-SSS-MAIN',
        platformSubjectCode: 'MAT',
      },
      // Strand: Number and Numeration
      {
        code: 'NG-SSS-MAT-NUM',
        name: 'Theme 1: Number and Numeration',
        nodeType: 'strand',
        depth: 2,
        gradeLevel: 'SSS 1-3',
        description: 'Logarithms, indices, surds, matrices, modular arithmetic, and arithmetic & geometric progressions.',
        isLeaf: false,
        parentCode: 'NG-SSS-MAT',
      },
      {
        code: 'NG-SSS-MAT-NUM-01',
        name: 'Logarithms, Indices and Surds',
        nodeType: 'topic',
        depth: 3,
        gradeLevel: 'SSS 1-3',
        description: 'Calculations with base-10 logarithms, fractional index laws, and rationalization of binomial surds.',
        isLeaf: false,
        parentCode: 'NG-SSS-MAT-NUM',
      },
      {
        code: 'NG-SSS-MAT.1.1',
        name: 'Evaluate computations using logarithm tables and rationalize denominators involving surds',
        nodeType: 'learning_objective',
        depth: 4,
        gradeLevel: 'SSS 1-3',
        description: 'Simplify complex algebraic expressions with surds and apply logarithm laws to solve equations.',
        isLeaf: true,
        parentCode: 'NG-SSS-MAT-NUM-01',
      },
      {
        code: 'NG-SSS-MAT-NUM-02',
        name: 'Sequences and Series (AP & GP)',
        nodeType: 'topic',
        depth: 3,
        gradeLevel: 'SSS 1-3',
        description: 'Linear and exponential progressions, nth term derivations, and sum to infinity.',
        isLeaf: false,
        parentCode: 'NG-SSS-MAT-NUM',
      },
      {
        code: 'NG-SSS-MAT.1.2',
        name: 'Derive nth term formulas and calculate sum of arithmetic and geometric series',
        nodeType: 'learning_objective',
        depth: 4,
        gradeLevel: 'SSS 1-3',
        description: 'Apply Sn = n/2[2a + (n-1)d] and Sn = a(1 - r^n)/(1 - r) to financial investments and population growth.',
        isLeaf: true,
        parentCode: 'NG-SSS-MAT-NUM-02',
      },

      // Strand: Algebraic Processes
      {
        code: 'NG-SSS-MAT-ALG',
        name: 'Theme 2: Algebraic Processes',
        nodeType: 'strand',
        depth: 2,
        gradeLevel: 'SSS 1-3',
        description: 'Quadratic equations, simultaneous linear and non-linear equations, variations, and polynomials.',
        isLeaf: false,
        parentCode: 'NG-SSS-MAT',
      },
      {
        code: 'NG-SSS-MAT-ALG-01',
        name: 'Quadratic Equations and Variations',
        nodeType: 'topic',
        depth: 3,
        gradeLevel: 'SSS 1-3',
        description: 'Completing the square, quadratic formula, nature of roots, and direct/inverse/joint variations.',
        isLeaf: false,
        parentCode: 'NG-SSS-MAT-ALG',
      },
      {
        code: 'NG-SSS-MAT.2.1',
        name: 'Solve pairs of simultaneous equations where one is linear and one quadratic',
        nodeType: 'learning_objective',
        depth: 4,
        gradeLevel: 'SSS 1-3',
        description: 'Substitute linear expressions into second-degree polynomials to determine intersection coordinates.',
        isLeaf: true,
        parentCode: 'NG-SSS-MAT-ALG-01',
      },
      {
        code: 'NG-SSS-MAT.2.2',
        name: 'Formulate and solve direct, inverse, joint, and partial variation equations',
        nodeType: 'learning_objective',
        depth: 4,
        gradeLevel: 'SSS 1-3',
        description: 'Calculate variation constants from given empirical conditions and evaluate dependent parameters.',
        isLeaf: true,
        parentCode: 'NG-SSS-MAT-ALG-01',
      },

      // Strand: Geometry and Trigonometry
      {
        code: 'NG-SSS-MAT-GEO',
        name: 'Theme 3: Geometry and Trigonometry',
        nodeType: 'strand',
        depth: 2,
        gradeLevel: 'SSS 1-3',
        description: 'Circle theorems, cyclic quadrilaterals, sine and cosine rules, three-figure bearings, and distances.',
        isLeaf: false,
        parentCode: 'NG-SSS-MAT',
      },
      {
        code: 'NG-SSS-MAT-GEO-01',
        name: 'Circle Theorems and Trigonometric Rules',
        nodeType: 'topic',
        depth: 3,
        gradeLevel: 'SSS 1-3',
        description: 'Proof and application of Euclidean circle theorems, Sine Law, and Cosine Law.',
        isLeaf: false,
        parentCode: 'NG-SSS-MAT-GEO',
      },
      {
        code: 'NG-SSS-MAT.3.1',
        name: 'Prove circle theorems and solve acute and obtuse triangles using Sine and Cosine rules',
        nodeType: 'learning_objective',
        depth: 4,
        gradeLevel: 'SSS 1-3',
        description: 'Calculate angles subtended at circumference, tangent properties, and bearings of non-right-angled triangles.',
        isLeaf: true,
        parentCode: 'NG-SSS-MAT-GEO-01',
      },

      // Strand: Statistics and Probability
      {
        code: 'NG-SSS-MAT-STAT',
        name: 'Theme 4: Statistics and Probability',
        nodeType: 'strand',
        depth: 2,
        gradeLevel: 'SSS 1-3',
        description: 'Measures of dispersion for grouped data, standard deviation, cumulative frequency, and permutations.',
        isLeaf: false,
        parentCode: 'NG-SSS-MAT',
      },
      {
        code: 'NG-SSS-MAT-STAT-01',
        name: 'Grouped Data Dispersion and Compound Probability',
        nodeType: 'topic',
        depth: 3,
        gradeLevel: 'SSS 1-3',
        description: 'Mean deviation, variance, standard deviation of grouped data, and probability of independent events.',
        isLeaf: false,
        parentCode: 'NG-SSS-MAT-STAT',
      },
      {
        code: 'NG-SSS-MAT.4.1',
        name: 'Calculate variance and standard deviation for grouped continuous frequency distributions',
        nodeType: 'learning_objective',
        depth: 4,
        gradeLevel: 'SSS 1-3',
        description: 'Construct cumulative frequency curves (ogive) to estimate quartiles and solve addition/multiplication probability rules.',
        isLeaf: true,
        parentCode: 'NG-SSS-MAT-STAT-01',
      },

      // Strand: Introductory Calculus
      {
        code: 'NG-SSS-MAT-CALC',
        name: 'Theme 5: Introductory Calculus',
        nodeType: 'strand',
        depth: 2,
        gradeLevel: 'SSS 1-3',
        description: 'Differentiation of algebraic polynomials, rate of change, turning points, and basic integration.',
        isLeaf: false,
        parentCode: 'NG-SSS-MAT',
      },
      {
        code: 'NG-SSS-MAT-CALC-01',
        name: 'Differentiation and Integration of Polynomials',
        nodeType: 'topic',
        depth: 3,
        gradeLevel: 'SSS 1-3',
        description: 'Derivative rules, gradient of a curve, maximum and minimum values, and definite integrals.',
        isLeaf: false,
        parentCode: 'NG-SSS-MAT-CALC',
      },
      {
        code: 'NG-SSS-MAT.5.1',
        name: 'Differentiate algebraic functions, determine stationary points, and evaluate definite integrals',
        nodeType: 'learning_objective',
        depth: 4,
        gradeLevel: 'SSS 1-3',
        description: 'Apply d/dx (ax^n) = n ax^(n-1), test for maximum/minimum with second derivative, and calculate area under curves.',
        isLeaf: true,
        parentCode: 'NG-SSS-MAT-CALC-01',
      },

      // ==================== Subject 2: Physics ====================
      {
        code: 'NG-SSS-PHY',
        name: 'Physics (SSS 1-3)',
        nodeType: 'subject',
        depth: 1,
        gradeLevel: 'SSS 1-3',
        description: 'Senior Secondary Physics curriculum covering mechanics, conservation laws, waves, electromagnetism, and atomic physics.',
        isLeaf: false,
        parentCode: 'NG-SSS-MAIN',
        platformSubjectCode: 'PHY',
      },
      // Strand: Mechanics and Motion
      {
        code: 'NG-SSS-PHY-MAT',
        name: 'Theme 1: Interaction of Matter, Space and Time',
        nodeType: 'strand',
        depth: 2,
        gradeLevel: 'SSS 1-3',
        description: 'Units, vectors, uniformly accelerated motion, projectiles, equilibrium of coplanar forces, and circular motion.',
        isLeaf: false,
        parentCode: 'NG-SSS-PHY',
      },
      {
        code: 'NG-SSS-PHY-MAT-01',
        name: 'Uniformly Accelerated Motion and Projectiles',
        nodeType: 'topic',
        depth: 3,
        gradeLevel: 'SSS 1-3',
        description: 'Equations of linear motion, velocity-time curves, and parabolic trajectory analysis.',
        isLeaf: false,
        parentCode: 'NG-SSS-PHY-MAT',
      },
      {
        code: 'NG-SSS-PHY.1.1',
        name: 'Derive equations of motion and compute range, maximum height, and time of flight for projectiles',
        nodeType: 'learning_objective',
        depth: 4,
        gradeLevel: 'SSS 1-3',
        description: 'Apply kinematic vector equations to resolve velocity components and predict projectile landing coordinates.',
        isLeaf: true,
        parentCode: 'NG-SSS-PHY-MAT-01',
      },
      // Strand: Conservation Principles
      {
        code: 'NG-SSS-PHY-CONS',
        name: 'Theme 2: Conservation Principles',
        nodeType: 'strand',
        depth: 2,
        gradeLevel: 'SSS 1-3',
        description: 'Work, energy, power, conservation of linear momentum, impulse, and mechanical machines.',
        isLeaf: false,
        parentCode: 'NG-SSS-PHY',
      },
      {
        code: 'NG-SSS-PHY-CONS-01',
        name: 'Linear Momentum, Collisions and Energy Conservation',
        nodeType: 'topic',
        depth: 3,
        gradeLevel: 'SSS 1-3',
        description: 'Conservation of linear momentum in one and two dimensions, impulse, and elastic versus inelastic collisions.',
        isLeaf: false,
        parentCode: 'NG-SSS-PHY-CONS',
      },
      {
        code: 'NG-SSS-PHY.2.1',
        name: 'State the law of conservation of momentum and solve elastic and inelastic collision problems',
        nodeType: 'learning_objective',
        depth: 4,
        gradeLevel: 'SSS 1-3',
        description: 'Calculate post-collision velocities and verify conservation of kinetic energy in isolated systems.',
        isLeaf: true,
        parentCode: 'NG-SSS-PHY-CONS-01',
      },
      // Strand: Waves and Optical Phenomena
      {
        code: 'NG-SSS-PHY-WAV',
        name: 'Theme 3: Waves and Optical Phenomena',
        nodeType: 'strand',
        depth: 2,
        gradeLevel: 'SSS 1-3',
        description: 'Transverse/longitudinal waves, sound, resonance, Snell’s law, refraction, lenses, and optical instruments.',
        isLeaf: false,
        parentCode: 'NG-SSS-PHY',
      },
      {
        code: 'NG-SSS-PHY-WAV-01',
        name: 'Wave Motion, Sound and Resonance in Pipes',
        nodeType: 'topic',
        depth: 3,
        gradeLevel: 'SSS 1-3',
        description: 'Wave equation v = fλ, harmonics, stationary waves, and sound frequencies in closed and open pipes.',
        isLeaf: false,
        parentCode: 'NG-SSS-PHY-WAV',
      },
      {
        code: 'NG-SSS-PHY.3.1',
        name: 'Apply v = fλ to calculate wave parameters and determine frequencies of harmonics in resonant pipes',
        nodeType: 'learning_objective',
        depth: 4,
        gradeLevel: 'SSS 1-3',
        description: 'Formulate fundamental and overtone wave equations for vibrating strings and organ pipes.',
        isLeaf: true,
        parentCode: 'NG-SSS-PHY-WAV-01',
      },
      // Strand: Fields and Electromagnetism
      {
        code: 'NG-SSS-PHY-EM',
        name: 'Theme 4: Fields and Electromagnetism',
        nodeType: 'strand',
        depth: 2,
        gradeLevel: 'SSS 1-3',
        description: 'Electric potential, Ohm’s law, Kirchhoff’s circuit rules, magnetic flux, and electromagnetic induction.',
        isLeaf: false,
        parentCode: 'NG-SSS-PHY',
      },
      {
        code: 'NG-SSS-PHY-EM-01',
        name: 'Electric Circuits, Magnetic Fields and Transformers',
        nodeType: 'topic',
        depth: 3,
        gradeLevel: 'SSS 1-3',
        description: 'Circuit analysis, magnetic force on currents, Faraday and Lenz laws, and transformer efficiency.',
        isLeaf: false,
        parentCode: 'NG-SSS-PHY-EM',
      },
      {
        code: 'NG-SSS-PHY.4.1',
        name: 'Apply Faraday’s and Lenz’s laws to electromagnetic induction and calculate transformer power efficiency',
        nodeType: 'learning_objective',
        depth: 4,
        gradeLevel: 'SSS 1-3',
        description: 'Relate primary and secondary coil turns to voltages and currents, determining energy losses.',
        isLeaf: true,
        parentCode: 'NG-SSS-PHY-EM-01',
      },

      // ==================== Subject 3: Chemistry ====================
      {
        code: 'NG-SSS-CHEM',
        name: 'Chemistry (SSS 1-3)',
        nodeType: 'subject',
        depth: 1,
        gradeLevel: 'SSS 1-3',
        description: 'NERDC Senior Secondary Chemistry curriculum covering atomic theory, stoichiometry, physical, and organic chemistry.',
        isLeaf: false,
        parentCode: 'NG-SSS-MAIN',
        platformSubjectCode: 'CHEM',
      },
      {
        code: 'NG-SSS-CHEM-ATOM',
        name: 'Theme 1: Atomic Structure and Chemical Bonding',
        nodeType: 'strand',
        depth: 2,
        gradeLevel: 'SSS 1-3',
        description: 'Subatomic particles, s p d f configurations, periodic table trends, and ionic/covalent bonding.',
        isLeaf: false,
        parentCode: 'NG-SSS-CHEM',
      },
      {
        code: 'NG-SSS-CHEM-ATOM-01',
        name: 'Electronic Configuration and Periodicity',
        nodeType: 'topic',
        depth: 3,
        gradeLevel: 'SSS 1-3',
        description: 'Aufbau principle, Hund’s rule, Pauli exclusion, and variations in atomic radius and electronegativity.',
        isLeaf: false,
        parentCode: 'NG-SSS-CHEM-ATOM',
      },
      {
        code: 'NG-SSS-CHEM.1.1',
        name: 'Write s, p, d, f electronic configurations for elements and explain periodic table trends',
        nodeType: 'learning_objective',
        depth: 4,
        gradeLevel: 'SSS 1-3',
        description: 'Correlate valence electron configurations with ionic charges, ionization potentials, and chemical reactivity.',
        isLeaf: true,
        parentCode: 'NG-SSS-CHEM-ATOM-01',
      },
      {
        code: 'NG-SSS-CHEM-STOICH',
        name: 'Theme 2: Stoichiometry and Gas Laws',
        nodeType: 'strand',
        depth: 2,
        gradeLevel: 'SSS 1-3',
        description: 'Boyle’s, Charles’, and ideal gas equations, the mole concept, empirical formulas, and titration.',
        isLeaf: false,
        parentCode: 'NG-SSS-CHEM',
      },
      {
        code: 'NG-SSS-CHEM-STOICH-01',
        name: 'Gas Laws and Volumetric Analysis',
        nodeType: 'topic',
        depth: 3,
        gradeLevel: 'SSS 1-3',
        description: 'Gas stoichiometry, molar volume at STP, and calculations from acid-base neutralization experiments.',
        isLeaf: false,
        parentCode: 'NG-SSS-CHEM-STOICH',
      },
      {
        code: 'NG-SSS-CHEM.2.1',
        name: 'Calculate reacting quantities and determine concentration and percentage purity from acid-base titrations',
        nodeType: 'learning_objective',
        depth: 4,
        gradeLevel: 'SSS 1-3',
        description: 'Apply molarity relationships (CaVa/CbVb = na/nb) to determine molecular mass of unknown anhydrous carbonates.',
        isLeaf: true,
        parentCode: 'NG-SSS-CHEM-STOICH-01',
      },
      {
        code: 'NG-SSS-CHEM-ORG',
        name: 'Theme 4: Organic Chemistry',
        nodeType: 'strand',
        depth: 2,
        gradeLevel: 'SSS 1-3',
        description: 'Hydrocarbons (alkanes, alkenes, alkynes, benzene), alkanols, alkanoic acids, esters, and soap manufacturing.',
        isLeaf: false,
        parentCode: 'NG-SSS-CHEM',
      },
      {
        code: 'NG-SSS-CHEM-ORG-01',
        name: 'Hydrocarbons: Alkanes, Alkenes and Alkynes',
        nodeType: 'topic',
        depth: 3,
        gradeLevel: 'SSS 1-3',
        description: 'Nomenclature, structural isomerism, fractional distillation of petroleum, and addition/substitution reactions.',
        isLeaf: false,
        parentCode: 'NG-SSS-CHEM-ORG',
      },
      {
        code: 'NG-SSS-CHEM.4.1',
        name: 'Name and draw structural isomers of hydrocarbons and write balanced organic reaction equations',
        nodeType: 'learning_objective',
        depth: 4,
        gradeLevel: 'SSS 1-3',
        description: 'Differentiate saturated from unsaturated hydrocarbons using bromine water and acidified KMnO4 tests.',
        isLeaf: true,
        parentCode: 'NG-SSS-CHEM-ORG-01',
      },

      // ==================== Subject 4: Biology ====================
      {
        code: 'NG-SSS-BIO',
        name: 'Biology (SSS 1-3)',
        nodeType: 'subject',
        depth: 1,
        gradeLevel: 'SSS 1-3',
        description: 'Senior Secondary Biology covering organization of life, cellular processes, organ systems, and genetics.',
        isLeaf: false,
        parentCode: 'NG-SSS-MAIN',
        platformSubjectCode: 'BIO',
      },
      {
        code: 'NG-SSS-BIO-CELL',
        name: 'Theme 1: Organization of Life and Cellular Processes',
        nodeType: 'strand',
        depth: 2,
        gradeLevel: 'SSS 1-3',
        description: 'Cell structure, organelle functions, diffusion, osmosis, plasmolysis, and tissue specialization.',
        isLeaf: false,
        parentCode: 'NG-SSS-BIO',
      },
      {
        code: 'NG-SSS-BIO-CELL-01',
        name: 'Cell Ultrastructure and Osmotic Transport',
        nodeType: 'topic',
        depth: 3,
        gradeLevel: 'SSS 1-3',
        description: 'Plant and animal cells under electron microscopy, semi-permeable membranes, and turgidity.',
        isLeaf: false,
        parentCode: 'NG-SSS-BIO-CELL',
      },
      {
        code: 'NG-SSS-BIO.1.1',
        name: 'Examine cell ultrastructure and explain mechanisms of osmosis, diffusion, and plasmolysis',
        nodeType: 'learning_objective',
        depth: 4,
        gradeLevel: 'SSS 1-3',
        description: 'Demonstrate osmotic pressure changes in living plant tissues placed in hypotonic and hypertonic solutions.',
        isLeaf: true,
        parentCode: 'NG-SSS-BIO-CELL-01',
      },
      {
        code: 'NG-SSS-BIO-GEN',
        name: 'Theme 4: Heredity and Genetics',
        nodeType: 'strand',
        depth: 2,
        gradeLevel: 'SSS 1-3',
        description: 'Mendelian inheritance, monohybrid and dihybrid crosses, chromosomes, DNA, and human blood groups.',
        isLeaf: false,
        parentCode: 'NG-SSS-BIO',
      },
      {
        code: 'NG-SSS-BIO-GEN-01',
        name: 'Mendelian Genetics and Genetic Crosses',
        nodeType: 'topic',
        depth: 3,
        gradeLevel: 'SSS 1-3',
        description: 'Alleles, dominant and recessive traits, Punnett squares, ABO blood typing, and sickle-cell gene inheritance.',
        isLeaf: false,
        parentCode: 'NG-SSS-BIO-GEN',
      },
      {
        code: 'NG-SSS-BIO.4.1',
        name: 'Solve genetic cross problems using Punnett squares and predict phenotypic/genotypic ratios',
        nodeType: 'learning_objective',
        depth: 4,
        gradeLevel: 'SSS 1-3',
        description: 'Determine genetic probability of offspring inheriting sickle cell anemia and rhesus factor incompatibilities.',
        isLeaf: true,
        parentCode: 'NG-SSS-BIO-GEN-01',
      },

      // ==================== Subject 5: English Language ====================
      {
        code: 'NG-SSS-ENG',
        name: 'English Language (SSS 1-3)',
        nodeType: 'subject',
        depth: 1,
        gradeLevel: 'SSS 1-3',
        description: 'Senior Secondary English curriculum covering phonology, lexis, complex clauses, summary, and composition.',
        isLeaf: false,
        parentCode: 'NG-SSS-MAIN',
        platformSubjectCode: 'ENG',
      },
      {
        code: 'NG-SSS-ENG-LEX',
        name: 'Theme 2: Lexis, Structure and Concord',
        nodeType: 'strand',
        depth: 2,
        gradeLevel: 'SSS 1-3',
        description: 'Complex sentence structures, relative/noun clauses, grammatical concord, phrasal verbs, and idioms.',
        isLeaf: false,
        parentCode: 'NG-SSS-ENG',
      },
      {
        code: 'NG-SSS-ENG-LEX-01',
        name: 'Clauses, Concord and Idiomatic Usage',
        nodeType: 'topic',
        depth: 3,
        gradeLevel: 'SSS 1-3',
        description: 'Identify grammatical functions of subordinate clauses and apply rules of notional and proximity concord.',
        isLeaf: false,
        parentCode: 'NG-SSS-ENG-LEX',
      },
      {
        code: 'NG-SSS-ENG.1.1',
        name: 'Identify grammatical names and functions of dependent clauses and apply rules of concord',
        nodeType: 'learning_objective',
        depth: 4,
        gradeLevel: 'SSS 1-3',
        description: 'Distinguish adjectival, adverbial, and noun clauses in complex prose sentences.',
        isLeaf: true,
        parentCode: 'NG-SSS-ENG-LEX-01',
      },
      {
        code: 'NG-SSS-ENG-SUM',
        name: 'Theme 3: Summary Writing and Composition',
        nodeType: 'strand',
        depth: 2,
        gradeLevel: 'SSS 1-3',
        description: 'Précis writing, isolating main points, eliminating extraneous details, and essay composition.',
        isLeaf: false,
        parentCode: 'NG-SSS-ENG',
      },
      {
        code: 'NG-SSS-ENG-SUM-01',
        name: 'Summary Writing and Formal Essay Craft',
        nodeType: 'topic',
        depth: 3,
        gradeLevel: 'SSS 1-3',
        description: 'Drafting concise précis from dense passages and composing formal argumentative and expository essays.',
        isLeaf: false,
        parentCode: 'NG-SSS-ENG-SUM',
      },
      {
        code: 'NG-SSS-ENG.3.1',
        name: 'Extract core propositions in specified sentences without lifting or extraneous explanations',
        nodeType: 'learning_objective',
        depth: 4,
        gradeLevel: 'SSS 1-3',
        description: 'Write coherent summaries meeting strict word counts and synthesize multiple viewpoints into structured essays.',
        isLeaf: true,
        parentCode: 'NG-SSS-ENG-SUM-01',
      },

      // ==================== Subject 6: Economics ====================
      {
        code: 'NG-SSS-ECO',
        name: 'Economics (SSS 1-3)',
        nodeType: 'subject',
        depth: 1,
        gradeLevel: 'SSS 1-3',
        description: 'Senior Secondary Economics curriculum covering price theory, production, national income, and trade.',
        isLeaf: false,
        parentCode: 'NG-SSS-MAIN',
        platformSubjectCode: 'ECO',
      },
      {
        code: 'NG-SSS-ECO-PRICE',
        name: 'Theme 1: Price Theory and Market Structures',
        nodeType: 'strand',
        depth: 2,
        gradeLevel: 'SSS 1-3',
        description: 'Demand, supply, price equilibrium, price elasticity of demand, and competitive vs monopoly markets.',
        isLeaf: false,
        parentCode: 'NG-SSS-ECO',
      },
      {
        code: 'NG-SSS-ECO-PRICE-01',
        name: 'Elasticity of Demand and Equilibrium Pricing',
        nodeType: 'topic',
        depth: 3,
        gradeLevel: 'SSS 1-3',
        description: 'Calculate price and income elasticity coefficients and analyze market adjustments to subsidies and tariffs.',
        isLeaf: false,
        parentCode: 'NG-SSS-ECO-PRICE',
      },
      {
        code: 'NG-SSS-ECO.1.1',
        name: 'Calculate price and cross elasticity of demand and graph market shifts from taxation',
        nodeType: 'learning_objective',
        depth: 4,
        gradeLevel: 'SSS 1-3',
        description: 'Interpret elastic, inelastic, and unitary curves and calculate consumer surplus at equilibrium.',
        isLeaf: true,
        parentCode: 'NG-SSS-ECO-PRICE-01',
      },

      // ==================== Subject 7: Civic Education ====================
      {
        code: 'NG-SSS-CVE',
        name: 'Civic Education (SSS 1-3)',
        nodeType: 'subject',
        depth: 1,
        gradeLevel: 'SSS 1-3',
        description: 'Senior Secondary Civic Education curriculum covering human rights, democracy, and national integrity.',
        isLeaf: false,
        parentCode: 'NG-SSS-MAIN',
        platformSubjectCode: 'CVE',
      },
      {
        code: 'NG-SSS-CVE-DEM',
        name: 'Theme 1: Democracy, Rule of Law and Human Rights',
        nodeType: 'strand',
        depth: 2,
        gradeLevel: 'SSS 1-3',
        description: 'Pillars of democracy, Universal Declaration of Human Rights, civic responsibilities, and electoral systems.',
        isLeaf: false,
        parentCode: 'NG-SSS-CVE',
      },
      {
        code: 'NG-SSS-CVE-DEM-01',
        name: 'Human Rights, Rule of Law and Democratic Delivery',
        nodeType: 'topic',
        depth: 3,
        gradeLevel: 'SSS 1-3',
        description: 'Evaluate fundamental freedoms, judicial independence, and citizens’ roles in safeguarding good governance.',
        isLeaf: false,
        parentCode: 'NG-SSS-CVE-DEM',
      },
      {
        code: 'NG-SSS-CVE.1.1',
        name: 'Analyze the seven core UDHR freedoms, constitutional rights, and electoral integrity in Nigeria',
        nodeType: 'learning_objective',
        depth: 4,
        gradeLevel: 'SSS 1-3',
        description: 'Critique factors causing human rights abuses and examine citizen mechanisms for legal redress.',
        isLeaf: true,
        parentCode: 'NG-SSS-CVE-DEM-01',
      },
    ],
  },

  // =========================================================================
  // 4. UNITED KINGDOM: National Curriculum (GB-NC)
  // Governing Authority: Department for Education
  // =========================================================================
  {
    curriculumCode: 'GB-NC',
    nodes: [
      {
        code: 'GB-KS3',
        name: 'Key Stage 3',
        nodeType: 'keystage',
        depth: 0,
        gradeLevel: 'Year 7-9',
        description: 'Lower secondary academic programme for England (Ages 11-14).',
        isLeaf: false,
      },
      {
        code: 'GB-KS4',
        name: 'Key Stage 4 (GCSE)',
        nodeType: 'keystage',
        depth: 0,
        gradeLevel: 'Year 10-11',
        description: 'Upper secondary national qualification programme for England (Ages 14-16).',
        isLeaf: false,
      },
      {
        code: 'GB-KS3-MAT',
        name: 'Mathematics',
        nodeType: 'subject',
        depth: 1,
        gradeLevel: 'Year 7-9',
        description: 'Key Stage 3 Mathematics covering fluency, mathematical reasoning, and problem solving.',
        isLeaf: false,
        parentCode: 'GB-KS3',
        platformSubjectCode: 'MAT',
      },
      {
        code: 'GB-KS3-ENG',
        name: 'English Language',
        nodeType: 'subject',
        depth: 1,
        gradeLevel: 'Year 7-9',
        description: 'Key Stage 3 English covering spoken language, reading, writing, and vocabulary.',
        isLeaf: false,
        parentCode: 'GB-KS3',
        platformSubjectCode: 'ENG',
      },
      {
        code: 'GB-KS4-MAT',
        name: 'Mathematics',
        nodeType: 'subject',
        depth: 1,
        gradeLevel: 'Year 10-11',
        description: 'GCSE Mathematics specification covering standard and higher tier curricula.',
        isLeaf: false,
        parentCode: 'GB-KS4',
        platformSubjectCode: 'MAT',
      },
      {
        code: 'GB-KS4-PHY',
        name: 'Physics',
        nodeType: 'subject',
        depth: 1,
        gradeLevel: 'Year 10-11',
        description: 'GCSE Physics covering forces, energy, waves, electricity, and magnetism.',
        isLeaf: false,
        parentCode: 'GB-KS4',
        platformSubjectCode: 'PHY',
      },
      {
        code: 'GB-KS4-MAT-ALG',
        name: 'Algebra',
        nodeType: 'strand',
        depth: 2,
        gradeLevel: 'Year 10-11',
        description: 'Expressions, linear and quadratic equations, simultaneous equations, sequences, and graphs.',
        isLeaf: false,
        parentCode: 'GB-KS4-MAT',
      },
      {
        code: 'GB-KS4-MAT-ALG-01',
        name: 'Linear Equations and Expressions',
        nodeType: 'topic',
        depth: 3,
        gradeLevel: 'Year 10-11',
        description: 'Solving linear equations with one unknown algebraically and graphically.',
        isLeaf: false,
        parentCode: 'GB-KS4-MAT-ALG',
      },
      {
        code: 'GB-KS4.1.1',
        name: 'Solve linear equations in one unknown algebraically including brackets and fractions',
        nodeType: 'learning_objective',
        depth: 4,
        gradeLevel: 'Year 10-11',
        description: 'Solve first-degree equations with integer and fractional coefficients.',
        isLeaf: true,
        parentCode: 'GB-KS4-MAT-ALG-01',
      },
      {
        code: 'GB-KS4-PHY-FOR',
        name: 'Forces and Motion',
        nodeType: 'strand',
        depth: 2,
        gradeLevel: 'Year 10-11',
        description: 'Scalar and vector quantities, velocity-time relationships, Newton’s laws, and momentum.',
        isLeaf: false,
        parentCode: 'GB-KS4-PHY',
      },
      {
        code: 'GB-KS4-PHY-FOR-01',
        name: "Newton's Laws and Momentum",
        nodeType: 'topic',
        depth: 3,
        gradeLevel: 'Year 10-11',
        description: 'Inertia, resultant force, acceleration, and conservation of linear momentum.',
        isLeaf: false,
        parentCode: 'GB-KS4-PHY-FOR',
      },
      {
        code: 'GB-KS4-PHY.1.1',
        name: 'Calculate resultant force and acceleration using Newton’s second law F = ma',
        nodeType: 'learning_objective',
        depth: 4,
        gradeLevel: 'Year 10-11',
        description: 'Determine relationship between force, mass and acceleration in one dimension.',
        isLeaf: true,
        parentCode: 'GB-KS4-PHY-FOR-01',
      },
    ],
  },
];

const url = process.env.DATABASE_URL;

if (!url) {
  throw new Error('DATABASE_URL is missing');
}

const parsed = new URL(url);

const connectionOptions = {
  host: parsed.hostname,
  port: Number(parsed.port || 3306),
  user: decodeURIComponent(parsed.username),
  password: decodeURIComponent(parsed.password),
  database: decodeURIComponent(parsed.pathname.slice(1)),
  connectionLimit: 5,
  connectTimeout: 5000,
  acquireTimeout: 15000,
  allowPublicKeyRetrieval: true,
};

async function main(): Promise<void> {
  const connection = await mariadb.createConnection(connectionOptions);

  try {
    // 1. Fetch all platform subjects to index by shortCode
    const rawPlatformSubjects: Array<{ id: string; shortCode: string }> =
      await connection.query('SELECT id, shortCode FROM platform_subjects');
    const platformSubjectMap = new Map<string, string>();
    for (const ps of rawPlatformSubjects) {
      platformSubjectMap.set(ps.shortCode, ps.id);
    }

    let totalNodesInserted = 0;
    let totalNodesUpdated = 0;
    let totalMappingsInserted = 0;

    for (const curriculum of seedData) {
      // Find curriculum profile
      const [profile]: Array<{ id: string }> = await connection.query(
        'SELECT id FROM curriculum_profiles WHERE shortCode = ?',
        [curriculum.curriculumCode],
      );

      if (!profile) {
        console.warn(`Curriculum profile ${curriculum.curriculumCode} not found in DB. Skipping.`);
        continue;
      }

      const curriculumId = profile.id;
      const codeToNodeMap = new Map<string, { id: string; path: string }>();

      // Fetch existing nodes for this curriculum to preserve IDs
      const existingNodes: Array<{ id: string; code: string; path: string }> =
        await connection.query(
          'SELECT id, code, path FROM curriculum_nodes WHERE curriculumId = ?',
          [curriculumId],
        );
      for (const en of existingNodes) {
        if (en.code) {
          codeToNodeMap.set(en.code, { id: en.id, path: en.path });
        }
      }

      // Sort nodes by depth (0, 1, 2, 3, 4) to ensure parents are inserted first
      const sortedNodes = [...curriculum.nodes].sort((a, b) => a.depth - b.depth);

      for (const node of sortedNodes) {
        let nodeId: string;
        let parentNodeId: string | null = null;
        let materializedPath: string;

        if (node.parentCode) {
          const parent = codeToNodeMap.get(node.parentCode);
          if (!parent) {
            throw new Error(
              `Parent node with code "${node.parentCode}" not found for "${node.code}"`,
            );
          }
          parentNodeId = parent.id;
        }

        const existing = codeToNodeMap.get(node.code);
        if (existing) {
          nodeId = existing.id;
          materializedPath = parentNodeId
            ? `${codeToNodeMap.get(node.parentCode!)!.path}${nodeId}/`
            : `/${nodeId}/`;

          await connection.query(
            `UPDATE curriculum_nodes
             SET parentNodeId = ?, name = ?, description = ?, gradeLevel = ?, depth = ?, path = ?, isLeaf = ?, isActive = true, updatedAt = NOW()
             WHERE id = ?`,
            [
              parentNodeId,
              node.name,
              node.description ?? null,
              node.gradeLevel ?? null,
              node.depth,
              materializedPath,
              node.isLeaf ? 1 : 0,
              nodeId,
            ],
          );
          totalNodesUpdated++;
        } else {
          nodeId = uuidv7();
          materializedPath = parentNodeId
            ? `${codeToNodeMap.get(node.parentCode!)!.path}${nodeId}/`
            : `/${nodeId}/`;

          await connection.query(
            `INSERT INTO curriculum_nodes (id, curriculumId, parentNodeId, nodeType, name, code, description, gradeLevel, depth, path, isLeaf, isActive, createdAt, updatedAt)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, true, NOW(), NOW())`,
            [
              nodeId,
              curriculumId,
              parentNodeId,
              node.nodeType,
              node.name,
              node.code,
              node.description ?? null,
              node.gradeLevel ?? null,
              node.depth,
              materializedPath,
              node.isLeaf ? 1 : 0,
            ],
          );
          totalNodesInserted++;
        }

        codeToNodeMap.set(node.code, { id: nodeId, path: materializedPath });

        // If this node represents a platform subject mapping
        if (node.platformSubjectCode && node.nodeType === 'subject') {
          const platformSubjectId = platformSubjectMap.get(node.platformSubjectCode);
          if (platformSubjectId) {
            await connection.query(
              `INSERT INTO subject_curriculum_mappings (id, platformSubjectId, curriculumId, subjectNodeId, createdAt)
               VALUES (?, ?, ?, ?, NOW())
               ON DUPLICATE KEY UPDATE subjectNodeId = VALUES(subjectNodeId)`,
              [uuidv7(), platformSubjectId, curriculumId, nodeId],
            );
            totalMappingsInserted++;
          }
        }
      }

      console.log(`✓ Seeded curriculum ${curriculum.curriculumCode}: ${curriculum.nodes.length} nodes processed.`);
    }

    console.log(
      `Done! Total new nodes inserted: ${totalNodesInserted}, updated: ${totalNodesUpdated}, mappings updated: ${totalMappingsInserted}.`,
    );
  } finally {
    await connection.end();
  }
}

main().catch((error: unknown) => {
  console.error(inspect(error, { depth: 10, colors: true }));
  process.exitCode = 1;
});
