/**
 * Interview Phases and Success Criteria
 */

const SYSTEM_DESIGN_PHASES = {
  INITIALIZATION: 'INITIALIZATION',
  REQUIREMENTS_GATHERING: 'REQUIREMENTS_GATHERING',
  HIGH_LEVEL_DESIGN: 'HIGH_LEVEL_DESIGN',
  DEEP_DIVE: 'DEEP_DIVE',
  EVALUATION: 'EVALUATION'
};

const DSA_PHASES = {
  INITIALIZATION: 'INITIALIZATION',
  UNDERSTANDING: 'UNDERSTANDING',
  BRUTE_FORCE: 'BRUTE_FORCE',
  OPTIMIZATION: 'OPTIMIZATION',
  CODING: 'CODING',
  TESTING: 'TESTING',
  EVALUATION: 'EVALUATION'
};

const SUCCESS_CRITERIA = {
  [SYSTEM_DESIGN_PHASES.REQUIREMENTS_GATHERING]: {
    requiredFields: ['functionalRequirements', 'nonFunctionalRequirements', 'constraints'],
    minQuestions: 3
  },
  [SYSTEM_DESIGN_PHASES.HIGH_LEVEL_DESIGN]: {
    requiredComponents: 2, // At least 2 components in the graph
    hasDataFlow: true
  },
  [DSA_PHASES.UNDERSTANDING]: {
    coveredConstraints: ['timeComplexity', 'spaceComplexity', 'edgeCases'],
    askedClarifyingQuestions: true
  },
  [DSA_PHASES.BRUTE_FORCE]: {
    identifiedApproach: true,
    estimatedComplexity: true
  }
};

module.exports = {
  SYSTEM_DESIGN_PHASES,
  DSA_PHASES,
  SUCCESS_CRITERIA
};
