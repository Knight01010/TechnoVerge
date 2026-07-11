/**
 * Single source of truth for all site copy and data.
 * Sections import from here — no copy lives inside components.
 */

export const site = {
  name: 'MS Technoverge',
  email: 'hello@mstechnoverge.com',
  tagline: 'AI Transformation × Cybersecurity Assurance',
  year: 2026,
};

export const bootLines = [
  { text: 'init ms.technoverge.core', status: 'OK' },
  { text: 'loading advisory modules', status: 'OK' },
  { text: 'arming security stack', status: 'OK' },
  { text: 'network mesh handshake', status: 'ONLINE' },
];

export const menuLinks = [
  { num: '01', href: '#hero', label: 'Home', meta: 'sys.root' },
  { num: '02', href: '#manifesto', label: 'Threat report', meta: 'scan.log' },
  { num: '03', href: '#practices', label: 'Practices', meta: '3 units' },
  { num: '04', href: '#services', label: 'Services', meta: '10 modules' },
  { num: '05', href: '#contact', label: 'Contact', meta: 'open channel' },
];

export const hero = {
  badge: 'AI advisory × cybersecurity — one accountable partner',
  line1: 'AI AMBITION,',
  line2Plain: 'ZERO COMPROMISE_',
  line2Lead: 'ZERO ',
  line2Accent: 'COMPROMISE_',
  sub: 'We find the AI worth building, ship it to production, and harden it against the threats that follow — on infrastructure engineered to hold.',
  cta: 'Initiate contact ↗',
  topLabels: ['[01] AI Transformation', '[02] Cybersecurity', '[03] Infrastructure'],
};

export const ticker =
  'AI Transformation Advisory /// Cybersecurity Assurance /// Network & Infrastructure /// 24·7 Monitoring /// Zero-Trust by Default ///';

/** Words wrapped in *asterisks* light up red as the reader scrolls. */
export const manifestoText =
  'Most AI initiatives never survive the pilot. Budgets burn, the *attack* *surface* grows, and nothing ships. We turn ambition into *operating* *reality* — high-value AI shipped, *hardened* against threats, on infrastructure built to hold.';

export type PracticeTheme = {
  bg: string;
  ink: string;
  sub: string;
  line: string;
  num: string;
  grid: string;
  corner: string;
  motif: string;
};

export const practiceThemes: PracticeTheme[] = [
  {
    bg: '#0A0C0E',
    ink: '#E6E8E6',
    sub: 'rgba(230,232,230,.62)',
    line: 'rgba(230,232,230,.25)',
    num: 'rgba(230,232,230,.1)',
    grid: 'rgba(230,232,230,.045)',
    corner: '#E01B1B',
    motif: 'rgba(224,27,27,.22)',
  },
  {
    bg: '#E01B1B',
    ink: '#050607',
    sub: 'rgba(5,6,7,.72)',
    line: 'rgba(5,6,7,.35)',
    num: 'rgba(5,6,7,.16)',
    grid: 'rgba(5,6,7,.08)',
    corner: '#050607',
    motif: 'rgba(5,6,7,.28)',
  },
  {
    bg: '#101417',
    ink: '#E6E8E6',
    sub: 'rgba(230,232,230,.62)',
    line: 'rgba(230,232,230,.25)',
    num: 'rgba(230,232,230,.1)',
    grid: 'rgba(230,232,230,.045)',
    corner: '#E01B1B',
    motif: 'rgba(230,232,230,.16)',
  },
];

export const practices = [
  {
    num: '01',
    tag: 'Practice // Advisory',
    title: 'AI Transformation',
    desc: 'We find the AI worth building. High-value use cases identified, business-cased, and taken from pilot to production — with adoption that sticks.',
    chips: ['Opportunity Radar', 'AI Roadmap', 'Responsible Implementation', 'Governance'],
  },
  {
    num: '02',
    tag: 'Practice // Security',
    title: 'Cybersecurity Assurance',
    desc: 'Move fast without breaking trust. Posture assessed, AI risk governed, and defenses ready before attackers — or auditors — arrive.',
    chips: ['Posture Assessment', 'AI Risk & Compliance', 'Detection Readiness'],
  },
  {
    num: '03',
    tag: 'Practice // Infrastructure',
    title: 'Network & Infrastructure',
    desc: 'The foundation for what is next. Networks modernized, cloud and edge engineered for the workloads AI actually demands.',
    chips: ['Network Modernization', 'Cloud & Edge', 'Resilience Engineering'],
  },
];

