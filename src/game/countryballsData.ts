import { CountryballDef } from '../types';

export const ALL_COUNTRYBALLS: CountryballDef[] = [
  {
    id: 'usa',
    name: 'USA',
    code: 'USA',
    flagCode: '🇺🇸',
    primaryColor: '#b22234',
    secondaryColor: '#ffffff',
    accentColor: '#3c3b6e',
    patternType: 'canton',
    eyeStyle: 'cool',
    personality: 'Hyper-energetic & aggressive speedster',
    description: 'Equipped with star-spangled sunglasses and maximum momentum.',
    mass: 1.15,
    restitution: 0.82,
    topSpeed: 1.18,
    grip: 1.05,
    specialTrait: 'Freedom Boost on downhill slopes',
  },
  {
    id: 'canada',
    name: 'Canada',
    code: 'CAN',
    flagCode: '🇨🇦',
    primaryColor: '#ff0000',
    secondaryColor: '#ffffff',
    accentColor: '#ff0000',
    patternType: 'stripes_v',
    eyeStyle: 'happy',
    personality: 'Friendly and smooth ice glider',
    description: 'Glides across icy zones without losing balance.',
    mass: 1.05,
    restitution: 0.78,
    topSpeed: 1.12,
    grip: 1.15,
    specialTrait: 'Maple Glide: immune to slippery ice slowdowns',
  },
  {
    id: 'brazil',
    name: 'Brazil',
    code: 'BRA',
    flagCode: '🇧🇷',
    primaryColor: '#009739',
    secondaryColor: '#fedd00',
    accentColor: '#012169',
    patternType: 'circle',
    eyeStyle: 'happy',
    personality: 'Samba-rhythm agile curve master',
    description: 'Turns tightly around tricky bends with unmatched spin.',
    mass: 1.0,
    restitution: 0.88,
    topSpeed: 1.16,
    grip: 1.2,
    specialTrait: 'Samba Spin: sharp high-speed cornering',
  },
  {
    id: 'mexico',
    name: 'Mexico',
    code: 'MEX',
    flagCode: '🇲🇽',
    primaryColor: '#006847',
    secondaryColor: '#ffffff',
    accentColor: '#ce1126',
    patternType: 'stripes_v',
    eyeStyle: 'determined',
    personality: 'Spicy acceleration and bumper bouncer',
    description: 'Gets extra launch velocity whenever hitting bouncy pads.',
    mass: 1.08,
    restitution: 0.86,
    topSpeed: 1.14,
    grip: 1.08,
    specialTrait: 'Fiesta Bounce: +25% rebound speed from pads',
  },
  {
    id: 'argentina',
    name: 'Argentina',
    code: 'ARG',
    flagCode: '🇦🇷',
    primaryColor: '#75aadb',
    secondaryColor: '#ffffff',
    accentColor: '#f6b40e',
    patternType: 'sun',
    eyeStyle: 'cool',
    personality: 'Graceful tango drifter with high torque',
    description: 'Maintains steady velocity through long slaloms and loops.',
    mass: 1.04,
    restitution: 0.8,
    topSpeed: 1.15,
    grip: 1.12,
    specialTrait: 'Tango Drift: smooth momentum preservation',
  },
  {
    id: 'uk',
    name: 'UK',
    code: 'GBR',
    flagCode: '🇬🇧',
    primaryColor: '#012169',
    secondaryColor: '#c8102e',
    accentColor: '#ffffff',
    patternType: 'cross',
    eyeStyle: 'cool',
    personality: 'Refined, steady and heavy momentum tank',
    description: 'Unshakable stability against pendulum hammers.',
    mass: 1.2,
    restitution: 0.72,
    topSpeed: 1.1,
    grip: 1.18,
    specialTrait: 'Monocle Stance: high collision resistance',
  },
  {
    id: 'france',
    name: 'France',
    code: 'FRA',
    flagCode: '🇫🇷',
    primaryColor: '#002654',
    secondaryColor: '#ffffff',
    accentColor: '#ed2939',
    patternType: 'stripes_v',
    eyeStyle: 'happy',
    personality: 'Quick sprint bursts and stylish jumps',
    description: 'Leaps high across jump gaps and ramps.',
    mass: 0.98,
    restitution: 0.84,
    topSpeed: 1.15,
    grip: 1.05,
    specialTrait: 'Baguette Leap: extra airtime on jump ramps',
  },
  {
    id: 'germany',
    name: 'Germany',
    code: 'DEU',
    flagCode: '🇩🇪',
    primaryColor: '#222222',
    secondaryColor: '#dd0000',
    accentColor: '#ffce00',
    patternType: 'stripes_h',
    eyeStyle: 'determined',
    personality: 'Autobahn engineering: relentless top speed',
    description: 'Accelerates continuously on straightaways.',
    mass: 1.22,
    restitution: 0.75,
    topSpeed: 1.22,
    grip: 1.12,
    specialTrait: 'Autobahn Drive: higher max straight line velocity',
  },
  {
    id: 'italy',
    name: 'Italy',
    code: 'ITA',
    flagCode: '🇮🇹',
    primaryColor: '#009246',
    secondaryColor: '#ffffff',
    accentColor: '#ce2b37',
    patternType: 'stripes_v',
    eyeStyle: 'intense',
    personality: 'Passionate racer with lightning fast revs',
    description: 'Starts with high initial launch torque.',
    mass: 0.96,
    restitution: 0.85,
    topSpeed: 1.17,
    grip: 1.02,
    specialTrait: 'Ferrari Launch: instant sprint off the gate',
  },
  {
    id: 'spain',
    name: 'Spain',
    code: 'ESP',
    flagCode: '🇪🇸',
    primaryColor: '#aa151b',
    secondaryColor: '#f1bf00',
    accentColor: '#aa151b',
    patternType: 'stripes_h',
    eyeStyle: 'determined',
    personality: 'Fearless matador dodging spinning obstacles',
    description: 'Slips through rotating hammers with ease.',
    mass: 1.06,
    restitution: 0.81,
    topSpeed: 1.13,
    grip: 1.1,
    specialTrait: 'Matador Dodge: reduced knockback from obstacles',
  },
  {
    id: 'portugal',
    name: 'Portugal',
    code: 'PRT',
    flagCode: '🇵🇹',
    primaryColor: '#006600',
    secondaryColor: '#ff0000',
    accentColor: '#ffff00',
    patternType: 'stripes_v',
    eyeStyle: 'happy',
    personality: 'Ocean navigator with water current mastery',
    description: 'Maintains full speed through water zones.',
    mass: 1.02,
    restitution: 0.79,
    topSpeed: 1.12,
    grip: 1.14,
    specialTrait: 'Navigator: bonus speed in water sections',
  },
  {
    id: 'poland',
    name: 'Poland',
    code: 'POL',
    flagCode: '🇵🇱',
    primaryColor: '#dc143c',
    secondaryColor: '#ffffff',
    patternType: 'stripes_h',
    eyeStyle: 'happy',
    personality: 'Lightweight bounce champion & comeback hero',
    description: 'Can into space! Extremely bouncy and fun.',
    mass: 0.88,
    restitution: 0.94,
    topSpeed: 1.14,
    grip: 0.95,
    specialTrait: 'Can Into Space: massive bounces and wild air recoveries',
  },
  {
    id: 'turkey',
    name: 'Turkey',
    code: 'TUR',
    flagCode: '🇹🇷',
    primaryColor: '#e30a17',
    secondaryColor: '#ffffff',
    patternType: 'sun',
    eyeStyle: 'determined',
    personality: 'Solid and unstoppable in tight packs',
    description: 'Pushes through clustered marbles effortlessly.',
    mass: 1.18,
    restitution: 0.78,
    topSpeed: 1.12,
    grip: 1.1,
    specialTrait: 'Ottoman Force: pushes rival marbles out of the way',
  },
  {
    id: 'japan',
    name: 'Japan',
    code: 'JPN',
    flagCode: '🇯🇵',
    primaryColor: '#ffffff',
    secondaryColor: '#bc002d',
    patternType: 'circle',
    eyeStyle: 'cool',
    personality: 'Shinkansen bullet train precision and aero low-drag',
    description: 'Flies along center rails with laser focus.',
    mass: 0.95,
    restitution: 0.8,
    topSpeed: 1.2,
    grip: 1.22,
    specialTrait: 'Bullet Train: high precision trajectory and low drag',
  },
  {
    id: 'china',
    name: 'China',
    code: 'CHN',
    flagCode: '🇨🇳',
    primaryColor: '#de2910',
    secondaryColor: '#ffde00',
    patternType: 'stars',
    eyeStyle: 'determined',
    personality: 'Heavyweight momentum powerhouse',
    description: 'Absorbs shocks and holds the racing line.',
    mass: 1.25,
    restitution: 0.74,
    topSpeed: 1.11,
    grip: 1.16,
    specialTrait: 'Dragon Heavy: shrugs off side-swipes',
  },
  {
    id: 'south_korea',
    name: 'South Korea',
    code: 'KOR',
    flagCode: '🇰🇷',
    primaryColor: '#ffffff',
    secondaryColor: '#cd2e3a',
    accentColor: '#0047a0',
    patternType: 'circle',
    eyeStyle: 'happy',
    personality: 'High-tech reflexes and lightning turbo boosts',
    description: 'Gains instant acceleration after exiting funnels.',
    mass: 0.96,
    restitution: 0.86,
    topSpeed: 1.18,
    grip: 1.15,
    specialTrait: 'Turbo Reflex: +30% boost duration on speed pads',
  },
  {
    id: 'india',
    name: 'India',
    code: 'IND',
    flagCode: '🇮🇳',
    primaryColor: '#ff9933',
    secondaryColor: '#ffffff',
    accentColor: '#138808',
    patternType: 'stripes_h',
    eyeStyle: 'happy',
    personality: 'Persistent stamina and uncanny comeback skills',
    description: 'Survives difficult bottlenecks and catches up fast.',
    mass: 1.08,
    restitution: 0.82,
    topSpeed: 1.13,
    grip: 1.12,
    specialTrait: 'Chai Surge: extra speed when lagging behind the pack',
  },
  {
    id: 'pakistan',
    name: 'Pakistan',
    code: 'PAK',
    flagCode: '🇵🇰',
    primaryColor: '#115740',
    secondaryColor: '#ffffff',
    patternType: 'sun',
    eyeStyle: 'determined',
    personality: 'Calculated agility and sharp narrow-bridge specialist',
    description: 'Excels on narrow bridges and high-altitude beams.',
    mass: 1.02,
    restitution: 0.83,
    topSpeed: 1.14,
    grip: 1.18,
    specialTrait: 'Crescent Focus: perfect balance on narrow beams',
  },
  {
    id: 'australia',
    name: 'Australia',
    code: 'AUS',
    flagCode: '🇦🇺',
    primaryColor: '#00008b',
    secondaryColor: '#ffffff',
    accentColor: '#cc0000',
    patternType: 'stars',
    eyeStyle: 'happy',
    personality: 'Acrobatic outback jumper & wildcard',
    description: 'Recovers instantly from wild obstacle impacts.',
    mass: 1.05,
    restitution: 0.9,
    topSpeed: 1.13,
    grip: 1.06,
    specialTrait: 'Boomerang Bounce: spins back onto track after collisions',
  },
  {
    id: 'egypt',
    name: 'Egypt',
    code: 'EGY',
    flagCode: '🇪🇬',
    primaryColor: '#c09300',
    secondaryColor: '#ffffff',
    accentColor: '#000000',
    patternType: 'stripes_h',
    eyeStyle: 'cool',
    personality: 'Dune master with high traction on desert sands',
    description: 'Rolls smoothly through mud, sand, and rough terrain.',
    mass: 1.14,
    restitution: 0.77,
    topSpeed: 1.12,
    grip: 1.25,
    specialTrait: 'Sand Walker: no friction penalty on dirt or mud',
  },
  {
    id: 'saudi_arabia',
    name: 'Saudi Arabia',
    code: 'SAU',
    flagCode: '🇸🇦',
    primaryColor: '#165d31',
    secondaryColor: '#ffffff',
    patternType: 'sun',
    eyeStyle: 'determined',
    personality: 'Desert falcon with high heat resistance',
    description: 'Unaffected by fire zones and magma traps.',
    mass: 1.12,
    restitution: 0.79,
    topSpeed: 1.15,
    grip: 1.1,
    specialTrait: 'Heat Shield: immune to fire hazard knockbacks',
  },
  {
    id: 'south_africa',
    name: 'South Africa',
    code: 'ZAF',
    flagCode: '🇿🇦',
    primaryColor: '#007a4d',
    secondaryColor: '#ffb612',
    accentColor: '#002395',
    patternType: 'triangle',
    eyeStyle: 'happy',
    personality: 'Versatile all-terrain rainbow powerhouse',
    description: 'Consistent performance across every track type.',
    mass: 1.07,
    restitution: 0.84,
    topSpeed: 1.14,
    grip: 1.14,
    specialTrait: 'Rainbow Versatility: balanced all-terrain physics',
  },
  {
    id: 'sweden',
    name: 'Sweden',
    code: 'SWE',
    flagCode: '🇸🇪',
    primaryColor: '#006aa7',
    secondaryColor: '#fecc00',
    patternType: 'cross',
    eyeStyle: 'happy',
    personality: 'Smooth Nordic glider with low friction loss',
    description: 'Effortlessly glides through tricky switchbacks.',
    mass: 1.03,
    restitution: 0.81,
    topSpeed: 1.14,
    grip: 1.16,
    specialTrait: 'Nordic Glide: smooth low-friction cornering',
  },
  {
    id: 'switzerland',
    name: 'Switzerland',
    code: 'CHE',
    flagCode: '🇨🇭',
    primaryColor: '#d52b1e',
    secondaryColor: '#ffffff',
    patternType: 'cross',
    eyeStyle: 'cool',
    personality: 'Alpine precision & centered center of gravity',
    description: 'Never wobbles or falls off steep downhill slopes.',
    mass: 1.1,
    restitution: 0.8,
    topSpeed: 1.13,
    grip: 1.24,
    specialTrait: 'Swiss Precision: center-gravity stability lock',
  },
  {
    id: 'netherlands',
    name: 'Netherlands',
    code: 'NLD',
    flagCode: '🇳🇱',
    primaryColor: '#ae1c28',
    secondaryColor: '#ffffff',
    accentColor: '#21468b',
    patternType: 'stripes_h',
    eyeStyle: 'happy',
    personality: 'Canal drifter with steady tailwind speed',
    description: 'Gains speed when drafting behind other marbles.',
    mass: 1.06,
    restitution: 0.83,
    topSpeed: 1.16,
    grip: 1.12,
    specialTrait: 'Windmill Slipstream: speed boost when following leaders',
  },
  {
    id: 'greece',
    name: 'Greece',
    code: 'GRC',
    flagCode: '🇬🇷',
    primaryColor: '#0d5eaf',
    secondaryColor: '#ffffff',
    patternType: 'stripes_h',
    eyeStyle: 'determined',
    personality: 'Spartan resilience in brutal collision chaos',
    description: 'Turns enemy impacts into forward kinetic energy.',
    mass: 1.16,
    restitution: 0.85,
    topSpeed: 1.11,
    grip: 1.1,
    specialTrait: 'Spartan Rebound: converts side bumps into forward thrust',
  },
  {
    id: 'jamaica',
    name: 'Jamaica',
    code: 'JAM',
    flagCode: '🇯🇲',
    primaryColor: '#009b3a',
    secondaryColor: '#fed100',
    accentColor: '#000000',
    patternType: 'diagonal',
    eyeStyle: 'happy',
    personality: 'Sprint King with explosive top-speed accelerations',
    description: 'Blasts out of starting gate with supersonic speed.',
    mass: 0.94,
    restitution: 0.87,
    topSpeed: 1.23,
    grip: 1.08,
    specialTrait: 'Sprint King: supersonic burst speed in final sector',
  },
  {
    id: 'norway',
    name: 'Norway',
    code: 'NOR',
    flagCode: '🇳🇴',
    primaryColor: '#ba0c2f',
    secondaryColor: '#ffffff',
    accentColor: '#00205b',
    patternType: 'cross',
    eyeStyle: 'cool',
    personality: 'Viking storm rider with heavy downhill charge',
    description: 'Crushes through swinging pendulum obstacles.',
    mass: 1.24,
    restitution: 0.76,
    topSpeed: 1.13,
    grip: 1.18,
    specialTrait: 'Viking Charge: high downhill inertia',
  },
  {
    id: 'indonesia',
    name: 'Indonesia',
    code: 'IDN',
    flagCode: '🇮🇩',
    primaryColor: '#ff0000',
    secondaryColor: '#ffffff',
    patternType: 'stripes_h',
    eyeStyle: 'happy',
    personality: 'Nimble shortcut finder & split-path acrobat',
    description: 'Naturally steers into risky high-speed shortcuts.',
    mass: 0.95,
    restitution: 0.86,
    topSpeed: 1.15,
    grip: 1.1,
    specialTrait: 'Shortcut Magnet: optimal pathing through split forks',
  },
  {
    id: 'philippines',
    name: 'Philippines',
    code: 'PHL',
    flagCode: '🇵🇭',
    primaryColor: '#0038a8',
    secondaryColor: '#ce1126',
    accentColor: '#fcd116',
    patternType: 'sun',
    eyeStyle: 'happy',
    personality: 'Pearl marble with spirited bouncy acrobatic recovery',
    description: 'Lively, joyful, and bounces off walls with cheer.',
    mass: 0.96,
    restitution: 0.89,
    topSpeed: 1.15,
    grip: 1.06,
    specialTrait: 'Pearl Bounce: high energy conservation in pinball areas',
  },
  {
    id: 'vietnam',
    name: 'Vietnam',
    code: 'VNM',
    flagCode: '🇻🇳',
    primaryColor: '#da251d',
    secondaryColor: '#ffff00',
    patternType: 'sun',
    eyeStyle: 'determined',
    personality: 'Unstoppable endurance through dense jungle courses',
    description: 'Maintains grip on winding obstacle-heavy tracks.',
    mass: 1.02,
    restitution: 0.82,
    topSpeed: 1.13,
    grip: 1.2,
    specialTrait: 'Golden Star: steady line through dense obstacle zones',
  },
  {
    id: 'iceland',
    name: 'Iceland',
    code: 'ISL',
    flagCode: '🇮🇸',
    primaryColor: '#02529c',
    secondaryColor: '#ffffff',
    accentColor: '#dc1e35',
    patternType: 'cross',
    eyeStyle: 'cool',
    personality: 'Volcano & glacier hybrid with ultra-smooth roll',
    description: 'Minimal rolling resistance across all slopes.',
    mass: 1.08,
    restitution: 0.8,
    topSpeed: 1.16,
    grip: 1.15,
    specialTrait: 'Glacier Core: ultra-smooth rolling momentum',
  },
];

