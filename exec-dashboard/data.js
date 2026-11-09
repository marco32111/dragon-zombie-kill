/* Executive Path — content library. Plain data; edit freely. */
window.EP = {};

/* ---------- Answer formats & frameworks ---------- */
EP.formats = [
  { key: "STAR", name: "STAR — behavioral answers", tag: "comm",
    letters: [
      ["S", "Situation", "One or two sentences of context: where, when, what was at stake. Keep it under 15 seconds."],
      ["T", "Task", "Your responsibility or the goal you owned. Say “I was accountable for…”"],
      ["A", "Action", "What YOU did, in 2–3 concrete steps. Use “I” for decisions, “we” for team execution."],
      ["R", "Result", "Quantify the outcome (%, $, days, incidents). Add the lesson or the process you made permanent."]
    ],
    tip: "Spend about 60% of your time on Action and Result. End every answer on a number or a lasting process change." },
  { key: "SMART", name: "SMART — goals and assignments", tag: "comm",
    letters: [
      ["S", "Specific", "Name exactly what will be delivered and by whom."],
      ["M", "Measurable", "Attach a metric: count, %, cycle time, dollars."],
      ["A", "Achievable", "Realistic with the staff, budget and authority you actually have."],
      ["R", "Relevant", "Ties directly to division and LADWP strategic goals (you also called it “relatable”)."],
      ["T", "Time-bound", "A due date and check-in points (timely)."]
    ],
    tip: "Example: “Reduce average new-service design cycle time from 45 to 35 business days by June 30 by standardizing the plan-check checklist.”" },
  { key: "PREP", name: "PREP — short opinion answers", tag: "comm",
    letters: [
      ["P", "Point", "Lead with your answer in one sentence."],
      ["R", "Reason", "Why you believe it."],
      ["E", "Example", "One short proof point."],
      ["P", "Point", "Restate the answer and stop."]
    ],
    tip: "Use PREP when the question is “What is your view on…?” and STAR when it is “Tell me about a time…”" },
  { key: "SCR", name: "SCR — executive briefing (Pyramid Principle)", tag: "strategy",
    letters: [
      ["S", "Situation", "What everyone agrees is true today."],
      ["C", "Complication", "What changed or what is at risk."],
      ["R", "Resolution", "Your recommendation, stated first in the room, then 3 supporting points."]
    ],
    tip: "Executives want the answer first. Say the recommendation in the first 20 seconds, then support it." }
];

/* ---------- Safety: 4 pillars (LAPP) ---------- */
EP.safetyPillars = {
  mnemonic: "LAPP",
  hook: "“Safety LAPPs every decision.” Leadership, Accountability, Prevention, Process improvement & recordkeeping.",
  pillars: [
    { l: "L", name: "Leadership", points: [
      "Set the tone: safety is a value, not a priority that shifts with schedule pressure.",
      "Be visible: regular field job walks and tailboard participation.",
      "Give every employee stop-work authority and back them when they use it.",
      "Resource safety: PPE, training time, and staffing are budgeted, not optional."] },
    { l: "A", name: "Accountability", points: [
      "Clear roles under the IIPP: who inspects, who corrects, who verifies.",
      "Supervisors are measured on leading indicators (inspections, JHAs, near-miss reports).",
      "Enforce rules consistently and fairly; recognize safe behavior publicly.",
      "Participate in and follow through on the Joint Labor-Management Safety Committee."] },
    { l: "P", name: "Prevention", points: [
      "Job Hazard Analysis before non-routine or high-risk field work.",
      "Hierarchy of controls: eliminate, substitute, engineer, administrative, then PPE.",
      "Near-miss reporting with no blame, so hazards surface early.",
      "Training before exposure: LOTO, arc flash, traffic control, heat illness."] },
    { l: "P", name: "Process improvement & Recordkeeping", points: [
      "Investigate every incident to root cause; fix the system, not just the person.",
      "Track corrective actions to closure with owners and dates.",
      "Keep IIPP records: inspections, training rosters, investigations, Cal/OSHA 300 log.",
      "Review trends quarterly and update procedures (Plan-Do-Check-Act)."] }
  ]
};

/* ---------- EEO: 4 pillars (LEAP) ---------- */
EP.eeoPillars = {
  mnemonic: "LEAP",
  hook: "“LEAP to fairness.” Leadership, Equity in practice, Awareness & prevention, Prompt response & accountability.",
  pillars: [
    { l: "L", name: "Leadership & commitment", points: [
      "Know and communicate the City of Los Angeles / LADWP EEO and anti-harassment policy.",
      "Model respectful conduct; zero tolerance for discrimination, harassment and retaliation.",
      "Set the expectation in staff meetings and onboarding, and repeat it."] },
    { l: "E", name: "Equity in practice", points: [
      "Merit-based, documented decisions for hiring, assignments, overtime, training and promotion.",
      "Consistent application of rules and discipline across the team.",
      "Engage in the interactive process for reasonable accommodation (ADA / FEHA)."] },
    { l: "A", name: "Awareness & prevention", points: [
      "Ensure required harassment-prevention training is current (California: supervisors 2 hours every 2 years).",
      "Post and explain reporting channels, including the EEO office.",
      "Watch for early warning signs: exclusion, jokes, unequal assignments."] },
    { l: "P", name: "Prompt response & accountability", points: [
      "When you see or hear of a possible violation, act and report promptly to the EEO office. Do not investigate it yourself unless directed.",
      "Protect against retaliation; keep information on a need-to-know basis.",
      "Cooperate with investigations, implement corrective action, and document."] }
  ]
};

