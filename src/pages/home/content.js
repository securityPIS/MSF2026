// Isi landing page Maritime Security Forum 2026, diambil dari maritimesecurityforum.com (Oktober 2026).
// Teks dua bahasa ditulis { id, en }; biodata pembicara dan judul sesi dibiarkan seperti yang dipublikasikan.

export const EVENT = {
  start: '2026-10-29T08:50:00+07:00',
  end: '2026-10-30T16:35:00+07:00',
  registerUrl: 'https://maritimesecurityforum.com/registration',
  whatsappUrl: 'https://chat.whatsapp.com/Ifjrk5eTPnf1yrGYVOpN9Y?s=sw&p=i&mlu=4&ilr=4',
  mapUrl: 'https://maps.app.goo.gl/PUseP7ganFG6Le6YA',
  trainUrl: 'https://www.kai.id/layanan/access-by-kai',
  theme: 'Navigating Uncertainty: Building Resilient Maritime Security in a Changing Risk Landscape',
  venue: 'Patra Cirebon Hotel & Convention',
  room: 'Ballroom 1–2, 2nd Floor',
  address: 'Jl. Tuparev No.11, Kedawung, Kec. Kedawung, Kabupaten Cirebon, Jawa Barat 45153, Indonesia',
}

export const INTRO = {
  id: 'Forum strategis yang mempertemukan pemimpin sektor maritim, energi, pemerintah, pertahanan, keamanan, dan teknologi untuk memahami risiko yang muncul, memperkuat pengambilan keputusan, dan membangun ketahanan di seluruh ekosistem maritim.',
  en: 'A strategic forum bringing together maritime, energy, government, defence, security and technology leaders to understand emerging risk, strengthen decision-making and build resilience across the maritime ecosystem.',
}

export const ABOUT = [
  {
    id: 'Maritime Security Forum (MSF) 2026 mempertemukan pemimpin industri maritim dan energi, perwakilan pemerintah dan pertahanan, profesional keamanan, penyedia teknologi, serta pakar internasional untuk membahas tantangan sektor maritim yang terus berkembang.',
    en: 'Maritime Security Forum (MSF) 2026 brings together maritime and energy industry leaders, government and defence representatives, security professionals, technology providers, and international experts to address the evolving challenges facing the maritime sector.',
  },
  {
    id: 'Melalui wawasan pakar, diskusi strategis, dan berbagi pengetahuan, forum ini membahas ancaman yang muncul, lanskap risiko yang berubah, teknologi keamanan, dan pendekatan praktis untuk memperkuat pengambilan keputusan berbasis risiko dan ketahanan operasional.',
    en: 'Through expert insights, strategic discussions, and knowledge sharing, the forum explores emerging threats, evolving risk landscapes, security technologies, and practical approaches to strengthening risk-informed decision-making and operational resilience.',
  },
  {
    id: 'Lebih dari sekadar bertukar pandangan, MSF 2026 bertujuan membangun kolaborasi yang bermakna dan komunitas keamanan maritim yang lebih kuat dan terhubung, yang mampu menghadapi ketidakpastian dan tantangan di masa depan.',
    en: 'Beyond exchanging perspectives, MSF 2026 aims to foster meaningful collaboration and build a stronger, more connected maritime security community capable of navigating uncertainty and responding to future challenges.',
  },
]

// Alur dari halaman About: dari kesadaran menuju ketahanan
export const JOURNEY = [
  { id: 'Kesadaran', en: 'Awareness' },
  { id: 'Pemahaman', en: 'Understanding' },
  { id: 'Penilaian risiko', en: 'Risk Assessment' },
  { id: 'Pengambilan keputusan', en: 'Decision-Making' },
  { id: 'Kapabilitas', en: 'Capability' },
  { id: 'Ketahanan', en: 'Resilience' },
]

export const GAINS = [
  {
    title: { id: 'Wawasan strategis', en: 'Strategic Insights' },
    body: { id: 'Pahami lebih dalam lanskap keamanan maritim dan risiko geopolitik yang terus berubah.', en: 'Gain a deeper understanding of the evolving maritime security and geopolitical risk landscape.' },
  },
  {
    title: { id: 'Perspektif pakar', en: 'Expert Perspectives' },
    body: { id: 'Dengar langsung pandangan pakar maritim, keamanan, pemerintah, dan industri.', en: 'Hear perspectives directly from maritime, security, government, and industry experts.' },
  },
  {
    title: { id: 'Praktik terbaik & studi kasus', en: 'Best Practices & Case Studies' },
    body: { id: 'Belajar dari pengalaman nyata, pelajaran yang dipetik, dan pendekatan keamanan maritim yang sudah terbukti.', en: 'Learn from real-world experiences, lessons learned, and proven approaches to maritime security.' },
  },
  {
    title: { id: 'Mitigasi risiko praktis', en: 'Practical Risk Mitigation' },
    body: { id: 'Temukan pendekatan praktis untuk memperkuat kesiapsiagaan, respons, dan ketahanan operasional.', en: 'Discover practical approaches to strengthen preparedness, response, and operational resilience.' },
  },
  {
    title: { id: 'Jejaring profesional', en: 'Professional Networking' },
    body: { id: 'Terhubung dengan profesional maritim, praktisi keamanan, regulator, dan pemangku kepentingan utama industri.', en: 'Connect with maritime professionals, security practitioners, regulators, and key industry stakeholders.' },
  },
  {
    title: { id: 'Peluang kolaborasi', en: 'Collaboration Opportunities' },
    body: { id: 'Jajaki peluang koordinasi yang lebih kuat, berbagi pengetahuan, dan kolaborasi lintas sektor.', en: 'Explore opportunities for stronger coordination, knowledge sharing, and cross-sector collaboration.' },
  },
]

