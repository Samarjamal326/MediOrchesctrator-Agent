export interface MedicalDomainAgent {
  id: string;
  name: string;
  domain: string;
  specialization: string;
  status: 'operational' | 'in_development' | 'planned';
  primaryModel: string;
  kbSources: string[];
  kbSize: 'Small' | 'Medium' | 'Large';
  updateFrequency: string;
  modulePath: string;
  responsibilities: string[];
  samplePrompts: string[];
  iconName: string;
}

export const TWELVE_MEDICAL_DOMAINS: MedicalDomainAgent[] = [
  {
    id: "general_medicine",
    name: "General Medicine",
    domain: "general_medicine",
    specialization: "Acute & chronic systemic symptoms, triage, multisystem presentations",
    status: "operational",
    primaryModel: "qwen2.5:3b (Local Ollama)",
    kbSources: ["WHO Guidelines", "CDC Protocols", "Merck Manual Clinical Database"],
    kbSize: "Large",
    updateFrequency: "Quarterly",
    modulePath: "backend/agents/general_medicine/agent.py",
    responsibilities: [
      "Initial symptom synthesis & differential guidance",
      "Identification of red-flag emergency symptoms",
      "Evidence-based primary care suggestions",
      "Multi-domain orchestration escalation"
    ],
    samplePrompts: [
      "I have a mild, dull headache behind my eyes and temples for the past 2 days.",
      "What are early signs of viral versus bacterial throat infection?"
    ],
    iconName: "Stethoscope"
  },
  {
    id: "nutrition",
    name: "Nutrition & Metabolic",
    domain: "nutrition",
    specialization: "Dietetics, metabolic homeostasis, macronutrient & micronutrient therapy",
    status: "operational",
    primaryModel: "qwen2.5:3b (Local Ollama)",
    kbSources: ["USDA FoodData Central", "WHO Nutrition Guidelines", "AND Practice Guides"],
    kbSize: "Medium",
    updateFrequency: "Monthly",
    modulePath: "backend/agents/nutrition/agent.py",
    responsibilities: [
      "Bioavailability and nutrient pairing analysis",
      "Dietary interventions for glycemic management",
      "Nutrient-drug interaction cautions",
      "Sustainable metabolic lifestyle design"
    ],
    samplePrompts: [
      "What are the best dietary sources of non-heme iron and how should I pair them?",
      "What foods help support gut lining and reduce chronic intestinal inflammation?"
    ],
    iconName: "Salad"
  },
  {
    id: "dermatology",
    name: "Dermatology",
    domain: "dermatology",
    specialization: "Cutaneous lesions, barrier integrity, rash triage, topical pharmacotherapy",
    status: "operational",
    primaryModel: "qwen2.5:3b (Local Ollama)",
    kbSources: ["AAD Clinical Guidelines", "DermNet New Zealand", "British Association of Dermatologists"],
    kbSize: "Medium",
    updateFrequency: "Quarterly",
    modulePath: "backend/agents/dermatology/agent.py",
    responsibilities: [
      "Cutaneous symptom differential and barrier repair guidance",
      "Melanoma ABCDE warning criteria education",
      "Topical therapy contraindication checks",
      "Referral recommendations for in-person dermoscopy"
    ],
    samplePrompts: [
      "I have an itchy, red annular rash on my forearm that started after gardening.",
      "What is the recommended approach to managing mild comedonal acne without drying skin?"
    ],
    iconName: "Sparkle"
  },
  {
    id: "dentistry",
    name: "Dentistry & Oral Health",
    domain: "dentistry",
    specialization: "Dental caries, periodontal pathology, maxillofacial trauma triage",
    status: "in_development",
    primaryModel: "Planned: qwen2.5:7b / Specialized MedLLM",
    kbSources: ["ADA Guidelines", "AAP Periodontal Classifications", "Cochrane Oral Health"],
    kbSize: "Medium",
    updateFrequency: "Quarterly",
    modulePath: "backend/agents/dentistry/ (scaffolded)",
    responsibilities: [
      "Toothache differential & acute pulpitis guidance",
      "Post-extraction recovery instructions",
      "Oral mucosal lesion red-flag detection"
    ],
    samplePrompts: [
      "Sharp pain when drinking cold liquids in lower left molar.",
      "Bleeding gums during flossing for 3 consecutive weeks."
    ],
    iconName: "Smile"
  },
  {
    id: "cardiology",
    name: "Cardiology",
    domain: "cardiology",
    specialization: "Cardiovascular hemodynamics, hypertension, ischemic warnings, arrhythmias",
    status: "planned",
    primaryModel: "Planned: Llama-3.3-Med / Clinical-70B",
    kbSources: ["ACC/AHA Guidelines", "ESC Clinical Practice Guidelines", "Framingham Risk Data"],
    kbSize: "Large",
    updateFrequency: "Quarterly",
    modulePath: "backend/agents/cardiology/ (planned)",
    responsibilities: [
      "Cardiovascular risk assessment interpretation",
      "Immediate triage for acute coronary syndrome red-flags",
      "Hypertension lifestyle & monitoring guidance"
    ],
    samplePrompts: [
      "Occasional heart palpitations after exercise with lightheadedness.",
      "What lifestyle factors most effectively lower systolic blood pressure?"
    ],
    iconName: "HeartPulse"
  },
  {
    id: "orthopedics",
    name: "Orthopedics & Sports Med",
    domain: "orthopedics",
    specialization: "Musculoskeletal injuries, joint mechanics, spine health, physical rehab",
    status: "planned",
    primaryModel: "Planned: Gemini-Pro-Med / Local 14B",
    kbSources: ["AAOS Guidelines", "ACSM Guidelines for Exercise Testing", "Cochrane MSK"],
    kbSize: "Medium",
    updateFrequency: "Bi-annual",
    modulePath: "backend/agents/orthopedics/ (planned)",
    responsibilities: [
      "Ligament vs tendon strain preliminary distinction",
      "RICE & PEACE/LOVE acute injury recovery protocols",
      "Ergonomic postural evaluation principles"
    ],
    samplePrompts: [
      "Twisted knee during soccer, heard a pop with immediate swelling.",
      "Lower back stiffness worse in mornings after sitting all day."
    ],
    iconName: "Bone"
  },
  {
    id: "neurology",
    name: "Neurology",
    domain: "neurology",
    specialization: "Central & peripheral neuro-pathology, neuropathies, cephalgia syndromes",
    status: "planned",
    primaryModel: "Planned: GPT-4o-Mini-Med / Local 32B",
    kbSources: ["AAN Guidelines", "International Headache Society (ICHD-3)", "NINDS"],
    kbSize: "Large",
    updateFrequency: "Quarterly",
    modulePath: "backend/agents/neurology/ (planned)",
    responsibilities: [
      "FAST stroke red-flag emergency screening",
      "Migraine vs cluster vs tension cephalgia differential",
      "Peripheral neuropathy sensory symptom triage"
    ],
    samplePrompts: [
      "Tingling in fingers and thumb waking me up at night.",
      "One-sided throbbing headache with visual aura and nausea."
    ],
    iconName: "Brain"
  },
  {
    id: "mental_health",
    name: "Mental Health & Behavioral",
    domain: "mental_health",
    specialization: "Mood disorders, acute anxiety, cognitive behavioral frameworks, sleep hygiene",
    status: "planned",
    primaryModel: "Planned: Claude 3.5 Sonnet / Llama 3 8B Guard",
    kbSources: ["DSM-5-TR Summaries", "APA Clinical Practice Guidelines", "NICE Mental Health"],
    kbSize: "Large",
    updateFrequency: "Annual",
    modulePath: "backend/agents/mental_health/ (planned)",
    responsibilities: [
      "Grounding techniques for panic and autonomic arousal",
      "Sleep hygiene & circadian stabilization protocols",
      "Immediate routing to 988 crisis lifelines when self-harm indicated"
    ],
    samplePrompts: [
      "Feeling persistent overwhelming anxiety and racing thoughts before bed.",
      "Evidence-based cognitive reframing strategies for work burnout."
    ],
    iconName: "Flame"
  },
  {
    id: "pharmacy",
    name: "Pharmacology & Therapeutics",
    domain: "pharmacy",
    specialization: "Drug mechanism of action, pharmacokinetics, polypharmacy interactions",
    status: "planned",
    primaryModel: "Planned: GPT-4o / DrugBank-LLM",
    kbSources: ["FDA Orange Book", "DrugBank Database", "Lexicomp Clinical Reference"],
    kbSize: "Large",
    updateFrequency: "Monthly",
    modulePath: "backend/agents/pharmacy/ (planned)",
    responsibilities: [
      "Drug-drug & drug-supplement interaction screening",
      "Common adverse side-effect profiles & timing",
      "Missed dose guidance protocols"
    ],
    samplePrompts: [
      "Can I take magnesium glycinate with my daily antibiotic prescription?",
      "Common side effects when starting SSRI medications in first two weeks."
    ],
    iconName: "Pill"
  },
  {
    id: "emergency",
    name: "Emergency Medicine & Triage",
    domain: "emergency",
    specialization: "Acuity stratification, shock detection, vital instability protocol",
    status: "planned",
    primaryModel: "Planned: Strict Rule-Engine + Fast Low-Latency LLM",
    kbSources: ["ACLS Guidelines", "ATLS Emergency Protocols", "Emergency Severity Index (ESI)"],
    kbSize: "Medium",
    updateFrequency: "Annual",
    modulePath: "backend/agents/emergency/ (planned)",
    responsibilities: [
      "Emergency Severity Index (ESI 1-5) rapid grading",
      "Instant disclaimer injection and localized emergency dispatch prompt",
      "Immediate pipeline bypass to safeguard user life"
    ],
    samplePrompts: [
      "Sudden crushing chest pressure, diaphoresis, radiating pain.",
      "Difficulty swallowing with rapidly swelling lips and hives."
    ],
    iconName: "AlertOctagon"
  },
  {
    id: "womens_health",
    name: "Women's & Reproductive Health",
    domain: "womens_health",
    specialization: "Obstetrics, gynecology, endocrine cycles, perimenopause, maternal wellness",
    status: "planned",
    primaryModel: "Planned: Gemini-Pro-Med / Local 14B",
    kbSources: ["ACOG Practice Bulletins", "RCOG Guidelines", "Endocrine Society Clinical Practice"],
    kbSize: "Medium",
    updateFrequency: "Quarterly",
    modulePath: "backend/agents/womens_health/ (planned)",
    responsibilities: [
      "Menstrual cycle irregularity differential factors",
      "Perimenopausal symptom mitigation and HRT discussion points",
      "Pregnancy medication safety classifications"
    ],
    samplePrompts: [
      "Irregular cycles accompanied by sudden adult acne and fatigue.",
      "Non-hormonal relief options for severe hot flashes."
    ],
    iconName: "Users"
  },
  {
    id: "pathology",
    name: "Pathology & Laboratory Medicine",
    domain: "pathology",
    specialization: "Biochemical markers, hematology, lipid panels, diagnostic lab interpretation",
    status: "planned",
    primaryModel: "Planned: GPT-4o / Specialized Lab Classifier",
    kbSources: ["CAP Laboratory Guidelines", "AACC Practice Guidelines", "Reference Range Atlas"],
    kbSize: "Medium",
    updateFrequency: "Bi-annual",
    modulePath: "backend/agents/pathology/ (planned)",
    responsibilities: [
      "Complete blood count (CBC) parameter explanation",
      "Comprehensive metabolic panel (CMP) trend contextualization",
      "Pre-analytical factors influencing blood test readings"
    ],
    samplePrompts: [
      "What does an elevated MCV and low ferritin indicate on a blood test?",
      "Why would serum ALT be temporarily elevated after intense weight training?"
    ],
    iconName: "TestTube"
  }
];
