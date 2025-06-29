import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Heart, MessageCircle, Share2, Send } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, updateDoc, doc, increment, getDocs } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

// Firebase configuration - your actual config
const firebaseConfig = {
  apiKey: "AIzaSyBgw0O4B_NbCvGfxOzSgEtNNYYYLoxFpic",
  authDomain: "clgsm-90aa8.firebaseapp.com",
  databaseURL: "https://clgsm-90aa8-default-rtdb.firebaseio.com",
  projectId: "clgsm-90aa8",
  storageBucket: "clgsm-90aa8.firebasestorage.app",
  messagingSenderId: "599942427925",
  appId: "1:599942427925:web:b65c4ca2b4537c0fa7e51c",
  measurementId: "G-CXB0LNYWFH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

interface MovieReview {
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

interface Comment {
  id: string;
  text: string;
  timestamp: Date;
  author: string;
}

const Index = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [reviews, setReviews] = useState<MovieReview[]>([]);
  const [newComment, setNewComment] = useState<{ [key: string]: string }>({});
  const [showComments, setShowComments] = useState<{ [key: string]: boolean }>({});
  const { toast } = useToast();

  // Movie reviews data
  const movieReviewsData: Omit<MovieReview, 'likes' | 'comments'>[] = [
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

  useEffect(() => {
    initializeReviews();
    loadLikes();
    loadComments();
  }, []);

  const initializeReviews = async () => {
    const reviewsWithInteractions: MovieReview[] = movieReviewsData.map(review => ({
      ...review,
      likes: 0,
      comments: []
    }));
    setReviews(reviewsWithInteractions);
  };

  const loadLikes = async () => {
    try {
      const likesQuery = query(collection(db, 'likes'));
      const likesSnapshot = await getDocs(likesQuery);
      const likesData: { [key: string]: number } = {};
      
      likesSnapshot.forEach((doc) => {
        likesData[doc.id] = doc.data().count || 0;
      });

      setReviews(prev => prev.map(review => ({
        ...review,
        likes: likesData[review.id] || 0
      })));
    } catch (error) {
      console.log('Loading likes locally for demo');
    }
  };

  const loadComments = async () => {
    try {
      const commentsQuery = query(collection(db, 'comments'), orderBy('timestamp', 'desc'));
      onSnapshot(commentsQuery, (snapshot) => {
        const commentsData: { [key: string]: Comment[] } = {};
        
        snapshot.forEach((doc) => {
          const comment = doc.data() as Comment & { reviewId: string };
          if (!commentsData[comment.reviewId]) {
            commentsData[comment.reviewId] = [];
          }
          commentsData[comment.reviewId].push({
            id: doc.id,
            text: comment.text,
            timestamp: comment.timestamp && typeof comment.timestamp.toDate === 'function' 
              ? comment.timestamp.toDate() 
              : comment.timestamp instanceof Date 
                ? comment.timestamp 
                : new Date(comment.timestamp),
            author: comment.author
          });
        });

        setReviews(prev => prev.map(review => ({
          ...review,
          comments: commentsData[review.id] || []
        })));
      });
    } catch (error) {
      console.log('Loading comments locally for demo');
    }
  };

  const handleLike = async (reviewId: string) => {
    try {
      const reviewRef = doc(db, 'likes', reviewId);
      await updateDoc(reviewRef, {
        count: increment(1)
      }).catch(async () => {
        // Document doesn't exist, create it
        await addDoc(collection(db, 'likes'), {
          reviewId: reviewId,
          count: 1
        });
      });
      
      setReviews(prev => prev.map(review => 
        review.id === reviewId 
          ? { ...review, likes: review.likes + 1 }
          : review
      ));

      toast({
        title: "Liked!",
        description: "Your like has been recorded.",
      });
    } catch (error) {
      // For demo purposes, update locally
      setReviews(prev => prev.map(review => 
        review.id === reviewId 
          ? { ...review, likes: review.likes + 1 }
          : review
      ));
      
      toast({
        title: "Liked! (Demo Mode)",
        description: "Like recorded locally - Firebase not connected.",
      });
    }
  };

  const handleComment = async (reviewId: string) => {
    const commentText = newComment[reviewId];
    if (!commentText?.trim()) return;

    const comment: Comment = {
      id: Date.now().toString(),
      text: commentText,
      timestamp: new Date(),
      author: 'Anonymous User'
    };

    try {
      await addDoc(collection(db, 'comments'), {
        reviewId,
        ...comment
      });

      toast({
        title: "Comment added!",
        description: "Your comment has been posted.",
      });
    } catch (error) {
      console.log('Demo mode: comment added locally');
      
      setReviews(prev => prev.map(review => 
        review.id === reviewId 
          ? { ...review, comments: [comment, ...review.comments] }
          : review
      ));

      toast({
        title: "Comment added! (Demo Mode)",
        description: "Comment saved locally - Firebase not connected.",
      });
    }

    setNewComment(prev => ({ ...prev, [reviewId]: '' }));
  };

  const handleShare = async (review: MovieReview) => {
    const shareData = {
      title: `SM Review: ${review.title}`,
      text: `Check out this movie review of ${review.title}: ${review.overall}`,
      url: window.location.href
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        toast({
          title: "Shared!",
          description: "Review shared successfully.",
        });
      } catch (error) {
        console.log('Sharing cancelled');
      }
    } else {
      // Fallback to copying URL
      try {
        await navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`);
        toast({
          title: "Copied!",
          description: "Review details copied to clipboard.",
        });
      } catch (error) {
        toast({
          title: "Share",
          description: `${shareData.title}\n${shareData.text}`,
        });
      }
    }
  };

  const filteredReviews = reviews.filter(review =>
    review.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    review.review.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 w-full bg-white z-50 p-4 shadow-lg border-b">
        <h1 className="text-center text-2xl font-bold mb-4" style={{
          background: 'linear-gradient(45deg, #ff7e5f, #feb47b)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          WELCOME TO SM REVIEW 2.0
        </h1>
        <Input
          type="text"
          placeholder="Search for movie Reviews..."
          className="w-full bg-gray-100"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pt-32 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReviews.map((review) => (
            <Card key={review.id} className="bg-black text-white border-none shadow-xl h-full">
              <CardHeader className="text-center">
                <h3 className="text-xl font-bold" style={{
                  background: 'linear-gradient(45deg, #ff7e5f, #feb47b)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  margin: '10px'
                }}>
                  {review.title}
                </h3>
              </CardHeader>

              <div className="px-4">
                <img 
                  src={review.image} 
                  alt={review.title}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
              </div>

              <CardContent className="space-y-4">
                <h5 className="text-center font-bold" style={{
                  background: 'linear-gradient(45deg, #ff7e5f, #feb47b)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  REVIEW
                </h5>
                <p className="text-pink-400 font-bold text-sm">{review.review}</p>
                
                <div className="space-y-2">
                  <h6 className="text-red-500 font-semibold">First Half:</h6>
                  <p className="text-pink-400 font-bold text-sm">{review.firstHalf}</p>
                  
                  <h6 className="text-red-500 font-semibold">Second Half:</h6>
                  <p className="text-pink-400 font-bold text-sm">{review.secondHalf}</p>
                  
                  <h6 className="text-red-500 font-semibold">Positives:</h6>
                  <p className="text-pink-400 font-bold text-sm">{review.positives}</p>
                  
                  <h6 className="text-red-500 font-semibold">Negatives:</h6>
                  <p className="text-pink-400 font-bold text-sm">{review.negatives}</p>
                  
                  <h6 className="text-red-500 font-semibold">Overall Movie:</h6>
                  <p className="text-pink-400 font-bold text-sm">{review.overall}</p>
                </div>

                {/* Interaction Buttons */}
                <div className="flex justify-around items-center pt-4 border-t border-gray-700">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleLike(review.id)}
                    className="flex items-center gap-2 text-white hover:text-red-500 transition-colors"
                  >
                    <Heart className="w-4 h-4" />
                    {review.likes}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowComments(prev => ({ ...prev, [review.id]: !prev[review.id] }))}
                    className="flex items-center gap-2 text-white hover:text-blue-500 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    {review.comments.length}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleShare(review)}
                    className="flex items-center gap-2 text-white hover:text-green-500 transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                    Share
                  </Button>
                </div>

                {/* Comments Section */}
                {showComments[review.id] && (
                  <div className="mt-4 space-y-3 border-t border-gray-700 pt-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a comment..."
                        value={newComment[review.id] || ''}
                        onChange={(e) => setNewComment(prev => ({ ...prev, [review.id]: e.target.value }))}
                        className="flex-1 bg-gray-800 border-gray-600 text-white"
                        onKeyPress={(e) => e.key === 'Enter' && handleComment(review.id)}
                      />
                      <Button
                        size="sm"
                        onClick={() => handleComment(review.id)}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {review.comments.map((comment) => (
                        <div key={comment.id} className="bg-gray-800 p-2 rounded text-sm">
                          <p className="text-gray-300">{comment.text}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {comment.author} • {comment.timestamp.toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>

              <CardFooter 
                className="text-center rounded-b-lg" 
                style={{
                  background: 'linear-gradient(164deg, rgba(238, 174, 202, 1) 0%, rgba(160, 148, 233, 0.8960376386882878) 100%)'
                }}
              >
                <div className="w-full">
                  <h1 className="text-lg font-bold text-black mb-2">SM RATING</h1>
                  <div className="flex justify-center">
                    <div className="text-center">
                      <p className="p-2 mt-2 font-bold text-black">
                        {review.rating}
                      </p>
                    </div>
                  </div>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;
