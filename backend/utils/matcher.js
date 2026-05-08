// Master skill list
const SKILL_KEYWORDS = [
  "JavaScript",
  "TypeScript",
  "React",
  "Vue.js",
  "Angular",
  "Node.js",
  "Express.js",
  "Python",
  "Java",
  "C++",
  "C#",
  "Go",
  "Rust",
  "Ruby",
  "PHP",
  "Swift",
  "Kotlin",
  "SQL",
  "MySQL",
  "PostgreSQL",
  "MongoDB",
  "Redis",
  "Elasticsearch",
  "SQLite",
  "AWS",
  "Azure",
  "GCP",
  "Firebase",
  "Docker",
  "Kubernetes",
  "Terraform",
  "Ansible",
  "Jenkins",
  "CI/CD",
  "Git",
  "GitHub",
  "GitLab",
  "REST API",
  "GraphQL",
  "gRPC",
  "WebSockets",
  "HTML",
  "CSS",
  "Sass",
  "Tailwind CSS",
  "Bootstrap",
  "Webpack",
  "Next.js",
  "Nuxt.js",
  "Gatsby",
  "Remix",
  "Django",
  "FastAPI",
  "Flask",
  "Spring Boot",
  "Laravel",
  "Rails",
  "Machine Learning",
  "Deep Learning",
  "TensorFlow",
  "PyTorch",
  "Scikit-learn",
  "Data Science",
  "Pandas",
  "NumPy",
  "Matplotlib",
  "Jupyter",
  "React Native",
  "Flutter",
  "Ionic",
  "Redux",
  "MobX",
  "Zustand",
  "Recoil",
  "Jest",
  "Cypress",
  "Mocha",
  "Selenium",
  "Playwright",
  "Nginx",
  "Apache",
  "Linux",
  "Bash",
  "Shell",
  "Kafka",
  "RabbitMQ",
  "NATS",
  "Figma",
  "Adobe XD",
  "Sketch",
  "Agile",
  "Scrum",
  "Kanban",
  "Jira",
  "Confluence",
];

//Synonyms / aliases
const ALIASES = {
  "react.js": "React",
  reactjs: "React",
  nodejs: "Node.js",
  node: "Node.js",
  vuejs: "Vue.js",
  vue: "Vue.js",
  postgres: "PostgreSQL",
  pg: "PostgreSQL",
  mongo: "MongoDB",
  k8s: "Kubernetes",
  tf: "TensorFlow",
  ml: "Machine Learning",
  dl: "Deep Learning",
  js: "JavaScript",
  ts: "TypeScript",
};

/**
 * Normalise a word: lowercase, collapse aliases to canonical form
 */
function normalise(word) {
  const w = word.toLowerCase().trim();
  return ALIASES[w] || w;
}

/**
 * Extract recognised skills from a block of text.
 * Returns an array of canonical skill strings.
 */
function extractSkills(text = "") {
  if (!text) return [];
  const lower = text.toLowerCase();
  const found = new Set();

  for (const skill of SKILL_KEYWORDS) {
    const s = skill.toLowerCase();
    // word-boundary check — avoid "rust" matching "frustrated"
    const pattern = new RegExp(
      `(?<![a-z])${s.replace(/[.+]/g, "\\$&")}(?![a-z])`,
      "i",
    );
    if (pattern.test(lower)) found.add(skill);
  }

  // Also check aliases
  for (const [alias, canonical] of Object.entries(ALIASES)) {
    const pattern = new RegExp(
      `(?<![a-z])${alias.replace(/[.+]/g, "\\$&")}(?![a-z])`,
      "i",
    );
    if (pattern.test(lower)) found.add(canonical);
  }

  return [...found];
}

/**
 * Core match function.
 * @param {string[]} resumeSkills  - skills extracted from resume
 * @param {string[]} jdSkills      - skills extracted from JD
 * @returns {{ matched, missing, percentage }}
 */
function computeMatch(resumeSkills = [], jdSkills = []) {
  if (!jdSkills.length) {
    return { matched: [], missing: [], percentage: 0 };
  }

  const resumeSet = new Set(resumeSkills.map((s) => s.toLowerCase()));

  const matched = jdSkills.filter((s) => resumeSet.has(s.toLowerCase()));
  const missing = jdSkills.filter((s) => !resumeSet.has(s.toLowerCase()));
  const percentage = Math.round((matched.length / jdSkills.length) * 100);

  return { matched, missing, percentage };
}

/**
 * Recommendations for missing skills.
 */
const RESOURCE_MAP = {
  AWS: "Earn the AWS Solutions Architect Associate via A Cloud Guru or Coursera.",
  Docker:
    'Follow Docker\'s official "Get Started" guide and write your first Dockerfile.',
  Kubernetes: "Install Minikube locally, then target the CKA exam path.",
  "Machine Learning":
    "Complete Andrew Ng's ML Specialization on Coursera (free audit).",
  TensorFlow:
    "Work through the TensorFlow Developer Certificate program by Google.",
  GraphQL: "Build a full-stack app with Apollo Server + Apollo Client.",
  TypeScript:
    "Read the official TypeScript Handbook and migrate a JS project to TS.",
  PostgreSQL:
    "Complete postgresqltutorial.com and build a CRUD API with pg library.",
  Redis: "Take free courses at university.redis.com and cache a real project.",
  "Next.js":
    "Follow the official Next.js Learn course and ship a full-stack app.",
  Terraform:
    "Complete HashiCorp's interactive tutorials at developer.hashicorp.com.",
  Kafka: "Read Confluent's Kafka 101 and spin up a local cluster via Docker.",
};

function getRecommendations(missingSkills = []) {
  return missingSkills.slice(0, 6).map((skill) => ({
    skill,
    resource:
      RESOURCE_MAP[skill] ||
      `Build a hands-on project with ${skill} and study the official docs.`,
  }));
}

module.exports = {
  extractSkills,
  computeMatch,
  getRecommendations,
  SKILL_KEYWORDS,
};
