/**
 * Velmora Evidence-Based Health Education Articles
 * Grounded in peer-reviewed clinical guidance from ACOG, NHS, CDC, and WHO.
 * Last reviewed: October 2026.
 */

import { EducationArticle } from '../types/index.ts';

export const EDUCATION_ARTICLES: EducationArticle[] = [
  {
    id: 'cycle_fundamentals',
    title: 'Understanding Menstrual Cycle Phases & Hormonal Shifts',
    category: 'Fundamentals',
    readTime: '4 min read',
    lastReviewed: 'October 2026',
    summary: 'A clear guide to the follicular, ovulatory, and luteal phases, and what happens physiologically throughout your cycle.',
    sources: [
      { title: 'ACOG: Your First Period and Menstrual Cycle Basics', url: 'https://www.acog.org/womens-health/faqs/your-first-period' },
      { title: 'NHS: Stages of the Menstrual Cycle', url: 'https://www.nhs.uk/conditions/periods/' }
    ],
    contentMarkdown: `
### What Is a Menstrual Cycle?
The menstrual cycle is counted from the first day of one period (Day 1) to the first day of the next period. While 28 days is often cited as a textbook average, normal cycle lengths for adults range between **21 and 35 days**, and variations of 2 to 4 days month-to-month are entirely standard.

### The Four Main Phases

1. **Menstrual Phase (Days 1–5 to 7):**
   The cycle begins when the thickened lining of the uterus (endometrium) is shed because pregnancy did not occur. Estrogen and progesterone are at their lowest levels. Bleeding typically lasts 3 to 7 days, with the heaviest flow usually occurring during the first 2 to 3 days.

2. **Follicular Phase (Days 1–13):**
   Overlapping with menstruation, the pituitary gland releases Follicle-Stimulating Hormone (FSH). This stimulates ovaries to mature several follicles, each housing an egg. As one dominant follicle grows, it secretes rising levels of estradiol (estrogen), rebuilding the uterine lining. Users often report increased energy and focus during this rise in estrogen.

3. **Ovulatory Phase (Approx. Day 14 in a 28-day cycle):**
   Surging estrogen triggers a sharp spike in Luteinizing Hormone (LH). This causes the mature follicle to rupture and release an ovum into the fallopian tube. The egg remains viable for approximately 12 to 24 hours. However, sperm can survive in cervical mucus for up to 5 days, defining the "fertile window".

4. **Luteal Phase (Days 15–28):**
   The ruptured follicle transforms into the **corpus luteum**, which secretes progesterone. Progesterone stabilizes the uterine lining in preparation for a potential fertilized egg. If fertilization does not occur, the corpus luteum degenerates after approximately 12–14 days, progesterone drops, and a new menstrual cycle begins.
    `
  },
  {
    id: 'symptoms_pain_dysmenorrhea',
    title: 'Period Pain & Symptoms: What Is Typical vs. When to Seek Care',
    category: 'Symptoms & Care',
    readTime: '5 min read',
    lastReviewed: 'October 2026',
    summary: 'Differentiating primary dysmenorrhea from secondary pelvic pain, understanding prostaglandins, and identifying red flags.',
    sources: [
      { title: 'ACOG Practice Bulletin No. 206: Chronic Pelvic Pain & Dysmenorrhea', url: 'https://www.acog.org/clinical/clinical-guidance/practice-bulletin/articles/2020/03/chronic-pelvic-pain' },
      { title: 'CDC: Managing Period Pain and Endometriosis', url: 'https://www.cdc.gov/' }
    ],
    contentMarkdown: `
### What Causes Menstrual Cramps?
Primary dysmenorrhea (cramping without an underlying pelvic disease) is primarily caused by **prostaglandins**—hormone-like lipids released by the uterine lining as it breaks down. Prostaglandins stimulate the muscular wall of the uterus (myometrium) to contract, temporarily compressing blood vessels and causing cramping sensations.

### Common vs. Concerning Symptoms

- **Common (Primary Dysmenorrhea):**
  - Mild to moderate cramping in the lower abdomen or lower back starting 1–2 days before or on Day 1 of bleeding.
  - Mild headache, fatigue, mild water retention/bloating, or softer bowel movements.
  - Pain that responds adequately to warmth (heating pads) or first-line NSAIDs like ibuprofen or naproxen.

- **Signs Requiring Medical Evaluation (Secondary Dysmenorrhea):**
  - Severe pain (7–10 on a 10-point scale) that prevents you from attending work, school, or daily activities.
  - Pain that steadily worsens over time or begins years after your first periods started.
  - Pain during intercourse (dyspareunia) or pain with bowel movements during your period.
  - Bleeding or spotting between periods.
  - Little to no pain relief from maximum recommended over-the-counter anti-inflammatories.

These symptoms can be signs of conditions such as **endometriosis**, **adenomyosis**, **uterine fibroids**, or **pelvic inflammatory disease (PID)**.
    `
  },
  {
    id: 'hygiene_tss_safety',
    title: 'Menstrual Hygiene, Product Safety & Toxic Shock Syndrome Facts',
    category: 'Products & Hygiene',
    readTime: '4 min read',
    lastReviewed: 'October 2026',
    summary: 'Safe usage intervals for tampons and cups, cleaning practices, and early recognition of Toxic Shock Syndrome.',
    sources: [
      { title: 'FDA: Tampons and Menstrual Cups Safety Guide', url: 'https://www.fda.gov/consumers/consumer-updates/facts-tampons-and-how-use-them-safely' },
      { title: 'NHS: Toxic Shock Syndrome (TSS)', url: 'https://www.nhs.uk/conditions/toxic-shock-syndrome/' }
    ],
    contentMarkdown: `
### Key Product Wear Times

- **Tampons:** Maximum wear time of **4 to 8 hours**. Never wear a tampon for longer than 8 hours. Always use the lowest absorbency suitable for your current flow (e.g., Light on light days, rather than leaving a Super tampon in for half a day).
- **Menstrual Cups & Discs:** Typically up to **8 to 12 hours** depending on capacity and manufacturer guidelines. Wash hands thoroughly before insertion and removal.
- **Pads & Reusable Cloth:** Change every **4 to 6 hours** (or sooner if soaked) to minimize bacterial growth and skin irritation.
- **Period Underwear:** Change every **8 to 12 hours** depending on rated absorbency; rinse with cold water before machine washing.

### Understanding Toxic Shock Syndrome (TSS)
TSS is a rare but serious condition caused by toxins produced by *Staphylococcus aureus* or *Streptococcus pyogenes* bacteria. While associated with high-absorbency tampon use, it can also rarely occur with menstrual cups, wound infections, or after surgery.

**Early Symptoms of TSS:**
- Sudden high fever (usually > 38.9°C / 102°F)
- A diffuse red rash that resembles a sunburn (especially on palms and soles)
- Dizziness, lightheadedness, or feeling faint upon standing
- Vomiting or sudden watery diarrhea
- Muscle aches and confusion

*If you experience these symptoms while wearing a tampon or cup, remove the device immediately and seek emergency medical care.*
    `
  },
  {
    id: 'prediction_limitations',
    title: 'Prediction Algorithms: Scientific Limitations & Why Estimates Vary',
    category: 'Privacy & Science',
    readTime: '3 min read',
    lastReviewed: 'October 2026',
    summary: 'Why algorithmic forecasts are statistical estimates rather than biological certainties, and why apps must never be used as contraception.',
    sources: [
      { title: 'ACOG Statement on Digital Fertility & Period Trackers', url: 'https://www.acog.org/' },
      { title: 'World Health Organization (WHO): Family Planning and Natural Methods', url: 'https://www.who.int/' }
    ],
    contentMarkdown: `
### How Cycle Prediction Models Work
Velmora calculates your estimated next period using the **median interval** between your consecutively recorded start dates. Because human biology is non-linear, the date is a mathematical estimate based on past patterns.

### Why Cycles Fluctuate
The follicular phase (the time before ovulation) is naturally variable. Ovulation can be delayed or advanced by:
- Acute physical or emotional stress (which influences the hypothalamic-pituitary-ovarian axis)
- Recent viral illness or fever
- Changes in sleep patterns, shift work, or time zone travel
- Nutritional shifts or significant weight fluctuations
- Hormonal medications or contraception changes

### Critical Safety Notice Regarding Contraception
**Never rely on calendar predictions or algorithmically calculated fertile windows for contraception.**
Sperm can survive in the reproductive tract for up to 5 days, and ovulation timing can shift unexpectedly without warning signs. An app that calculates fertile days based purely on calendar arithmetic cannot confirm biological ovulation or guarantee contraceptive safety.
    `
  },
  {
    id: 'talking_to_your_doctor',
    title: 'Preparing for Your Healthcare Appointment: Practical Tips',
    category: 'Symptoms & Care',
    readTime: '4 min read',
    lastReviewed: 'October 2026',
    summary: 'How to organize your Velmora reports, specific questions to ask, and advocating for your reproductive wellness.',
    sources: [
      { title: 'ACOG: Preparing for Your Annual Well-Woman Exam', url: 'https://www.acog.org/' },
      { title: 'NHS: Talking to a GP About Period Problems', url: 'https://www.nhs.uk/' }
    ],
    contentMarkdown: `
### What Healthcare Providers Need to Know
When visiting an OB/GYN, general practitioner, or women's health specialist about menstrual concerns, having concrete observational data makes a tremendous difference. Clinicians look for:

1. **First Day of Last Menstrual Period (LMP):** The exact date bleeding began.
2. **Cycle Consistency:** Median length and range (e.g. "My cycle ranges between 26 and 31 days over the past 6 months").
3. **Bleeding Volume & Duration:** How many days of heavy, medium, and light bleeding occur, and how many pads/tampons are soaked on peak days.
4. **Pain Character & Timing:** When during the cycle cramping begins (before vs. during bleeding), peak pain level (0–10), and whether pain interferes with daily responsibilities.
5. **Impact of Medications:** Which pain relievers were tried, the dosage taken, and whether they provided meaningful relief.

### Using Velmora’s Health Reports
Use Velmora's **Health Reports** section to generate a 3-month or 6-month summary before your visit. You can print it to paper or save it as a clean PDF to bring along.
    `
  },
  {
    id: 'privacy_and_data_autonomy',
    title: 'Local-First Health Tracking: Why Your Data Stays on Your Device',
    category: 'Privacy & Science',
    readTime: '3 min read',
    lastReviewed: 'October 2026',
    summary: 'An architectural breakdown of local IndexedDB storage, zero-tracking commitments, and browser storage precautions.',
    sources: [
      { title: 'Electronic Frontier Foundation (EFF): Reproductive Privacy in the Digital Age', url: 'https://www.eff.org/' }
    ],
    contentMarkdown: `
### How Velmora Protects Your Health Privacy
In modern digital health, period and reproductive tracking data are among the most sensitive personal records you create. Unlike conventional commercial apps that store your cycle history on remote corporate cloud databases, **Velmora is architected local-first**:

- **No Remote User Accounts:** You are never asked to enter an email address, create a password, or register an identity.
- **Client-Side IndexedDB Storage:** All menstrual start dates, bleeding intensities, pain ratings, symptoms, and doctor notes reside strictly inside your browser's private IndexedDB database on your phone or laptop.
- **No Third-Party Analytics:** We do not embed behavioral trackers, advertising pixels, or telemetry beacons.
- **Transparent Open-Source Rules:** Predictions and health alerts run locally in JavaScript right in your browser tab without pinging external AI servers with your health records.

### Important Practical Notes on Browser Data
Because your data is stored locally in your browser:
- Clearing your browser's history and website storage will delete your Velmora records unless you have exported a JSON backup.
- We recommend using the **Data Backup** option in Settings periodically to save an offline copy to your computer or personal drive.
    `
  }
];