/* ---------- IIPP: Cal/OSHA Title 8 §3203 ---------- */
EP.iipp = {
  hook: "8 required elements. Memory line: “Real Crews Communicate Hazards; Investigate, Hold, Train, Record.”",
  elements: [
    ["Responsibility", "Name the person(s) with authority and responsibility for implementing the program."],
    ["Compliance", "A system to ensure employees follow safe work practices: recognition, training, discipline."],
    ["Communication", "Two-way communication on safety, including a way to report hazards without fear of reprisal (tailboards, committee, postings)."],
    ["Hazard assessment", "Identify and evaluate hazards through scheduled periodic inspections and when new processes, equipment or hazards appear."],
    ["Accident / exposure investigation", "Procedures to investigate occupational injuries, illnesses and near misses."],
    ["Hazard correction", "Correct unsafe conditions in a timely manner based on severity; immediate action for imminent hazards."],
    ["Training & instruction", "When the program starts, for new hires, new assignments, new hazards, and for supervisors on the hazards their crews face."],
    ["Recordkeeping", "Document inspections, corrections and training (who, what, when) and keep the records."]
  ]
};

EP.safetyRoles = [
  ["Job Hazard Analysis (JHA)", "Require a JHA before high-risk or non-routine field work; review a sample of JHAs each month for quality, not just completion."],
  ["Field job walks", "Walk active job sites on a set cadence; observe, coach, and record findings as corrective actions."],
  ["Incident investigation", "Ensure every injury, illness and near miss is investigated to root cause within set timelines; review findings with the crew."],
  ["Joint Labor-Management Safety Committee (JLMSC)", "Participate, bring data, and close the action items the committee raises. It is the main two-way channel with labor."],
  ["Enforcement & recognition", "Apply rules consistently; recognize good catches and safe behavior as visibly as you correct unsafe acts."],
  ["Reporting", "Serious injuries are reported to Cal/OSHA within 8 hours; keep the Cal/OSHA 300 log accurate."],
  ["Program ownership", "As manager you own the IIPP for your section: it is current, trained, practiced and audited."]
];

EP.eeoRoles = [
  ["Know the policy", "The City of Los Angeles and LADWP prohibit discrimination, harassment and retaliation based on protected categories (race, color, religion, sex, gender identity and expression, sexual orientation, national origin, ancestry, age, disability, medical condition, genetic information, marital status, military/veteran status, and others under FEHA). Confirm the exact list against your copy."],
  ["Duty to report", "Managers who witness or learn of possible EEO violations report them promptly to the EEO office, even if the employee asks you not to."],
  ["No retaliation", "Protect complainants and witnesses. Watch for subtle retaliation: schedule changes, exclusion, assignment changes."],
  ["Reasonable accommodation", "Start the interactive process when an employee requests or needs accommodation; document good-faith engagement."],
  ["Fair decisions", "Base selection, assignment, overtime and discipline on documented, job-related criteria."],
  ["Training compliance", "Track harassment-prevention and EEO training for every supervisor and employee in your section."],
  ["Confidentiality", "Share information only on a need-to-know basis and keep records secure."]
];

/* ---------- Communication toolkit ---------- */
EP.comms = {
  openers: [
    "Good morning, everyone. Thank you for the opportunity to be here today.",
    "Good afternoon, everyone. I appreciate your time, and I’m excited to talk about how I can support the division’s goals.",
    "Thank you, panel. I’ll keep my answers focused and tie each one to results."
  ],
  icebreakers: [
    "I drove in past a crew working on a service upgrade this morning, which reminded me why this work matters to customers.",
    "Before we start, thank you for making time during a busy quarter for the division.",
    "I’ve been looking forward to this conversation; New Business is where electrification becomes real for our customers."
  ],
  bridges: [
    "The short answer is…, and here’s a specific example.",
    "I’ll answer that in three parts.",
    "What I learned from that, and what I’d bring to this role, is…",
    "To connect that back to your question…",
    "The result was…, and we made it permanent by…"
  ],
  unknowns: [
    "I don’t have that exact figure, but here’s how I would find it and what I’d expect to see.",
    "That’s a good question. Let me take a moment to structure my thoughts.",
    "Let me make sure I understand: are you asking about … or …?"
  ],
  closers: [
    "That’s my approach. Safety first, results driven, and measured.",
    "In short: I set the expectation, measure it, and follow through.",
    "I hope that answers your question. I’m happy to go deeper on any part."
  ]
};

EP.closings = [
  { name: "Value, vision, ask", text: "Thank you, everyone, for your time today. In this conversation I’ve tried to show three things: I lead with safety and fairness, I deliver measurable results with limited resources, and I build processes that last. In my first 90 days I would listen to the team, align our work to the division’s top priority projects, and set clear SMART goals we can report on. I’m excited about the chance to help New Business serve customers faster and safer, and I would welcome the opportunity to lead this team." },
  { name: "Three-pillar recap", text: "Thank you, panel. If I could leave you with three points: first, safety and EEO are not programs for me; they are how I manage every day. Second, I am results driven: I measure cycle time, backlog and customer outcomes, and I act on the data. Third, I develop people so the organization is stronger after me than before. I would be proud to bring that to this role." },
  { name: "Safety-first close", text: "Thank you for the opportunity. As a manager, my first responsibility is that every employee goes home safe, and every employee is treated with respect. On that foundation, I will drive the division’s priorities with clear goals, regular reporting and accountability. I am ready to take on this responsibility and I appreciate your consideration." },
  { name: "First 90 days close", text: "Thank you for your time. If selected, my first 30 days would be about listening and learning the team, the backlog and the top priority projects. By 60 days I would align on a short list of measurable goals with my director. By 90 days I would have a reporting rhythm in place so leadership always knows where we stand. I’m confident I can deliver that, and I would welcome the chance." },
  { name: "Gratitude and commitment", text: "I want to thank each of you for the thoughtful questions. This role matters to me because the work we do connects directly to reliable service for the people of Los Angeles. I bring the technical depth, the leadership discipline and the commitment to safety and fairness that this position requires. Thank you again, and I look forward to hearing from you." }
];

