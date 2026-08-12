import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // ─── Clean existing data ───────────────────────────────
  await prisma.margin_records.deleteMany()
  await prisma.interview_rounds.deleteMany()
  await prisma.allocations.deleteMany()
  await prisma.candidate_languages.deleteMany()
  await prisma.candidate_certifications.deleteMany()
  await prisma.candidate_education.deleteMany()
  await prisma.candidate_work_history.deleteMany()
  await prisma.candidate_skills.deleteMany()
  await prisma.candidates.deleteMany()
  await prisma.requirements.deleteMany()
  await prisma.roles.deleteMany()
  await prisma.customer_contacts.deleteMany()
  await prisma.customers.deleteMany()
  await prisma.resume_templates.deleteMany()
  await prisma.users.deleteMany()

  // ─── Users ─────────────────────────────────────────────
  const passwordHash = await bcrypt.hash('Admin@123', 10)

  const admin = await prisma.users.create({
    data: {
      full_name: 'Admin User',
      email: 'admin@gitrecruitment.com',
      password_hash: passwordHash,
      role: 'admin',
    },
  })

  const recruiter = await prisma.users.create({
    data: {
      full_name: 'Sarah Khan',
      email: 'sarah@gitrecruitment.com',
      password_hash: await bcrypt.hash('Recruiter@123', 10),
      role: 'recruiter',
    },
  })

  await prisma.users.create({
    data: {
      full_name: 'Alex Morgan',
      email: 'accountmanager@gitrecruitment.com',
      password_hash: await bcrypt.hash('Account@123', 10),
      role: 'account_manager',
    },
  })

  await prisma.users.create({
    data: {
      full_name: 'Finance User',
      email: 'finance@gitrecruitment.com',
      password_hash: await bcrypt.hash('Finance@123', 10),
      role: 'finance',
    },
  })

  await prisma.users.create({
    data: {
      full_name: 'Viewer User',
      email: 'viewer@gitrecruitment.com',
      password_hash: await bcrypt.hash('Viewer@123', 10),
      role: 'viewer',
    },
  })

  console.log('✓ Users created')

  // ─── Customers ─────────────────────────────────────────
  const accenture = await prisma.customers.create({
    data: {
      name: 'Accenture UK',
      industry: 'Consulting',
      website: 'https://www.accenture.com',
      country: 'United Kingdom',
      city: 'London',
      account_manager_id: admin.id,
      status: 'active',
      notes: 'Key account. Multiple openings every quarter.',
    },
  })

  await prisma.customer_contacts.createMany({
    data: [
      {
        customer_id: accenture.id,
        name: 'James Mitchell',
        email: 'j.mitchell@accenture.com',
        phone: '+44 20 7000 1234',
        label: 'primary',
        is_primary: true,
      },
      {
        customer_id: accenture.id,
        name: 'Nadia Fox',
        email: 'n.fox@accenture.com',
        phone: '+44 20 7000 1235',
        label: 'hr',
        is_primary: false,
      },
    ],
  })

  const hsbc = await prisma.customers.create({
    data: {
      name: 'HSBC',
      industry: 'Banking',
      website: 'https://www.hsbc.com',
      country: 'United Kingdom',
      city: 'London',
      account_manager_id: admin.id,
      status: 'active',
      notes: 'Focus on fintech and data engineering roles.',
    },
  })

  await prisma.customer_contacts.createMany({
    data: [
      {
        customer_id: hsbc.id,
        name: 'Priya Sharma',
        email: 'p.sharma@hsbc.com',
        phone: '+44 20 7000 5678',
        label: 'primary',
        is_primary: true,
      },
      {
        customer_id: hsbc.id,
        name: 'Ravi Chandra',
        email: 'r.chandra@hsbc.com',
        phone: '+44 20 7000 5679',
        label: 'procurement',
        is_primary: false,
        notes: 'Handles PO approvals and invoicing queries.',
      },
    ],
  })

  const deloitte = await prisma.customers.create({
    data: {
      name: 'Deloitte',
      industry: 'Consulting',
      website: 'https://www.deloitte.com',
      country: 'United Kingdom',
      city: 'Manchester',
      account_manager_id: admin.id,
      status: 'active',
    },
  })

  await prisma.customer_contacts.create({
    data: {
      customer_id: deloitte.id,
      name: 'Tom Richards',
      email: 't.richards@deloitte.com',
      phone: '+44 16 1000 9999',
      label: 'primary',
      is_primary: true,
    },
  })

  const barclays = await prisma.customers.create({
    data: {
      name: 'Barclays',
      industry: 'Banking',
      website: 'https://www.barclays.co.uk',
      country: 'United Kingdom',
      city: 'London',
      account_manager_id: admin.id,
      status: 'active',
      notes: 'UK headquartered, with active hiring needs for the Dubai office.',
    },
  })

  await prisma.customer_contacts.createMany({
    data: [
      {
        customer_id: barclays.id,
        name: 'Emma Thompson',
        email: 'e.thompson@barclays.com',
        phone: '+44 20 7000 2222',
        label: 'primary',
        is_primary: true,
      },
      {
        customer_id: barclays.id,
        name: 'Khalid Rahman',
        email: 'k.rahman@barclays.ae',
        phone: '+971 4 000 3333',
        label: 'secondary',
        is_primary: false,
        notes: 'Point of contact for the Dubai office hiring.',
      },
      {
        customer_id: barclays.id,
        name: 'Finance Desk',
        email: 'finance.uk@barclays.com',
        label: 'finance',
        is_primary: false,
      },
    ],
  })

  console.log('✓ Customers created')

  // ─── Roles ─────────────────────────────────────────────
  const javaRole = await prisma.roles.create({
    data: {
      title: 'Senior Java Developer',
      category: 'Engineering',
      description: 'Backend development using Java and Spring Boot.',
    },
  })

  const devopsRole = await prisma.roles.create({
    data: {
      title: 'DevOps Engineer',
      category: 'Engineering',
      description: 'CI/CD pipelines, Kubernetes, cloud infrastructure.',
    },
  })

  const dataRole = await prisma.roles.create({
    data: {
      title: 'Data Scientist',
      category: 'Data',
      description: 'ML models, data pipelines, Python and SQL.',
    },
  })

  const reactRole = await prisma.roles.create({
    data: {
      title: 'React Developer',
      category: 'Engineering',
      description: 'Frontend development with React and TypeScript.',
    },
  })

  const pmRole = await prisma.roles.create({
    data: {
      title: 'Product Manager',
      category: 'Management',
      description: 'Product strategy, roadmap, and stakeholder management.',
    },
  })

  console.log('✓ Roles created')

  // ─── Requirements ───────────────────────────────────────
  const opening1 = await prisma.requirements.create({
    data: {
      customer_id: accenture.id,
      role_id: javaRole.id,
      billing_entity: 'git_uk_ltd',
      status: 'open',
      min_exp_years: 5,
      max_exp_years: 10,
      budget_min: 70000,
      budget_max: 90000,
      budget_currency: 'GBP',
      hiring_type: 'permanent',
      notice_period_buyback: true,
      no_of_positions: 2,
      filled_positions: 0,
      location: 'London',
      work_mode: 'hybrid',
      job_description: 'Looking for a Senior Java Developer with Spring Boot and microservices experience.',
      required_skills: ['Java', 'Spring Boot', 'Microservices', 'PostgreSQL'],
      nice_to_have_skills: ['Kafka', 'Docker', 'AWS'],
      priority: 'high',
      visa_sponsorship_available: false,
      closing_date: new Date('2026-08-01'),
      created_by: admin.id,
    },
  })

  const opening2 = await prisma.requirements.create({
    data: {
      customer_id: hsbc.id,
      role_id: devopsRole.id,
      billing_entity: 'git_india_llp',
      status: 'open',
      min_exp_years: 3,
      max_exp_years: 7,
      budget_min: 400,
      budget_max: 550,
      budget_currency: 'GBP',
      hiring_type: 'contract',
      min_contract_months: 6,
      notice_period_buyback: false,
      no_of_positions: 1,
      filled_positions: 0,
      location: 'London',
      work_mode: 'onsite',
      job_description: 'DevOps Engineer needed for a large scale cloud migration project.',
      required_skills: ['Kubernetes', 'Terraform', 'AWS', 'CI/CD'],
      nice_to_have_skills: ['Helm', 'ArgoCD'],
      priority: 'urgent',
      visa_sponsorship_available: false,
      closing_date: new Date('2026-07-15'),
      created_by: admin.id,
    },
  })

  const opening3 = await prisma.requirements.create({
    data: {
      customer_id: deloitte.id,
      role_id: dataRole.id,
      billing_entity: 'git_uk_ltd',
      status: 'open',
      min_exp_years: 2,
      max_exp_years: 6,
      budget_min: 55000,
      budget_max: 75000,
      budget_currency: 'GBP',
      hiring_type: 'permanent',
      notice_period_buyback: false,
      no_of_positions: 2,
      filled_positions: 1,
      location: 'Manchester',
      work_mode: 'hybrid',
      required_skills: ['Python', 'SQL', 'Machine Learning', 'TensorFlow'],
      nice_to_have_skills: ['Spark', 'Databricks'],
      priority: 'medium',
      clearance_required: 'BPSS (Baseline Personnel Security Standard)',
      created_by: recruiter.id,
    },
  })

  const opening4 = await prisma.requirements.create({
    data: {
      customer_id: barclays.id,
      role_id: reactRole.id,
      billing_entity: 'git_uae_fze',
      status: 'open',
      min_exp_years: 4,
      max_exp_years: 8,
      budget_min: 25000,
      budget_max: 32000,
      budget_currency: 'AED',
      hiring_type: 'contract',
      min_contract_months: 12,
      notice_period_buyback: false,
      no_of_positions: 1,
      filled_positions: 1,
      location: 'Dubai, UAE',
      work_mode: 'onsite',
      job_description: 'React Developer for a fintech platform rollout across the UAE region.',
      required_skills: ['React', 'TypeScript', 'Redux'],
      nice_to_have_skills: ['Next.js'],
      priority: 'high',
      visa_sponsorship_available: true,
      created_by: recruiter.id,
    },
  })

  console.log('✓ Requirements created')

  // ─── Candidates ─────────────────────────────────────────
  const candidate1 = await prisma.candidates.create({
    data: {
      full_name: 'Arjun Mehta',
      email: 'arjun.mehta@email.com',
      phone: '+44 7911 123456',
      linkedin_url: 'https://linkedin.com/in/arjunmehta',
      current_location: 'London, UK',
      preferred_location: 'London, UK',
      willing_to_relocate: false,
      exp_years: 7,
      current_company: 'TechCorp Ltd',
      current_role: 'Java Developer',
      current_ctc: 75000,
      expected_ctc: 85000,
      currency: 'GBP',
      notice_period_days: 30,
      availability_status: 'notice_period',
      highest_qualification: 'B.Tech Computer Science',
      requires_visa_sponsorship: false,
      visa_status: 'Skilled Worker visa, valid until 2028',
      source: 'linkedin',
      status: 'active',
      notes: 'Strong Java background, keen on fintech.',
      created_by: recruiter.id,
    },
  })

  await prisma.candidate_skills.createMany({
    data: [
      { candidate_id: candidate1.id, skill: 'Java', years_exp: 7, proficiency: 'expert', is_primary: true },
      { candidate_id: candidate1.id, skill: 'Spring Boot', years_exp: 5, proficiency: 'advanced', is_primary: true },
      { candidate_id: candidate1.id, skill: 'PostgreSQL', years_exp: 4, proficiency: 'advanced', is_primary: false },
      { candidate_id: candidate1.id, skill: 'Docker', years_exp: 2, proficiency: 'intermediate', is_primary: false },
    ],
  })

  await prisma.candidate_work_history.createMany({
    data: [
      {
        candidate_id: candidate1.id,
        company_name: 'TechCorp Ltd',
        role_title: 'Java Developer',
        employment_type: 'full_time',
        location: 'London, UK',
        start_date: new Date('2021-03-01'),
        is_current: true,
        responsibilities: 'Developed microservices using Java and Spring Boot for a banking client.',
        achievements: 'Reduced API response time by 40% through query optimisation.',
        technologies_used: ['Java', 'Spring Boot', 'PostgreSQL', 'Docker'],
      },
      {
        candidate_id: candidate1.id,
        company_name: 'Infosys',
        role_title: 'Junior Java Developer',
        employment_type: 'full_time',
        location: 'Bangalore, India',
        start_date: new Date('2018-07-01'),
        end_date: new Date('2021-02-28'),
        is_current: false,
        responsibilities: 'Built REST APIs for internal HR systems.',
        technologies_used: ['Java', 'MySQL', 'Spring MVC'],
      },
    ],
  })

  await prisma.candidate_education.create({
    data: {
      candidate_id: candidate1.id,
      institution: 'VIT University',
      degree: 'B.Tech',
      field_of_study: 'Computer Science',
      grade: '8.4 CGPA',
      start_year: 2014,
      end_year: 2018,
    },
  })

  await prisma.candidate_languages.createMany({
    data: [
      { candidate_id: candidate1.id, language: 'English', proficiency: 'professional' },
      { candidate_id: candidate1.id, language: 'Hindi', proficiency: 'native' },
    ],
  })

  const candidate2 = await prisma.candidates.create({
    data: {
      full_name: 'Emily Clarke',
      email: 'emily.clarke@email.com',
      phone: '+44 7922 654321',
      linkedin_url: 'https://linkedin.com/in/emilyclarke',
      current_location: 'London, UK',
      preferred_location: 'London, UK',
      willing_to_relocate: false,
      exp_years: 5,
      current_company: 'CloudSys UK',
      current_role: 'DevOps Engineer',
      current_ctc: 450,
      expected_day_rate: 500,
      currency: 'GBP',
      notice_period_days: 14,
      availability_status: 'notice_period',
      highest_qualification: 'B.Sc Computer Science',
      requires_visa_sponsorship: false,
      security_clearance_level: 'SC (Security Check)',
      security_clearance_expiry: new Date('2027-04-01'),
      source: 'referral',
      status: 'active',
      created_by: recruiter.id,
    },
  })

  await prisma.candidate_skills.createMany({
    data: [
      { candidate_id: candidate2.id, skill: 'Kubernetes', years_exp: 4, proficiency: 'advanced', is_primary: true },
      { candidate_id: candidate2.id, skill: 'Terraform', years_exp: 3, proficiency: 'advanced', is_primary: true },
      { candidate_id: candidate2.id, skill: 'AWS', years_exp: 5, proficiency: 'expert', is_primary: true },
      { candidate_id: candidate2.id, skill: 'CI/CD', years_exp: 4, proficiency: 'advanced', is_primary: false },
    ],
  })

  await prisma.candidate_work_history.create({
    data: {
      candidate_id: candidate2.id,
      company_name: 'CloudSys UK',
      role_title: 'DevOps Engineer',
      employment_type: 'contract',
      location: 'London, UK',
      start_date: new Date('2022-01-01'),
      is_current: true,
      responsibilities: 'Managing Kubernetes clusters and CI/CD pipelines for 12 client environments.',
      achievements: 'Reduced deployment time from 45 minutes to 8 minutes.',
      technologies_used: ['Kubernetes', 'Terraform', 'AWS', 'Jenkins', 'ArgoCD'],
    },
  })

  await prisma.candidate_education.create({
    data: {
      candidate_id: candidate2.id,
      institution: 'University of Manchester',
      degree: 'B.Sc',
      field_of_study: 'Computer Science',
      grade: 'First Class',
      start_year: 2016,
      end_year: 2019,
    },
  })

  await prisma.candidate_certifications.createMany({
    data: [
      {
        candidate_id: candidate2.id,
        name: 'AWS Solutions Architect Professional',
        issuing_organization: 'Amazon Web Services',
        issue_date: new Date('2023-03-01'),
        expiry_date: new Date('2026-03-01'),
        credential_url: 'https://aws.amazon.com/verification',
      },
      {
        candidate_id: candidate2.id,
        name: 'Certified Kubernetes Administrator',
        issuing_organization: 'CNCF',
        issue_date: new Date('2022-09-01'),
        expiry_date: new Date('2025-09-01'),
      },
    ],
  })

  await prisma.candidate_languages.create({
    data: { candidate_id: candidate2.id, language: 'English', proficiency: 'native' },
  })

  const candidate3 = await prisma.candidates.create({
    data: {
      full_name: 'Rahul Verma',
      email: 'rahul.verma@email.com',
      phone: '+44 7933 111222',
      current_location: 'Manchester, UK',
      preferred_location: 'Manchester, UK',
      willing_to_relocate: true,
      exp_years: 4,
      current_company: 'DataMinds Ltd',
      current_role: 'Data Scientist',
      current_ctc: 60000,
      expected_ctc: 70000,
      currency: 'GBP',
      notice_period_days: 30,
      availability_status: 'notice_period',
      highest_qualification: 'M.Sc Data Science',
      source: 'linkedin',
      status: 'placed',
      created_by: recruiter.id,
    },
  })

  await prisma.candidate_skills.createMany({
    data: [
      { candidate_id: candidate3.id, skill: 'Python', years_exp: 4, proficiency: 'expert', is_primary: true },
      { candidate_id: candidate3.id, skill: 'Machine Learning', years_exp: 3, proficiency: 'advanced', is_primary: true },
      { candidate_id: candidate3.id, skill: 'SQL', years_exp: 4, proficiency: 'advanced', is_primary: false },
      { candidate_id: candidate3.id, skill: 'TensorFlow', years_exp: 2, proficiency: 'intermediate', is_primary: false },
    ],
  })

  await prisma.candidate_work_history.create({
    data: {
      candidate_id: candidate3.id,
      company_name: 'DataMinds Ltd',
      role_title: 'Data Scientist',
      employment_type: 'full_time',
      location: 'Manchester, UK',
      start_date: new Date('2020-06-01'),
      is_current: true,
      responsibilities: 'Built predictive models for retail demand forecasting.',
      achievements: 'Improved forecast accuracy by 22% using ensemble methods.',
      technologies_used: ['Python', 'TensorFlow', 'SQL', 'Spark'],
    },
  })

  await prisma.candidate_education.create({
    data: {
      candidate_id: candidate3.id,
      institution: 'University of Edinburgh',
      degree: 'M.Sc',
      field_of_study: 'Data Science',
      grade: 'Distinction',
      start_year: 2018,
      end_year: 2020,
    },
  })

  await prisma.candidate_languages.createMany({
    data: [
      { candidate_id: candidate3.id, language: 'English', proficiency: 'professional' },
      { candidate_id: candidate3.id, language: 'Hindi', proficiency: 'native' },
    ],
  })

  console.log('✓ Candidates created')

  const candidate4 = await prisma.candidates.create({
    data: {
      full_name: 'Youssef Nasser',
      email: 'youssef.nasser@email.com',
      phone: '+971 50 123 4567',
      linkedin_url: 'https://linkedin.com/in/youssefnasser',
      current_location: 'Dubai, UAE',
      preferred_location: 'Dubai, UAE',
      willing_to_relocate: false,
      exp_years: 6,
      current_company: 'Emirates Digital Solutions',
      current_role: 'Senior Frontend Developer',
      expected_day_rate: 900,
      currency: 'AED',
      notice_period_days: 30,
      availability_status: 'notice_period',
      highest_qualification: 'B.Eng Computer Engineering',
      requires_visa_sponsorship: true,
      visa_status: 'Requires UAE employment visa sponsorship',
      source: 'referral',
      status: 'placed',
      created_by: recruiter.id,
    },
  })

  await prisma.candidate_skills.createMany({
    data: [
      { candidate_id: candidate4.id, skill: 'React', years_exp: 6, proficiency: 'expert', is_primary: true },
      { candidate_id: candidate4.id, skill: 'TypeScript', years_exp: 5, proficiency: 'advanced', is_primary: true },
      { candidate_id: candidate4.id, skill: 'Redux', years_exp: 4, proficiency: 'advanced', is_primary: false },
    ],
  })

  await prisma.candidate_work_history.create({
    data: {
      candidate_id: candidate4.id,
      company_name: 'Emirates Digital Solutions',
      role_title: 'Senior Frontend Developer',
      employment_type: 'full_time',
      location: 'Dubai, UAE',
      start_date: new Date('2021-09-01'),
      is_current: true,
      responsibilities: 'Led frontend architecture for a regional banking app rollout.',
      achievements: 'Cut initial page load time by 35% through code-splitting.',
      technologies_used: ['React', 'TypeScript', 'Redux'],
    },
  })

  await prisma.candidate_education.create({
    data: {
      candidate_id: candidate4.id,
      institution: 'American University of Sharjah',
      degree: 'B.Eng',
      field_of_study: 'Computer Engineering',
      start_year: 2013,
      end_year: 2017,
    },
  })

  await prisma.candidate_languages.createMany({
    data: [
      { candidate_id: candidate4.id, language: 'Arabic', proficiency: 'native' },
      { candidate_id: candidate4.id, language: 'English', proficiency: 'professional' },
    ],
  })

  console.log('✓ UAE candidate created')

  // ─── Allocations ───────────────────────────────────────
  const app1 = await prisma.allocations.create({
    data: {
      requirement_id: opening1.id,
      candidate_id: candidate1.id,
      status: 'interviewing',
      expected_availability: new Date('2026-07-15'),
      match_score: 87.5,
      notes: 'Strong technical fit. Cleared first round.',
      created_by: recruiter.id,
    },
  })

  const app2 = await prisma.allocations.create({
    data: {
      requirement_id: opening2.id,
      candidate_id: candidate2.id,
      status: 'placed',
      expected_availability: new Date('2026-06-20'),
      match_score: 94.0,
      offer_date: new Date('2026-06-01'),
      placed_date: new Date('2026-06-10'),
      notes: 'Excellent match. Client very happy.',
      created_by: recruiter.id,
    },
  })

  const app3 = await prisma.allocations.create({
    data: {
      requirement_id: opening3.id,
      candidate_id: candidate3.id,
      status: 'placed',
      expected_availability: new Date('2026-05-01'),
      match_score: 91.0,
      offer_date: new Date('2026-04-20'),
      placed_date: new Date('2026-05-01'),
      created_by: recruiter.id,
    },
  })

  const app4 = await prisma.allocations.create({
    data: {
      requirement_id: opening4.id,
      candidate_id: candidate4.id,
      status: 'placed',
      expected_availability: new Date('2026-06-01'),
      match_score: 89.0,
      offer_date: new Date('2026-05-15'),
      placed_date: new Date('2026-06-01'),
      notes: 'Strong React/TypeScript background, immediate culture fit with the Dubai team.',
      created_by: recruiter.id,
    },
  })

  console.log('✓ Allocations created')

  // ─── Interview Rounds ───────────────────────────────────
  await prisma.interview_rounds.createMany({
    data: [
      {
        allocation_id: app1.id,
        round_number: 1,
        round_type: 'screening',
        scheduled_at: new Date('2026-06-05T10:00:00Z'),
        conducted_by: 'James Mitchell',
        mode: 'video',
        outcome: 'passed',
        feedback: 'Good communication. Strong Java fundamentals.',
      },
      {
        allocation_id: app1.id,
        round_number: 2,
        round_type: 'technical',
        scheduled_at: new Date('2026-06-12T14:00:00Z'),
        conducted_by: 'Tech Lead - Accenture',
        mode: 'video',
        outcome: 'passed',
        feedback: 'Solid microservices knowledge. Passed coding challenge.',
      },
      {
        allocation_id: app2.id,
        round_number: 1,
        round_type: 'technical',
        scheduled_at: new Date('2026-05-20T11:00:00Z'),
        conducted_by: 'HSBC Infrastructure Lead',
        mode: 'video',
        outcome: 'passed',
        feedback: 'Exceptional Kubernetes knowledge. Hired on the spot.',
      },
    ],
  })

  await prisma.interview_rounds.create({
    data: {
      allocation_id: app4.id,
      round_number: 1,
      round_type: 'technical',
      scheduled_at: new Date('2026-05-08T09:00:00Z'),
      conducted_by: 'Barclays Dubai Tech Lead',
      mode: 'video',
      outcome: 'passed',
      feedback: 'Excellent React fundamentals, strong communication in English.',
    },
  })

  console.log('✓ Interview rounds created')

  // ─── Margin Records ─────────────────────────────────────
  // app2 — HSBC contract, billed via the India LLP entity. Candidate is
  // paid in GBP, but the deal is invoiced by git_india_llp, so both
  // demand and bill get converted into INR (that entity's reporting
  // currency) at the rate locked on the day the record was created.
  await prisma.margin_records.create({
    data: {
      allocation_id: app2.id,
      billing_entity: 'git_india_llp',
      demand_amount: 8000,
      demand_currency: 'GBP',
      demand_fx_rate: 105.0,
      demand_converted: 840000,
      billed_amount: 9500,
      billed_currency: 'GBP',
      billed_fx_rate: 105.0,
      billed_converted: 997500,
      billed_converted_yearly: 11970000,
      margin_amount: 157500,
      margin_pct: 15.79,
      reporting_currency: 'INR',
      fx_rate_locked_at: new Date('2026-06-10'),
      invoice_ref: 'INV-2026-0041',
      billing_period_start: new Date('2026-06-10'),
      billing_period_end: new Date('2026-12-10'),
      payment_status: 'invoiced',
      notes: 'Contract role. Billed monthly. Invoiced via India LLP entity.',
    },
  })

  // app3 — Deloitte permanent placement, billed via the UK Ltd entity.
  // Same currency on both sides, so the FX rate is 1 (no real conversion
  // happening, just kept consistent with the locked-rate design).
  await prisma.margin_records.create({
    data: {
      allocation_id: app3.id,
      billing_entity: 'git_uk_ltd',
      demand_amount: 5500,
      demand_currency: 'GBP',
      demand_fx_rate: 1,
      demand_converted: 5500,
      billed_amount: 6500,
      billed_currency: 'GBP',
      billed_fx_rate: 1,
      billed_converted: 6500,
      billed_converted_yearly: 78000,
      margin_amount: 1000,
      margin_pct: 15.38,
      reporting_currency: 'GBP',
      fx_rate_locked_at: new Date('2026-05-01'),
      invoice_ref: 'INV-2026-0038',
      billing_period_start: new Date('2026-05-01'),
      payment_status: 'paid',
      notes: 'Permanent placement fee.',
    },
  })

  // app4 — Barclays Dubai contract, billed via the UAE FZE entity.
  // Candidate demand and client bill are both already in AED, matching
  // that entity's reporting currency, so the rate is 1 here too.
  await prisma.margin_records.create({
    data: {
      allocation_id: app4.id,
      billing_entity: 'git_uae_fze',
      demand_amount: 18000,
      demand_currency: 'AED',
      demand_fx_rate: 1,
      demand_converted: 18000,
      billed_amount: 22000,
      billed_currency: 'AED',
      billed_fx_rate: 1,
      billed_converted: 22000,
      billed_converted_yearly: 264000,
      margin_amount: 4000,
      margin_pct: 18.18,
      reporting_currency: 'AED',
      fx_rate_locked_at: new Date('2026-06-01'),
      invoice_ref: 'INV-2026-0052',
      billing_period_start: new Date('2026-06-01'),
      payment_status: 'invoiced',
      notes: 'UAE FZE placement. Contract renewed annually.',
    },
  })

  console.log('✓ Margin records created')

  // ─── Resume Templates ───────────────────────────────────
  await prisma.resume_templates.createMany({
    data: [
      {
        name: 'Junior Engineer Template',
        bucket_label: 'junior',
        min_exp_years: 0,
        max_exp_years: 2,
        template_file_path: 'templates/resume/junior.html',
        is_active: true,
      },
      {
        name: 'Mid-Level Engineer Template',
        bucket_label: 'mid',
        min_exp_years: 3,
        max_exp_years: 6,
        template_file_path: 'templates/resume/mid.html',
        is_active: true,
      },
      {
        name: 'Senior Engineer Template',
        bucket_label: 'senior',
        min_exp_years: 7,
        max_exp_years: 12,
        template_file_path: 'templates/resume/senior.html',
        is_active: true,
      },
      {
        name: 'Principal Engineer Template',
        bucket_label: 'principal',
        min_exp_years: 13,
        max_exp_years: 99,
        template_file_path: 'templates/resume/principal.html',
        is_active: true,
      },
    ],
  })

  console.log('✓ Resume templates created')
  console.log('✅ Seeding complete.')
}

main()
  .catch((e) => {
    console.error(e)
    // process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })