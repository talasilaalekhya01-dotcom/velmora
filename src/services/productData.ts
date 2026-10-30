/**
 * Velmora Period Products Directory
 * Objective, sourced guides on menstrual care products with user review capabilities.
 * Strictly educational and observational — no shopping or e-commerce links.
 */

import { ProductItem } from '../types/index.ts';

export const PERIOD_PRODUCTS: ProductItem[] = [
  {
    id: 'pads_disposable',
    name: 'Disposable Sanitary Pads',
    category: 'Disposable',
    description: 'Adhesive absorbent pads worn in underwear that capture menstrual flow externally.',
    howItWorks: 'Layers of absorbent cellulose core, superabsorbent polymers, and a moisture-barrier backing adhere to the interior gusset of undergarments.',
    wearTime: 'Change every 4 to 6 hours, or sooner if saturated.',
    pros: [
      'Simple, non-invasive external use; no internal insertion needed',
      'Ideal for heavy days, overnight protection, or post-partum care',
      'Zero risk of Toxic Shock Syndrome (TSS)',
      'Widely available in varied lengths, thicknesses, and absorbencies'
    ],
    cons: [
      'Generates regular disposable plastic and cellulose waste',
      'Can feel bulky or cause friction during active sports or swimming',
      'Adhesive shifting can occasionally lead to side leakage'
    ],
    careAndDisposal: 'Wrap securely in toilet paper or wrapper and dispose of in household waste bins. Never flush pads down toilets.',
    ecoImpact: 'High',
    tssRisk: 'None'
  },
  {
    id: 'cloth_pads',
    name: 'Reusable Cloth Pads',
    category: 'Reusable',
    description: 'Washable fabric pads made from cotton, bamboo fleece, or hemp with snap wings.',
    howItWorks: 'Multiple absorbent fabric layers absorb flow externally; wings with snap fasteners wrap around the underwear gusset.',
    wearTime: 'Change every 4 to 6 hours as needed.',
    pros: [
      'Reusable for 3 to 5+ years, drastically lowering recurring expense and waste',
      'Breathable, natural fabrics that reduce skin chafing and irritation',
      'Soft and quiet compared to plastic-backed disposable products',
      'Available in organic cotton and hypoallergenic variants'
    ],
    cons: [
      'Requires access to clean water, laundry facilities, and drying time',
      'Carrying used pads in wet bags during travel requires extra planning'
    ],
    careAndDisposal: 'Rinse in cold water until water runs clear, then wash on a normal machine cycle with mild detergent. Air dry or tumble dry low.',
    ecoImpact: 'Low',
    tssRisk: 'None'
  },
  {
    id: 'tampons',
    name: 'Tampons (Applicator & Non-Applicator)',
    category: 'Disposable',
    description: 'Compressed cylindrical absorbent cotton or rayon fibers inserted into the vaginal canal.',
    howItWorks: 'Inserted into the vagina using a cardboard/plastic applicator or fingers. Expands radially to absorb menstrual fluid directly at the cervical os.',
    wearTime: 'Change every 4 to 8 hours. Never exceed 8 hours.',
    pros: [
      'Discreet and allows swimming, intense workouts, and sports',
      'Minimal sensation when inserted correctly',
      'Compact to carry in bags or pockets'
    ],
    cons: [
      'Carries a known risk of Toxic Shock Syndrome (TSS) if worn too long or if absorbency is too high',
      'Can cause vaginal dryness if used on very light flow days',
      'Requires learning curve for comfortable positioning'
    ],
    careAndDisposal: 'Wrap in tissue and dispose in household trash. Tampons and applicators must never be flushed.',
    ecoImpact: 'Moderate',
    tssRisk: 'Moderate (follow change times)'
  },
  {
    id: 'menstrual_cups',
    name: 'Menstrual Cups',
    category: 'Reusable',
    description: 'Flexible medical-grade silicone, elastomer, or latex bell-shaped cup inserted into the vagina.',
    howItWorks: 'Folded and inserted into the lower vaginal canal where it pops open, creating a gentle seal that catches rather than absorbs fluid.',
    wearTime: 'Can be worn for up to 8 to 12 hours depending on flow.',
    pros: [
      'Holds 3x to 5x more fluid than a standard tampon',
      'Reusable for 5 to 10 years, offering exceptional long-term financial and ecological savings',
      'Maintains natural vaginal pH and mucosal moisture',
      'Odour-free since fluid is not exposed to air'
    ],
    cons: [
      'Initial learning curve for insertion, fold techniques, and breaking the seal',
      'Requires boiling for 5–10 minutes between menstrual cycles',
      'Emptying in public restrooms requires clean wipes or hand sanitizing'
    ],
    careAndDisposal: 'Empty contents into the toilet, rinse with warm water and oil-free soap, and reinsert. Sterilize in boiling water between periods.',
    ecoImpact: 'Low',
    tssRisk: 'Very Low'
  },
  {
    id: 'menstrual_discs',
    name: 'Menstrual Discs',
    category: 'Reusable',
    description: 'Flat, flexible disc that sits in the vaginal fornix directly beneath the cervix.',
    howItWorks: 'Pinched into an oval and pushed back into the vaginal fornix, tucking behind the pubic bone to collect menstrual fluid.',
    wearTime: 'Up to 12 hours.',
    pros: [
      'Positioned in the widest part of the vagina, accommodating mess-free sexual intercourse during menstruation',
      'Does not rely on suction, which some users find more comfortable with IUDs (though consultation with a doctor is advised)',
      'High fluid capacity (up to 50–70ml)'
    ],
    cons: [
      'Removal can be messy if not kept horizontal',
      'Sizing requires trial to fit pelvic anatomy securely behind the pubic bone'
    ],
    careAndDisposal: 'Available in single-use or reusable medical-grade silicone. Wash with warm water and mild soap; boil to sanitize.',
    ecoImpact: 'Low',
    tssRisk: 'Very Low'
  },
  {
    id: 'period_underwear',
    name: 'Period Underwear',
    category: 'Reusable',
    description: 'Absorbent, leak-resistant layered underwear designed to replace or backup pads and tampons.',
    howItWorks: 'Constructed with a moisture-wicking top layer, antimicrobial absorbent middle layers, and a breathable waterproof outer barrier.',
    wearTime: 'Typically 8 to 12 hours depending on rated capacity (e.g. Light, Moderate, Overnight).',
    pros: [
      'Feels like standard comfortable underwear with no external shifting or bulk',
      'Excellent for teens, spotting, backup protection with cups, or overnight use',
      'Washable and reusable for several years'
    ],
    cons: [
      'Higher upfront cost per pair',
      'Changing during the day requires removing shoes and pants in a restroom'
    ],
    careAndDisposal: 'Rinse with cold tap water until clear, machine wash on delicate without fabric softener, and hang dry.',
    ecoImpact: 'Low',
    tssRisk: 'None'
  }
];