export const ATTEND = [
  { id: 'Eksekutif maritim & pelayaran', en: 'Maritime and shipping executives' },
  { id: 'Pemimpin HSSE & keamanan', en: 'HSSE and security leaders' },
  { id: 'Operator pelabuhan & terminal', en: 'Port and terminal operators' },
  { id: 'Profesional sektor energi', en: 'Energy-sector professionals' },
  { id: 'Perwakilan TNI AL & penegak hukum maritim', en: 'Naval and maritime law-enforcement representatives' },
  { id: 'Praktisi intelijen & risiko', en: 'Intelligence and risk practitioners' },
  { id: 'Spesialis keamanan siber', en: 'Cybersecurity specialists' },
  { id: 'Profesional manajemen darurat & krisis', en: 'Emergency and crisis management professionals' },
  { id: 'Penyedia teknologi maritim', en: 'Maritime technology providers' },
  { id: 'Akademisi & peneliti', en: 'Academics and researchers' },
]

const P = '/landing/speakers/'
const ROOM = 'Ballroom 1–2, 2nd Floor'

export const SPEAKERS = {
  esa: {
    name: 'Esa Sayid Akbar',
    role: 'Sr Manager HSSE Shipping & Marine',
    org: 'PT Pertamina Patra Niaga',
    photo: P + 'esa-sayid-akbar.webp',
    bio: [
      'Captain Esa Sayid Akbar is a maritime and HSSE professional with extensive experience in the shipping, energy, and oil & gas industries. He currently serves as Sr Manager HSSE Shipping & Marine at PT Pertamina Patra Niaga. He holds a Diploma (D-III) and Bachelor’s degree (S1) in Nautical Studies, a Master’s degree in Marine Engineering, and a Master’s degree in Management. His professional expertise includes Marine Operations, Marine & Aviation Operations, HSSE, safety, emergency response, incident investigation, and crisis management.',
      'Throughout his career at Pertamina, he has held various positions in marine operations and undertaken strategic assignments, including as a Marine Subject Matter Expert (SME), a member of the Emergency and Crisis Response Team, and an Incident Investigation Team member.',
    ],
  },
  arif: {
    name: 'Arif Yunianto',
    role: 'Direktur Armada Logistik',
    org: 'PT Pertamina Patra Niaga',
    photo: P + 'arif-yunianto.webp',
    bio: [
      'Arif Yunianto holds a Bachelor’s degree in Information Engineering from Universitas Islam Indonesia and a Master’s degree in Industrial Engineering from Universitas Indonesia.',
      'He has held several strategic leadership positions within Pertamina Group, including VP Supply & Logistics Operation at PT Pertamina (Persero), Director of Commercial Planning at PT Pelayaran Bahtera Adhiguna, and Director of Crude Oil Tanker and Petroleum Products at PT Pertamina International Shipping, Subholding Integrated Marine Logistics.',
      'With extensive experience across supply chain, logistics, commercial planning, and maritime operations, he brings a strong strategic perspective in supporting integrated and reliable energy logistics operations.',
    ],
  },
  ketut: {
    name: 'I Ketut Laba',
    role: 'SVP HSSE',
    org: 'PT Pertamina (Persero)',
    photo: P + 'i-ketut-laba.webp',
    bio: [
      'I Ketut Laba is a seasoned maritime and energy executive with 30 years of combined experience across LNG shipping, oil and gas tanker operations, and 5 years of experience in integrated operations and services within the oil & gas value chain. His professional journey includes 15 years in LNG shipping, where he developed a strong technical and operational foundation in complex marine environments; 10 years in oil and gas tanker operations, strengthening his expertise in operational reliability, risk management, and disciplined execution; and five years leading an operations and services company supporting multiple segments of the oil and gas value chain.',
      'His academic background spans four complementary disciplines: Marine Engineering, Management, Industrial Engineering, and Business Law. This multidisciplinary foundation in marine expertise, operational leadership and business perspectives enables him to approach leadership from technical, operational, commercial, organizational, and legal perspectives.',
      'Throughout his career, he has focused on connecting strong leadership with safe operations, reliable performance, high standards, capable people, and sustainable business value. He brings to every forum a practical executive perspective shaped by decades of experience in asset-intensive and high-risk industries.',
    ],
  },
  ade: {
    name: 'Captain Ade Gunawan, M.M.Tr., M.Mar',
    role: 'VP HSSE Program',
    org: 'PT Pertamina (Persero)',
    photo: P + 'ade-gunawan.webp',
    bio: [
      'Captain Ade Gunawan is an experienced maritime and HSSE professional with more than 25 years of experience in the maritime industry, including extensive exposure to tanker operations and the oil & gas sector. His expertise covers marine operations, Health, Safety, Security & Environment (HSSE), marine assurance, risk management, and integrated marine quality management.',
      'Throughout his career, he has held various strategic and operational leadership positions within Pertamina Group, including roles in marine operations, safety, security, environment, and maritime logistics. He currently serves as Vice President HSSE, where he contributes to strengthening safety performance, operational resilience, regulatory compliance, and HSSE excellence across the organization.',
    ],
  },
  andreas: {
    name: 'Andreas Immanuel Mulianto',
    role: 'Sr Expert II HSSE Shipping & Marine',
    org: 'PT Pertamina Patra Niaga',
    photo: P + 'andreas-immanuel-mulianto.webp',
    bio: [
      'Andreas Immanuel Mulianto, PMP, PSP, CPP, CCTP, CITA, CRP, CSMP is Senior Expert II HSSE Shipping & Marine at PT Pertamina Patra Niaga and the author of GRID: From Intelligence to Decision-Ready Risk.',
      'He has more than 30 years of professional experience spanning technology, security, risk management, and HSSE, with extensive involvement in corporate and maritime security. His experience includes security risk assessment, physical security, intelligence, security governance, critical infrastructure protection, and the planning and oversight of multi-million-dollar security projects. He has also undertaken BTEC Level 7 Professional Security Management courses in the United Kingdom.',
      'Andreas is a member of the IOGP Security Committee and OCIMF Maritime Security Committee, a former Chairman of the ASIS International Indonesia Chapter, and a Board Member of the Certified Physical Security Consultant (CPSC) Board in Singapore.',
      'He holds a Bachelor’s degree in Information Systems, a Master of Management, and is currently pursuing a Doctor of Business Administration in Emerging Technology at Golden Gate University. His professional focus is on transforming intelligence and risk assessment into practical, decision-ready insights for leaders operating in complex and uncertain environments.',
    ],
  },
  indarto: {
    name: 'M. Indarto Wibowo',
    role: 'Senior Manager and Head of the Security Department',
    org: 'SKK Migas',
    photo: P + 'm-indarto-wibowo.webp',
    bio: [
      'An energy and security professional with more than 20 years of experience in Indonesia’s oil and gas industry. He currently serves as Head of Security Department at SKK Migas, bringing extensive leadership experience in security management, regional operations, procurement, and strategic stakeholder engagement.',
      'Throughout his career, he has held several key leadership positions at SKK Migas, including Head of Business Support Division, Senior Manager of Goods & Services Procurement, and Head of Regional Operations. His areas of expertise include energy and maritime security, critical infrastructure protection, security risk management, intelligence, and multi-stakeholder collaboration.',
      'He holds a Master of Business Administration (MBA) from Institut Teknologi Bandung (ITB) and a Bachelor of Engineering in Industrial Engineering from Telkom University, providing a strong foundation in strategic management, engineering, and operational leadership.',
    ],
  },
  awang: {
    name: 'Kolonel Laut (P) Awang Bawono',
    role: 'Paban VI Binkuat Sopsal',
    org: 'TNI AL',
    photo: P + 'awang-bawono.webp',
    bio: [
      'Kolonel Awang Bawono, S.E., M.M., M.A.P., CRMP is a distinguished Indonesian Navy officer with over 28 years of military service and extensive experience in maritime operations, naval security, strategic leadership, and international cooperation. A graduate of the Indonesian Naval Academy (Class of 1998), he currently serves as Head of Subdivision VI for Force Development at the Indonesian Navy Operations Staff (Paban VI Binkuat Sopsal), Naval Headquarters.',
      'Throughout his career, he has held numerous strategic command and staff positions, including commanding several Indonesian Navy warships and naval units under Fleet Commands I and II. His international experience includes assignments in the Netherlands, Singapore, and Sudan, notably serving as Chief of U6 Communication at the UNAMID Force Headquarters.',
      'He has also completed advanced military education and specialized training in maritime security, naval operations, and strategic defense at institutions in Indonesia and abroad. His extensive operational and international experience provides valuable perspectives on maritime security, naval readiness, and regional security cooperation.',
    ],
  },
  arienda: {
    name: 'Arienda Anggraini, M.Psi., Psikolog',
    role: 'Psikolog',
    org: 'PT Naluri Hidup Indonesia',
    photo: P + 'arienda-anggraini.webp',
    bio: [
      'Arienda Anggraini is a Psychologist with over 15 years of experience as a counselor, assessor, trainer, and public speaker. She has experience working with individuals from various background and range of ages, with focus on general mental health, personal and career development, relationship, parenting and family issues.',
      'She currently serves as a Psychologist at PT Naluri Hidup Indonesia. Previously, she worked as an Associate Assessor at Kompas Gramedia and as an HR Staff at PT Perkebunan Nusantara VII (Persero). She holds a Professional Master’s degree in Educational Psychology from Universitas Indonesia and a Bachelor’s degree in Psychology from Universitas Islam Indonesia. She is also a Certified Assessment Center Assessor and a member of Himpunan Psikologi Indonesia (HIMPSI).',
    ],
  },
  hakeng: {
    name: 'Marcellus Hakeng Jayawibawa Maripatiasi',
    role: 'Manager Maritime Training Center',
    org: 'Pertamina Maritime Training Center',
    photo: P + 'marcellus-hakeng.webp',
    bio: [
      'Dr. (HC) Capt. Marcellus “Hakeng” Jayawibawa, S.SiT., S.H., M.H., M.Mar. is an Indonesian maritime observer, Master Mariner, and maritime security professional with extensive experience in the shipping industry. He has served as Master aboard supertankers, including the VLGC vessels Pertamina Gas I and Pertamina Gas II, and currently serves as Designated Person Ashore and Coordinator of the Recognized Security Organization at PT Pertamina Trans Kontinental.',
      'He is the founder of the Indonesian Maritime Security and Safety Experts Association (AKKMI) and is actively involved in several national maritime and professional organizations. An alumnus of the National Resilience Institute of the Republic of Indonesia (Lemhannas RI), Capt. Hakeng is also a frequent speaker, guest lecturer, and contributor to maritime discussions, academic journals, and publications.',
      'In 2023, he received an honorary doctorate in maritime studies from the Ambedkar Institute of Technology, India, and in 2024 was recognized as the Best Graduate of the Master of Law program at Universitas Bhayangkara Jakarta Raya.',
    ],
  },
  pawan: {
    name: 'Pawan Desai',
    role: 'CEO',
    org: 'MitKat Advisory',
    photo: P + 'pawan-desai.webp',
    bio: [
      'An executive with three decades of illustrious career in security risk management which includes a distinguished background as an ex-Indian Navy officer specializing in Submarine operations and a successful track record in setting up and growing new ventures.',
      'Alumnus of Stanford GBS, Jamnalal Bajaj Institute of Management Studies and IVLP Fellow. Currently Co-founder and CEO of MitKat Advisory Services; also spearheaded the establishment and growth of Mahindra Special Services Group.',
      'A TEDx speaker, Certified Independent Director from Institute of Directors, Certified Coach felicitated by Dr. Marshall Goldsmith. He is a big advocate for the convergence of Cyber and Physical security domains. Regular speaker at prestigious forums such as OSAC, ACSG, ASIS, BCI, Duty of Care, and more. Holds CISA, CISSP, CBCP, ISO 27001, and 22301 certifications.',
      'Regular visiting faculty at esteemed management institutes, including College of Defence Management, Symbiosis International University, NMIMS, RRU, NFSU, fostering the growth and development of future leaders.',
    ],
  },
  richard: {
    name: 'Richard Wagner',
    role: 'Global Head of Sales',
    org: 'CyberOwl',
    photo: P + 'richard-wagner.webp',
    bio: [
      'Richard Wagner is Global Head of Sales at CyberOwl (DNV Group company), a maritime cyber risk specialist whose technology and service provides fleet operators visibility and response to cyber threats across their vessels and remote offshore assets. Based in Singapore, Richard established CyberOwl’s operations in the region in 2020 and leads its work with owners, operators and offshore fleets around the world.',
      'He also chairs the Cyber Security Sub-Committee for the Singapore Shipping Association, working with operators, class and regulators to elevate cyber resilience standards across Singapore’s fleet.',
      'Richard brings over two decades across the technology, payments and maritime sectors, with previous roles at Royal Bank of Scotland, Worldpay, ACI Worldwide and Voyager Worldwide (Global Navigation Solutions), spanning Europe, the Americas and Asia. He is a frequent speaker and commentator on maritime cyber risk, focused on moving operators beyond compliance towards actively managing OT and connectivity risk on increasingly digitalised commercial fleets and offshore assets.',
    ],
  },
  jeremy: {
    name: 'Jeremy Seng',
    role: 'Senior BD Manager – Commercial Maritime',
    org: 'Medsea Services Pte. Ltd.',
    photo: P + 'jeremy-seng.webp',
    bio: [
      'Maritime Health, Safety & Crew Wellbeing Specialist. Senior Business Development Manager, Commercial Maritime, International SOS, Medsea.',
      'Jeremy Seng is a maritime industry professional with more than 15 years of experience supporting shipowners, offshore operators, vessel managers, and maritime organizations across Asia in the areas of health, safety, security, medical preparedness, and crew wellbeing. Currently with International SOS, Medsea, Jeremy works closely with maritime stakeholders to strengthen risk management frameworks, improve workforce resilience, and enhance crew health and safety outcomes throughout vessel operations. His experience combines maritime operations, occupational health, emergency response planning, and innovative healthcare solutions designed for remote and challenging environments.',
      'Over the years, Jeremy has supported the deployment of maritime health and safety programs covering medical preparedness, telemedical assistance, emergency response capabilities, chronic disease management, mental health support, and crew welfare initiatives. His work focuses on helping organizations move beyond incident response towards proactive prevention, early intervention, and resilience-building strategies that support safer operations and healthier workforces.',
      'Jeremy regularly engages with senior executives, HSSE leaders, fleet managers, vessel operators, masters, and crew personnel to understand operational challenges and identify practical solutions that improve workforce safety, operational continuity, and duty of care performance. Through his collaboration with major international shipping companies and maritime organizations, Jeremy has gained extensive exposure to managing health and safety risks across diverse vessel types, offshore operations, and global trading environments.',
    ],
  },
  aaron: {
    name: 'Dr. Aaron Luis',
    role: 'Director – Commercial Maritime',
    org: 'International SOS',
    photo: P + 'aaron-luis.webp',
    bio: [
      'Dr Aaron Christopher Luis. Medical Director, Maritime | International Medical Assistance | Occupational Medicine | Emergency Medicine.',
      'Senior physician with more than 15 years of progressive experience in emergency medicine, international medical assistance, maritime healthcare, occupational medicine, and global medical operations leadership. In addition to maritime operations, he provides medical and logistical assistance to offshore and onshore oil, gas, and energy sector clients across Southeast Asia, including Thailand, Singapore, Malaysia, Indonesia, the Philippines, Vietnam, Cambodia, and throughout Africa. This includes supporting personnel working in remote industrial environments through emergency medical advice, occupational health management, return-to-work planning, and incident response.',
      'Currently working as Medical Director, Maritime at International SOS, providing strategic leadership for maritime health services, clinical governance, medical risk management, and international assistance operations, and has successfully led multidisciplinary teams across Asia-Pacific and global operations.',
    ],
  },
  klaus: {
    name: 'Klaus Kohlreiter',
    role: 'Business Segment Manager Maritime Solutions',
    org: 'Commend International',
    photo: P + 'klaus-kohlreiter.webp',
    bio: [
      'Experienced Business Segment Manager with over 25 years of expertise in Business Development and Sales, and a dedicated tenure at Commend International since 2018. He has deep expertise in the maritime security sector, holding strategic responsibility for the product development, global sales, and marketing of Commend’s Marine Division.',
      'His core competencies focus on Critical Onboard Communication Systems, including Public Address (PA) and General Alarm systems, as well as the integration of complex communication systems within critical infrastructure. A key differentiator of his portfolio is the development of communication products compliant with IEC 62443-4-1, a standard for cybersecurity in industrial automation and control systems. This goes far beyond standard type approvals (such as IACS UR E27), ensuring robust cyber resilience for modern maritime operations. He is currently qualifying as a Technical Risk Manager (EN 50726-1) to support clients with systematic risk assessment and secure system design.',
    ],
  },
  josefina: {
    name: 'Josefina Regula',
    role: 'Credibility and Risk Assessment Specialist',
    org: 'SensAI',
    photo: P + 'josefina-regula.webp',
    bio: [
      'Josefina Regula retired from the Federal Bureau of Investigation with over 32 years of investigative experience. Agent Regula investigated a wide range of federal violations to include drug trafficking; civil rights violations; human trafficking; crimes against children and crimes on the high seas.',
      'Agent Regula served the FBI’s Polygraph Program as a Unit Chief, Supervisor and Examiner for over 17 years. During this time she conducted over 2000 polygraph examinations and performed quality control of over 5000 cases.',
      'Additionally, Agent Regula was a member of the FBI’s elite Evidence Response Team (ERT) where she managed major crime scene investigations in the United States and overseas, to include deployment to the World Trade Center attacks. Agent Regula was a certified FBI Adjunct Professor in the fields of Interview and Interrogation, and Crime Scene Management.',
    ],
  },
  daniel: {
    name: 'Daniel J. Molina',
    role: 'Chief Revenue Officer',
    org: 'SensAI',
    photo: P + 'daniel-j-molina.webp',
    bio: [],
  },
  cholan: {
    name: 'Dr. Cholan V',
    role: 'Scientific and Operations Lead',
    org: 'SensAI',
    photo: P + 'cholan-v.webp',
    bio: [
      'Dr. Cholan V is Scientific and Operations Lead at SensAI, where he directs a contact-free platform for deception detection and credibility assessment. He built the MINDEF Centre for Credibility Assessment from the ground up, earning American Polygraph Association (APA) accreditation and partnerships with the FBI and U.S. Department of Defense. He holds a PhD in Psychology (NTU) and a Master’s in Security Management (Michigan State), and has received the APA President’s Award, the APA Reid Award for Research Excellence, and Singapore’s National Day Commendation Medal.',
    ],
  },
}