/* ---------- Executive frameworks ---------- */
EP.frameworks = [
  ["MECE", "Mutually Exclusive, Collectively Exhaustive. Break a problem into parts that don’t overlap and leave nothing out. The backbone of McKinsey-style case answers."],
  ["Issue tree", "Write the core question at the top, split it into 3–4 MECE drivers, and test each with data. Example: “Why is cycle time up?” splits into intake, design, permitting, construction."],
  ["Pyramid Principle", "Answer first, then group supporting arguments, then data. Executives read top-down."],
  ["30-60-90 plan", "30 days: listen and learn. 60 days: align on priorities and quick wins. 90 days: operating rhythm, metrics and first results."],
  ["RACI", "Responsible, Accountable, Consulted, Informed. Removes confusion over who decides."],
  ["PDCA", "Plan, Do, Check, Act. The continuous-improvement loop; also how an IIPP stays alive."],
  ["5 Whys", "Ask “why” until you reach a process cause you can fix. Used in incident investigation."],
  ["Eisenhower matrix", "Urgent versus important. Protect time for important-not-urgent work: coaching, planning, safety walks."],
  ["SWOT", "Strengths, Weaknesses, Opportunities, Threats. Good for a quick organizational read in your first 90 days."],
  ["Capacity vs. demand", "For resource questions: quantify demand (requests per month), capacity (FTE × throughput), and the gap. Then close it with prioritization, process, people or partners."]
];

/* ---------- LADWP context ---------- */
EP.ladwp = [
  ["Scale", "LADWP is the largest municipal utility in the United States, serving roughly 4 million residents of Los Angeles."],
  ["Clean energy target", "The City’s goal is 100% carbon-free electricity by 2035, informed by the LA100 study with NREL."],
  ["Strategic Long-Term Resource Plan (SLTRP)", "The Power System’s long-range plan for generation, transmission, storage and distribution investments to meet reliability and carbon goals."],
  ["Electrification and load growth", "Transportation and building electrification increase demand for new and upgraded services. That flows directly to New Business volume and cycle time."],
  ["Customer connections", "New Business connects customer projects: new services, upgrades, EV charging, solar and storage interconnection (NEM, BESS). Speed and reliability of connection is a visible customer outcome."],
  ["Reliability investment", "Aging infrastructure replacement (poles, cables, transformers, substations) competes with new-connection demand for the same crews and materials."],
  ["Your homework", "Upload or send the division’s top 10 priority projects, the CAR New Business slides, and the current SLTRP summary so the drills can use exact names and numbers."]
];

/* ---------- Acronyms ---------- */
EP.acronyms = [
  ["STAR", "Situation, Task, Action, Result", "comm"],
  ["SMART", "Specific, Measurable, Achievable, Relevant, Time-bound", "comm"],
  ["PREP", "Point, Reason, Example, Point", "comm"],
  ["SCR", "Situation, Complication, Resolution", "strategy"],
  ["LAPP", "Leadership, Accountability, Prevention, Process improvement & recordkeeping (your 4 safety pillars)", "safety"],
  ["LEAP", "Leadership, Equity in practice, Awareness & prevention, Prompt response & accountability (your 4 EEO pillars)", "eeo"],
  ["IIPP", "Injury and Illness Prevention Program", "safety"],
  ["JHA", "Job Hazard Analysis", "safety"],
  ["JLMSC", "Joint Labor-Management Safety Committee", "safety"],
  ["PPE", "Personal Protective Equipment", "safety"],
  ["LOTO", "Lockout/Tagout", "safety"],
  ["SDS", "Safety Data Sheet", "safety"],
  ["Cal/OSHA", "California Division of Occupational Safety and Health", "safety"],
  ["TRIR", "Total Recordable Incident Rate", "safety"],
  ["DART", "Days Away, Restricted or Transferred (rate)", "safety"],
  ["LTIR", "Lost Time Incident Rate", "safety"],
  ["EMR", "Experience Modification Rate", "safety"],
  ["RCA", "Root Cause Analysis", "safety"],
  ["CAPA", "Corrective and Preventive Action", "safety"],
  ["EEO", "Equal Employment Opportunity", "eeo"],
  ["ADA", "Americans with Disabilities Act", "eeo"],
  ["FEHA", "Fair Employment and Housing Act (California)", "eeo"],
  ["CRD", "California Civil Rights Department (formerly DFEH)", "eeo"],
  ["EEOC", "Equal Employment Opportunity Commission (federal)", "eeo"],
  ["MOU", "Memorandum of Understanding (labor agreement)", "ops"],
  ["RACI", "Responsible, Accountable, Consulted, Informed", "strategy"],
  ["MECE", "Mutually Exclusive, Collectively Exhaustive", "strategy"],
  ["PDCA", "Plan, Do, Check, Act", "strategy"],
  ["SWOT", "Strengths, Weaknesses, Opportunities, Threats", "strategy"],
  ["KPI", "Key Performance Indicator", "ops"],
  ["OKR", "Objectives and Key Results", "strategy"],
  ["SLA", "Service Level Agreement", "ops"],
  ["SOP", "Standard Operating Procedure", "ops"],
  ["EVM", "Earned Value Management", "ops"],
  ["CPI", "Cost Performance Index (EV ÷ AC)", "ops"],
  ["SPI", "Schedule Performance Index (EV ÷ PV)", "ops"],
  ["EAC", "Estimate at Completion", "ops"],
  ["BAC", "Budget at Completion", "ops"],
  ["CAPEX", "Capital Expenditure", "ops"],
  ["O&M", "Operations and Maintenance", "ops"],
  ["ROI", "Return on Investment", "ops"],
  ["NPV", "Net Present Value", "ops"],
  ["SAIDI", "System Average Interruption Duration Index", "ops"],
  ["SAIFI", "System Average Interruption Frequency Index", "ops"],
  ["CAIDI", "Customer Average Interruption Duration Index", "ops"],
  ["ASA", "Average Speed of Answer", "ops"],
  ["FCR", "First Contact Resolution", "ops"],
  ["CSAT", "Customer Satisfaction score", "ops"],
  ["NPS", "Net Promoter Score", "ops"],
  ["AHT", "Average Handle Time", "ops"],
  ["DER", "Distributed Energy Resources", "strategy"],
  ["NEM", "Net Energy Metering", "strategy"],
  ["BESS", "Battery Energy Storage System", "strategy"],
  ["SLTRP", "Strategic Long-Term Resource Plan", "strategy"],
  ["PMO", "Project Management Office", "ops"],
  ["QA/QC", "Quality Assurance / Quality Control", "ops"]
];

