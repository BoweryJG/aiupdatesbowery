export interface VoiceCommand {
  patterns: string[];
  action: (matches: string[]) => VoiceCommandAction;
  description: string;
}

export interface VoiceCommandAction {
  type: 'search' | 'filter' | 'navigate' | 'open';
  payload: any;
}

export const VOICE_COMMANDS: VoiceCommand[] = [
  // News category commands
  {
    patterns: [
      'show (me)? (the)? latest ai (news|updates)?',
      'ai news',
      'artificial intelligence (news|updates)?'
    ],
    action: () => ({ type: 'filter', payload: { newsType: 'ai' } }),
    description: 'Show latest AI news'
  },
  {
    patterns: [
      'show (me)? (the)? world news',
      'global news',
      'international news'
    ],
    action: () => ({ type: 'filter', payload: { newsType: 'world' } }),
    description: 'Show world news'
  },
  {
    patterns: [
      'show (me)? (the)? business news',
      'market (news|updates)?',
      'financial news'
    ],
    action: () => ({ type: 'filter', payload: { newsType: 'business' } }),
    description: 'Show business news'
  },
  {
    patterns: [
      'show (me)? (the)? new york (city)? news',
      'nyc news',
      'manhattan news'
    ],
    action: () => ({ type: 'filter', payload: { newsType: 'nyc' } }),
    description: 'Show New York City news'
  },
  {
    patterns: [
      'show (me)? (the)? bowery news',
      'lower east side news',
      'les news'
    ],
    action: () => ({ type: 'filter', payload: { newsType: 'nyc', location: 'Bowery' } }),
    description: 'Show Bowery NYC news'
  },
  {
    patterns: [
      'show (me)? (the)? costa rica news',
      'costa rican news',
      'cr news'
    ],
    action: () => ({ type: 'filter', payload: { newsType: 'costa-rica' } }),
    description: 'Show Costa Rica news'
  },
  {
    patterns: [
      'show (me)? (the)? ojochal news',
      'dominical news',
      'south pacific costa rica news'
    ],
    action: () => ({ type: 'filter', payload: { newsType: 'costa-rica', location: 'Ojochal' } }),
    description: 'Show Ojochal/Dominical news'
  },

  // Company-specific commands
  {
    patterns: [
      'show (me)? (the)? (news|updates) (from|about) (.+)',
      '(.+) news'
    ],
    action: (matches) => {
      const company = matches[matches.length - 1];
      return { type: 'filter', payload: { companies: [company] } };
    },
    description: 'Show news from specific company'
  },

  // Time-based commands
  {
    patterns: [
      'show (me)? today\'s (news|headlines)',
      'what\'s new today',
      'latest news'
    ],
    action: () => ({ type: 'filter', payload: { dateRange: 'today' } }),
    description: 'Show today\'s news'
  },
  {
    patterns: [
      'show (me)? this week\'s news',
      'news from this week',
      'weekly news'
    ],
    action: () => ({ type: 'filter', payload: { dateRange: 'week' } }),
    description: 'Show this week\'s news'
  },

  // Importance-based commands
  {
    patterns: [
      'show (me)? (the)? breaking news',
      'important news',
      'critical updates'
    ],
    action: () => ({ type: 'filter', payload: { minImportanceScore: 8 } }),
    description: 'Show breaking/important news'
  },

  // Search commands
  {
    patterns: [
      'search (for)? (.+)',
      'find (news about)? (.+)',
      'look for (.+)'
    ],
    action: (matches) => {
      const query = matches[matches.length - 1];
      return { type: 'search', payload: { searchTerm: query } };
    },
    description: 'Search for specific topics'
  },

  // Navigation commands
  {
    patterns: [
      'open (the)? (first|second|third|fourth|fifth) (article|news|story)',
      'show (me)? (article|news) (number)? (\\d+)'
    ],
    action: (matches) => {
      const numberWords: { [key: string]: number } = {
        'first': 0, 'second': 1, 'third': 2, 'fourth': 3, 'fifth': 4
      };
      let index = 0;
      
      for (const match of matches) {
        if (numberWords[match]) {
          index = numberWords[match];
          break;
        } else if (/^\d+$/.test(match)) {
          index = parseInt(match) - 1;
          break;
        }
      }
      
      return { type: 'open', payload: { index } };
    },
    description: 'Open specific article by position'
  },

  // Clear/reset commands
  {
    patterns: [
      'clear filters',
      'show all news',
      'reset'
    ],
    action: () => ({ type: 'filter', payload: {} }),
    description: 'Clear all filters'
  }
];

export class VoiceCommandProcessor {
  private commands = VOICE_COMMANDS;

  processCommand(transcript: string): VoiceCommandAction | null {
    const normalizedTranscript = transcript.toLowerCase().trim();

    for (const command of this.commands) {
      for (const pattern of command.patterns) {
        const regex = new RegExp(pattern, 'i');
        const matches = normalizedTranscript.match(regex);
        
        if (matches) {
          return command.action(matches.slice(1));
        }
      }
    }

    return null;
  }

  getSuggestions(): string[] {
    return [
      "Show me AI news",
      "Costa Rica news",
      "Breaking news",
      "Search for climate change",
      "Open the first article",
      "This week's business news"
    ];
  }
}

export const voiceCommandProcessor = new VoiceCommandProcessor();