// Agenda per hari. kind: label sesi pembuka; sesi materi tidak diberi label.
export const PROGRAMME = [
  {
    key: 'day1',
    date: '2026-10-29',
    day: { id: 'Hari 1', en: 'Day 1' },
    when: { id: 'Kamis, 29 Okt', en: 'Thu, 29 Oct' },
    sessions: [
      { time: '08:50 – 09:05', kind: { id: 'Pembukaan', en: 'Introduction' }, title: 'Introduction', speakers: ['esa'] },
      { time: '09:05 – 09:25', kind: { id: 'Sambutan', en: 'Welcome remarks' }, title: 'Welcome Remarks', speakers: ['arif'] },
      { time: '09:25 – 09:40', kind: { id: 'Pidato pembukaan', en: 'Opening speech' }, title: 'Opening Speech', speakers: ['ketut'] },
      { time: '09:40 – 10:40', title: 'From Risk to Resilience: Strengthening Maritime Security Through Integrated HSSE Governance', speakers: ['ade'] },
      { time: '10:40 – 11:40', title: 'From Intelligence to Decision-Ready Risk: Introducing GRID for Maritime Security Assessment', speakers: ['andreas'] },
      { time: '13:10 – 14:10', title: 'Securing Indonesia’s Energy at Sea: Building Maritime Security Resilience through Integrated Stakeholder Collaboration', speakers: ['indarto'] },
      { time: '14:10 – 15:10', title: 'Peran TNI AL dalam Maritime Domain Awareness Guna Mewujudkan Ketahanan Energi Nasional', speakers: ['awang'] },
      { time: '15:10 – 16:10', title: 'Managing Stress, Fatigue & Human Factors in Maritime Work', speakers: ['arienda'] },
    ],
  },
  {
    key: 'day2',
    date: '2026-10-30',
    day: { id: 'Hari 2', en: 'Day 2' },
    when: { id: 'Jumat, 30 Okt', en: 'Fri, 30 Oct' },
    sessions: [
      { time: '08:35 – 09:35', title: 'Maritime Security: Strengthening Security Across the Maritime Ecosystem', speakers: ['hakeng'] },
      { time: '09:35 – 10:35', title: 'Predictive Intelligence as the Currency of Trust: Shifting from Reactive to Proactive Risk Management', speakers: ['pawan'] },
      { time: '10:35 – 11:35', title: 'Cybersecurity and Risk Management: Mitigating the Threat of Attacks', speakers: ['richard'] },
      { time: '13:35 – 14:35', title: 'Medical Evacuation in Maritime Operations: Lessons, Challenges and Prevention Strategies', speakers: ['jeremy', 'aaron'] },
      { time: '14:35 – 15:35', title: 'Beyond Type Approval: Defining the New Standard for Critical Maritime & Onshore Security', speakers: ['klaus'] },
      { time: '15:35 – 16:35', title: 'Innovative Strategies and Technologies for Resilient Maritime Security', speakers: ['josefina', 'daniel', 'cholan'] },
    ],
  },
]

