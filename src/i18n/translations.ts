export type Language = 'en' | 'te' | 'hi' | 'ta';

export const languageNames: Record<Language, string> = {
  en: 'English',
  te: 'తెలుగు',
  hi: 'हिन्दी',
  ta: 'தமிழ்',
};

export const languageFlags: Record<Language, string> = {
  en: '🇬🇧',
  te: '🎬',
  hi: '🇮🇳',
  ta: '🎭',
};

type TranslationKeys = {
  // Header
  searchPlaceholder: string;
  // Sections
  newReviews: string;
  oldReviews: string;
  trendingThisWeek: string;
  contactUs: string;
  // Buttons
  seeMore: string;
  seeLess: string;
  seeMoreNew: string;
  seeMoreOld: string;
  readMore: string;
  views: string;
  // Review Detail
  review: string;
  firstHalf: string;
  secondHalf: string;
  positives: string;
  negatives: string;
  overall: string;
  rating: string;
  like: string;
  liked: string;
  comment: string;
  share: string;
  bookTicket: string;
  bookTickets: string;
  choosePlatform: string;
  cancel: string;
  watchTrailer: string;
  backToPoster: string;
  reviewVinandi: string;
  stop: string;
  loading: string;
  // Share
  sharedSuccess: string;
  sharedSuccessDesc: string;
  linkCopied: string;
  linkCopiedDesc: string;
  shareFailed: string;
  shareFailedDesc: string;
  // Contact
  emailSupport: string;
  whatsappChat: string;
  chatWithUs: string;
  // Footer
  phone: string;
  email: string;
  whatsapp: string;
  allRightsReserved: string;
  // Notification
  notSupported: string;
  voiceNotSupported: string;
  notificationsBlocked: string;
  notificationsBlockedDesc: string;
  notificationsActive: string;
  notificationsActiveDesc: string;
  notificationsEnabled: string;
  notificationsEnabledDesc: string;
  notificationsFailed: string;
  notificationsFailedDesc: string;
  enableNotifications: string;
  // Today Views
  todayViews: string;
  live: string;
  // Comments
  addComment: string;
  reply: string;
  replyTo: string;
  // User Rating
  audienceRating: string;
  usersRated: string;
  userRated: string;
  rateThisMovie: string;
  youRated: string;
  ratingSaved: string;
  ratingSavedDesc: string;
  ratingUpdated: string;
  thanksForRating: string;
  ratingSavedLocally: string;
  ratingSavedLocallyDesc: string;
  // Admin / Critic Rating
  criticRating: string;
  smRating: string;
  story: string;
  acting: string;
  music: string;
  direction: string;
  cinematography: string;
  rewatchValue: string;
  // Rating Comparison
  ratingComparison: string;
  critic: string;
  audience: string;
  votes: string;
  beFirstToRate: string;
  criticsAndAudienceAgree: string;
  audienceLoveMore: string;
  criticsCraftMore: string;
  // Trending
  trendingReviews: string;
  basedOnEngagement: string;
  points: string;
  // Polls
  pollsAndVotes: string;
  totalVotes: string;
  tapToVote: string;
  // Stories
  quickStories: string;
};