/* ---------- Executive vocabulary ---------- */
EP.vocab = [
  ["Alignment", "Everyone’s work points at the same priorities.", "My first step is alignment: the team’s work plan maps to the division’s top 10 projects."],
  ["Line of sight", "People can see how their task connects to the strategic goal.", "I want every designer to have line of sight from their work order to the customer energization date."],
  ["Operating rhythm", "The recurring cadence of meetings, reports and reviews that runs the organization.", "I’d establish a weekly operating rhythm: Monday priorities, Thursday metrics review."],
  ["Cadence", "A regular, predictable frequency of activity.", "We review safety leading indicators on a monthly cadence."],
  ["Throughput", "How much work moves through a process in a period.", "Throughput rose 18% once we removed the duplicate review step."],
  ["Bottleneck", "The step that limits the whole process.", "Data showed the bottleneck was permitting, not design."],
  ["Critical path", "The sequence of tasks that determines the earliest finish.", "Material lead time for transformers is on the critical path."],
  ["Mitigate", "Reduce the likelihood or impact of a risk.", "We mitigated the staffing risk by cross-training two engineers."],
  ["Escalate", "Raise an issue to a higher authority at the right time.", "I escalate early, with options, not just problems."],
  ["Governance", "The decision rights, controls and oversight that steer work.", "Clear governance means we know who approves scope changes."],
  ["Accountability", "Owning outcomes, not just tasks.", "Accountability is clear owners, clear dates, and follow-through."],
  ["Stakeholder", "Anyone affected by or able to influence the work.", "I mapped stakeholders: customers, crews, labor, permitting agencies, and the Board."],
  ["Root cause", "The underlying process failure that produced the problem.", "We fixed the root cause, an unclear handoff, rather than retraining one person."],
  ["Continuous improvement", "Ongoing, incremental process gains measured over time.", "Continuous improvement is built into our monthly PDCA review."],
  ["Resource-constrained", "Operating with less staff, budget or time than ideal.", "In a resource-constrained year, I prioritize by risk and customer impact."],
  ["Prioritize", "Rank work so the most valuable gets done first.", "We prioritized by safety risk, then customer commitment date, then revenue."],
  ["Leverage", "Use an existing strength to multiply impact.", "We leveraged the existing WMIS data instead of building a new tracker."],
  ["Scalable", "Able to grow without a matching growth in cost.", "The checklist is scalable because any new engineer can use it day one."],
  ["Sustainable", "Able to last without heroic effort.", "The improvement was sustainable because it lived in the SOP, not in one person."],
  ["Transparency", "Openly sharing status, data and decisions.", "Transparency in the backlog built trust with customers and the Board."],
  ["Cross-functional", "Involving several departments or disciplines.", "I led a cross-functional team of design, construction and customer service."],
  ["Change management", "Helping people adopt a new way of working.", "Change management meant involving the crews before rolling out the new JHA form."],
  ["Psychological safety", "People feel safe to speak up, report errors and near misses.", "Near-miss reports doubled because we built psychological safety."],
  ["Data-driven", "Decisions based on measured evidence.", "My approach is data-driven: baseline, target, measure, adjust."],
  ["Strategic imperative", "A must-do priority that the strategy depends on.", "Electrification is a strategic imperative for New Business."],
  ["Resiliency", "The ability to absorb and recover from disruption.", "Grid resiliency drives our undergrounding priorities."],
  ["Decarbonization", "Reducing carbon emissions from energy supply and use.", "Every interconnected solar and storage project supports decarbonization."],
  ["Load growth", "Increase in electricity demand over time.", "Load growth from EV charging is reshaping our service planning."],
  ["Ratepayer value", "Benefit delivered to the customers who pay the rates.", "Each process change must show ratepayer value."],
  ["Succession planning", "Developing people to fill key roles in the future.", "Succession planning is how I make sure the team outlasts me."],
  ["Guardrails", "Boundaries within which a team can decide independently.", "I set guardrails, then let supervisors make the call."],
  ["North star", "The single guiding outcome that orients all work.", "Our north star is safe, on-time energization for every customer."]
];

