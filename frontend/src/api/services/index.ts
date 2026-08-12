export { login } from './auth.service';
export { listCustomers, getCustomerById, createCustomer } from './customers.service';
export { listRequirements, getRequirementById, createRequirement, getSuggestedCandidates } from './requirements.service';
export { listRoles } from './roles.service';
export {
  listCandidates,
  getCandidateById,
  createCandidate,
  addCandidateSkill,
} from './candidates.service';
export {
  listAllocations,
  getAllocationById,
  createAllocation,
  updateAllocationStatus,
  recalculateMatchScore,
  addInterviewRound,
} from './allocations.service';
export {
  listMarginRecords,
  getMarginRecordById,
  createMarginRecord,
} from './margin-records.service';
export { getDashboardAggregates } from './dashboard.service';