const translations: Record<Language, TranslationKeys> = {
  en: {
    searchPlaceholder: '🔍 Search for movie Reviews...',
    newReviews: '🎬 New Reviews',
    oldReviews: '📽️ Old Reviews',
    trendingThisWeek: '🔥 Trending This Week',
    contactUs: '📞 Contact Us',
    seeMore: 'See More',
    seeLess: 'See Less',
    seeMoreNew: 'See More New Reviews',
    seeMoreOld: 'See More Old Reviews',
    readMore: 'Read more',
    views: 'views',
    review: 'REVIEW',
    firstHalf: 'First Half:',
    secondHalf: 'Second Half:',
    positives: 'Positives:',
    negatives: 'Negatives:',
    overall: 'Overall:',
    rating: 'Rating:',
    like: 'Like',
    liked: 'Liked',
    comment: 'Comment',
    share: 'Share',
    bookTicket: '🎟️ Book Your Ticket',
    bookTickets: '🎟️ Book Your Tickets',
    choosePlatform: 'Choose your preferred platform:',
    cancel: '✖️ Cancel',
    watchTrailer: '▶️ Watch Trailer',
    backToPoster: '🖼️ Back to Poster',
    reviewVinandi: '🔊 Listen Review',
    stop: '🔇 Stop',
    loading: 'Loading...',
    sharedSuccess: 'Shared Successfully!',
    sharedSuccessDesc: 'Your friends can see this review now!',
    linkCopied: 'Link Copied!',
    linkCopiedDesc: 'You can paste and share it anywhere.',
    shareFailed: 'Share Failed',
    shareFailedDesc: 'Something went wrong. Try again!',
    emailSupport: 'Email Support',
    whatsappChat: 'WhatsApp Chat',
    chatWithUs: 'Chat with us instantly',
    phone: 'Phone',
    email: 'Email',
    whatsapp: 'WhatsApp',
    allRightsReserved: '© 2024 Movie Review Hub. All rights reserved.',
    notSupported: 'Not Supported',
    voiceNotSupported: 'Voice playback is not supported on this device.',
    notificationsBlocked: '⚠️ Notifications Blocked',
    notificationsBlockedDesc: 'Please enable notifications in your browser settings.',
    notificationsActive: '🔔 Notifications Active',
    notificationsActiveDesc: "You're receiving push notifications!",
    notificationsEnabled: '🔔 Notifications Enabled!',
    notificationsEnabledDesc: "You'll get notified about new reviews!",
    notificationsFailed: '❌ Failed',
    notificationsFailedDesc: 'Could not enable notifications.',
    enableNotifications: 'Enable Notifications',
    todayViews: "Today's Views",
    live: 'LIVE',
    addComment: 'Add a comment...',
    reply: 'Reply',
    replyTo: 'Reply to',
    audienceRating: '👥 Audience Rating',
    usersRated: 'users rated',
    userRated: 'user rated',
    rateThisMovie: '⭐ Rate This Movie',
    youRated: 'You rated:',
    ratingSaved: 'Rating saved locally!',
    ratingSavedDesc: 'You rated this movie',
    ratingUpdated: 'Rating updated!',
    thanksForRating: 'Thanks for rating!',
    ratingSavedLocally: 'Rating saved locally',
    ratingSavedLocallyDesc: 'Rating saved on your device',
    criticRating: '🎬 CRITIC RATING',
    smRating: 'SM RATING:',
    story: 'Story',
    acting: 'Acting',
    music: 'Music',
    direction: 'Direction',
    cinematography: 'Cinematography',
    rewatchValue: 'Rewatch Value',
    ratingComparison: 'Rating Comparison',
    critic: 'CRITIC',
    audience: 'AUDIENCE',
    votes: 'votes',
    beFirstToRate: 'Be the first to rate this movie!',
    criticsAndAudienceAgree: 'Critics and audience agree on this one!',
    audienceLoveMore: 'Audience loved this movie more than critics.',
    criticsCraftMore: 'Critics appreciated the craft more than viewers.',
    trendingReviews: 'Trending Reviews',
    basedOnEngagement: 'Based on views, likes & engagement',
    points: 'points',
    pollsAndVotes: '📊 Polls & Votes',
    totalVotes: 'Total votes:',
    tapToVote: 'Tap to vote!',
    quickStories: '📖 Quick Stories',
  },
  te: {
    searchPlaceholder: '🔍 సినిమా రివ్యూలు వెతకండి...',
    newReviews: '🎬 కొత్త రివ్యూలు',
    oldReviews: '📽️ పాత రివ్యూలు',
    trendingThisWeek: '🔥 ఈ వారం ట్రెండింగ్',
    contactUs: '📞 మమ్మల్ని సంప్రదించండి',
    seeMore: 'మరిన్ని చూడండి',
    seeLess: 'తక్కువ చూడండి',
    seeMoreNew: 'మరిన్ని కొత్త రివ్యూలు',
    seeMoreOld: 'మరిన్ని పాత రివ్యూలు',
    readMore: 'ఇంకా చదవండి',
    views: 'వ్యూస్',
    review: 'రివ్యూ',
    firstHalf: 'మొదటి సగం:',
    secondHalf: 'రెండవ సగం:',
    positives: 'సానుకూలాలు:',
    negatives: 'ప్రతికూలాలు:',
    overall: 'మొత్తం మీద:',
    rating: 'రేటింగ్:',
    like: 'లైక్',
    liked: 'లైక్ చేసారు',
    comment: 'కామెంట్',
    share: 'షేర్',
    bookTicket: '🎟️ టిక్కెట్ బుక్ చేయండి',
    bookTickets: '🎟️ టిక్కెట్లు బుక్ చేయండి',
    choosePlatform: 'మీకు ఇష్టమైన ప్లాట్‌ఫామ్ ఎంచుకోండి:',
    cancel: '✖️ రద్దు',
    watchTrailer: '▶️ ట్రైలర్ చూడండి',
    backToPoster: '🖼️ పోస్టర్‌కి తిరిగి',
    reviewVinandi: '🔊 రివ్యూ వినండి',
    stop: '🔇 ఆపండి',
    loading: 'లోడ్ అవుతోంది...',
    sharedSuccess: 'విజయవంతంగా షేర్ చేయబడింది!',
    sharedSuccessDesc: 'మీ ఫ్రెండ్స్ ఇప్పుడు ఈ రివ్యూ చూడవచ్చు!',
    linkCopied: 'లింక్ కాపీ అయింది!',
    linkCopiedDesc: 'దీన్ని ఎక్కడైనా పేస్ట్ చేసి షేర్ చేయండి.',
    shareFailed: 'షేర్ విఫలమైంది',
    shareFailedDesc: 'ఏదో తప్పు జరిగింది. మళ్ళీ ప్రయత్నించండి!',
    emailSupport: 'ఈమెయిల్ సపోర్ట్',
    whatsappChat: 'వాట్సాప్ చాట్',
    chatWithUs: 'మాతో చాట్ చేయండి',
    phone: 'ఫోన్',
    email: 'ఈమెయిల్',
    whatsapp: 'వాట్సాప్',
    allRightsReserved: '© 2024 మూవీ రివ్యూ హబ్. అన్ని హక్కులు రిజర్వ్ చేయబడ్డాయి.',
    notSupported: 'సపోర్ట్ లేదు',
    voiceNotSupported: 'ఈ పరికరంలో వాయిస్ ప్లేబ్యాక్ అందుబాటులో లేదు.',
    notificationsBlocked: '⚠️ నోటిఫికేషన్లు బ్లాక్ చేయబడ్డాయి',
    notificationsBlockedDesc: 'దయచేసి మీ బ్రౌజర్ సెట్టింగ్స్‌లో నోటిఫికేషన్లను ఎనేబుల్ చేయండి.',
    notificationsActive: '🔔 నోటిఫికేషన్లు యాక్టివ్',
    notificationsActiveDesc: 'మీరు పుష్ నోటిఫికేషన్లు అందుకుంటున్నారు!',
    notificationsEnabled: '🔔 నోటిఫికేషన్లు ఎనేబుల్ అయ్యాయి!',
    notificationsEnabledDesc: 'కొత్త రివ్యూల గురించి మీకు తెలియజేయబడుతుంది!',
    notificationsFailed: '❌ విఫలమైంది',
    notificationsFailedDesc: 'నోటిఫికేషన్లను ఎనేబుల్ చేయలేకపోయాము.',
    enableNotifications: 'నోటిఫికేషన్లు ఎనేబుల్ చేయండి',
    todayViews: 'ఈరోజు వ్యూస్',
    live: 'లైవ్',
    addComment: 'కామెంట్ రాయండి...',
    reply: 'రిప్లై',
    replyTo: 'రిప్లై ఇవ్వండి',
    audienceRating: '👥 ప్రేక్షకుల రేటింగ్',
    usersRated: 'మంది రేట్ చేసారు',
    userRated: 'యూజర్ రేట్ చేసారు',
    rateThisMovie: '⭐ ఈ సినిమాకి రేట్ చేయండి',
    youRated: 'మీ రేటింగ్:',
    ratingSaved: 'రేటింగ్ సేవ్ అయింది!',
    ratingSavedDesc: 'మీరు ఈ సినిమాకి రేట్ చేసారు',
    ratingUpdated: 'రేటింగ్ అప్‌డేట్ అయింది!',
    thanksForRating: 'రేట్ చేసినందుకు ధన్యవాదాలు!',
    ratingSavedLocally: 'రేటింగ్ లోకల్‌గా సేవ్ అయింది',
    ratingSavedLocallyDesc: 'రేటింగ్ మీ డివైస్‌లో సేవ్ అయింది',
    criticRating: '🎬 క్రిటిక్ రేటింగ్',
    smRating: 'SM రేటింగ్:',
    story: 'కథ',
    acting: 'నటన',
    music: 'సంగీతం',
    direction: 'దర్శకత్వం',
    cinematography: 'సినిమాటోగ్రఫీ',
    rewatchValue: 'మళ్ళీ చూడదగినది',
    ratingComparison: 'రేటింగ్ పోలిక',
    critic: 'క్రిటిక్',
    audience: 'ప్రేక్షకులు',
    votes: 'ఓట్లు',
    beFirstToRate: 'ఈ సినిమాకి మొదట రేట్ చేయండి!',
    criticsAndAudienceAgree: 'క్రిటిక్స్ మరియు ప్రేక్షకులు ఏకీభవిస్తున్నారు!',
    audienceLoveMore: 'ప్రేక్షకులు క్రిటిక్స్ కంటే ఎక్కువగా ఇష్టపడ్డారు.',
    criticsCraftMore: 'క్రిటిక్స్ దర్శకులను ప్రేక్షకుల కంటే ఎక్కువగా మెచ్చుకున్నారు.',
    trendingReviews: 'ట్రెండింగ్ రివ్యూలు',
    basedOnEngagement: 'వ్యూస్, లైక్స్ & ఎంగేజ్‌మెంట్ ఆధారంగా',
    points: 'పాయింట్లు',
    pollsAndVotes: '📊 పోల్స్ & ఓట్లు',
    totalVotes: 'మొత్తం ఓట్లు:',
    tapToVote: 'ఓట్ చేయడానికి ట్యాప్ చేయండి!',
    quickStories: '📖 క్విక్ స్టోరీస్',
  },
  hi: {
    searchPlaceholder: '🔍 मूवी रिव्यू खोजें...',
    newReviews: '🎬 नई समीक्षाएं',
    oldReviews: '📽️ पुरानी समीक्षाएं',
    trendingThisWeek: '🔥 इस हफ्ते ट्रेंडिंग',
    contactUs: '📞 हमसे संपर्क करें',
    seeMore: 'और देखें',
    seeLess: 'कम देखें',
    seeMoreNew: 'और नई समीक्षाएं देखें',
    seeMoreOld: 'और पुरानी समीक्षाएं देखें',
    readMore: 'और पढ़ें',
    views: 'व्यूज',
    review: 'समीक्षा',
    firstHalf: 'पहला हाफ:',
    secondHalf: 'दूसरा हाफ:',
    positives: 'अच्छी बातें:',
    negatives: 'कमियां:',
    overall: 'कुल मिलाकर:',
    rating: 'रेटिंग:',
    like: 'लाइक',
    liked: 'लाइक किया',
    comment: 'कमेंट',
    share: 'शेयर',
    bookTicket: '🎟️ टिकट बुक करें',
    bookTickets: '🎟️ टिकट बुक करें',
    choosePlatform: 'अपना पसंदीदा प्लेटफॉर्म चुनें:',
    cancel: '✖️ रद्द करें',
    watchTrailer: '▶️ ट्रेलर देखें',
    backToPoster: '🖼️ पोस्टर पर वापस',
    reviewVinandi: '🔊 रिव्यू सुनें',
    stop: '🔇 रोकें',
    loading: 'लोड हो रहा है...',
    sharedSuccess: 'सफलतापूर्वक शेयर किया!',
    sharedSuccessDesc: 'आपके दोस्त अब यह रिव्यू देख सकते हैं!',
    linkCopied: 'लिंक कॉपी हो गया!',
    linkCopiedDesc: 'इसे कहीं भी पेस्ट करके शेयर करें।',
    shareFailed: 'शेयर विफल',
    shareFailedDesc: 'कुछ गलत हो गया। फिर से कोशिश करें!',
    emailSupport: 'ईमेल सपोर्ट',
    whatsappChat: 'व्हाट्सएप चैट',
    chatWithUs: 'हमसे चैट करें',
    phone: 'फ़ोन',
    email: 'ईमेल',
    whatsapp: 'व्हाट्सएप',
    allRightsReserved: '© 2024 मूवी रिव्यू हब। सर्वाधिकार सुरक्षित।',
    notSupported: 'सपोर्ट नहीं है',
    voiceNotSupported: 'इस डिवाइस पर वॉइस प्लेबैक उपलब्ध नहीं है।',
    notificationsBlocked: '⚠️ नोटिफिकेशन ब्लॉक हैं',
    notificationsBlockedDesc: 'कृपया अपने ब्राउज़र सेटिंग्स में नोटिफिकेशन सक्षम करें।',
    notificationsActive: '🔔 नोटिफिकेशन सक्रिय',
    notificationsActiveDesc: 'आप पुश नोटिफिकेशन प्राप्त कर रहे हैं!',
    notificationsEnabled: '🔔 नोटिफिकेशन सक्षम!',
    notificationsEnabledDesc: 'नई समीक्षाओं की सूचना मिलेगी!',
    notificationsFailed: '❌ विफल',
    notificationsFailedDesc: 'नोटिफिकेशन सक्षम नहीं हो सके।',
    enableNotifications: 'नोटिफिकेशन सक्षम करें',
    todayViews: 'आज के व्यूज',
    live: 'लाइव',
    addComment: 'कमेंट लिखें...',
    reply: 'जवाब',
    replyTo: 'जवाब दें',
    audienceRating: '👥 दर्शक रेटिंग',
    usersRated: 'यूजर्स ने रेट किया',
    userRated: 'यूजर ने रेट किया',
    rateThisMovie: '⭐ इस मूवी को रेट करें',
    youRated: 'आपकी रेटिंग:',
    ratingSaved: 'रेटिंग सेव हुई!',
    ratingSavedDesc: 'आपने इस मूवी को रेट किया',
    ratingUpdated: 'रेटिंग अपडेट हुई!',
    thanksForRating: 'रेट करने के लिए धन्यवाद!',
    ratingSavedLocally: 'रेटिंग लोकल में सेव हुई',
    ratingSavedLocallyDesc: 'रेटिंग आपके डिवाइस पर सेव हुई',
    criticRating: '🎬 क्रिटिक रेटिंग',
    smRating: 'SM रेटिंग:',
    story: 'कहानी',
    acting: 'अभिनय',
    music: 'संगीत',
    direction: 'निर्देशन',
    cinematography: 'सिनेमैटोग्राफी',
    rewatchValue: 'दोबारा देखने योग्य',
    ratingComparison: 'रेटिंग तुलना',
    critic: 'क्रिटिक',
    audience: 'दर्शक',
    votes: 'वोट',
    beFirstToRate: 'इस मूवी को पहले रेट करें!',
    criticsAndAudienceAgree: 'क्रिटिक्स और दर्शक सहमत हैं!',
    audienceLoveMore: 'दर्शकों ने क्रिटिक्स से ज्यादा पसंद किया।',
    criticsCraftMore: 'क्रिटिक्स ने दर्शकों से ज्यादा सराहा।',
    trendingReviews: 'ट्रेंडिंग रिव्यू',
    basedOnEngagement: 'व्यूज, लाइक्स और एंगेजमेंट के आधार पर',
    points: 'पॉइंट्स',
    pollsAndVotes: '📊 पोल्स और वोट',
    totalVotes: 'कुल वोट:',
    tapToVote: 'वोट करने के लिए टैप करें!',
    quickStories: '📖 क्विक स्टोरीज',
  },
  ta: {
    searchPlaceholder: '🔍 திரைப்பட விமர்சனங்களைத் தேடுங்கள்...',
    newReviews: '🎬 புதிய விமர்சனங்கள்',
    oldReviews: '📽️ பழைய விமர்சனங்கள்',
    trendingThisWeek: '🔥 இந்த வாரம் டிரெண்டிங்',
    contactUs: '📞 எங்களைத் தொடர்பு கொள்ளுங்கள்',
    seeMore: 'மேலும் பார்க்க',
    seeLess: 'குறைவாக பார்க்க',
    seeMoreNew: 'மேலும் புதிய விமர்சனங்கள்',
    seeMoreOld: 'மேலும் பழைய விமர்சனங்கள்',
    readMore: 'மேலும் படிக்க',
    views: 'பார்வைகள்',
    review: 'விமர்சனம்',
    firstHalf: 'முதல் பாதி:',
    secondHalf: 'இரண்டாம் பாதி:',
    positives: 'நல்ல விஷயங்கள்:',
    negatives: 'குறைகள்:',
    overall: 'ஒட்டுமொத்தம்:',
    rating: 'மதிப்பீடு:',
    like: 'லைக்',
    liked: 'லைக் செய்தீர்கள்',
    comment: 'கருத்து',
    share: 'பகிர்',
    bookTicket: '🎟️ டிக்கெட் புக் செய்யுங்கள்',
    bookTickets: '🎟️ டிக்கெட்டுகளை புக் செய்யுங்கள்',
    choosePlatform: 'உங்கள் விருப்பமான தளத்தைத் தேர்வு செய்யுங்கள்:',
    cancel: '✖️ ரத்து',
    watchTrailer: '▶️ ட்ரெய்லர் பாருங்கள்',
    backToPoster: '🖼️ போஸ்டருக்குத் திரும்பு',
    reviewVinandi: '🔊 விமர்சனத்தைக் கேளுங்கள்',
    stop: '🔇 நிறுத்து',
    loading: 'ஏற்றுகிறது...',
    sharedSuccess: 'வெற்றிகரமாக பகிரப்பட்டது!',
    sharedSuccessDesc: 'உங்கள் நண்பர்கள் இப்போது இந்த விமர்சனத்தைப் பார்க்கலாம்!',
    linkCopied: 'லிங்க் காப்பி ஆனது!',
    linkCopiedDesc: 'எங்கு வேண்டுமானாலும் பேஸ்ட் செய்து பகிருங்கள்.',
    shareFailed: 'பகிர்வு தோல்வி',
    shareFailedDesc: 'ஏதோ தவறு நடந்தது. மீண்டும் முயற்சிக்கவும்!',
    emailSupport: 'ஈமெயில் சப்போர்ட்',
    whatsappChat: 'வாட்ஸ்அப் சாட்',
    chatWithUs: 'எங்களுடன் சாட் செய்யுங்கள்',
    phone: 'போன்',
    email: 'ஈமெயில்',
    whatsapp: 'வாட்ஸ்அப்',
    allRightsReserved: '© 2024 மூவி ரிவ்யூ ஹப். அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.',
    notSupported: 'ஆதரவு இல்லை',
    voiceNotSupported: 'இந்த சாதனத்தில் குரல் பிளேபேக் கிடைக்கவில்லை.',
    notificationsBlocked: '⚠️ அறிவிப்புகள் தடுக்கப்பட்டுள்ளன',
    notificationsBlockedDesc: 'உங்கள் உலாவி அமைப்புகளில் அறிவிப்புகளை இயக்கவும்.',
    notificationsActive: '🔔 அறிவிப்புகள் செயலில்',
    notificationsActiveDesc: 'நீங்கள் புஷ் அறிவிப்புகளைப் பெறுகிறீர்கள்!',
    notificationsEnabled: '🔔 அறிவிப்புகள் இயக்கப்பட்டன!',
    notificationsEnabledDesc: 'புதிய விமர்சனங்கள் பற்றி தெரிவிக்கப்படும்!',
    notificationsFailed: '❌ தோல்வி',
    notificationsFailedDesc: 'அறிவிப்புகளை இயக்க முடியவில்லை.',
    enableNotifications: 'அறிவிப்புகளை இயக்கு',
    todayViews: 'இன்றைய பார்வைகள்',
    live: 'நேரலை',
    addComment: 'கருத்து எழுதுங்கள்...',
    reply: 'பதில்',
    replyTo: 'பதில் அளிக்கவும்',
    audienceRating: '👥 பார்வையாளர் மதிப்பீடு',
    usersRated: 'பயனர்கள் மதிப்பிட்டனர்',
    userRated: 'பயனர் மதிப்பிட்டார்',
    rateThisMovie: '⭐ இந்த படத்தை மதிப்பிடுங்கள்',
    youRated: 'உங்கள் மதிப்பீடு:',
    ratingSaved: 'மதிப்பீடு சேமிக்கப்பட்டது!',
    ratingSavedDesc: 'நீங்கள் இந்த படத்தை மதிப்பிட்டீர்கள்',
    ratingUpdated: 'மதிப்பீடு புதுப்பிக்கப்பட்டது!',
    thanksForRating: 'மதிப்பிட்டதற்கு நன்றி!',
    ratingSavedLocally: 'மதிப்பீடு உள்ளூரில் சேமிக்கப்பட்டது',
    ratingSavedLocallyDesc: 'மதிப்பீடு உங்கள் சாதனத்தில் சேமிக்கப்பட்டது',
    criticRating: '🎬 விமர்சகர் மதிப்பீடு',
    smRating: 'SM மதிப்பீடு:',
    story: 'கதை',
    acting: 'நடிப்பு',
    music: 'இசை',
    direction: 'இயக்கம்',
    cinematography: 'ஒளிப்பதிவு',
    rewatchValue: 'மீண்டும் பார்க்கத்தக்கது',
    ratingComparison: 'மதிப்பீடு ஒப்பீடு',
    critic: 'விமர்சகர்',
    audience: 'பார்வையாளர்',
    votes: 'வாக்குகள்',
    beFirstToRate: 'இந்த படத்தை முதலில் மதிப்பிடுங்கள்!',
    criticsAndAudienceAgree: 'விமர்சகர்களும் பார்வையாளர்களும் ஒத்துக்கொள்கிறார்கள்!',
    audienceLoveMore: 'பார்வையாளர்கள் விமர்சகர்களை விட அதிகம் விரும்பினர்.',
    criticsCraftMore: 'விமர்சகர்கள் பார்வையாளர்களை விட அதிகம் பாராட்டினர்.',
    trendingReviews: 'டிரெண்டிங் விமர்சனங்கள்',
    basedOnEngagement: 'பார்வைகள், லைக்குகள் & ஈடுபாடு அடிப்படையில்',
    points: 'புள்ளிகள்',
    pollsAndVotes: '📊 கருத்துக்கணிப்பு & வாக்குகள்',
    totalVotes: 'மொத்த வாக்குகள்:',
    tapToVote: 'வாக்களிக்க தட்டுங்கள்!',
    quickStories: '📖 விரைவு கதைகள்',
  },
};

export default translations;
