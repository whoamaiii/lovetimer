// Enhanced moon phase calculations and visual representation
// Provides accurate lunar data for romantic astronomical context

/**
 * Calculate current moon phase with high precision
 * @param {Date} date - Date to calculate moon phase for
 * @returns {Object} Moon phase information
 */
export function calculateMoonPhase(date = new Date()) {
  const currentDate = new Date(date);

  // More accurate moon phase calculation using astronomical formulas
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1; // JavaScript months are 0-based
  const day = currentDate.getDate();

  // Calculate Julian day number
  let julianDay;
  if (month <= 2) {
    const adjustedYear = year - 1;
    const adjustedMonth = month + 12;
    julianDay =
      Math.floor(365.25 * adjustedYear) +
      Math.floor(30.6001 * (adjustedMonth + 1)) +
      day +
      1720995;
  } else {
    julianDay =
      Math.floor(365.25 * year) +
      Math.floor(30.6001 * (month + 1)) +
      day +
      1720995;
  }

  // Moon phase calculation based on astronomical algorithms
  const daysSinceNewMoon = (julianDay - 2451549.5) % 29.53058867;
  const moonAge =
    daysSinceNewMoon < 0 ? daysSinceNewMoon + 29.53058867 : daysSinceNewMoon;

  // Calculate illumination percentage
  const illumination = (1 - Math.cos((moonAge * Math.PI) / 14.765294335)) / 2;

  // Determine phase name
  let phaseName;
  let phaseEmoji;

  if (moonAge < 1.84566) {
    phaseName = 'New Moon';
    phaseEmoji = '🌑';
  } else if (moonAge < 5.53699) {
    phaseName = 'Waxing Crescent';
    phaseEmoji = '🌒';
  } else if (moonAge < 9.22831) {
    phaseName = 'First Quarter';
    phaseEmoji = '🌓';
  } else if (moonAge < 12.91963) {
    phaseName = 'Waxing Gibbous';
    phaseEmoji = '🌔';
  } else if (moonAge < 16.61096) {
    phaseName = 'Full Moon';
    phaseEmoji = '🌕';
  } else if (moonAge < 20.30228) {
    phaseName = 'Waning Gibbous';
    phaseEmoji = '🌖';
  } else if (moonAge < 23.99361) {
    phaseName = 'Last Quarter';
    phaseEmoji = '🌗';
  } else {
    phaseName = 'Waning Crescent';
    phaseEmoji = '🌘';
  }

  return {
    age: moonAge,
    illumination: illumination * 100, // Convert to percentage
    phaseName,
    phaseEmoji,
    isWaxing: moonAge < 14.765294335,
    isRomantic: phaseName === 'Full Moon' || phaseName === 'New Moon'
  };
}

/**
 * Get moon rise and set times for a given date and location
 * @param {Date} date - Date to calculate for
 * @returns {Object} Moon rise and set times
 */
export function getMoonTimes(date, latitude = 59.9139) {
  // Simplified moon rise/set calculation
  // In a production app, you'd use a more sophisticated library like SunCalc

  const moonPhase = calculateMoonPhase(date);

  // Approximate moon rise/set based on phase and location
  const baseRise = 6 + (moonPhase.age / 29.53) * 24; // Hours after midnight
  const baseSet = baseRise + 12.5; // Moon is visible ~12.5 hours

  // Adjust for latitude (simplified)
  const latitudeAdjustment = Math.sin((latitude * Math.PI) / 180) * 2;

  const moonrise = new Date(date);
  moonrise.setHours(
    Math.floor(baseRise + latitudeAdjustment),
    Math.floor((baseRise % 1) * 60)
  );

  const moonset = new Date(date);
  moonset.setHours(
    Math.floor(baseSet + latitudeAdjustment),
    Math.floor((baseSet % 1) * 60)
  );

  return {
    moonrise: moonrise.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    }),
    moonset: moonset.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    }),
    isVisible: true // Simplified - in reality depends on current time
  };
}

/**
 * Generate romantic moon phase message
 * @param {Object} moonPhase - Moon phase data from calculateMoonPhase
 * @returns {string} Romantic message about the current moon phase
 */
export function getMoonPhaseMessage(moonPhase) {
  const messages = {
    'New Moon': [
      'A new beginning, just like our love story',
      'In the darkest sky, our love shines brightest',
      'New moon, new memories to create together'
    ],
    'Waxing Crescent': [
      'Our love grows stronger, like the crescent moon',
      'A sliver of moonlight, a universe of love',
      'Growing together under the waxing moon'
    ],
    'First Quarter': [
      'Half moon, whole heart, infinite love',
      'Balanced like the moon, perfect like our love',
      'Quarter moon lighting our romantic evening'
    ],
    'Waxing Gibbous': [
      'Almost full, just like my heart with you',
      'Growing brighter, just like our future',
      'The moon swells with the same joy I feel'
    ],
    'Full Moon': [
      'Under the full moon, our love is complete',
      'The moon is full, and so is my heart',
      'Moonlight dancing on your beautiful face',
      'Full moon, full hearts, forever together'
    ],
    'Waning Gibbous': [
      'Even as the moon wanes, our love remains full',
      'Gentle moonlight for gentle moments together',
      'The moon may fade, but our love never will'
    ],
    'Last Quarter': [
      'In every phase, our love finds its way',
      'Quarter moon, complete love story',
      'Moonlight memories that last forever'
    ],
    'Waning Crescent': [
      'A whisper of moonlight, a lifetime of love',
      'Even the smallest moon lights up our love',
      'Crescent moon, crescendo of emotions'
    ]
  };

  const phaseMessages = messages[moonPhase.phaseName] || [
    'Under any moon, our love shines eternal'
  ];

  return phaseMessages[Math.floor(Math.random() * phaseMessages.length)];
}

/**
 * Calculate next romantic moon event (full or new moon)
 * @param {Date} fromDate - Starting date
 * @returns {Object} Next romantic moon event details
 */
export function getNextRomanticMoon(fromDate = new Date()) {
  const currentPhase = calculateMoonPhase(fromDate);
  const currentAge = currentPhase.age;

  let daysToNext;
  let nextType;

  // Calculate days to next new moon or full moon
  if (currentAge < 14.765) {
    // Before full moon
    daysToNext = 14.765 - currentAge;
    nextType = 'Full Moon';
  } else {
    // Before new moon
    daysToNext = 29.531 - currentAge;
    nextType = 'New Moon';
  }

  const nextDate = new Date(fromDate);
  nextDate.setDate(nextDate.getDate() + Math.ceil(daysToNext));

  return {
    type: nextType,
    date: nextDate,
    daysAway: Math.ceil(daysToNext),
    emoji: nextType === 'Full Moon' ? '🌕' : '🌑',
    message:
      nextType === 'Full Moon'
        ? 'Perfect for a romantic evening under the stars'
        : 'A mystical new beginning awaits you both'
  };
}