/* ---------- Scenario questions (manager judgment) ---------- */
EP.scenarios = [
  { area: "eeo", q: "An employee tells you in confidence a coworker is making offensive comments about her religion, and asks you not to report it. As manager you…",
    a: "Thank her, explain you are required to report it, report promptly to the EEO office, and protect her from retaliation.",
    w: ["Respect her wishes and keep it confidential.", "Talk to the coworker yourself and settle it informally.", "Wait to see if it happens again before acting."] },
  { area: "eeo", q: "A supervisor wants to move an employee to a less desirable shift right after the employee filed an EEO complaint. You…",
    a: "Stop the change pending review; it could be seen as retaliation. Consult HR/EEO and document a legitimate business reason if one exists.",
    w: ["Approve it; supervisors manage schedules.", "Approve it if the employee agrees verbally.", "Ignore it; it is unrelated to the complaint."] },
  { area: "eeo", q: "An employee with a back condition asks for a lighter-duty assignment. Your first step is…",
    a: "Begin the interactive process: discuss limitations and possible accommodations, involve HR/the accommodation coordinator, and document.",
    w: ["Deny it; all field staff must meet full duty.", "Grant any request immediately without documentation.", "Tell the employee to apply for disability leave."] },
  { area: "eeo", q: "Overtime has gone to the same three people for six months. The best manager response is…",
    a: "Review the distribution against the MOU and policy, set a transparent rotation, and document the criteria.",
    w: ["Leave it; they are the most reliable.", "Ask the three to share voluntarily.", "Stop all overtime."] },
  { area: "safety", q: "A crew is behind schedule and wants to skip the JHA for a ‘simple’ job. You…",
    a: "Require the JHA; schedule pressure is exactly when hazards get missed. Help remove the real schedule constraint.",
    w: ["Allow it this once to meet the date.", "Let the foreman decide.", "Have them complete the JHA after the job."] },
  { area: "safety", q: "A near miss occurs: a load shifted during lifting, no one was hurt. You…",
    a: "Treat it as a free lesson: stop, secure, investigate to root cause, share findings, and track corrective actions to closure.",
    w: ["No injury, so no report is needed.", "Discipline the rigger and move on.", "Mention it at next month’s meeting."] },
  { area: "safety", q: "An employee is seriously injured on a job site. Besides care and scene control, a key regulatory step is…",
    a: "Report to Cal/OSHA within 8 hours, notify management and safety, preserve the scene, and start the investigation.",
    w: ["Report it within 30 days.", "Only record it on the 300 log at year end.", "Wait for the medical diagnosis before reporting anything."] },
  { area: "safety", q: "The Joint Labor-Management Safety Committee raises a recurring concern about traffic control. Your best response is…",
    a: "Assign an owner and due date, bring data to the next meeting, and report closure back to the committee.",
    w: ["Say it is a contractor issue.", "Note it in the minutes only.", "Ask labor to fix it themselves."] },
  { area: "strategy", q: "You have a 30% increase in service requests and no new headcount. Your first move is…",
    a: "Quantify demand vs. capacity, find the bottleneck, prioritize by risk and customer impact, then propose process, overtime, contract or staffing options with data.",
    w: ["Tell staff to work faster.", "Stop accepting new requests.", "Ask for 30% more staff without analysis."] },
  { area: "strategy", q: "In your first week as manager, the most valuable activity is…",
    a: "Listening: one-on-ones with staff, key stakeholders and your director; review the backlog, safety record and priorities.",
    w: ["Announce a reorganization.", "Rewrite all procedures.", "Focus only on the largest project."] }
];

