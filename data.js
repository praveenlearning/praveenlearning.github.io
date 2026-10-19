// Single source of truth for the portfolio.
// Edit this file to update the site; index.js renders it and builds the DOCX.
const profileData = {
  name: 'Praveen Bathula',
  role: 'Senior Data Engineer',
  contact: {
    location: 'Hyderabad, India',
    email: 'praveenbathula7@gmail.com',
    phone: '+91 8106766448',
    links: [
      { icon: 'linkedin', label: 'LinkedIn', url: 'https://www.linkedin.com/in/praveen-the-de/' },
//      { icon: 'github', label: 'GitHub', url: 'https://github.com/REPLACE-ME' }
    ]
  },

  summary:
    'Senior Data Engineer with 6+ years of experience designing, building and modernising production data ' +
    'platforms end to end, from source ingestion through to analytics-ready models. Hands-on with ' +
    'metadata-driven ETL and ELT development in Python, PySpark, dbt and SQL, dimensional and medallion ' +
    'data modelling, and workflow orchestration on AWS Glue Workflows and Apache Airflow (Google Cloud ' +
    'Composer, Astronomer Cosmos). Experienced in integrating multiple source systems into conformed ' +
    'warehouse models on BigQuery, PostgreSQL and Amazon Aurora, building event-driven pipelines on S3, ' +
    'EventBridge, Lambda and Glue, graph data modelling on Neo4j with Apache Spark and Scala, and ' +
    'automated data quality checks that gate a dataset before it reaches production. Provisions ' +
    'infrastructure as code with Terraform and OpenTofu and automates delivery through GitLab CI/CD and ' +
    'GitHub Actions, covering ingestion, validation, data quality, transformation, load and reporting.',

  // Keyword-dense variant used for the PDF and the DOCX, where an ATS or a keyword
  // filter reads the text before a person does. The web page uses `summary` above.
  summaryAts:
    'Senior Data Engineer with 6+ years of experience designing, building and modernising production data ' +
    'platforms end to end, from source ingestion to analytics-ready models. Builds metadata-driven and ' +
    'config-driven ETL/ELT pipelines in Python, PySpark, Apache Spark (Scala), SQL, pandas and dbt, with ' +
    'dimensional and star-schema modelling, medallion architecture and change data capture. Orchestrates ' +
    'workflows with AWS Glue Workflows and Apache Airflow on Google Cloud Composer and Astronomer Cosmos, ' +
    'and builds event-driven pipelines on Amazon S3, EventBridge, Lambda and Glue. Models and loads data ' +
    'into BigQuery, PostgreSQL, Amazon Aurora, DuckDB and Neo4j, with automated data quality checks and ' +
    'dbt tests that gate datasets before publication. Provisions cloud infrastructure as code with ' +
    'Terraform and OpenTofu across AWS and Google Cloud, containerises with Docker and Kubernetes, and ' +
    'automates delivery through GitLab CI/CD and GitHub Actions. Integrates AWS Bedrock KnowledgeBase and ' +
    'retrieval-augmented generation (RAG) into data workflows.',

  highlights: [
//    { value: '6+ yrs', label: 'Data Engineering | Data Modelling | PySpark | Python | AWS' },
//    { value: '8', label: 'Client platforms delivered' },
//    { value: '3', label: 'Clouds and warehouses' }
  ],

  education: [
    {
      degree: 'Bachelor of Technology in Electronics and Communications Engineering',
      institute: 'Rajiv Gandhi University of Knowledge Technologies, Basar',
      duration: '2016-2020',
      note: ''
    },
    {
      degree: 'PUC',
      institute: 'Rajiv Gandhi University of Knowledge Technologies, Basar',
      duration: '2014-2016',
      note: ''
    }
  ],

  skills: [
    { category: 'Languages', items: ['Python', 'SQL (PostgreSQL, MySQL, GoogleSQL)', 'Scala', 'Java', 'Bash'] },
    { category: 'Data Modelling & Transformation', items: ['PySpark', 'Apache Spark (Scala)', 'dbt', 'pandas', 'NumPy', 'DuckDB', 'ETL/ELT design', 'Metadata-driven ETL', 'Star schema', 'Medallion architecture', 'Change data capture'] },
    { category: 'Workflow Orchestration', items: ['AWS Glue Workflows', 'Apache Airflow', 'Google Cloud Composer', 'Astronomer Cosmos'] },
    { category: 'AI / ML Integration', items: ['AWS Bedrock KnowledgeBase', 'Retrieval-Augmented Generation (RAG)', 'LLM-assisted data mapping'] },
    { category: 'AI-Assisted Engineering', items: ['Claude Code', 'Spec-Driven Development'] },
    { category: 'Databases & Storage', items: ['PostgreSQL', 'BigQuery', 'Amazon Aurora', 'Neo4j', 'Amazon S3'] },
    { category: 'Cloud', items: ['AWS (Glue, Lambda, S3, EventBridge, Aurora, Bedrock, EKS, ECS, CloudFront)', 'Google Cloud Platform (BigQuery, Cloud Composer)'] },
    { category: 'Infrastructure as Code', items: ['Terraform', 'OpenTofu'] },
    { category: 'CI/CD & Tooling', items: ['GitLab CI/CD', 'GitHub Actions', 'Docker', 'Kubernetes', 'Git'] }
  ],

  experiences: [
    {
      title: 'Software Craftsperson / Data Engineer',
      company: 'Everest Engineering',
      location: 'Hyderabad, India',
      duration: 'Sep 2022 - Present',
      summary: [
        'Data engineer on client delivery teams, building the ingestion, transformation and warehouse layers of production platforms and carrying them from first schema design through to a published dataset.',
        'Responsible for the full pipeline lifecycle rather than the transformation step alone: source ingestion, data modelling, orchestration and scheduling, data quality, and the cloud infrastructure and release automation underneath.'
      ]
    },
    {
      title: 'Application Developer',
      company: 'ThoughtWorks',
      location: 'Hyderabad, India',
      duration: 'Jun 2020 - Sep 2022',
      summary: [
        'Data engineer on a long-running automotive engagement, building batch ETL at scale and the automated data quality checks that guarded what it produced.',
        'Responsible for how pipelines ran in production, not only the transformation logic: the data models they loaded into, the infrastructure they ran on, and the scheduled deployments that shipped them.'
      ]
    }
  ],

  projects: [
    {
      name: 'OHDSI OMOP Standardisation',
      employer: 'Everest Engineering',
      client: "Murdoch Children's Research Institute",
      role: 'Senior Data Engineer',
      duration: 'Sep 2025 - Sep 2026',
      tech: ['Python', 'PySpark', 'AWS Glue', 'Amazon S3', 'Amazon Aurora', 'AWS Bedrock', 'OpenTofu', 'GitLab CI/CD'],
      bullets: [
        'Developed a greenfield, metadata-driven ETL application that standardises allergy research data into the OHDSI OMOP Common Data Model.',
        'Carried three research studies through to production on the shared OMOP schema during development.',
        'Designed a reusable REDCap ingestion pattern with configurable parameters per study, enabling automated extraction of source data to Amazon S3 without code changes between studies.',
        'Built an event-driven orchestration flow across S3, EventBridge, Lambda and Glue that carries each study through validation, data quality checks, transformation and load without manual intervention.',
        'Enabled cross-study analysis by merging independently collected studies into a single shared OMOP schema, resolving identifier collisions across studies and preventing duplicate records on re-runs.',
        'Introduced a candidate schema that is rebuilt and validated by automated OHDSI data quality analysis before any study is promoted to the published production dataset.',
        'Provisioned and managed all AWS infrastructure (Glue, Lambda, S3, Aurora, Bedrock KnowledgeBase) using OpenTofu, with end-to-end deployment automated through GitLab CI/CD pipelines.',
        'Integrated AWS Bedrock KnowledgeBase with a retrieval-augmented generation approach to auto-generate OMOP mapping specifications from study metadata, reducing manual mapping effort.'
      ]
    },
    {
      name: 'Stripe Migration and Integration',
      employer: 'Everest Engineering',
      client: 'Travello',
      role: 'Backend Developer',
      duration: 'Nov 2024 - Jan 2025',
      tech: ['Kotlin', 'Spring Boot', 'GraphQL', 'React', 'TypeScript'],
      bullets: [
        "Developer on a four-person team responsible for migrating a travel platform's payments from Braintree to Stripe, implementing the equivalent Stripe solution for every Braintree payment method offered.",
        'Enabled payments through a separate Stripe account per currency, matched to booking currency, across both the checkout front end and the payment service.'
      ]
    },
    {
      name: 'Data Platform Modernisation',
      employer: 'Everest Engineering',
      client: 'Mindvalley',
      role: 'Data Engineer',
      duration: 'Jan 2024 - Oct 2024',
      tech: ['GoogleSQL (BigQuery)', 'Python', 'dbt', 'Apache Airflow', 'Google Cloud Composer', 'Astronomer Cosmos', 'GitHub Actions'],
      bullets: [
        "Built the consolidated and star-schema layers of Mindvalley's BigQuery warehouse on an L1/L2/L3 medallion architecture, unifying Zuora, Stripe, PayPal, Bizzabo, RevenueCat and internal platform data into conformed sales models for payments, refunds, invoices and payment methods.",
        'Made revenue queryable by geography and acquisition channel through country-tier mapping and traffic source attribution carried into the sales facts, alongside the country and product funnel dimensions they resolve against.',
        'Orchestrated dbt on Google Cloud Composer through Astronomer Cosmos, using cross-DAG sensors so each layer runs only once the ingestion it depends on has landed, with sensor timing tuned to upstream schedules to cut idle waiting and false timeouts.',
        'Integrated dbt unit tests covering transformation logic and not-null constraints on monetary fields, and wired dbt tests into CI so a model change could not merge without them passing.',
        'Developed staging and production deployment workflows in GitHub Actions with automatic date-based release tagging, plus security scanning in pre-commit hooks.',
        'Built Auth0 ingestion into BigQuery: a change-data-capture operator and DAG that pages the Auth0 management API with adaptive intervals and retry handling for rate limits and transient failures, a bulk user export, and validation of the machine-to-machine credentials the pipeline depends on.'
      ]
    },
    {
      name: 'Learning Portal',
      employer: 'Everest Engineering',
      client: 'KidsGetMoney',
      role: 'Full Stack Developer',
      duration: 'Aug 2023 - Nov 2023',
      tech: ['NestJS', 'TypeScript', 'GraphQL', 'React', 'Python', 'AWS Lambda', 'ECS', 'S3', 'CloudFront', 'Auth0'],
      bullets: [
        'Established authentication and authorisation end to end for a learning portal integrated with an LMS, carrying Auth0 single sign-on through to the GraphQL API and applying role guards per operation so teachers, parents, students and administrators each reached only what their role allowed.',
        'Built account provisioning and the invitation flow behind it, creating an invited learner in Auth0 and in the LMS, placing them in the group carrying their purchased program, and letting them set their own password rather than issuing a temporary credential.',
        "Surfaced the program catalogue and each learner's progress in one view, combining modules and ordered lessons with completion state drawn from the LMS.",
        'Processed Stripe checkout events in an event-driven Lambda, verifying webhook signatures before trusting a payload, and delivered CSV-driven administrative workflows for client subscription, bulk invitation and usage reporting with per-row validation.',
        'Set up the React portal and the delivery pipelines behind all three components, with lint and test gates, containerised API releases to ECS, and the web app published to S3 and CloudFront.'
      ]
    },
    {
      name: 'SEQTA School Management Platform',
      employer: 'Everest Engineering',
      client: 'Education Horizons',
      role: 'Full Stack Developer',
      duration: 'Nov 2022 - Jun 2023',
      tech: ['Java', 'JavaScript', 'React', 'Python', 'PostgreSQL', 'Docker', 'Microsoft Graph API'],
      bullets: [
        'Created a tool that automated the repetitive investigation work support engineers ran per school site, retrieving sync service logs over SSH, extracting error detail with its preceding context, and running data sanity checks against the site database, reducing IT support time on routine sync incidents.',
        'Automated timetable and daily-organisation rollouts against Edval, Synergetic and Timetabler, replacing manual per-site steps with a repeatable process that verified source data against what had landed in SEQTA.',
        'Built the Microsoft Teams integration for SEQTA, provisioning a Team and general channel per class from enrolment data through the Microsoft Graph API and keeping them current as classes were renamed, re-staffed and archived.'
      ]
    },
    {
      name: 'Timesheets',
      employer: 'Everest Engineering',
      client: 'Everest Engineering (internal product)',
      role: 'Full Stack Developer',
      duration: 'Oct 2022 - Nov 2022',
      tech: ['Node.js', 'TypeScript', 'Slack Bolt', 'PostgREST', 'PostgreSQL', 'Docker', 'AWS'],
      bullets: [
        'Contributed to the internal timesheet application, a Slack app where staff log hours through slash commands and the same data drives client invoicing.',
        'Closed a billing integrity gap by making invoiced time immutable so hours can no longer be edited once an invoice has been raised against them, and surfaced billed state in timesheet history so users see the restriction before attempting a change.'
      ]
    },
    {
      name: 'Product Merchandise Data',
      employer: 'ThoughtWorks',
      client: 'Mercedes-Benz (Daimler AG)',
      role: 'Data Engineer',
      duration: 'Sep 2020 - Sep 2022',
      tech: ['Apache Spark', 'Scala', 'Python', 'Neo4j', 'Terraform', 'GoCD', 'Kubernetes', 'AWS EKS'],
      bullets: [
        'Designed scalable ETL pipelines to extract, transform and load data from relational databases into Neo4j graph databases.',
        'Used Apache Spark with Scala to perform complex transformations and optimise data for graph modelling.',
        'Contributed to the design and implementation of graph data models derived from relational data structures.',
        'Developed a data quality framework in Python to automatically identify and flag data anomalies and integrity issues.',
        'Automated CI/CD pipelines for deployment on AWS EKS, using Terraform for infrastructure as code and GoCD for pipeline orchestration.'
      ]
    },
    {
      name: 'Agricultural Retailer Platform',
      employer: 'ThoughtWorks',
      client: 'Yara International',
      role: 'Full Stack Developer',
      duration: 'Jun 2020 - Aug 2020',
      tech: ['Java', 'Spring Boot'],
      bullets: [
        'Developed a web application connecting farmers with major pesticide and Yara fertiliser retailers in Africa, enabling access to free agricultural pesticides.'
      ]
    }
  ]
};
