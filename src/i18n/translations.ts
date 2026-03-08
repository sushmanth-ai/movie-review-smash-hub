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
  // Today Views
  todayViews: string;
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
    todayViews: "Today's Views",
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
    todayViews: 'ఈరోజు వ్యూస్',
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
    todayViews: 'आज के व्यूज',
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
    todayViews: 'இன்றைய பார்வைகள்',
  },
};

export default translations;
