import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';

const STORAGE_KEY = 'training-admin-data';

const uuid = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2, 10);
};

export type TrainingStatus = 'not_started' | 'in_progress' | 'completed';
export type TestStatus = 'not_taken' | 'scheduled' | 'completed';
export type PostSessionStatus = 'pending' | 'submitted' | 'reviewed';

export interface TrainingModule {
  id: string;
  module_name: string;
  designations: string[];
  sub_module_title: string;
  content_url: string;
  content_type: string;
  file_name: string;
  slides_url: string;
  has_test: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Test {
  id: string;
  module_id: string;
  title: string;
  description: string;
  passing_score: number;
  duration_minutes: number;
  questions: Array<{
    id: string;
    question: string;
    options: string[];
    answer: number;
  }>;
}

export interface Employee {
  id: string;
  employee_id: string;
  name: string;
  phone_number: string;
  email: string;
  designation: string;
  department: string;
  date_of_joining: string;
  location: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Batch {
  id: string;
  title: string;
  description: string;
  is_published: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

export interface BatchEmployee {
  id: string;
  batch_id: string;
  employee_id: string;
  enrolled_at: string;
}

export interface BatchModule {
  id: string;
  batch_id: string;
  module_id: string;
  order_index: number;
  assigned_at: string;
}

export interface EmployeeProgress {
  id: string;
  employee_id: string;
  batch_id: string;
  module_id: string;
  status: TrainingStatus;
  progress_percentage: number;
  test_status: TestStatus;
  test_score: number | null;
  started_at: string | null;
  completed_at: string | null;
  last_accessed_at: string | null;
}

export interface PostSessionAssignment {
  id: string;
  batch_id: string;
  employee_id: string;
  module_id: string;
  assigned_at: string;
  due_date: string | null;
  submitted_at: string | null;
  status: PostSessionStatus;
  test_status: TestStatus;
  notes: string;
}

interface DataState {
  modules: TrainingModule[];
  tests: Test[];
  employees: Employee[];
  batches: Batch[];
  batchEmployees: BatchEmployee[];
  batchModules: BatchModule[];
  employeeProgress: EmployeeProgress[];
  postSessionAssignments: PostSessionAssignment[];
}

type DataContextType = DataState & {
  addModule: (input: Omit<TrainingModule, 'id' | 'created_at' | 'updated_at'>, test?: TestInput | null) => TrainingModule;
  updateModule: (id: string, updates: Partial<TrainingModule>, test?: TestInput | null) => void;
  deleteModule: (id: string) => void;
  addEmployee: (input: Omit<Employee, 'id' | 'created_at' | 'updated_at'>) => Employee;
  updateEmployee: (id: string, updates: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;
  importEmployees: (records: Array<Omit<Employee, 'id' | 'created_at' | 'updated_at'>>) => void;
  addBatch: (input: Omit<Batch, 'id' | 'created_at' | 'updated_at' | 'published_at'>) => Batch;
  updateBatch: (id: string, updates: Partial<Batch>) => void;
  deleteBatch: (id: string) => void;
  updateBatchEmployees: (batchId: string, employeeIds: string[]) => void;
  updateBatchModules: (batchId: string, moduleIds: string[]) => void;
  updateEmployeeProgress: (input: EmployeeProgress) => void;
  addPostSessionAssignment: (input: {
    batch_id: string;
    employee_id: string;
    module_id: string;
    test_status: TestStatus;
    status?: PostSessionStatus;
    assigned_at?: string;
    due_date?: string | null;
    submitted_at?: string | null;
    notes?: string;
  }) => PostSessionAssignment;
  updatePostSessionAssignment: (id: string, updates: Partial<PostSessionAssignment>) => void;
};

const now = (offsetHours = 0) => {
  const date = new Date();
  date.setHours(date.getHours() + offsetHours);
  return date.toISOString();
};

type TestInput = Omit<Test, 'module_id' | 'id'> & { id?: string };

const moduleSoftId = 'module-soft-communications';
const modulePoshId = 'module-posh-basics';
const moduleSalesId = 'module-sales-excellence';
const moduleCrmId = 'module-crm-mastery';
const moduleDigitalId = 'module-digital-marketing';
const moduleLeadershipId = 'module-leadership-essentials';
const moduleCyberId = 'module-cybersecurity-101';
const moduleDeiId = 'module-dei-foundations';
const moduleTimeMgmtId = 'module-time-management';
const moduleAdvNegId = 'module-advanced-negotiation';
const modulePrivacyId = 'module-data-privacy';

const employeeCxoId = 'employee-cxo-01';
const employeeDirectorId = 'employee-director-01';
const employeeManagerId = 'employee-manager-01';
const employeeSrExecId = 'employee-sr-exec-01';
const employeeExecId = 'employee-exec-01';
const employeeItId = 'employee-it-01';
const employeeFinanceId = 'employee-finance-01';
const employeeLegalId = 'employee-legal-01';
const employeeProductId = 'employee-product-01';
const employeeEngineerId = 'employee-engineer-01';
const employeeHr2Id = 'employee-hr-02';
const employeeOps2Id = 'employee-ops-02';
const employeeSales2Id = 'employee-sales-02';

const batchLeadershipId = 'batch-leadership-2024';
const batchSalesId = 'batch-sales-2024';
const batchOnboardMayId = 'batch-onboarding-may';
const batchSalesQ2Id = 'batch-sales-q2';
const batchComplianceSummerId = 'batch-compliance-summer';

const initialState: DataState = {
  modules: [
    {
      id: moduleSoftId,
      module_name: 'Soft Communications',
      designations: ['Manager'],
      sub_module_title: 'Executive Presence and Leadership Communication',
      content_url: '#',
      content_type: 'pdf',
      file_name: 'leadership-communication.pdf',
      slides_url: '',
      has_test: true,
      is_active: true,
      created_at: now(-120),
      updated_at: now(-120),
    },
    {
      id: modulePoshId,
      module_name: 'POSH',
      designations: ['Executive'],
      sub_module_title: 'Workplace Sensitivity Essentials',
      content_url: '#',
      content_type: 'ppt',
      file_name: 'posh-basics.pptx',
      slides_url: '',
      has_test: true,
      is_active: true,
      created_at: now(-90),
      updated_at: now(-90),
    },
    {
      id: moduleSalesId,
      module_name: 'Sales Excellence',
      designations: ['Senior Executive'],
      sub_module_title: 'Negotiation Frameworks',
      content_url: '#',
      content_type: 'pdf',
      file_name: 'negotiation-frameworks.pdf',
      slides_url: '',
      has_test: false,
      is_active: true,
      created_at: now(-60),
      updated_at: now(-60),
    },
    {
      id: moduleCrmId,
      module_name: 'CRM Mastery',
      designations: ['Executive'],
      sub_module_title: 'Pipeline Hygiene Basics',
      content_url: '#',
      content_type: 'pdf',
      file_name: 'pipeline-hygiene.pdf',
      slides_url: '',
      has_test: false,
      is_active: true,
      created_at: now(-30),
      updated_at: now(-30),
    },
    {
      id: moduleDigitalId,
      module_name: 'Digital Marketing',
      designations: ['Manager'],
      sub_module_title: 'Growth Reporting Playbook',
      content_url: '#',
      content_type: 'pdf',
      file_name: 'growth-reporting.pdf',
      slides_url: '',
      has_test: true,
      is_active: true,
      created_at: now(-15),
      updated_at: now(-15),
    },
    {
      id: moduleLeadershipId,
      module_name: 'Leadership Essentials',
      designations: ['CXO', 'Director'],
      sub_module_title: 'Decision Making Under Uncertainty',
      content_url: '#',
      content_type: 'pdf',
      file_name: 'decision-making.pdf',
      slides_url: 'slides/leadership-decision.pptx',
      has_test: true,
      is_active: true,
      created_at: now(-25),
      updated_at: now(-25),
    },
    {
      id: moduleCyberId,
      module_name: 'Cybersecurity 101',
      designations: ['Executive', 'Senior Executive'],
      sub_module_title: 'Phishing Awareness and Response',
      content_url: '#',
      content_type: 'pdf',
      file_name: 'phishing-awareness.pdf',
      slides_url: 'slides/cybersecurity-101.pptx',
      has_test: true,
      is_active: true,
      created_at: now(-22),
      updated_at: now(-22),
    },
    {
      id: moduleDeiId,
      module_name: 'DEI Foundations',
      designations: ['Manager', 'Executive'],
      sub_module_title: 'Inclusive Communication Practices',
      content_url: '#',
      content_type: 'doc',
      file_name: 'inclusive-communication.docx',
      slides_url: '',
      has_test: false,
      is_active: true,
      created_at: now(-20),
      updated_at: now(-20),
    },
    {
      id: moduleTimeMgmtId,
      module_name: 'Time Management',
      designations: ['Executive'],
      sub_module_title: 'Prioritization Frameworks',
      content_url: '#',
      content_type: 'pdf',
      file_name: 'prioritization-frameworks.pdf',
      slides_url: '',
      has_test: false,
      is_active: true,
      created_at: now(-18),
      updated_at: now(-18),
    },
    {
      id: moduleAdvNegId,
      module_name: 'Advanced Negotiation',
      designations: ['Director', 'Manager'],
      sub_module_title: 'Multi-Party Negotiation Strategies',
      content_url: '#',
      content_type: 'ppt',
      file_name: 'multi-party-negotiation.pptx',
      slides_url: 'slides/advanced-negotiation.pptx',
      has_test: true,
      is_active: true,
      created_at: now(-16),
      updated_at: now(-16),
    },
    {
      id: modulePrivacyId,
      module_name: 'Data Privacy',
      designations: ['CXO', 'Director', 'Manager'],
      sub_module_title: 'GDPR and CCPA Overview',
      content_url: '#',
      content_type: 'pdf',
      file_name: 'data-privacy-basics.pdf',
      slides_url: '',
      has_test: true,
      is_active: true,
      created_at: now(-14),
      updated_at: now(-14),
    },
  ],
  tests: [
    {
      id: 'test-soft-communications',
      module_id: moduleSoftId,
      title: 'Leadership Communication Quiz',
      description: 'Assess executive presence and leadership communication skills',
      passing_score: 70,
      duration_minutes: 15,
      questions: [
        {
          id: 'q1',
          question: 'What framework helps structure leadership messaging?',
          options: ['SOAP', 'STAR', 'AIDA', 'PEST'],
          answer: 1,
        },
        {
          id: 'q2',
          question: 'What is the recommended length for executive updates?',
          options: ['30 minutes', '15 minutes', '10 minutes', '20 minutes'],
          answer: 2,
        },
      ],
    },
    {
      id: 'test-posh',
      module_id: modulePoshId,
      title: 'POSH Compliance Check',
      description: 'Key concepts from the Workplace Sensitivity module',
      passing_score: 80,
      duration_minutes: 20,
      questions: [
        {
          id: 'q1',
          question: 'How many members must a POSH committee have?',
          options: ['At least 2', 'At least 4', 'Exactly 4', 'At least 3'],
          answer: 1,
        },
      ],
    },
    {
      id: 'test-digital',
      module_id: moduleDigitalId,
      title: 'Growth Reporting Assessment',
      description: 'Evaluate understanding of marketing growth metrics',
      passing_score: 75,
      duration_minutes: 25,
      questions: [
        {
          id: 'q1',
          question: 'Which metric best measures campaign efficiency?',
          options: ['CTR', 'CPA', 'Impressions', 'Reach'],
          answer: 1,
        },
      ],
    },
    {
      id: 'test-leadership',
      module_id: moduleLeadershipId,
      title: 'Leadership Under Pressure',
      description: 'Evaluate judgement and prioritization under uncertainty',
      passing_score: 70,
      duration_minutes: 20,
      questions: [
        { id: 'q1', question: 'Best first step in a crisis?', options: ['Pause', 'React', 'Delegate', 'Ignore'], answer: 0 },
      ],
    },
    {
      id: 'test-cyber',
      module_id: moduleCyberId,
      title: 'Cyber Hygiene Basics',
      description: 'Identify phishing and social engineering',
      passing_score: 80,
      duration_minutes: 15,
      questions: [
        { id: 'q1', question: 'Which is a phishing red flag?', options: ['Generic greeting', 'HTTPS link', 'Known sender', 'None'], answer: 0 },
      ],
    },
    {
      id: 'test-privacy',
      module_id: modulePrivacyId,
      title: 'Privacy Readiness',
      description: 'Core privacy frameworks and rights',
      passing_score: 75,
      duration_minutes: 25,
      questions: [
        { id: 'q1', question: 'Data subject rights include?', options: ['Erasure', 'Profit', 'Ownership', 'Liability'], answer: 0 },
      ],
    },
  ],
  employees: [
    {
      id: employeeCxoId,
      employee_id: 'EMP001',
      name: 'Jordan Blake',
      phone_number: '555-1001',
      email: 'jordan.blake@example.com',
      designation: 'CXO',
      department: 'Executive',
      date_of_joining: '2022-01-10',
      location: 'New York',
      is_active: true,
      created_at: now(-210),
      updated_at: now(-210),
    },
    {
      id: employeeDirectorId,
      employee_id: 'EMP002',
      name: 'Priya Mehta',
      phone_number: '555-1002',
      email: 'priya.mehta@example.com',
      designation: 'Director',
      department: 'Operations',
      date_of_joining: '2022-05-12',
      location: 'Chicago',
      is_active: true,
      created_at: now(-190),
      updated_at: now(-190),
    },
    {
      id: employeeManagerId,
      employee_id: 'EMP003',
      name: 'Marcus Lee',
      phone_number: '555-1003',
      email: 'marcus.lee@example.com',
      designation: 'Manager',
      department: 'Sales',
      date_of_joining: '2023-02-18',
      location: 'San Francisco',
      is_active: true,
      created_at: now(-150),
      updated_at: now(-150),
    },
    {
      id: employeeSrExecId,
      employee_id: 'EMP004',
      name: 'Elena Rodriguez',
      phone_number: '555-1004',
      email: 'elena.rodriguez@example.com',
      designation: 'Senior Executive',
      department: 'Marketing',
      date_of_joining: '2023-07-04',
      location: 'Austin',
      is_active: true,
      created_at: now(-90),
      updated_at: now(-90),
    },
    {
      id: employeeExecId,
      employee_id: 'EMP005',
      name: 'Devon Carter',
      phone_number: '555-1005',
      email: 'devon.carter@example.com',
      designation: 'Executive',
      department: 'Customer Success',
      date_of_joining: '2024-01-15',
      location: 'Seattle',
      is_active: true,
      created_at: now(-45),
      updated_at: now(-45),
    },
    {
      id: employeeItId,
      employee_id: 'EMP006',
      name: 'Sam Patel',
      phone_number: '555-1006',
      email: 'sam.patel@example.com',
      designation: 'Executive',
      department: 'IT',
      date_of_joining: '2024-02-10',
      location: 'Boston',
      is_active: true,
      created_at: now(-120),
      updated_at: now(-110),
    },
    {
      id: employeeFinanceId,
      employee_id: 'EMP007',
      name: 'Nina Alvarez',
      phone_number: '555-1007',
      email: 'nina.alvarez@example.com',
      designation: 'Senior Executive',
      department: 'Finance',
      date_of_joining: '2023-11-01',
      location: 'Miami',
      is_active: true,
      created_at: now(-100),
      updated_at: now(-100),
    },
    {
      id: employeeLegalId,
      employee_id: 'EMP008',
      name: 'Victor Huang',
      phone_number: '555-1008',
      email: 'victor.huang@example.com',
      designation: 'Director',
      department: 'Legal',
      date_of_joining: '2021-08-15',
      location: 'Los Angeles',
      is_active: true,
      created_at: now(-300),
      updated_at: now(-200),
    },
    {
      id: employeeProductId,
      employee_id: 'EMP009',
      name: 'Aisha Khan',
      phone_number: '555-1009',
      email: 'aisha.khan@example.com',
      designation: 'Manager',
      department: 'Product',
      date_of_joining: '2022-09-07',
      location: 'Denver',
      is_active: true,
      created_at: now(-180),
      updated_at: now(-160),
    },
    {
      id: employeeEngineerId,
      employee_id: 'EMP010',
      name: 'Diego Silva',
      phone_number: '555-1010',
      email: 'diego.silva@example.com',
      designation: 'Executive',
      department: 'Engineering',
      date_of_joining: '2024-03-12',
      location: 'Austin',
      is_active: true,
      created_at: now(-80),
      updated_at: now(-80),
    },
    {
      id: employeeHr2Id,
      employee_id: 'EMP011',
      name: 'Chloe Martin',
      phone_number: '555-1011',
      email: 'chloe.martin@example.com',
      designation: 'Executive',
      department: 'HR',
      date_of_joining: '2020-04-22',
      location: 'Seattle',
      is_active: false,
      created_at: now(-600),
      updated_at: now(-500),
    },
    {
      id: employeeOps2Id,
      employee_id: 'EMP012',
      name: 'Liam O’Connor',
      phone_number: '555-1012',
      email: 'liam.oconnor@example.com',
      designation: 'Manager',
      department: 'Operations',
      date_of_joining: '2021-03-03',
      location: 'Dublin',
      is_active: true,
      created_at: now(-500),
      updated_at: now(-400),
    },
    {
      id: employeeSales2Id,
      employee_id: 'EMP013',
      name: 'Emily Rogers',
      phone_number: '555-1013',
      email: 'emily.rogers@example.com',
      designation: 'Senior Executive',
      department: 'Sales',
      date_of_joining: '2022-12-19',
      location: 'Chicago',
      is_active: true,
      created_at: now(-140),
      updated_at: now(-120),
    },
  ],
  batches: [
    {
      id: batchLeadershipId,
      title: 'Q1 Leadership Immersion',
      description: 'Cross-functional leadership fundamentals for new managers',
      is_published: true,
      is_active: true,
      created_at: now(-80),
      updated_at: now(-60),
      published_at: now(-60),
    },
    {
      id: batchSalesId,
      title: 'Sales Mastery Spring Cohort',
      description: 'Negotiation and CRM workflows for sales teams',
      is_published: false,
      is_active: true,
      created_at: now(-40),
      updated_at: now(-30),
      published_at: null,
    },
    {
      id: batchOnboardMayId,
      title: 'May Onboarding Cohort',
      description: 'Orientation and foundations for new hires',
      is_published: true,
      is_active: true,
      created_at: now(-28),
      updated_at: now(-27),
      published_at: now(-27),
    },
    {
      id: batchSalesQ2Id,
      title: 'Q2 Sales Accelerator',
      description: 'Negotiation and time management toolkit',
      is_published: true,
      is_active: true,
      created_at: now(-26),
      updated_at: now(-24),
      published_at: now(-24),
    },
    {
      id: batchComplianceSummerId,
      title: 'Summer Compliance Wave',
      description: 'Privacy, security, and workplace safety',
      is_published: false,
      is_active: true,
      created_at: now(-23),
      updated_at: now(-23),
      published_at: null,
    },
  ],
  batchEmployees: [
    {
      id: 'be-1',
      batch_id: batchLeadershipId,
      employee_id: employeeManagerId,
      enrolled_at: now(-70),
    },
    {
      id: 'be-2',
      batch_id: batchLeadershipId,
      employee_id: employeeSrExecId,
      enrolled_at: now(-70),
    },
    {
      id: 'be-3',
      batch_id: batchSalesId,
      employee_id: employeeExecId,
      enrolled_at: now(-35),
    },
    { id: 'be-4', batch_id: batchOnboardMayId, employee_id: employeeItId, enrolled_at: now(-27) },
    { id: 'be-5', batch_id: batchOnboardMayId, employee_id: employeeEngineerId, enrolled_at: now(-27) },
    { id: 'be-6', batch_id: batchOnboardMayId, employee_id: employeeProductId, enrolled_at: now(-27) },
    { id: 'be-7', batch_id: batchSalesQ2Id, employee_id: employeeSales2Id, enrolled_at: now(-24) },
    { id: 'be-8', batch_id: batchSalesQ2Id, employee_id: employeeManagerId, enrolled_at: now(-24) },
    { id: 'be-9', batch_id: batchComplianceSummerId, employee_id: employeeFinanceId, enrolled_at: now(-22) },
    { id: 'be-10', batch_id: batchComplianceSummerId, employee_id: employeeLegalId, enrolled_at: now(-22) },
    { id: 'be-11', batch_id: batchComplianceSummerId, employee_id: employeeDirectorId, enrolled_at: now(-22) },
  ],
  batchModules: [
    {
      id: 'bm-1',
      batch_id: batchLeadershipId,
      module_id: moduleSoftId,
      order_index: 0,
      assigned_at: now(-70),
    },
    {
      id: 'bm-2',
      batch_id: batchLeadershipId,
      module_id: moduleDigitalId,
      order_index: 1,
      assigned_at: now(-68),
    },
    {
      id: 'bm-3',
      batch_id: batchSalesId,
      module_id: moduleSalesId,
      order_index: 0,
      assigned_at: now(-35),
    },
    {
      id: 'bm-4',
      batch_id: batchSalesId,
      module_id: moduleCrmId,
      order_index: 1,
      assigned_at: now(-32),
    },
    { id: 'bm-5', batch_id: batchOnboardMayId, module_id: moduleDeiId, order_index: 0, assigned_at: now(-27) },
    { id: 'bm-6', batch_id: batchOnboardMayId, module_id: moduleTimeMgmtId, order_index: 1, assigned_at: now(-27) },
    { id: 'bm-7', batch_id: batchSalesQ2Id, module_id: moduleAdvNegId, order_index: 0, assigned_at: now(-24) },
    { id: 'bm-8', batch_id: batchSalesQ2Id, module_id: moduleSalesId, order_index: 1, assigned_at: now(-24) },
    { id: 'bm-9', batch_id: batchComplianceSummerId, module_id: modulePrivacyId, order_index: 0, assigned_at: now(-22) },
    { id: 'bm-10', batch_id: batchComplianceSummerId, module_id: moduleCyberId, order_index: 1, assigned_at: now(-22) },
  ],
  employeeProgress: [
    {
      id: 'progress-1',
      employee_id: employeeManagerId,
      batch_id: batchLeadershipId,
      module_id: moduleSoftId,
      status: 'completed',
      progress_percentage: 100,
      test_status: 'completed',
      test_score: 85,
      started_at: now(-65),
      completed_at: now(-62),
      last_accessed_at: now(-62),
    },
    {
      id: 'progress-2',
      employee_id: employeeManagerId,
      batch_id: batchLeadershipId,
      module_id: moduleDigitalId,
      status: 'in_progress',
      progress_percentage: 60,
      test_status: 'scheduled',
      test_score: null,
      started_at: now(-61),
      completed_at: null,
      last_accessed_at: now(-1),
    },
    {
      id: 'progress-3',
      employee_id: employeeSrExecId,
      batch_id: batchLeadershipId,
      module_id: moduleSoftId,
      status: 'in_progress',
      progress_percentage: 40,
      test_status: 'scheduled',
      test_score: null,
      started_at: now(-64),
      completed_at: null,
      last_accessed_at: now(-2),
    },
    {
      id: 'progress-4',
      employee_id: employeeExecId,
      batch_id: batchSalesId,
      module_id: moduleSalesId,
      status: 'not_started',
      progress_percentage: 0,
      test_status: 'not_taken',
      test_score: null,
      started_at: null,
      completed_at: null,
      last_accessed_at: null,
    },
    {
      id: 'progress-5',
      employee_id: employeeExecId,
      batch_id: batchSalesId,
      module_id: moduleCrmId,
      status: 'not_started',
      progress_percentage: 0,
      test_status: 'not_taken',
      test_score: null,
      started_at: null,
      completed_at: null,
      last_accessed_at: null,
    },
    // Onboarding cohort
    {
      id: 'progress-6',
      employee_id: employeeItId,
      batch_id: batchOnboardMayId,
      module_id: moduleDeiId,
      status: 'completed',
      progress_percentage: 100,
      test_status: 'not_taken',
      test_score: null,
      started_at: now(-27),
      completed_at: now(-26),
      last_accessed_at: now(-26),
    },
    {
      id: 'progress-7',
      employee_id: employeeEngineerId,
      batch_id: batchOnboardMayId,
      module_id: moduleTimeMgmtId,
      status: 'in_progress',
      progress_percentage: 35,
      test_status: 'not_taken',
      test_score: null,
      started_at: now(-26),
      completed_at: null,
      last_accessed_at: now(-1),
    },
    // Sales Q2
    {
      id: 'progress-8',
      employee_id: employeeSales2Id,
      batch_id: batchSalesQ2Id,
      module_id: moduleAdvNegId,
      status: 'completed',
      progress_percentage: 100,
      test_status: 'completed',
      test_score: 92,
      started_at: now(-24),
      completed_at: now(-23),
      last_accessed_at: now(-23),
    },
    {
      id: 'progress-9',
      employee_id: employeeManagerId,
      batch_id: batchSalesQ2Id,
      module_id: moduleAdvNegId,
      status: 'in_progress',
      progress_percentage: 55,
      test_status: 'scheduled',
      test_score: null,
      started_at: now(-24),
      completed_at: null,
      last_accessed_at: now(-3),
    },
    {
      id: 'progress-10',
      employee_id: employeeManagerId,
      batch_id: batchSalesQ2Id,
      module_id: moduleSalesId,
      status: 'not_started',
      progress_percentage: 0,
      test_status: 'not_taken',
      test_score: null,
      started_at: null,
      completed_at: null,
      last_accessed_at: null,
    },
    // Compliance Summer
    {
      id: 'progress-11',
      employee_id: employeeFinanceId,
      batch_id: batchComplianceSummerId,
      module_id: modulePrivacyId,
      status: 'in_progress',
      progress_percentage: 20,
      test_status: 'not_taken',
      test_score: null,
      started_at: now(-21),
      completed_at: null,
      last_accessed_at: now(-2),
    },
    {
      id: 'progress-12',
      employee_id: employeeLegalId,
      batch_id: batchComplianceSummerId,
      module_id: modulePrivacyId,
      status: 'completed',
      progress_percentage: 100,
      test_status: 'completed',
      test_score: 88,
      started_at: now(-22),
      completed_at: now(-21),
      last_accessed_at: now(-21),
    },
    {
      id: 'progress-13',
      employee_id: employeeDirectorId,
      batch_id: batchComplianceSummerId,
      module_id: moduleCyberId,
      status: 'not_started',
      progress_percentage: 0,
      test_status: 'not_taken',
      test_score: null,
      started_at: null,
      completed_at: null,
      last_accessed_at: null,
    },
  ],
  postSessionAssignments: [
    {
      id: 'post-assignment-1',
      batch_id: batchLeadershipId,
      employee_id: employeeManagerId,
      module_id: moduleSoftId,
      assigned_at: now(-20),
      due_date: now(-14),
      submitted_at: now(-15),
      status: 'reviewed',
      test_status: 'completed',
      notes: 'Delivered leadership reflection deck and received coaching feedback.',
    },
    {
      id: 'post-assignment-2',
      batch_id: batchLeadershipId,
      employee_id: employeeSrExecId,
      module_id: moduleDigitalId,
      assigned_at: now(-12),
      due_date: now(-5),
      submitted_at: null,
      status: 'submitted',
      test_status: 'scheduled',
      notes: 'Awaiting analytics deep-dive presentation recording.',
    },
    {
      id: 'post-assignment-3',
      batch_id: batchSalesId,
      employee_id: employeeExecId,
      module_id: moduleCrmId,
      assigned_at: now(-8),
      due_date: now(3),
      submitted_at: null,
      status: 'pending',
      test_status: 'not_taken',
      notes: 'Prepare CRM pipeline clean-up checklist after module completion.',
    },
    {
      id: 'post-assignment-4',
      batch_id: batchOnboardMayId,
      employee_id: employeeItId,
      module_id: moduleDeiId,
      assigned_at: now(-27),
      due_date: now(-25),
      submitted_at: now(-26),
      status: 'reviewed',
      test_status: 'not_taken',
      notes: 'Great examples shared; action plan noted.',
    },
    {
      id: 'post-assignment-5',
      batch_id: batchSalesQ2Id,
      employee_id: employeeSales2Id,
      module_id: moduleAdvNegId,
      assigned_at: now(-24),
      due_date: now(-22),
      submitted_at: now(-23),
      status: 'reviewed',
      test_status: 'completed',
      notes: 'Applied frameworks to current pipeline successfully.',
    },
    {
      id: 'post-assignment-6',
      batch_id: batchComplianceSummerId,
      employee_id: employeeFinanceId,
      module_id: modulePrivacyId,
      assigned_at: now(-22),
      due_date: now(-15),
      submitted_at: null,
      status: 'pending',
      test_status: 'not_taken',
      notes: 'Compile departmental data map for privacy readiness.',
    },
  ],
};

const DataContext = createContext<DataContextType | undefined>(undefined);

const loadState = (): DataState => {
  if (typeof localStorage === 'undefined') {
    return initialState;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialState));
      return initialState;
    }
    const parsed = JSON.parse(stored) as DataState;
    const normalizeModules = (modules: TrainingModule[] | undefined): TrainingModule[] => {
      const fallback = modules && modules.length ? modules : initialState.modules;
      return fallback.map((module) => {
        const legacyDesignation = (module as TrainingModule & { designation?: string }).designation;
        const designations = Array.isArray((module as TrainingModule & { designations?: string[] }).designations)
          ? (module as TrainingModule & { designations: string[] }).designations
          : legacyDesignation
            ? [legacyDesignation]
            : [];
        return {
          ...module,
          designations,
        };
      });
    };

    return {
      ...initialState,
      ...parsed,
      modules: normalizeModules(parsed.modules),
    };
  } catch (error) {
    console.error('Failed to load local data store:', error);
    return initialState;
  }
};

const persistState = (state: DataState) => {
  if (typeof localStorage === 'undefined') {
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<DataState>(() => loadState());

  useEffect(() => {
    persistState(state);
  }, [state]);

  const contextValue = useMemo<DataContextType>(() => {
    const addModule: DataContextType['addModule'] = (input, test) => {
      const newModule: TrainingModule = {
        ...input,
        designations: [...input.designations],
        id: uuid(),
        created_at: now(),
        updated_at: now(),
      };

      setState((prev) => {
        const updated: DataState = {
          ...prev,
          modules: [newModule, ...prev.modules],
          tests: test
            ? [
                ...prev.tests,
                {
                  id: uuid(),
                  module_id: newModule.id,
                  title: test.title,
                  description: test.description,
                  passing_score: test.passing_score,
                  duration_minutes: test.duration_minutes,
                  questions: test.questions,
                },
              ]
            : prev.tests,
        };
        return updated;
      });

      return newModule;
    };

    const updateModule: DataContextType['updateModule'] = (id, updates, test) => {
      setState((prev) => {
        const moduleExists = prev.modules.find((m) => m.id === id);
        if (!moduleExists) return prev;

        const normalizedUpdates: Partial<TrainingModule> = updates.designations
          ? { ...updates, designations: [...updates.designations] }
          : updates;

        const updatedModules = prev.modules.map((module) =>
          module.id === id
            ? { ...module, ...normalizedUpdates, updated_at: now() }
            : module
        );

        let updatedTests = prev.tests;
        if (test === null) {
          updatedTests = prev.tests.filter((t) => t.module_id !== id);
        } else if (test) {
          const existingTest = prev.tests.find((t) => t.module_id === id);
          if (existingTest) {
            updatedTests = prev.tests.map((t) =>
              t.module_id === id
                ? {
                    ...existingTest,
                    title: test.title,
                    description: test.description,
                    passing_score: test.passing_score,
                    duration_minutes: test.duration_minutes,
                    questions: test.questions,
                  }
                : t
            );
          } else {
            updatedTests = [
              ...prev.tests,
              {
                id: uuid(),
                module_id: id,
                title: test.title,
                description: test.description,
                passing_score: test.passing_score,
                duration_minutes: test.duration_minutes,
                questions: test.questions,
              },
            ];
          }
        }

        return { ...prev, modules: updatedModules, tests: updatedTests };
      });
    };

    const deleteModule: DataContextType['deleteModule'] = (id) => {
      setState((prev) => ({
        ...prev,
        modules: prev.modules.filter((module) => module.id !== id),
        tests: prev.tests.filter((test) => test.module_id !== id),
        batchModules: prev.batchModules.filter((bm) => bm.module_id !== id),
        employeeProgress: prev.employeeProgress.filter((progress) => progress.module_id !== id),
        postSessionAssignments: prev.postSessionAssignments.filter((assignment) => assignment.module_id !== id),
      }));
    };

    const addEmployee: DataContextType['addEmployee'] = (input) => {
      const newEmployee: Employee = {
        ...input,
        id: uuid(),
        created_at: now(),
        updated_at: now(),
      };
      setState((prev) => ({
        ...prev,
        employees: [newEmployee, ...prev.employees],
      }));
      return newEmployee;
    };

    const updateEmployee: DataContextType['updateEmployee'] = (id, updates) => {
      setState((prev) => ({
        ...prev,
        employees: prev.employees.map((employee) =>
          employee.id === id ? { ...employee, ...updates, updated_at: now() } : employee
        ),
      }));
    };

    const deleteEmployee: DataContextType['deleteEmployee'] = (id) => {
      setState((prev) => ({
        ...prev,
        employees: prev.employees.filter((employee) => employee.id !== id),
        batchEmployees: prev.batchEmployees.filter((be) => be.employee_id !== id),
        employeeProgress: prev.employeeProgress.filter((progress) => progress.employee_id !== id),
        postSessionAssignments: prev.postSessionAssignments.filter((assignment) => assignment.employee_id !== id),
      }));
    };

    const importEmployees: DataContextType['importEmployees'] = (records) => {
      const newEmployees = records.map((record) => ({
        ...record,
        id: uuid(),
        created_at: now(),
        updated_at: now(),
      }));
      setState((prev) => ({
        ...prev,
        employees: [...newEmployees, ...prev.employees],
      }));
    };

    const addBatch: DataContextType['addBatch'] = (input) => {
      const batch: Batch = {
        ...input,
        id: uuid(),
        created_at: now(),
        updated_at: now(),
        published_at: input.is_published ? now() : null,
      };
      setState((prev) => ({
        ...prev,
        batches: [batch, ...prev.batches],
      }));
      return batch;
    };

    const updateBatch: DataContextType['updateBatch'] = (id, updates) => {
      setState((prev) => ({
        ...prev,
        batches: prev.batches.map((batch) =>
          batch.id === id
            ? {
                ...batch,
                ...updates,
                updated_at: now(),
                published_at: updates.is_published ? now() : batch.published_at,
              }
            : batch
        ),
      }));
    };

    const deleteBatch: DataContextType['deleteBatch'] = (id) => {
      setState((prev) => ({
        ...prev,
        batches: prev.batches.filter((batch) => batch.id !== id),
        batchEmployees: prev.batchEmployees.filter((be) => be.batch_id !== id),
        batchModules: prev.batchModules.filter((bm) => bm.batch_id !== id),
        employeeProgress: prev.employeeProgress.filter((progress) => progress.batch_id !== id),
        postSessionAssignments: prev.postSessionAssignments.filter((assignment) => assignment.batch_id !== id),
      }));
    };

    const updateBatchEmployees: DataContextType['updateBatchEmployees'] = (batchId, employeeIds) => {
      setState((prev) => {
        const filtered = prev.batchEmployees.filter((be) => be.batch_id !== batchId);
        const newEntries = employeeIds.map((employeeId) => ({
          id: uuid(),
          batch_id: batchId,
          employee_id: employeeId,
          enrolled_at: now(),
        }));

        // Maintain progress entries
        const remainingProgress = prev.employeeProgress.filter(
          (progress) => !(progress.batch_id === batchId)
        );

        const newProgress: EmployeeProgress[] = [];
        employeeIds.forEach((employeeId) => {
          prev.batchModules
            .filter((bm) => bm.batch_id === batchId)
            .forEach((bm) => {
              newProgress.push({
                id: uuid(),
                employee_id: employeeId,
                batch_id: batchId,
                module_id: bm.module_id,
                status: 'not_started',
                progress_percentage: 0,
                test_status: 'not_taken',
                test_score: null,
                started_at: null,
                completed_at: null,
                last_accessed_at: null,
              });
            });
        });

        const updatedAssignments = prev.postSessionAssignments.filter(
          (assignment) => assignment.batch_id !== batchId || employeeIds.includes(assignment.employee_id)
        );

        return {
          ...prev,
          batchEmployees: [...filtered, ...newEntries],
          employeeProgress: [...remainingProgress, ...newProgress],
          postSessionAssignments: updatedAssignments,
        };
      });
    };

    const updateBatchModules: DataContextType['updateBatchModules'] = (batchId, moduleIds) => {
      setState((prev) => {
        const filtered = prev.batchModules.filter((bm) => bm.batch_id !== batchId);
        const newEntries = moduleIds.map((moduleId, index) => ({
          id: uuid(),
          batch_id: batchId,
          module_id: moduleId,
          order_index: index,
          assigned_at: now(),
        }));

        const currentEmployeeIds = prev.batchEmployees
          .filter((be) => be.batch_id === batchId)
          .map((be) => be.employee_id);

        const remainingProgress = prev.employeeProgress.filter(
          (progress) => !(progress.batch_id === batchId)
        );

        const newProgress: EmployeeProgress[] = [];
        currentEmployeeIds.forEach((employeeId) => {
          moduleIds.forEach((moduleId) => {
            newProgress.push({
              id: uuid(),
              employee_id: employeeId,
              batch_id: batchId,
              module_id: moduleId,
              status: 'not_started',
              progress_percentage: 0,
              test_status: 'not_taken',
              test_score: null,
              started_at: null,
              completed_at: null,
              last_accessed_at: null,
            });
          });
        });

        const updatedAssignments = prev.postSessionAssignments.filter(
          (assignment) =>
            assignment.batch_id !== batchId || moduleIds.includes(assignment.module_id)
        );

        return {
          ...prev,
          batchModules: [...filtered, ...newEntries],
          employeeProgress: [...remainingProgress, ...newProgress],
          postSessionAssignments: updatedAssignments,
        };
      });
    };

    const updateEmployeeProgress: DataContextType['updateEmployeeProgress'] = (input) => {
      setState((prev) => {
        const existing = prev.employeeProgress.find((prog) => prog.id === input.id);
        if (!existing) {
          return {
            ...prev,
            employeeProgress: [...prev.employeeProgress, input],
          };
        }

        return {
          ...prev,
          employeeProgress: prev.employeeProgress.map((prog) =>
            prog.id === input.id ? { ...existing, ...input, last_accessed_at: now() } : prog
          ),
        };
      });
    };

    const addPostSessionAssignment: DataContextType['addPostSessionAssignment'] = (input) => {
      const assignment: PostSessionAssignment = {
        id: uuid(),
        batch_id: input.batch_id,
        employee_id: input.employee_id,
        module_id: input.module_id,
        assigned_at: input.assigned_at ?? now(),
        due_date: input.due_date ?? null,
        submitted_at: input.submitted_at ?? null,
        status: input.status ?? 'pending',
        test_status: input.test_status,
        notes: input.notes ?? '',
      };

      setState((prev) => ({
        ...prev,
        postSessionAssignments: [assignment, ...prev.postSessionAssignments],
      }));

      return assignment;
    };

    const updatePostSessionAssignment: DataContextType['updatePostSessionAssignment'] = (id, updates) => {
      setState((prev) => ({
        ...prev,
        postSessionAssignments: prev.postSessionAssignments.map((assignment) =>
          assignment.id === id
            ? {
                ...assignment,
                ...updates,
              }
            : assignment
        ),
      }));
    };

    return {
      ...state,
      addModule,
      updateModule,
      deleteModule,
      addEmployee,
      updateEmployee,
      deleteEmployee,
      importEmployees,
      addBatch,
      updateBatch,
      deleteBatch,
      updateBatchEmployees,
      updateBatchModules,
      updateEmployeeProgress,
      addPostSessionAssignment,
      updatePostSessionAssignment,
    };
  }, [state]);

  return <DataContext.Provider value={contextValue}>{children}</DataContext.Provider>;
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
};
