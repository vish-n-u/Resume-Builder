// Mock job data for testing — used when NODE_ENV=development

export const mockJSearchResults = [
    {
        job_id: 'mock-job-001',
        job_title: 'Senior React Developer',
        employer_name: 'TechCorp',
        job_city: 'San Francisco',
        job_state: 'CA',
        job_country: 'US',
        job_is_remote: false,
        job_min_salary: 120000,
        job_max_salary: 160000,
        job_description: 'We are looking for a Senior React Developer to join our team. You will build modern web applications using React, TypeScript, and Node.js. Experience with Redux, GraphQL, and cloud services (AWS/GCP) is preferred. Strong understanding of responsive design and performance optimization required.',
        job_required_skills: ['React', 'TypeScript', 'Node.js', 'Redux', 'GraphQL', 'AWS'],
        job_apply_link: 'https://example.com/apply/react-dev',
        job_posted_at_datetime_utc: '2026-03-05T10:00:00Z',
    },
    {
        job_id: 'mock-job-002',
        job_title: 'Full Stack Engineer',
        employer_name: 'StartupXYZ',
        job_city: 'New York',
        job_state: 'NY',
        job_country: 'US',
        job_is_remote: true,
        job_min_salary: 100000,
        job_max_salary: 140000,
        job_description: 'Join our fast-growing startup as a Full Stack Engineer. Work on our SaaS platform built with Next.js, Express, and PostgreSQL. You will own features end-to-end, from database design to UI implementation. We value clean code, testing, and shipping fast.',
        job_required_skills: ['Next.js', 'Express', 'PostgreSQL', 'Docker', 'CI/CD'],
        job_apply_link: 'https://example.com/apply/fullstack',
        job_posted_at_datetime_utc: '2026-03-06T14:30:00Z',
    },
    {
        job_id: 'mock-job-003',
        job_title: 'Frontend Developer',
        employer_name: 'DesignStudio',
        job_city: 'Austin',
        job_state: 'TX',
        job_country: 'US',
        job_is_remote: false,
        job_min_salary: 90000,
        job_max_salary: 120000,
        job_description: 'DesignStudio is hiring a Frontend Developer who is passionate about creating beautiful, accessible user interfaces. You will collaborate closely with our design team to implement pixel-perfect UIs using React, Tailwind CSS, and Framer Motion. Accessibility and performance are top priorities.',
        job_required_skills: ['React', 'Tailwind CSS', 'JavaScript', 'Figma', 'Accessibility'],
        job_apply_link: 'https://example.com/apply/frontend',
        job_posted_at_datetime_utc: '2026-03-04T09:00:00Z',
    },
    {
        job_id: 'mock-job-004',
        job_title: 'Backend Engineer (Node.js)',
        employer_name: 'CloudServices Inc',
        job_city: 'Seattle',
        job_state: 'WA',
        job_country: 'US',
        job_is_remote: true,
        job_min_salary: 130000,
        job_max_salary: 170000,
        job_description: 'Build scalable microservices and APIs at CloudServices Inc. We use Node.js, MongoDB, Redis, and Kubernetes. You will design and implement RESTful and GraphQL APIs serving millions of requests daily. Experience with message queues (RabbitMQ/Kafka) is a plus.',
        job_required_skills: ['Node.js', 'MongoDB', 'Redis', 'Kubernetes', 'REST APIs', 'GraphQL'],
        job_apply_link: 'https://example.com/apply/backend',
        job_posted_at_datetime_utc: '2026-03-07T16:00:00Z',
    },
    {
        job_id: 'mock-job-005',
        job_title: 'DevOps Engineer',
        employer_name: 'InfraTeam',
        job_city: 'Remote',
        job_state: '',
        job_country: 'US',
        job_is_remote: true,
        job_min_salary: 110000,
        job_max_salary: 150000,
        job_description: 'InfraTeam needs a DevOps Engineer to manage our cloud infrastructure on AWS. You will work with Terraform, Docker, Kubernetes, and GitHub Actions. Responsibilities include CI/CD pipeline management, monitoring with Prometheus/Grafana, and incident response.',
        job_required_skills: ['AWS', 'Terraform', 'Docker', 'Kubernetes', 'GitHub Actions', 'Prometheus'],
        job_apply_link: 'https://example.com/apply/devops',
        job_posted_at_datetime_utc: '2026-03-03T11:00:00Z',
    },
    {
        job_id: 'mock-job-006',
        job_title: 'Mobile Developer (React Native)',
        employer_name: 'AppFactory',
        job_city: 'Los Angeles',
        job_state: 'CA',
        job_country: 'US',
        job_is_remote: false,
        job_min_salary: 95000,
        job_max_salary: 130000,
        job_description: 'Build cross-platform mobile apps with React Native at AppFactory. You will develop features for our consumer app with 500K+ users. Experience with native modules, app store deployment, and push notifications required.',
        job_required_skills: ['React Native', 'JavaScript', 'iOS', 'Android', 'Firebase'],
        job_apply_link: 'https://example.com/apply/mobile',
        job_posted_at_datetime_utc: '2026-03-06T08:00:00Z',
    },
    {
        job_id: 'mock-job-007',
        job_title: 'Data Engineer',
        employer_name: 'DataDriven Co',
        job_city: 'Chicago',
        job_state: 'IL',
        job_country: 'US',
        job_is_remote: true,
        job_min_salary: 115000,
        job_max_salary: 155000,
        job_description: 'DataDriven Co is looking for a Data Engineer to build and maintain our data pipelines. Work with Python, Apache Spark, Airflow, and Snowflake. You will design ETL processes and ensure data quality across our analytics platform.',
        job_required_skills: ['Python', 'Apache Spark', 'Airflow', 'Snowflake', 'SQL', 'ETL'],
        job_apply_link: 'https://example.com/apply/data-eng',
        job_posted_at_datetime_utc: '2026-03-05T13:00:00Z',
    },
    {
        job_id: 'mock-job-008',
        job_title: 'UI/UX Developer',
        employer_name: 'CreativeAgency',
        job_city: 'Miami',
        job_state: 'FL',
        job_country: 'US',
        job_is_remote: false,
        job_min_salary: 85000,
        job_max_salary: 115000,
        job_description: 'CreativeAgency seeks a UI/UX Developer who bridges design and code. You will prototype in Figma, then implement with React and CSS animations. Strong eye for design, motion, and micro-interactions required.',
        job_required_skills: ['React', 'CSS', 'Figma', 'Animation', 'UI/UX Design'],
        job_apply_link: 'https://example.com/apply/uiux',
        job_posted_at_datetime_utc: '2026-03-07T10:00:00Z',
    },
];

