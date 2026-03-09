import { Language } from "@/i18n/translations";

export interface MovieReview {
  id: string;
  title: string;
  image: string;
  review: string;
  firstHalf: string;
  secondHalf: string;
  positives: string;
  negatives: string;
  overall: string;
  rating: string;
  likes: number;
  comments: Comment[];
  views?: number;
  translations?: {
    [lang in Language]?: {
      title?: string;
      review?: string;
      firstHalf?: string;
      secondHalf?: string;
      positives?: string;
      negatives?: string;
      overall?: string;
    }
  };
}

export interface Comment {
  id: string;
  text: string;
  timestamp: Date;
  author: string;
  replies?: Comment[];
}

export const movieReviewsData: Omit<MovieReview, 'likes' | 'comments'>[] = [
  // ...existing reviews
  
{
    id: 'coolie',
    title: 'COOLIE',
    image: 'https://www.ntvenglish.com/wp-content/uploads/2025/08/Coolie-sales-800x500.jpg',
    review: 'inka Movie ela vundho detail review lo chudham',
    firstHalf: 'Starting story setup ni establish chestadu..aaa Tarvata vachhe characters...Rajini entry..Monica song Main Innervel scene high high ante... Anirudh okka Range loo kottedu BGM..Okka okka scene lepedu..',
    secondHalf: 'Second half chaala baaga start avuthadhi..Characters Shifts baaga Raasukunnaru... Madhyalo konchem Track Tappidhi..aa tarvata Pre climax ki set aidhi..Climax High istadhi... Anirudh BGM tho Movie ni Next Level ki  tisukuveledu...',
    positives: 'Aniruddh BGM💥💥,Loki Direction,Rajini Swag 😎...',
    negatives: 'Second Half middle Portion loo konchem Baaga Excute chesi vunte bagundedhI..',
    overall: "except some portions nakku aite nachindhi guys",
    rating: '3.8 STARS',
    translations: {
      en: {
        title: 'COOLIE (2025)',
        review: 'Let\'s check out the details of the movie in this review.',
        firstHalf: 'Starts by establishing the story setup... followed by the characters... Rajini\'s entry... Monica\'s song... The main interval scene is a major high... Anirudh killed it with the BGM... Every single scene was elevated.',
        secondHalf: 'The second half starts really well... Character shifts are written well... The track gets a bit lost in the middle... but then it sets up for the pre-climax... Climax gives a high... Anirudh\'s BGM takes the movie to the next level.',
        positives: 'Anirudh\'s BGM, Lokesh\'s Direction, Rajini\'s Swag...',
        negatives: 'The middle portion of the second half could have been executed better.',
        overall: 'Except for some portions, I personally liked it, guys.'
      },
      te: {
        title: 'కూలీ (COOLIE)',
        review: 'ఇంకా మూవీ ఎలా ఉందో డీటెయిల్ రివ్యూ లో చూద్దాం.',
        firstHalf: 'స్టార్టింగ్ స్టోరీ సెటప్ ని ఎస్టాబ్లిష్ చేస్తాడు.. ఆ తర్వాత వచ్చే క్యారెక్టర్స్... రజినీ ఎంట్రీ.. మోనికా సాంగ్.. మెయిన్ ఇంటర్వెల్ సీన్ హై హై అంతే... అనిరుధ్ ఒక రేంజ్ లో కొట్టాడు BGM.. ఒక్కొక్క సీన్ లేపాడు..',
        secondHalf: 'సెకండ్ హాఫ్ చాలా బాగా స్టార్ట్ అవుతుంది.. క్యారెక్టర్స్ షిఫ్ట్స్ బాగా రాసుకున్నారు... మధ్యలో కొంచెం ట్రాక్ తప్పింది.. ఆ తర్వాత ప్రీ క్లైమాక్స్ కి సెట్ అవుతుంది.. క్లైమాక్స్ హై ఇస్తుంది... అనిరుధ్ BGM తో మూవీని నెక్స్ట్ లెవల్ కి తీసుకెళ్లాడు...',
        positives: 'అనిరుధ్ BGM💥💥, లోకేష్ డైరెక్షన్, రజినీ స్వాగ్ 😎...',
        negatives: 'సెకండ్ హాఫ్ మిడిల్ పోర్షన్ లో కొంచెం బాగా ఎగ్జిక్యూట్ చేసి ఉంటే బాగుండేది..',
        overall: "కొన్ని పోర్షన్స్ తప్ప నాకు అయితే నచ్చింది గాయ్స్."
      },
      hi: {
        title: 'कुली (COOLIE)',
        review: 'आइए इस समीक्षा में फिल्म के विवरण देखें।',
        firstHalf: 'शुरुआत कहानी के सेटअप को स्थापित करने से होती है... उसके बाद पात्र... रजनी की एंट्री... मोनिका का गाना... मुख्य इंटरवल सीन बहुत जबरदस्त है... अनिरुद्ध ने बीजीएम के साथ कमाल कर दिया... हर एक सीन को ऊपर उठाया गया।',
        secondHalf: 'दूसरा हाफ बहुत अच्छी तरह से शुरू होता है... पात्रों के बदलाव अच्छी तरह लिखे गए हैं... बीच में ट्रैक थोड़ा भटक जाता है... लेकिन फिर यह प्री-क्लाइमेक्स के लिए सेट हो जाता है... क्लाइमेक्स हाई देता है... अनिरुद्ध का बीजीएम फिल्म को अगले स्तर पर ले जाता है।',
        positives: 'अनिरुद्ध का बीजीएम, लोकेश का निर्देशन, रजनी का स्वैग...',
        negatives: 'दूसरे हाफ के मध्य भाग को और बेहतर तरीके से निष्पादित किया जा सकता था।',
        overall: 'कुछ हिस्सों को छोड़कर, मुझे व्यक्तिगत रूप से यह पसंद आया, दोस्तों।'
      },
      ta: {
        title: 'கூலி (COOLIE)',
        review: 'இந்த விமர்சனத்தில் படத்தின் விவரங்களை விரிவாகப் பார்ப்போம்.',
        firstHalf: 'கதை அமைப்பை நிறுவுவதில் தொடங்குகிறது... அதைத் தொடர்ந்து கதாபாத்திரங்கள்... ரஜினியின் என்ட்ரி... மோனிகா பாடல்... பிரதான இடைவேளை காட்சி ஒரு பெரிய ஹைப்... அனிருத் பிஜிஎம்மில் மிரட்டியுள்ளார்... ஒவ்வொரு காட்சியும் சிறப்பாக இருந்தது.',
        secondHalf: 'இரண்டாம் பாதி நன்றாகத் தொடங்குகிறது... கதாபாத்திர மாற்றங்கள் சிறப்பாக எழுதப்பட்டுள்ளன... இடையில் கதை சற்றே தடுமாறுகிறது... ஆனால் பின்னர் அது ப்ரீ-கிளைமாக்ஸிற்கு தயாராகிறது... கிளைமாக்ஸ் சிறப்பாக உள்ளது... அனிருத்தின் பிஜிஎம் படத்தை அடுத்த கட்டத்திற்கு கொண்டு செல்கிறது.',
        positives: 'அனிருத்தின் பிஜிஎம், லோகேஷ் இயக்கம், ரஜினியின் ஸ்வாக்...',
        negatives: 'இரண்டாம் பாதியின் இடைப்பகுதியை இன்னும் சிறப்பாக செய்திருக்கலாம்.',
        overall: 'சில பகுதிகளைத் தவிர, எனக்கு தனிப்பட்ட முறையில் இது பிடித்திருந்தது.'
      }
    }
  },
  {
    id: 'mrithyunjay',
    title: 'MRITHYUNJAY',
    image: 'https://images.sumantv.com/sumantv/2024/09/Mrithyunjay-Review.jpg',
    review: 'Movie Ela Vundho Detail Review loo Chudham',
    firstHalf: 'Coming to the First Half... Director Took a 20 min of time to Establish a story Plot...Then Movie Proceedings Going well....But Intervel Sequence have to Be Better...',
    secondHalf: 'Coming to Second Half... It was Good.. With Well Written Scenes and drama handling... Overall it was a decent emotional journey.',
    positives: 'Hero performance, emotion, story concept.',
    negatives: 'First half slow pace, some illogical scenes.',
    overall: "A good attempt for a thriller.",
    rating: '3.5 STARS',
    translations: {
      en: {
        title: 'MRITHYUNJAY',
        review: 'Let\'s check the detailed review of the movie.',
        firstHalf: 'Coming to the First Half... The director took about 20 minutes to establish the story plot... Then the proceedings go well... But the interval sequence could have been better.',
        secondHalf: 'Coming to the Second Half... It was good... with well-written scenes and drama handling... Overall a decent emotional journey.',
        positives: 'Hero performance, Emotional depth, Story concept.',
        negatives: 'Slow pace in the first half, some illogical scenes.',
        overall: 'A good attempt for a thriller.'
      },
      te: {
        title: 'మృత్యుంజయ్ (MRITHYUNJAY)',
        review: 'ఈ సినిమా ఎలా ఉందో డీటెయిల్ గా రివ్యూలో చూద్దాం.',
        firstHalf: 'మొదటి సగం విషయానికి వస్తే... డైరెక్టర్ స్టోరీ ప్లాట్ ని ఎస్టాబ్లిష్ చేయడానికి 20 నిమిషాల సమయం తీసుకున్నాడు... ఆ తర్వాత ప్రొసీడింగ్స్ బాగుంటాయి... కానీ ఇంటర్వెల్ సీక్వెన్స్ ఇంకా బెటర్ గా ఉంటే బాగుండేది.',
        secondHalf: 'రెండవ సగం విషయానికి వస్తే... ఇది బాగుంది... సీన్స్ మరియు డ్రామా హ్యాండ్లింగ్ బాగా రాశారు... మొత్తం మీద ఇది ఒక మంచి ఎమోషనల్ జర్నీ.',
        positives: 'హీరో పెర్ఫార్మెన్స్, ఎమోషన్, స్టోరీ కాన్సెప్ట్.',
        negatives: 'మొదటి సగంలో స్లో పేస్, కొన్ని ఇల్లాజికల్ సీన్స్.',
        overall: 'థ్రిల్లర్ సినిమాలని ఇష్టపడే వారికి ఒక మంచి అటెంప్ట్.'
      },
      hi: {
        title: 'मृत्युंजय (MRITHYUNJAY)',
        review: 'फिल्म कैसी है, आइए विस्तार से समीक्षा में देखें।',
        firstHalf: 'पहले हाफ की बात करें तो... निर्देशक ने कहानी की पृष्ठभूमि तैयार करने में करीब 20 मिनट का समय लिया... उसके बाद कार्यवाही अच्छी चलती है... लेकिन इंटरवल सीक्वेंस और बेहतर हो सकता था।',
        secondHalf: 'दूसरे हाफ की बात करें तो... यह अच्छा था... अच्छी तरह से लिखे गए दृश्यों और ड्रामा हैंडलिंग के साथ... कुल मिलाकर यह एक अच्छी भावनात्मक यात्रा थी।',
        positives: 'हीरो का प्रदर्शन, भावनाएं, कहानी का आधार।',
        negatives: 'पहले हाफ की धीमी गति, कुछ अतार्किक दृश्य।',
        overall: 'थ्रिलर प्रशंसकों के लिए एक अच्छी कोशिश।'
      },
      ta: {
        title: 'மிருத்யுஞ்சய் (MRITHYUNJAY)',
        review: 'படம் எப்படி இருக்கிறது என்பதை விரிவாக விமர்சனத்தில் பார்ப்போம்.',
        firstHalf: 'முதல் பாதியைப் பொறுத்தவரை... இயக்குனர் கதைக்களத்தை நிறுவ சுமார் 20 நிமிடங்கள் எடுத்துக்கொண்டார்... அதன் பிறகு காட்சிகள் நன்றாக நகர்கின்றன... ஆனால் இடைவேளை காட்சி இன்னும் சிறப்பாக இருந்திருக்கலாம்.',
        secondHalf: 'இரண்டாம் பாதியைப் பொறுத்தவரை... இது நன்றாக இருந்தது... சிறப்பாக எழுதப்பட்ட காட்சிகள் மற்றும் நாடகக் கையாள்கையுடன்... ஒட்டுமொத்தமாக இது ஒரு நல்ல உணர்ச்சிகரமான பயணம்.',
        positives: 'ஹீரோவின் நடிப்பு, உணர்ச்சிகள், கதையின் கரு.',
        negatives: 'முதல் பாதியில் மெதுவான வேகம், சில தர்க்கமற்ற காட்சிகள்.',
        overall: 'த்ரில்லர் ரசிகர்களுக்கு ஒரு நல்ல முயற்சி.'
      }
    }
  },
{
    id: 'sir Madam',
    title: 'SIR MADAM',
    image: 'https://assetscdn1.paytm.com/images/cinema/sir-madam-cover-b8268b50-5e4a-11f0-955e-b3a7ddd74d55.jpg',
    review: 'inka Movie ela vundho detail review lo chudham',
    firstHalf: 'First half..chaala Fun gaa velipoindhi.. First nunchi last daakaa Fun gaa velthu vuntadhi.Hero characterization picha picha gaa vuntadhi.. okka fast screenplay tho run avvutu Vuntadhi overall Decent First half...',
    secondHalf: 'Chala Relastic situations ni screen midha present cheseru..emotions chaala baga blend cheseru.. comedy Matram Next Level especially climax part is hilarious 😂😂...post credit scene too good...',
    positives: 'Vijay Sethupathi Acting, Heroine performance, Story, screenplay,Fun, Direction 👌',
    negatives: 'No Negatives ',
    overall: "Chaala Bagundhi.. Family tho vellandi Nuvvu kuntu baithaki vastaru...",
    rating: '4 STARS',
    translations: {
      en: {
        title: 'SIR MADAM',
        review: 'Let\'s check the detailed review below.',
        firstHalf: 'First half is very fun... flows smoothly from start to finish. Hero characterization is crazy... runs with a fast screenplay. Overall a decent first half.',
        secondHalf: 'Very realistic situations presented on screen... emotions are blended well. Comedy is next level, especially the hilarious climax... post-credit scene is too good.',
        positives: 'Vijay Sethupathi Acting, Heroine performance, Story, Screenplay, Fun, Direction.',
        negatives: 'None.',
        overall: 'Very good! Go with family, you\'ll come out laughing.'
      }
    }
  },
{
    id: 'kingdom',
    title: 'KINGDOM',
    image: 'https://cdn.123telugu.com/content/wp-content/uploads/2025/07/kingdom-14.jpg',
    review: 'inka Movie ela vundho detail review lo chudham',
    firstHalf: 'First Half..chaala intresting gaa vuntundi.. conflicts, intresting scenes tho engage Chestaru.. vaalu create chesina World building chaala baguntadhi manki kuda chaala twarga connect avvudhi.. without spoken any dialogue..just Hand gesture intervel elevation padutundi Top notch 🔥🔥',
    secondHalf: 'Asalu Movie Eyy etu etho podhi..chaala slow gaa veltu vuntadhi.. Emotions workout kaavu...last minute varaku post production work complete chestu vunte elaghe vuntadhi...okka manchi song ni lepeseru.. aa climax ento😌😌',
    positives: 'Gautham Direction in First Half,VD Acting....',
    negatives: 'Second half.. incompleteness feeling in last..Anirudh music kk but dhani ki taggatu scenes padaledu second half loo..',
    overall: "it was Average",
    rating: '3 STARS',
    translations: {
      en: {
        title: 'KINGDOM',
        review: 'Check the detailed review of the movie below.',
        firstHalf: 'First half is very interesting... engages with conflicts and interesting scenes. World building is great and easy to connect with. Without any dialogue, the hand gesture interval sequence is top notch.',
        secondHalf: 'The movie loses its way... moves very slowly. Emotions don\'t work out. It feels like post-production was rushed. A good song was removed. The climax is confusing.',
        positives: 'Gautham\'s Direction in the 1st Half, VD\'s Acting.',
        negatives: 'Second half feels incomplete at the end. Anirudh\'s music is okay but doesn\'t fit the scenes in the 2nd half.',
        overall: 'It was Average.'
      }
    }
  },
{
    id: 'mahavtara narsimha',
    title: 'MAHAVATARA NARSIMHA',
    image: 'https://boxofficeindex.in/wp-content/uploads/2025/07/Mahavatar-Narsimha-1-768x432.webp',
    review: 'inka Movie ela vundho detail review lo chudham',
    firstHalf: 'First half Lag cheyakunda direct Story lo ki velthadu...Okka sequence vuntadhi..aa sequence Graphics are Top Notch..aa tarvata Story  based gaa veltuntadhi Movie antha..decent First Half..',
    secondHalf: 'Coming to the second Half...antha okka lekka Last climax portion okka lekka.. literally Gooesubmps vachayi...that visuals,Bgm vere level..waiting For the next Movie From this universe...',
    positives: 'All positives visuals, making, BGM super 💥 Naaku teliyiani points enno telsukunna..',
    negatives: 'NO Negatives',
    overall: "idhi prathi okkaru chudalsina cinema..super ante..",
    rating: '4 STARS',
    translations: {
      en: {
        title: 'MAHAVATARA NARSIMHA',
        review: 'Let\'s check the detailed review of this film.',
        firstHalf: 'In the first half, the director dives straight into the story without wasting time. There is one particular sequence with top-notch graphics. The rest of the film progresses based on the storyline. A decent first half.',
        secondHalf: 'The second half and especially the final climax portion are on another level. The visuals, BGM literally gave goosebumps. Waiting for the next installment of this universe.',
        positives: 'Visuals, Making, BGM are all superb. Got to know many things I didn\'t know before.',
        negatives: 'No negatives.',
        overall: 'This is a must-watch film for everyone. It was super.'
      }
    }
  },
  
  {
    id: 'HHVM',
    title: 'HARI HARA VEERA MALLU',
    image: 'https://images.filmibeat.com/img/2022/11/1-1653556615-1667553644.jpg',
    review: 'inka Movie ela vundho detail review lo chudham',
    firstHalf: 'First Half Starts very well..Hero Introduction Scene..aa Tarvata Proceedings kuda baguntai...Madhyaloo akkada akkada kk anipinchela vuntadhi...Pre intervel Twist bagundhi.. Intervel Kuda baguntadhi.. overall First Half Bagundhi..',
    secondHalf: 'Second half Asalu Story Gurinchi kasepu pakkana pedethe.. Recent Times lo worst VFX Chusenu eee Movie loo..entha bad Graphics ante easy gaa Telesi pothundi...Inka story vishyaniki vaste edo chustanamu ante chustunam anatu vuntadhi...',
    positives: 'Keeravani soul pettedu Movie ki..thana BGM chaala Normal scenes ki kuda High icche laa kottedu.. Pawan Kalyan as usual did well..',
    negatives: '2nd half,boring scenes..bad vfx..konni scenes aite idhi Ai tho generate chesaru Anni easy gaa telisi pothundi...',
    overall: "it's a Average movie",
    rating: '3 STARS',
    translations: {
      en: {
        title: 'HARI HARA VEERA MALLU',
        review: 'Let\'s check the detailed review of this film.',
        firstHalf: 'The first half starts very well with the hero introduction scene. The proceedings are good too. Occasionally it feels a bit average in the middle. The pre-interval twist is good. The interval itself is good. Overall, a good first half.',
        secondHalf: 'Setting aside the story in the second half, this film has the worst VFX I have seen in recent times. The bad graphics are very obvious. Coming back to the story, it feels like we are just watching for the sake of it.',
        positives: 'Keeravani put his soul into the film. His BGM elevated even normal scenes. Pawan Kalyan as usual did well.',
        negatives: '2nd half, boring scenes, bad VFX. Some scenes are easily identifiable as AI-generated.',
        overall: 'It\'s an average movie.'
      }
    }
  },
  
  

 {
    id: 'oh bhama ayyo rama',
    title: 'OH BHAMA AYYO RAMA',
    image: 'https://filmyfocus.com/wp-content/uploads/2025/04/Profile1-46.png',
    review: 'inka Movie ela vundho detail review lo chudham',
    firstHalf: 'First Half vishiyaniki vaste Asalu Director em chepalli anukuntunado em ardham kaala.. Movie lo expect songs and bgm...Inka em ledu eppudo Old movie chustunna feeling vachindhi naaku aite...',
    secondHalf: 'coming to the second half edo ala ala velipotha vuntadhi...okka engaging scene vundadu.emotions and scenes emi workout kaadu..predictable gaa vuntundhi max story',
    positives: 'Songs, Cinematography, Malavika Manoj.. Parthi Frame chaala grander gaa kanapadutindhi...',
    negatives: 'Anni negatives eyy moive loo..inka em cheppali',
    overall: "it's Below Average movie",
    rating: '2.8 STARS',
    translations: {
      en: {
        title: 'OH BHAMA AYYO RAMA',
        review: 'Let\'s check the detailed review of this film.',
        firstHalf: 'Coming to the first half, I had no idea what the director was trying to say. The film was supposed to have good songs and BGM. But there was nothing else. It felt like watching an old movie.',
        secondHalf: 'The second half goes along somehow. There is not a single engaging scene. Neither the emotions nor the scenes work. The story is mostly predictable.',
        positives: 'Songs, Cinematography, Malavika Manoj. Parthi looks very grand on screen.',
        negatives: 'All negatives in this movie. What else can I say?',
        overall: 'It\'s a below average movie.'
      }
    }
  },

  {
    id: 'kannappa',
    title: 'KANNAPPA',
    image: 'https://moviemonarch.in/wp-content/uploads/2025/06/Kannappa-Movie-Review.jpg',
    review: 'kannappa Movie ela vundho detail review lo chudham',
    firstHalf: 'Movie vishyaniki vaste...we enjoyed a lot sir 🤣🤣..ee madhya kaalam lo Nenu inthala eppudu navuko ledu..idhi Eyy context lo tisukuntaro mee oohake vadilestunanu...aa dialogues aa scenes,aa casting naa booto naa bavishatu...',
    secondHalf: 'First 30 Min Bore kotttadhi.... Prabhas scenes and Shiva Shiva Shankar song and climax baguntadhi ante...Inka em ledu cheppadaniki....',
    positives: 'Prabhas,shiva shiva shankara song..climax',
    negatives: 'ilogical scenes and songs..artficial drama and emotions..dilogue delivery what not everthing',
    overall: "it's Below Average",
    rating: '2.8 STARS',
    translations: {
      en: {
        title: 'KANNAPPA',
        review: 'Let\'s check the detailed review of this film.',
        firstHalf: 'Coming to the movie... we enjoyed a lot! I haven\'t laughed this much in recent times. I\'ll leave it up to you to figure out in what context. The dialogues, scenes, casting were just... I leave my future to you.',
        secondHalf: 'The first 30 minutes were boring. The Prabhas scenes, the Shiva Shiva Shankar song, and the climax were good. There\'s nothing else to say.',
        positives: 'Prabhas, Shiva Shiva Shankara song, climax.',
        negatives: 'Illogical scenes and songs. Artificial drama and emotions. Dialogue delivery and everything else.',
        overall: 'It\'s below average.'
      }
    }
  },
  {
    id: 'kubera',
    title: 'KUBERA',
    image: 'https://www.pinkvilla.com/images/2024-09/1594720010_kubera-poster.jpg',
    review: 'kubera Movie ela vundho detail review lo chudham',
    firstHalf: 'First short lo nee idhi Shekar kammula movie naa anipistadhi....Next jaragaboyee Proceedings interesting gaa vuntai... First Half It\'s like a Journey laa gaa real gaa jarugutunatu vuntadhi.... Heroine entry deggara nundi inka baaga proceed avutuntdhi Movie....',
    secondHalf: 'It was Good man😍.....naaku baaga nachindhi Heroine tho vunde Conversational Scenes..and Scenes Playoffs and drama Emotions... Director Shekar kammula Wrote Not Screenplay..he wrote Scenes Play..everything work well',
    positives: 'Dhanush Acting... What a Man he was.. literally aaa Charcter lo Munighi poyyedu...And Also Rashmika kuda...And Nagarjuna chaala Rojjula Tarvata Fantastic Role padindhi... DSP Music Ramp 🤙🤙Ante.',
    negatives: 'Climax inka konchem baaga end chesunte bagundu anipinchindi',
    overall: 'Bagundhi..I loved It❤....',
    rating: '4 STARS',
    translations: {
      en: {
        title: 'KUBERA',
        review: 'Let\'s check the detailed review of this film.',
        firstHalf: 'In the short beginning, you feel like you\'re watching a Shekar Kammula film. The next proceedings are interesting. The first half feels like a real journey. From the heroine\'s entry onwards, the movie progresses even better.',
        secondHalf: 'It was really good. I really enjoyed the conversational scenes between the hero and heroine, the scene playouts and drama-emotions. Director Sekhar Kammula didn\'t just write a screenplay — he wrote scene plays. Everything works well.',
        positives: 'Dhanush acting — what a man, he literally immersed into the character. Rashmika also performed well. Nagarjuna got a fantastic role after many years. DSP music is on a ramp.',
        negatives: 'The climax could have ended slightly better.',
        overall: 'It was good. I loved it!'
      }
    }
  },
  {
    id: 'single',
    title: 'SINGLE',
    image: 'https://images.moneycontrol.com/static-mcnews/2025/05/20250509073125_Sree-Vishnu-starrer-Single-received-good-response-from-the-audience.png?impolicy=website&width=770&height=431',
    review: 'Single Movie ela vundho detail review lo chudham',
    firstHalf: 'Movie Starting To interval okka scene kuda bore kotadhu...edo okka comedy punches, scenes and sree Vishnu one liners tho entertain avuthu vuntham... Story Trailer lo chupinchadhe ..overall very good first half',
    secondHalf: 'Second half kuda same ante funny scenes... Asalu Sree vishnu One man show anni Cheppali... Pakkana vennala Kishore vunna konni konni scenes lo dominate chesedu kuda..pre climax slight emotion pedataru..climax is back to fun zone...',
    positives: 'Sree Vishnu performance and dialogues, vennela Kishore comedy...',
    negatives: 'NO NEGATIVES....Vaalu edhi aite movie lo vuntadhi anni cheppi audience ni prepare chesearo.. Adhe delivery cheseru..',
    overall: "it's a Youthful entertainer and worth watch movie",
    rating: '4 STARS',
    translations: {
      en: {
        title: 'SINGLE',
        review: 'Let\'s check the detailed review of this film.',
        firstHalf: 'From the start to the interval, not a single scene feels boring. We get entertained with comedy punches, scenes, and Sree Vishnu one-liners. The story is pretty much what the trailer showed. Overall a very good first half.',
        secondHalf: 'Same vibe in the second half too — funny scenes throughout. It\'s truly Sree Vishnu\'s one-man show. Vennela Kishore also dominated some scenes alongside. The pre-climax has some slight emotion, and the climax brings it back to the fun zone.',
        positives: 'Sree Vishnu performance and dialogues, Vennela Kishore comedy.',
        negatives: 'No negatives. They told the audience exactly what to expect, and they delivered that.',
        overall: 'It\'s a youthful entertainer and a must-watch movie.'
      }
    }
  },
  
  {
    id: 'robinhood',
    title: 'ROBINHOOD',
    image: 'https://th.bing.com/th/id/OIP.-ONs1V3ROAS26n-aPemlNQHaLH?rs=1&pid=ImgDetMain',
    review: 'Robinhood movie ela vundho detail review lo chudham',
    firstHalf: 'First half vishayaniki vaste...it was okk...Time pass gaa veltu vuntadhi.. Comdey scenes..songs good but Edo miss avutundhe anna feeling kaluguthadhi....',
    secondHalf: 'Second half edo flat gaa sagutunna feeling vastadhi...okka clarity vundadhu.... sambandam lekkunda songs vastuntaie...but last 10 Min was Good..chaala baga rasukunadu director...But overall Movie execution konchem tedha kottindhi...',
    positives: 'Some comedy scenes,sreleela beauty....',
    negatives: 'Song\'s placements,some boring scenes..in first and second half',
    overall: "It's average",
    rating: '3 STARS',
    translations: {
      en: {
        title: 'ROBINHOOD',
        review: 'Let\'s check the detailed review of this film.',
        firstHalf: 'Coming to the first half, it was okay. It moves at a time-pass pace. Comedy scenes and songs were good, but there was a feeling of something missing.',
        secondHalf: 'The second half feels flat. There\'s no clarity. Songs feel out of place. But the last 10 minutes were really good — the director wrote it very well. Overall, the movie\'s execution went a bit off.',
        positives: 'Some comedy scenes, Sreeleela\'s beauty.',
        negatives: 'Song placements, some boring scenes in both halves.',
        overall: 'It\'s average.'
      }
    }
  },
  {
    id: 'madsquare',
    title: 'MAD SQUARE',
    image: 'https://assets-in.bmscdn.com/iedb/movies/images/mobile/thumbnail/xlarge/mad-square-et00435629-1740499947.jpg',
    review: 'MAD SQUARE movie ela vundho detail review lo chudham',
    firstHalf: 'Starting Nundi... Comdey Non stop gaa vastuvuntadhi...good songs.. especially single liners was terrific...pre intervel okkate parledhu anipichelavuntadhi..',
    secondHalf: 'Second half started on a good Note....gap lekunda fun generate avuthu vuntadhi....songs kaani.. especially laddu charcter was hilarious 😆...Pre climax and climax was super...',
    positives: 'Mad characterizations...craziest one liners...Song\'s and BGM',
    negatives: 'NO Negatives',
    overall: 'Worth watch movie... Friends andhari tho Kalisi velli enjoy Chesi randi....',
    rating: '4 STARS',
    translations: {
      en: {
        title: 'MAD SQUARE',
        review: 'Let\'s check the detailed review of this film.',
        firstHalf: 'From the start, non-stop comedy keeps coming. Good songs. The single-liners especially were terrific. The pre-interval moment was so good it felt unreal.',
        secondHalf: 'The second half also started on a good note. Fun keeps generating without any gaps. Songs as well. The Laddu character was especially hilarious. Pre-climax and climax were super.',
        positives: 'Mad characterizations, craziest one-liners, songs and BGM.',
        negatives: 'No negatives.',
        overall: 'A worth-watching movie. Go enjoy it with all your friends!'
      }
    }
  }
];
