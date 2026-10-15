// Crisis and care contacts by region. Free, confidential, 24/7 unless noted.
// Keep this list short and verified; it is shown at the worst possible moment.

export const REGIONS = {
  DE: {
    name: 'Germany',
    emergency: '112',
    crisisLines: [
      { name: 'TelefonSeelsorge', phone: '0800 111 0 111', note: 'Free, anonymous, 24/7' },
      { name: 'TelefonSeelsorge', phone: '0800 111 0 222', note: 'Free, anonymous, 24/7' },
      { name: 'TelefonSeelsorge', phone: '116 123', note: 'Free, anonymous, 24/7' },
    ],
    care: [
      {
        name: 'Medical on-call service and appointment service',
        phone: '116 117',
        note: 'Out-of-hours doctor, and help booking a first psychotherapy consultation (psychotherapeutische Sprechstunde).',
        url: 'https://www.116117.de',
      },
    ],
  },
  AT: {
    name: 'Austria',
    emergency: '112',
    crisisLines: [{ name: 'TelefonSeelsorge', phone: '142', note: 'Free, anonymous, 24/7' }],
    care: [],
  },
  CH: {
    name: 'Switzerland',
    emergency: '112',
    crisisLines: [{ name: 'Die Dargebotene Hand', phone: '143', note: 'Free, anonymous, 24/7' }],
    care: [],
  },
  UK: {
    name: 'United Kingdom',
    emergency: '999',
    crisisLines: [{ name: 'Samaritans', phone: '116 123', note: 'Free, 24/7' }],
    care: [{ name: 'NHS 111', phone: '111', note: 'Urgent medical help; choose the mental health option.', url: 'https://111.nhs.uk' }],
  },
  OTHER: {
    name: 'Another country',
    emergency: null,
    crisisLines: [],
    care: [{ name: 'Find A Helpline', note: 'Free, confidential helplines in over 130 countries.', url: 'https://findahelpline.com' }],
  },
}

export const REGION_CODES = Object.keys(REGIONS)

export function resourcesFor(region) {
  return { region: REGIONS[region] ? region : 'DE', ...(REGIONS[region] ?? REGIONS.DE) }
}