export const services = [
  {
    id: '01',
    tag: 'Advisory',
    name: 'AI Opportunity Radar',
    purpose:
      'A structured scan of your operations to surface the AI use cases with real ROI — ranked by value, feasibility, and risk.',
    duration: '3–4 weeks',
  },
  {
    id: '02',
    tag: 'Advisory',
    name: 'AI Roadmap & Business Case',
    purpose:
      'The board-ready plan: sequenced initiatives, investment cases, and the operating model to deliver them.',
    duration: '4–6 weeks',
  },
  {
    id: '03',
    tag: 'Advisory',
    name: 'Responsible AI Implementation',
    purpose:
      'From pilot to production with governance built in — model selection, integration, and adoption that survives contact with reality.',
    duration: '8–16 weeks',
  },
  {
    id: '04',
    tag: 'Advisory',
    name: 'AI Governance & Enablement',
    purpose:
      'Policies, guardrails, and training so your teams ship AI confidently — and compliantly.',
    duration: 'ongoing',
  },
  {
    id: '05',
    tag: 'Security',
    name: 'Security Posture Assessment',
    purpose:
      'A clear-eyed audit of your defenses, mapped to the threats that actually target you.',
    duration: '3–5 weeks',
  },
  {
    id: '06',
    tag: 'Security',
    name: 'AI Risk & Compliance',
    purpose:
      'Get ahead of AI-specific risk — data leakage, model abuse, regulatory exposure — before it gets ahead of you.',
    duration: '4–8 weeks',
  },
  {
    id: '07',
    tag: 'Security',
    name: 'Detection & Response Readiness',
    purpose:
      'Instrumentation, playbooks, and drills so an incident is a Tuesday, not a catastrophe.',
    duration: '6–10 weeks',
  },
  {
    id: '08',
    tag: 'Infrastructure',
    name: 'Network Modernization',
    purpose:
      'Re-architect the network for cloud, edge, and AI workloads — without betting the business on a big bang.',
    duration: '10–20 weeks',
  },
  {
    id: '09',
    tag: 'Infrastructure',
    name: 'Cloud & Edge Engineering',
    purpose:
      'Right-sized compute where the work happens, engineered for the loads AI actually creates.',
    duration: '8–16 weeks',
  },
  {
    id: '10',
    tag: 'Infrastructure',
    name: 'Resilience Engineering',
    purpose:
      'Failover, recovery, and continuity designed in — so transformation never means fragility.',
    duration: '6–12 weeks',
  },
];

export const servicesCta = {
  id: 'SVC/11 → ∞',
  text: "Not sure where to start? That's the point. ↗",
};

export const processSteps = [
  {
    num: '01',
    title: 'Discover',
    desc: 'Workshops with your leaders to map ambition, constraints, and the honest state of your estate.',
  },
  {
    num: '02',
    title: 'Assess',
    desc: 'Value, risk, and readiness scored across AI, security, and infrastructure — one integrated view.',
  },
  {
    num: '03',
    title: 'Roadmap',
    desc: 'A sequenced plan with business cases attached. No decks that die in a drawer.',
  },
  {
    num: '04',
    title: 'Implement',
    desc: 'We build alongside your teams — production systems, not proofs of concept.',
  },
  {
    num: '05',
    title: 'Secure',
    desc: 'Guardrails, governance, and detection wired in from day one, not bolted on after.',
  },
  {
    num: '06',
    title: 'Operate',
    desc: 'Measured outcomes, enablement, and a foundation that keeps compounding.',
  },
];

export const footerLinks = [
  { href: '#manifesto', label: 'Threat report' },
  { href: '#practices', label: 'Practices' },
  { href: '#services', label: 'Services' },
  { href: '#process', label: 'Protocol' },
];