// Helper to generate a 512x512 Canvas texture for any Countryball flag with cartoon eyes
export function createCountryballTexture(ball: CountryballDef): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  const w = canvas.width;
  const h = canvas.height;

  // 1. Draw Flag Background Base
  ctx.fillStyle = ball.primaryColor;
  ctx.fillRect(0, 0, w, h);

  const sec = ball.secondaryColor;
  const acc = ball.accentColor || '#ffffff';

  switch (ball.patternType) {
    case 'stripes_h': {
      if (ball.accentColor) {
        // 3 horizontal stripes (e.g. Germany, India, Egypt)
        ctx.fillStyle = ball.primaryColor;
        ctx.fillRect(0, 0, w, h / 3);
        ctx.fillStyle = sec;
        ctx.fillRect(0, h / 3, w, h / 3);
        ctx.fillStyle = acc;
        ctx.fillRect(0, (2 * h) / 3, w, h / 3);
      } else {
        // 2 horizontal stripes (e.g. Poland, Indonesia)
        ctx.fillStyle = ball.primaryColor;
        ctx.fillRect(0, 0, w, h / 2);
        ctx.fillStyle = sec;
        ctx.fillRect(0, h / 2, w, h / 2);
      }
      break;
    }
    case 'stripes_v': {
      // Vertical Tricolor (e.g. France, Italy, Mexico, Canada)
      const colW = w / 3;
      ctx.fillStyle = ball.primaryColor;
      ctx.fillRect(0, 0, colW, h);
      ctx.fillStyle = sec;
      ctx.fillRect(colW, 0, colW, h);
      ctx.fillStyle = acc;
      ctx.fillRect(colW * 2, 0, colW, h);
      break;
    }
    case 'cross': {
      // Nordic / UK / Swiss cross
      ctx.fillStyle = ball.primaryColor;
      ctx.fillRect(0, 0, w, h);

      // White under-cross
      ctx.fillStyle = sec;
      ctx.fillRect(0, h * 0.38, w, h * 0.24);
      ctx.fillRect(w * 0.32, 0, w * 0.16, h);

      if (ball.accentColor) {
        // Inner cross
        ctx.fillStyle = acc;
        ctx.fillRect(0, h * 0.44, w, h * 0.12);
        ctx.fillRect(w * 0.35, 0, w * 0.1, h);
      }
      break;
    }
    case 'circle': {
      // Japan, Brazil, South Korea
      ctx.fillStyle = ball.primaryColor;
      ctx.fillRect(0, 0, w, h);

      ctx.fillStyle = sec;
      ctx.beginPath();
      ctx.arc(w * 0.5, h * 0.5, h * 0.38, 0, Math.PI * 2);
      ctx.fill();

      if (ball.accentColor) {
        ctx.fillStyle = acc;
        ctx.beginPath();
        ctx.arc(w * 0.5, h * 0.5, h * 0.24, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
    case 'canton': {
      // USA stripes + blue canton
      const stripeH = h / 7;
      for (let i = 0; i < 7; i++) {
        ctx.fillStyle = i % 2 === 0 ? ball.primaryColor : sec;
        ctx.fillRect(0, i * stripeH, w, stripeH);
      }
      // Canton
      ctx.fillStyle = acc;
      ctx.fillRect(0, 0, w * 0.45, h * 0.55);

      // Star dots
      ctx.fillStyle = '#ffffff';
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 5; c++) {
          ctx.fillRect(20 + c * 38, 15 + r * 28, 6, 6);
        }
      }
      break;
    }
    case 'sun':
    case 'stars': {
      // Sun / Star pattern base
      ctx.fillStyle = ball.primaryColor;
      ctx.fillRect(0, 0, w, h);

      if (ball.secondaryColor) {
        ctx.fillStyle = ball.secondaryColor;
        ctx.fillRect(0, h / 2, w, h / 2);
      }

      ctx.fillStyle = acc || '#ffde00';
      ctx.beginPath();
      ctx.arc(w * 0.5, h * 0.45, h * 0.2, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'diagonal': {
      // Jamaica X
      ctx.fillStyle = ball.primaryColor;
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = sec;
      ctx.lineWidth = 32;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(w, h);
      ctx.moveTo(w, 0);
      ctx.lineTo(0, h);
      ctx.stroke();

      ctx.fillStyle = acc;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(w * 0.25, h * 0.5);
      ctx.lineTo(0, h);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(w, 0);
      ctx.lineTo(w * 0.75, h * 0.5);
      ctx.lineTo(w, h);
      ctx.fill();
      break;
    }
    case 'triangle': {
      // South Africa Y-chevron
      ctx.fillStyle = ball.primaryColor;
      ctx.fillRect(0, 0, w, h);

      ctx.fillStyle = sec;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(w * 0.45, h * 0.5);
      ctx.lineTo(0, h);
      ctx.fill();

      ctx.fillStyle = acc;
      ctx.beginPath();
      ctx.moveTo(0, h * 0.15);
      ctx.lineTo(w * 0.35, h * 0.5);
      ctx.lineTo(0, h * 0.85);
      ctx.fill();
      break;
    }
  }

  // 2. Draw Classic Countryball Expressive Cartoon Eyes
  // Eyes are placed symmetrically on the front face
  const eyeCenterX = w * 0.5;
  const eyeCenterY = h * 0.48;
  const eyeDist = 44;
  const eyeRadiusX = 22;
  const eyeRadiusY = 32;

  // White sclera with soft black outline
  const drawEye = (cx: number, cy: number, isRight: boolean) => {
    ctx.save();
    ctx.translate(cx, cy);

    // Expression tilt
    if (ball.eyeStyle === 'happy') {
      ctx.rotate(isRight ? -0.12 : 0.12);
    } else if (ball.eyeStyle === 'determined' || ball.eyeStyle === 'intense') {
      ctx.rotate(isRight ? 0.2 : -0.2);
    }

    // Outer shadow / outline
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.ellipse(0, 0, eyeRadiusX + 4, eyeRadiusY + 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eye white
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(0, 0, eyeRadiusX, eyeRadiusY, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eye pupil / Iris
    ctx.fillStyle = '#0f172a';
    let pupilOffsetY = 4;
    let pupilOffsetX = isRight ? -3 : 3;

    if (ball.eyeStyle === 'happy') {
      // Happy curved squint
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(0, 6, eyeRadiusX * 0.85, Math.PI, Math.PI * 2);
      ctx.fill();
    } else if (ball.eyeStyle === 'cool') {
      // Aviator shades!
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-eyeRadiusX - 4, -eyeRadiusY * 0.5, (eyeRadiusX + 4) * 2, eyeRadiusY * 1.3);
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-eyeRadiusX - 2, 0);
      ctx.lineTo(eyeRadiusX + 2, 0);
      ctx.stroke();
    } else {
      // Normal / determined pupil
      ctx.beginPath();
      ctx.ellipse(pupilOffsetX, pupilOffsetY, eyeRadiusX * 0.55, eyeRadiusY * 0.55, 0, 0, Math.PI * 2);
      ctx.fill();

      // Cute white catchlight
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(pupilOffsetX - 4, pupilOffsetY - 6, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(pupilOffsetX + 4, pupilOffsetY + 4, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  };

  drawEye(eyeCenterX - eyeDist, eyeCenterY, false);
  drawEye(eyeCenterX + eyeDist, eyeCenterY, true);

  return canvas;
}
