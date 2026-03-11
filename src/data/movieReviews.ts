
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
    rating: '3.8 STARS'
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
    rating: '4 STARS'
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
    rating: '3 STARS'
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
    rating: '4 STARS'
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
    rating: '3 STARS'
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
    rating: '2.8 STARS'
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
    rating: '2.8 STARS'
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
    rating: '4 STARS'
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
    rating: '4 STARS'
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
    rating: '3 STARS'
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
    rating: '4 STARS'
  }
];