/* ---------- Interview question bank ---------- */
EP.questions = [
  // Behavioral / leadership
  { id: "b1", cat: "Leadership", q: "Tell us about a time you led a team through a significant change.", hint: "STAR. Name the change, resistance, how you engaged people, measured result." },
  { id: "b2", cat: "Leadership", q: "Describe a time you had to hold a supervisor accountable for performance.", hint: "Expectations set, coaching, documentation, outcome. Fair and consistent." },
  { id: "b3", cat: "Leadership", q: "How do you develop the people who report to you?", hint: "Individual development plans, stretch assignments, succession planning, an example with a result." },
  { id: "b4", cat: "Leadership", q: "Tell us about a decision you made with incomplete information.", hint: "Risk framing, who you consulted, decision, how you monitored and adjusted." },
  { id: "b5", cat: "Leadership", q: "Describe a conflict between two of your direct reports and how you resolved it.", hint: "Listen to both, focus on interests and facts, agreement, follow-up." },
  { id: "b6", cat: "Communication", q: "Tell us about a time you had to deliver bad news to senior management.", hint: "Early, with data and options. Show escalation judgment." },
  { id: "b7", cat: "Communication", q: "How would you communicate a new policy to a team that is skeptical?", hint: "Why it matters, involve them, feedback loop, measure adoption." },
  // Safety
  { id: "s1", cat: "Safety", q: "What are your responsibilities as a manager under the IIPP?", hint: "Name the 8 elements briefly; emphasize ownership, inspections, investigations, corrective action, training, records." },
  { id: "s2", cat: "Safety", q: "How do you build a safety culture in a field organization?", hint: "Use LAPP: Leadership, Accountability, Prevention, Process improvement & recordkeeping, with one example." },
  { id: "s3", cat: "Safety", q: "Tell us about a time you stopped work for safety reasons.", hint: "STAR. Hazard, decision under schedule pressure, result, lesson institutionalized." },
  { id: "s4", cat: "Safety", q: "How do you measure safety performance beyond injury rates?", hint: "Leading indicators: JHAs, job walks, near-miss reports, corrective-action closure, training completion." },
  { id: "s5", cat: "Safety", q: "How would you work with the Joint Labor-Management Safety Committee?", hint: "Partnership, data, owners and due dates, report back closure, trust with labor." },
  // EEO
  { id: "e1", cat: "EEO", q: "What are a manager’s responsibilities under the City’s EEO policy?", hint: "Use LEAP. Prevent, report promptly, no retaliation, accommodation, fair decisions, training." },
  { id: "e2", cat: "EEO", q: "An employee reports harassment by a well-performing supervisor. What do you do?", hint: "Take it seriously, report to EEO office promptly, interim protection, no retaliation, confidentiality, follow through." },
  { id: "e3", cat: "EEO", q: "How do you ensure fairness in assignments, overtime and promotions?", hint: "Documented criteria, rotation, MOU compliance, transparency, periodic review of data." },
  { id: "e4", cat: "EEO", q: "How do you create an inclusive environment on a diverse team?", hint: "Voice for everyone, respect standards, development access, measure engagement." },
  // Case / McKinsey style
  { id: "c1", cat: "Case", q: "Service requests are up 30% and you have no new staff. How do you deliver?", hint: "MECE: demand, capacity, process, priorities. Quantify the gap, options, recommendation, metrics." },
  { id: "c2", cat: "Case", q: "Average time to energize new customers has risen from 90 to 130 days. How do you diagnose and fix it?", hint: "Issue tree by phase: intake, design, permits, materials, construction. Data, bottleneck, fix, measure." },
  { id: "c3", cat: "Case", q: "Two top-priority projects need the same crew in the same month. How do you decide?", hint: "Criteria: safety, reliability, customer commitments, regulatory, cost. Escalate with options." },
  { id: "c4", cat: "Case", q: "Your section is 15% over budget at mid-year. What do you do?", hint: "Burn rate, variance drivers, forecast EAC, corrective actions, communicate early." },
  { id: "c5", cat: "Case", q: "How would you reduce the backlog of solar and battery interconnection applications by half in a year?", hint: "Baseline, triage by complexity, standardize, automate checks, staff flex, weekly tracking." },
  { id: "c6", cat: "Case", q: "How would you organize the division to support electrification growth over the next five years?", hint: "Demand forecast, capability gaps, workforce plan, process, technology, partnerships, KPIs." },
  // Strategy / LADWP
  { id: "t1", cat: "Strategy", q: "What do you see as the biggest challenges facing Power New Business in the next three years?", hint: "Load growth/electrification, workforce, materials supply chain, customer expectations, 2035 clean energy." },
  { id: "t2", cat: "Strategy", q: "How does New Business support LADWP’s strategic long-term resource plan?", hint: "Connecting DER, EV and electrification load; data for planning; reliability; customer experience." },
  { id: "t3", cat: "Strategy", q: "How would you align your team’s work with the top 10 priority projects?", hint: "Map work to projects, capacity plan, RACI, dashboard, operating rhythm." },
  // First 90 days
  { id: "n1", cat: "First 90 days", q: "What would you do in your first 90 days to ensure the division is aligned?", hint: "30 listen, 60 align and quick wins, 90 operating rhythm and metrics. Be concrete." },
  { id: "n2", cat: "First 90 days", q: "How would you earn the trust of a team that was hoping someone else got this job?", hint: "Listen, credit, consistency, quick visible support, involve them in decisions." },
  // Operations / resources
  { id: "o1", cat: "Operations", q: "Which KPIs would you use to run New Business, and why?", hint: "Cycle time, backlog, on-time energization, first-pass plan approval, safety leading indicators, budget burn, customer satisfaction." },
  { id: "o2", cat: "Operations", q: "Tell us about a process you improved and how you measured it.", hint: "STAR with baseline and after numbers. How you sustained it (SOP, training)." },
  { id: "o3", cat: "Operations", q: "How do you manage competing priorities with limited resources?", hint: "Prioritization criteria, transparency, escalation, say no with options." },
  { id: "o4", cat: "Operations", q: "How do you follow through when a project runs into serious obstacles?", hint: "Recovery plan, critical path, stakeholder communication, escalation, result." },
  // Closing / general
  { id: "g1", cat: "General", q: "Why should we select you for this position?", hint: "Three reasons tied to the role: safety/EEO leadership, results with data, people development. Close strong." },
  { id: "g2", cat: "General", q: "Tell us about yourself.", hint: "Present, past, future in 90 seconds. Tie to New Business and management." },
  { id: "g3", cat: "General", q: "Do you have a closing statement?", hint: "Use a closing template: thank, 3 points, 90-day vision, enthusiasm." }
];