export const SESSION_ROOM = ROOM

// Urutan tampil di bagian Pembicara, mengikuti urutan sesi
export const SPEAKER_ORDER = PROGRAMME.flatMap((d) => d.sessions.flatMap((s) => s.speakers))

export const PARTNERS = [
  { name: 'MitKat Advisory', logo: '/landing/partners/mitkat.webp' },
  { name: 'Naluri', logo: '/landing/partners/naluri.webp' },
  { name: 'MedSea, an International SOS company', logo: '/landing/partners/medsea.webp' },
  { name: 'SKK Migas', logo: '/landing/partners/skkmigas.webp' },
  { name: 'CyberOwl, a DNV company', logo: '/landing/partners/cyberowl.webp' },
  { name: 'TNI Angkatan Laut', logo: '/landing/partners/tni-al.webp' },
  { name: 'Commend', logo: '/landing/partners/commend.webp' },
  { name: 'SensAI', logo: '/landing/partners/sensai.webp' },
]

export const PARTNERS_TEXT = {
  id: 'Maritime Security Forum 2026 didukung organisasi yang memiliki kepentingan bersama dalam memperkuat keamanan maritim, ketahanan, kolaborasi profesional, dan pertukaran pengetahuan di seluruh ekosistem maritim.',
  en: 'Maritime Security Forum 2026 is supported by organisations that share a common interest in strengthening maritime security, resilience, professional collaboration, and the exchange of knowledge across the maritime ecosystem.',
}