// Mock Hunter.io email results — some companies have emails, some don't
export const mockCompanyEmails = {
    'TechCorp': 'hr@techcorp.com',
    'StartupXYZ': 'careers@startupxyz.com',
    'DesignStudio': '',              // no email found — will use external apply
    'CloudServices Inc': 'recruiting@cloudservices.com',
    'InfraTeam': '',                 // no email found
    'AppFactory': 'jobs@appfactory.com',
    'DataDriven Co': '',             // no email found
    'CreativeAgency': 'hello@creativeagency.com',
};

/**
 * Filter mock jobs based on query params (simulates JSearch filtering).
 */
export const getMockJSearchResults = ({ keyword, location, type } = {}) => {
    let results = [...mockJSearchResults];

    if (keyword) {
        const kw = keyword.toLowerCase();
        results = results.filter(j =>
            j.job_title.toLowerCase().includes(kw) ||
            j.job_description.toLowerCase().includes(kw) ||
            j.job_required_skills.some(s => s.toLowerCase().includes(kw))
        );
    }

    if (location) {
        const loc = location.toLowerCase();
        results = results.filter(j =>
            (j.job_city || '').toLowerCase().includes(loc) ||
            (j.job_state || '').toLowerCase().includes(loc) ||
            (j.job_country || '').toLowerCase().includes(loc)
        );
    }

    if (type === 'remote') {
        results = results.filter(j => j.job_is_remote);
    } else if (type === 'onsite') {
        results = results.filter(j => !j.job_is_remote);
    }

    return results;
};

/**
 * Mock Hunter.io lookup — returns email for known companies, empty string otherwise.
 */
export const mockLookupCompanyEmail = async (companyName) => {
    return mockCompanyEmails[companyName] || '';
};