/* ---------- KPI library ---------- */
EP.kpis = [
  { name: "Burn rate", cat: "Finance", def: "How fast a budget is being spent per period (week or month).", formula: "Spend in period ÷ period length. Runway = remaining budget ÷ burn rate.", bench: "Compare actual burn to planned burn. A burn rate above plan with progress below plan is the warning sign.", say: "“We are burning $420K a month against a $380K plan, so at this rate we exhaust budget in October, two months early.”" },
  { name: "Budget variance", cat: "Finance", def: "Difference between budgeted and actual cost.", formula: "(Actual − Budget) ÷ Budget × 100%", bench: "Within ±5% is commonly treated as on track; explain anything beyond ±10%.", say: "“We are 7% over at mid-year, driven by overtime and transformer prices.”" },
  { name: "CPI (Cost Performance Index)", cat: "Finance", def: "Value earned per dollar spent.", formula: "Earned Value ÷ Actual Cost", bench: "1.0 is on budget; below 0.9 needs a recovery plan.", say: "“CPI is 0.92: for every dollar spent we are getting 92 cents of planned work.”" },
  { name: "SPI (Schedule Performance Index)", cat: "Finance", def: "Work done versus work planned to date.", formula: "Earned Value ÷ Planned Value", bench: "1.0 on schedule; below 1.0 behind.", say: "“SPI of 0.85 means we are about 15% behind plan.”" },
  { name: "EAC (Estimate at Completion)", cat: "Finance", def: "Forecast total cost at the end.", formula: "BAC ÷ CPI (simple method)", bench: "Report EAC early when it exceeds BAC.", say: "“At current CPI, EAC is $11.8M against a $10.9M budget.”" },
  { name: "Capital plan execution", cat: "Finance", def: "Share of the approved capital budget actually delivered.", formula: "Actual capital spend ÷ approved capital budget", bench: "Utilities often target 90–100%; low execution signals planning or resource gaps.", say: "“We executed 94% of the capital plan.”" },
  { name: "Cycle time to energize", cat: "New Business", def: "Days from complete customer application to energized service.", formula: "Median days, by job type (residential, commercial, EV, solar/storage)", bench: "Track median and 90th percentile; the tail is where complaints come from.", say: "“Median commercial cycle time dropped from 128 to 104 days.”" },
  { name: "Backlog", cat: "New Business", def: "Open work orders or applications not yet completed.", formula: "Count open; also backlog age and backlog ÷ monthly throughput (months of work).", bench: "Stable or shrinking backlog with stable intake is healthy.", say: "“We have 4.2 months of backlog, down from 5.6.”" },
  { name: "On-time energization", cat: "New Business", def: "Share of jobs energized by the committed date.", formula: "On-time jobs ÷ total completed", bench: "Set a target (for example 85–90%) and report monthly.", say: "“We met 88% of committed dates this quarter.”" },
  { name: "First-pass plan approval", cat: "New Business", def: "Share of customer plans approved without resubmittal.", formula: "First-pass approvals ÷ plans reviewed", bench: "Rising rates mean clearer requirements and less rework.", say: "“First-pass approval rose to 72% after we published the checklist.”" },
  { name: "Interconnection queue", cat: "New Business", def: "Pending solar, storage or DER applications and their age.", formula: "Count by phase; average days in phase", bench: "Watch for phases where time-in-phase grows.", say: "“Design phase is the bottleneck at 41 average days.”" },
  { name: "Throughput", cat: "Operations", def: "Jobs completed per period.", formula: "Completed jobs ÷ month", bench: "Compare to intake. Throughput below intake means backlog grows.", say: "“We closed 310 jobs against 290 new requests.”" },
  { name: "Overtime %", cat: "Workforce", def: "Overtime hours as a share of regular hours.", formula: "OT hours ÷ regular hours", bench: "Sustained high overtime signals a capacity gap and fatigue risk.", say: "“Overtime is 18%, above our 10% guideline, so we are adding contract support.”" },
  { name: "Vacancy rate", cat: "Workforce", def: "Share of authorized positions that are unfilled.", formula: "Vacant positions ÷ authorized positions", bench: "Public utilities often run 10%+; pair with time-to-fill.", say: "“We are at a 14% vacancy rate with 120-day average time to fill.”" },
  { name: "Training compliance", cat: "Workforce", def: "Share of required training current.", formula: "Employees current ÷ employees required", bench: "Aim for 100% on safety and harassment-prevention training.", say: "“Harassment-prevention training is at 100% for supervisors.”" },
  { name: "TRIR", cat: "Safety", def: "Recordable injuries and illnesses per 100 full-time workers per year.", formula: "Recordables × 200,000 ÷ hours worked", bench: "Compare to the BLS rate for electric utilities and to your own trend.", say: "“TRIR fell from 3.1 to 2.4.”" },
  { name: "DART rate", cat: "Safety", def: "Cases with days away, restricted duty or transfer, per 100 workers.", formula: "DART cases × 200,000 ÷ hours worked", bench: "Shows severity better than TRIR.", say: "“DART is down 20% year over year.”" },
  { name: "Near-miss reporting rate", cat: "Safety", def: "Near misses reported per period or per 100 workers. A leading indicator.", formula: "Reports ÷ period (or per 200,000 hours)", bench: "Rising reports with falling injuries signals a healthy reporting culture.", say: "“Near-miss reports doubled while recordables fell.”" },
  { name: "Corrective-action closure", cat: "Safety", def: "Share of safety corrective actions closed by their due date.", formula: "Closed on time ÷ due", bench: "Target 90%+; overdue high-severity items get escalated.", say: "“We closed 93% of corrective actions on time.”" },
  { name: "SAIDI", cat: "Reliability", def: "Average outage minutes per customer per year.", formula: "Σ customer-minutes interrupted ÷ customers served", bench: "U.S. utilities commonly report roughly 100–150 minutes excluding major events.", say: "“SAIDI improved to 112 minutes.”" },
  { name: "SAIFI", cat: "Reliability", def: "Average number of outages per customer per year.", formula: "Σ customer interruptions ÷ customers served", bench: "Commonly around 1.0–1.3 excluding major events.", say: "“SAIFI is 0.9.”" },
  { name: "CAIDI", cat: "Reliability", def: "Average restoration time per interrupted customer.", formula: "SAIDI ÷ SAIFI", bench: "Commonly 90–130 minutes.", say: "“CAIDI shows we restore in about 2 hours on average.”" },
  { name: "ASA (Average Speed of Answer)", cat: "Customer", def: "Average wait before a call is answered.", formula: "Total wait time ÷ answered calls", bench: "Service level 80/20 (80% answered in 20 seconds) is a common call-center target.", say: "“ASA is 45 seconds; target is 30.”" },
  { name: "First Contact Resolution", cat: "Customer", def: "Share of issues resolved on the first contact.", formula: "Resolved first contact ÷ total contacts", bench: "70–75% is commonly considered good.", say: "“FCR is 71%.”" },
  { name: "CSAT", cat: "Customer", def: "Customer satisfaction score from post-interaction surveys.", formula: "Satisfied responses ÷ total responses", bench: "Track the trend and the top complaint drivers.", say: "“CSAT for new service customers is 82%.”" },
  { name: "NPS", cat: "Customer", def: "Likelihood to recommend, from −100 to +100.", formula: "% promoters (9–10) − % detractors (0–6)", bench: "Utilities typically score lower than retail brands; trend matters most.", say: "“NPS rose 8 points after we added status updates.”" },
  { name: "Abandonment rate", cat: "Customer", def: "Callers who hang up before reaching an agent.", formula: "Abandoned calls ÷ offered calls", bench: "Under 5% is a common target.", say: "“Abandonment is 4%.”" }
];