export const ROUTES = [
  {
    title: { id: 'Bandara Soekarno-Hatta (CGK) ke Stasiun Gambir', en: 'Soekarno-Hatta Airport (CGK) to Gambir Station' },
    options: [
      {
        label: { id: 'Bus DAMRI', en: 'DAMRI bus' },
        body: {
          id: 'Naik bus resmi DAMRI bandara langsung ke Stasiun Gambir. Pilihan paling langsung dan praktis tanpa transit. Bus bisa dinaiki dari pool DAMRI di Terminal 1, 2, atau 3.',
          en: 'Take the official DAMRI airport bus directly to Gambir Station. The most direct and convenient option, with no transfer. Board from DAMRI’s designated pool at Terminal 1, 2, or 3.',
        },
      },
      {
        label: { id: 'Kereta Bandara (Railink)', en: 'Airport train (Railink)' },
        body: {
          id: 'Naik Kereta Bandara ke Stasiun BNI City/Sudirman, lalu lanjut taksi atau ojek online ke Stasiun Gambir.',
          en: 'Take the airport train to BNI City/Sudirman Station, then a short taxi or ride-hailing trip to Gambir Station.',
        },
      },
    ],
  },
  {
    title: { id: 'Stasiun Gambir ke Stasiun Cirebon', en: 'Gambir Station to Cirebon Station' },
    options: [
      {
        body: {
          id: 'Naik kereta antarkota dari Stasiun Gambir ke Stasiun Cirebon. Pilih jadwal yang paling sesuai dengan waktu kedatangan Anda.',
          en: 'Board an intercity train from Gambir Station to Cirebon Station. Choose the schedule that best fits your arrival time.',
        },
        link: 'train',
      },
    ],
  },
  {
    title: { id: 'Stasiun Cirebon ke Patra Cirebon Hotel', en: 'Cirebon Station to Patra Cirebon Hotel' },
    options: [
      {
        body: {
          id: 'Pesan taksi stasiun atau ojek online. Hotel berjarak sekitar 5 km dari stasiun, kira-kira 10–15 menit perjalanan tergantung lalu lintas.',
          en: 'Book a station taxi or use a ride-hailing app. The hotel is about 5 km from the station, roughly a 10–15 minute drive depending on traffic.',
        },
      },
    ],
  },
]

