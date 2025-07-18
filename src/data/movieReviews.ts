
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
}

export interface Comment {
  id: string;
  text: string;
  timestamp: Date;
  author: string;
}

export const movieReviewsData: Omit<MovieReview, 'likes' | 'comments'>[] = [
  // ...existing reviews

  {
    id: 'junior',
    title: 'JUNIOR',
    image: 'https://www.google.com/url?sa=i&url=https%3A%2F%2Fin.bookmyshow.com%2Fmovies%2Fbengaluru%2Fjunior%2FET00448285&psig=AOvVaw1uxkI1SbwaGz2KcvI6Bjqy&ust=1752931232210000&source=images&cd=vfe&opi=89978449&ved=0CBUQjRxqFwoTCNjwsOu_xo4DFQAAAAAdAAAAABAE',
    review: 'inka Movie ela vundho detail review lo chudham',
    firstHalf: 'Em cheppali... Story antha kotha gaa em ledu.. edo velipothu vuntadhi... conflict Execution lo tedha kottindhi.. correct gaa present chesunte intervel loo cheppina point connect ayyindi vundedhi..But didn't..',
    secondHalf: 'Second half kk parledhu it's better than first Half..konni Flaws vunna kuda kk anipinchela Vuntadhi..Inka Heroine ni Enduku pettero teledu, movie loo chala Charcters complete cheykunda finish chestaru..',
    positives: 'Kireeti Performance,dance and fights ,Viral vyari song..',
    negatives: 'Execution, Routine scenes, improper endings of The characters',
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
    id: 'hit3',
    title: 'HIT 3',
    image: 'https://indiaglitz-medianw.s3.amazonaws.com/telugu/home/hit-3-010525-1.jpg',
    review: 'HIT Movie hit aindha ledha detail review lo chudham',
    firstHalf: 'First half started a good Note.. Interesting scenes, Story Plot..Arjun Sarkar characterization ... Heroine Portions... overall ekkada Bore kottaledu...and nice interval Bang',
    secondHalf: 'Second half lo new world vuntadhi..chaala intresting and kotha gaa vuntadhi...That Last pre climax and climax was 🔥🔥🔥...Konni surprises gaa ni vuntai..',
    positives: 'Arjun Sarkar characterization,New Concept...',
    negatives: 'investigation Process Inka better gaa Present chesunte bagundu anipinchindi...',
    overall: "it's Worth Watching",
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