/* ---------- Roadmap ---------- */
EP.phases = [
  { id: "p1", name: "Foundation: formats & acronyms", area: "comm", from: 0, to: 0.18, ms: [
    ["m1", "Recite STAR and SMART with an example each"],
    ["m2", "Score 90%+ on the acronym rapid-fire"],
    ["m3", "Write your own closing statement draft"]] },
  { id: "p2", name: "Safety & IIPP mastery", area: "safety", from: 0.1, to: 0.38, ms: [
    ["m4", "Explain the 4 safety pillars (LAPP) from memory"],
    ["m5", "Name all 8 IIPP elements in under 60 seconds"],
    ["m6", "Record 3 safety STAR answers scoring 75+"]] },
  { id: "p3", name: "EEO management mastery", area: "eeo", from: 0.25, to: 0.5, ms: [
    ["m7", "Explain the 4 EEO pillars (LEAP) from memory"],
    ["m8", "Pass all EEO scenario drills"],
    ["m9", "Record 2 EEO answers scoring 75+"]] },
  { id: "p4", name: "Executive & case mindset", area: "strategy", from: 0.4, to: 0.72, ms: [
    ["m10", "Solve 3 case questions with an issue tree"],
    ["m11", "Draft a 30-60-90 plan for the division"],
    ["m12", "Explain 10 KPIs with formula and benchmark"]] },
  { id: "p5", name: "Interview readiness", area: "comm", from: 0.62, to: 0.9, ms: [
    ["m13", "Full mock panel: 8 questions in 40 minutes"],
    ["m14", "Average critique score 80+ over last 10 answers"],
    ["m15", "Closing statement delivered in under 90 seconds"]] },
  { id: "p6", name: "Executive operating rhythm", area: "ops", from: 0.82, to: 1, ms: [
    ["m16", "Weekly metrics review habit for 4 straight weeks"],
    ["m17", "Executive vocabulary used naturally in 3 meetings"],
    ["m18", "Goal: assistant-director-ready leadership presence"]] }
];

EP.actions = [
  { id: "a1", text: "Send Claude the IIPP for Power New Business", note: "So safety drills use your exact program language." },
  { id: "a2", text: "Send Claude the City of LA / LADWP EEO policy", note: "So EEO drills match the policy word for word." },
  { id: "a3", text: "Send Claude the CAR New Business presentation slides", note: "To build questions on the division’s goals and numbers." },
  { id: "a4", text: "Send the division’s top 10 priority projects", note: "For strategy and alignment case questions." },
  { id: "a5", text: "Confirm what “ESM” stands for in your division", note: "Add it to the acronym deck once confirmed." },
  { id: "a6", text: "Review the 5 closing statement templates and pick one", note: "Then personalize it in the Playbook." },
  { id: "a7", text: "Read the SLTRP and LA100 executive summaries", note: "Note three facts you can quote." },
  { id: "a8", text: "Draft your 30-60-90 day plan", note: "Use the framework in the Playbook." },
  { id: "a9", text: "Record and critique your “Tell us about yourself” answer", note: "Aim for 90 seconds." }
];

EP.ranks = [
  [0, "Emerging leader"], [150, "Supervisor mindset"], [400, "Manager mindset"],
  [800, "Senior manager"], [1400, "Assistant director"], [2200, "Executive"]
];