export const FAQ = [
  {
    q: { id: 'Apa itu Maritime Security Forum 2026?', en: 'What is the Maritime Security Forum 2026?' },
    a: [
      {
        id: 'Forum profesional yang mempertemukan praktisi keamanan maritim, pemimpin industri, regulator, pemangku kepentingan pemerintah, profesional keamanan, dan pakar untuk membahas tantangan keamanan yang memengaruhi industri maritim.',
        en: 'A professional forum bringing together maritime security practitioners, industry leaders, regulators, government stakeholders, security professionals, and subject-matter experts to discuss emerging security challenges affecting the maritime industry.',
      },
      {
        id: 'Forum ini berfokus pada penguatan ketahanan, pengambilan keputusan berbasis risiko, berbagi pengalaman praktis, dan mendorong kolaborasi di komunitas keamanan maritim.',
        en: 'The forum focuses on strengthening resilience, improving risk-informed decision-making, sharing practical experience, and encouraging collaboration across the maritime security community.',
      },
    ],
  },
  {
    q: { id: 'Apa tema Maritime Security Forum 2026?', en: 'What is the theme of Maritime Security Forum 2026?' },
    a: [
      { id: 'Temanya “Navigating Uncertainty: Building Resilient Maritime Security in a Changing Risk Landscape.”', en: 'The theme is “Navigating Uncertainty: Building Resilient Maritime Security in a Changing Risk Landscape.”' },
      {
        id: 'Tema ini mencerminkan risiko keamanan maritim yang makin kompleks: ketidakpastian geopolitik, perompakan dan perampokan bersenjata, ancaman siber dan teknologi, risiko orang dalam, kerentanan rantai pasok, regulasi yang berubah, serta makin eratnya keterkaitan keamanan fisik dan digital.',
        en: 'The theme reflects the increasing complexity of maritime security risks, including geopolitical uncertainty, piracy and armed robbery, cyber and technology-related threats, insider risks, supply-chain vulnerabilities, evolving regulations, and the growing interdependence between physical and digital security.',
      },
    ],
  },
  {
    q: { id: 'Kapan dan di mana forum diadakan?', en: 'When and where will the forum be held?' },
    a: [{ id: '29–30 Oktober 2026 di Patra Cirebon Hotel & Convention, Cirebon, Jawa Barat, Indonesia.', en: '29–30 October 2026 at Patra Cirebon Hotel & Convention, Cirebon, West Java, Indonesia.' }],
  },
  {
    q: { id: 'Siapa yang sebaiknya hadir?', en: 'Who should attend the forum?' },
    a: [
      {
        id: 'Profesional yang tanggung jawabnya terkait keamanan maritim, pelayaran, operasi kelautan, HSSE, manajemen risiko, intelijen, manajemen krisis, keamanan siber, operasi pelabuhan dan terminal, penegakan hukum, hubungan pemerintah, dan keamanan korporat.',
        en: 'Professionals whose responsibilities relate to maritime security, shipping, marine operations, HSSE, risk management, intelligence, crisis management, cyber security, port and terminal operations, law enforcement, government affairs, and corporate security.',
      },
      {
        id: 'Peserta bisa berasal dari perusahaan pelayaran, perusahaan energi, operator pelabuhan dan terminal, instansi pemerintah, otoritas maritim, organisasi keamanan, penyedia teknologi, akademisi, dan asosiasi profesi.',
        en: 'Participants may include representatives from shipping companies, energy companies, port and terminal operators, government institutions, maritime authorities, security organizations, technology providers, academia, and professional associations.',
      },
    ],
  },
  {
    q: { id: 'Topik apa saja yang dibahas?', en: 'What topics will be discussed?' },
    list: [
      { id: 'Perubahan lanskap ancaman maritim global dan regional', en: 'Changes in the global and regional maritime threat landscape' },
      { id: 'Risiko geopolitik yang memengaruhi pelayaran dan operasi maritim', en: 'Geopolitical risks affecting shipping and maritime operations' },
      { id: 'Penilaian risiko keamanan maritim dan pengambilan keputusan', en: 'Maritime security risk assessment and decision-making' },
      { id: 'Keamanan fisik kapal, pelabuhan, terminal, dan fasilitas maritim', en: 'Physical security of vessels, ports, terminals, and maritime facilities' },
      { id: 'Risiko keamanan maritim terkait siber dan teknologi', en: 'Cyber and technology-related maritime security risks' },
      { id: 'Intelijen dan kesadaran situasional', en: 'Intelligence and situational awareness' },
      { id: 'Tata kelola keamanan dan ketahanan organisasi', en: 'Security governance and organizational resilience' },
      { id: 'Kesiapsiagaan krisis dan respons insiden', en: 'Crisis preparedness and incident response' },
      { id: 'Teknologi dan inovasi keamanan', en: 'Security technology and innovation' },
      { id: 'Kolaborasi industri, pemerintah, dan pemangku kepentingan keamanan', en: 'Collaboration between industry, government, and security stakeholders' },
      { id: 'Pelajaran dan praktik baik keamanan maritim', en: 'Lessons learned and emerging good practices in maritime security' },
    ],
  },
  {
    q: { id: 'Apa yang bisa diharapkan peserta?', en: 'What can participants expect from the forum?' },
    a: [
      { id: 'Kombinasi presentasi utama, sesi pakar, diskusi panel, studi kasus praktis, dan jejaring profesional.', en: 'A combination of keynote presentations, expert sessions, panel discussions, practical case studies, and professional networking.' },
      {
        id: 'Forum ini tidak hanya membahas ancaman, tetapi juga bagaimana organisasi menerjemahkan intelijen, penilaian risiko, tata kelola, teknologi, dan pengalaman operasional menjadi keputusan keamanan yang lebih baik dan ketahanan organisasi yang lebih kuat.',
        en: 'The forum is designed not only to discuss threats, but also to explore how organizations can translate intelligence, risk assessments, governance, technology, and operational experience into better security decisions and stronger organizational resilience.',
      },
    ],
  },
  {
    q: { id: 'Apakah forum hanya membahas keamanan maritim fisik?', en: 'Will the forum focus only on physical maritime security?' },
    a: [
      {
        id: 'Tidak. Forum memandang keamanan maritim sebagai sistem yang saling terhubung: keamanan fisik, risiko siber, intelijen, perkembangan geopolitik, teknologi, faktor manusia, tata kelola organisasi, manajemen krisis, dan ketahanan operasional.',
        en: 'No. The forum considers maritime security as an interconnected system involving physical security, cyber risk, intelligence, geopolitical developments, technology, human factors, organizational governance, crisis management, and operational resilience.',
      },
    ],
  },
  {
    q: { id: 'Apakah forum ini hanya untuk profesional keamanan?', en: 'Is the forum relevant only for security professionals?' },
    a: [
      {
        id: 'Tidak. Forum juga relevan untuk eksekutif dan profesional di bidang operasi pelayaran, HSSE, marine assurance, manajemen risiko, keamanan siber, keberlangsungan bisnis, operasi pelabuhan, hukum dan kepatuhan, intelijen, serta tata kelola korporat.',
        en: 'No. The forum is also relevant for executives and professionals working in shipping operations, HSSE, marine assurance, risk management, cyber security, business continuity, port operations, legal and compliance, intelligence, and corporate governance.',
      },
    ],
  },
  {
    q: { id: 'Apa hasil yang diharapkan dari forum?', en: 'What is the expected outcome of the forum?' },
    a: [
      {
        id: 'Memperkuat pemahaman peserta tentang lingkungan keamanan maritim yang berubah, memberi wawasan praktis yang bisa diterapkan di organisasi masing-masing, serta mendorong jejaring profesional, kolaborasi lintas sektor, dan pendekatan yang lebih tangguh dalam mengelola risiko keamanan maritim.',
        en: 'To strengthen participants’ understanding of the evolving maritime security environment, provide practical insights they can apply in their own organizations, and encourage stronger professional networks, cross-sector collaboration, and more resilient approaches to managing maritime security risks.',
      },
    ],
  },
  {
    q: { id: 'Apakah peserta mendapat materi presentasi?', en: 'Will participants receive presentation materials?' },
    a: [
      {
        id: 'Sebagian materi dapat dibagikan, tergantung persetujuan pembicara, kerahasiaan, hak cipta, dan ketentuan keamanan informasi. Beberapa materi mungkin tidak didistribusikan.',
        en: 'Selected materials may be made available, subject to speaker approval, confidentiality, copyright, and information-security requirements. Some materials may not be distributed.',
      },
    ],
  },
  {
    q: { id: 'Apakah peserta mendapat sertifikat?', en: 'Will participants receive a certificate?' },
    a: [{ id: 'Informasi sertifikat keikutsertaan akan disampaikan panitia dalam paket informasi peserta.', en: 'Information about certificates of participation will be shared by the organizing committee in the participant information package.' }],
  },
  {
    q: { id: 'Bahasa apa yang digunakan?', en: 'What language will be used?' },
    a: [{ id: 'Bahasa Indonesia dan Inggris, tergantung pembicara dan sesi. Materi presentasi juga bisa dalam salah satu bahasa tersebut.', en: 'Both Bahasa Indonesia and English, depending on the speaker and session. Presentation materials may be in either language.' }],
  },
  {
    q: { id: 'Apakah akomodasi termasuk?', en: 'Is accommodation included?' },
    a: [{ id: 'Akomodasi mengikuti paket registrasi atau undangan masing-masing peserta. Lihat undangan resmi Anda atau hubungi panitia untuk konfirmasi.', en: 'Accommodation follows each participant’s registration or invitation package. Check your official invitation or contact the organizing committee to confirm.' }],
  },
  {
    q: { id: 'Apakah transportasi disediakan?', en: 'Is transportation provided?' },
    a: [{ id: 'Jika disediakan, informasi transportasi akan disampaikan terpisah oleh panitia. Mohon cek informasi logistik yang dibagikan sebelum acara.', en: 'If provided, transportation details will be shared separately by the organizing committee. Please review the logistics information sent before the event.' }],
  },
  {
    q: { id: 'Apa dress code-nya?', en: 'What should participants wear?' },
    a: [{ id: 'Busana bisnis atau smart business casual, kecuali disebutkan lain dalam informasi resmi peserta. Kegiatan khusus dengan dress code berbeda akan diinformasikan sebelumnya.', en: 'Business attire or smart business casual, unless otherwise stated in the official participant information. You will be told in advance about activities with a different dress code.' }],
  },
  {
    q: { id: 'Jam berapa peserta sebaiknya datang?', en: 'What time should participants arrive?' },
    a: [{ id: 'Datanglah cukup awal untuk menyelesaikan registrasi sebelum sesi pembukaan. Jadwal registrasi dan agenda harian dirinci di program final.', en: 'Arrive early enough to complete registration before the opening session. Registration times and the daily agenda are detailed in the final programme.' }],
  },
  {
    q: { id: 'Bolehkah membagikan foto atau materi di media sosial?', en: 'Can participants share photos or presentation content on social media?' },
    a: [{ id: 'Boleh untuk kegiatan forum secara umum, kecuali sesi, presentasi, diskusi, atau materi yang dinyatakan rahasia atau terbatas. Hormati kerahasiaan pembicara dan ketentuan dari panitia.', en: 'You are welcome to share general forum activities unless a session, presentation, discussion, or material is identified as confidential or restricted. Please respect speaker confidentiality and any restrictions from the organizing committee.' }],
  },
  {
    q: { id: 'Apakah ada kesempatan networking?', en: 'Are networking opportunities available?' },
    a: [{ id: 'Ya. Peserta bisa bertukar pengalaman, membangun koneksi profesional, dan menjajaki kolaborasi dengan sesama praktisi, pembicara, perwakilan industri, dan pemangku kepentingan lain.', en: 'Yes. Participants can exchange experiences, build professional connections, and explore collaboration with fellow practitioners, speakers, industry representatives, and other stakeholders.' }],
  },
  {
    q: { id: 'Bagaimana cara mendapat informasi lebih lanjut?', en: 'How can I get more information?' },
    a: [{ id: 'Hubungi Panitia Maritime Security Forum 2026 melalui kanal kontak resmi yang tercantum di undangan atau informasi registrasi Anda.', en: 'Contact the Maritime Security Forum 2026 Organizing Committee through the official contact channel in your invitation or registration information.' }],
  },
]

export const COMMUNITY = {
  title: { id: 'Gabung Indonesia Maritime Security Community', en: 'Join the Indonesia Maritime Security Community' },
  body: {
    id: 'Setelah forum, komunitas praktisi keamanan maritim Indonesia dimulai lewat grup WhatsApp: ruang profesional untuk berbagi informasi, membahas risiko yang muncul, dan menjaga jejaring di luar forum.',
    en: 'After the forum, the Indonesia Maritime Security Practitioners community starts with a WhatsApp group: a professional space to share information, discuss emerging risks, and keep connections beyond the forum.',
  },
}
