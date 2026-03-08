import { useState, useEffect } from 'react';
import { collection, doc, getDoc, setDoc, updateDoc, onSnapshot, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/utils/firebase';
import { getDeviceFingerprint } from '@/utils/deviceFingerprint';

export interface PollOption {
  id: string;
  label: string;
  votes: number;
}

export interface Poll {
  id: string;
  movieId: string;
  question: string;
  options: PollOption[];
  createdAt: Date;
}

export const usePolls = (movieId: string) => {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [votedPolls, setVotedPolls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  // Load voted polls from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('votedPolls');
    if (saved) {
      try {
        setVotedPolls(JSON.parse(saved));
      } catch { /* ignore */ }
    }
  }, []);

  // Listen for polls in real-time
  useEffect(() => {
    if (!db || !movieId) {
      setLoading(false);
      return;
    }

    const pollsRef = collection(db, 'polls');
    const unsubscribe = onSnapshot(pollsRef, (snapshot) => {
      const pollsList: Poll[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.movieId === movieId) {
          pollsList.push({
            id: docSnap.id,
            movieId: data.movieId,
            question: data.question,
            options: data.options || [],
            createdAt: data.createdAt?.toDate?.() || new Date(),
          });
        }
      });
      setPolls(pollsList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [movieId]);

  const vote = async (pollId: string, optionId: string) => {
    if (!db) return;
    
    const deviceHash = getDeviceFingerprint();
    
    // Check if already voted
    if (votedPolls[pollId]) return;

    // Check device-level vote in Firebase
    try {
      const voteDocRef = doc(db, 'poll_votes', `${pollId}_${deviceHash}`);
      const existingVote = await getDoc(voteDocRef);
      if (existingVote.exists()) {
        // Already voted from this device
        const newVoted = { ...votedPolls, [pollId]: existingVote.data().optionId };
        setVotedPolls(newVoted);
        localStorage.setItem('votedPolls', JSON.stringify(newVoted));
        return;
      }

      // Get current poll and update vote count
      const pollRef = doc(db, 'polls', pollId);
      const pollSnap = await getDoc(pollRef);
      if (!pollSnap.exists()) return;

      const pollData = pollSnap.data();
      const updatedOptions = pollData.options.map((opt: PollOption) =>
        opt.id === optionId ? { ...opt, votes: (opt.votes || 0) + 1 } : opt
      );

      await updateDoc(pollRef, { options: updatedOptions });

      // Record the vote
      await setDoc(voteDocRef, {
        pollId,
        optionId,
        deviceHash,
        timestamp: new Date(),
      });

      // Update local state
      const newVoted = { ...votedPolls, [pollId]: optionId };
      setVotedPolls(newVoted);
      localStorage.setItem('votedPolls', JSON.stringify(newVoted));
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  return { polls, votedPolls, vote, loading };
};

// Admin: create a poll for a movie
export const createPoll = async (movieId: string, question: string, optionLabels: string[]) => {
  if (!db) return;

  const options: PollOption[] = optionLabels.map((label, i) => ({
    id: `opt_${i}`,
    label,
    votes: 0,
  }));

  const pollRef = doc(collection(db, 'polls'));
  await setDoc(pollRef, {
    movieId,
    question,
    options,
    createdAt: new Date(),
  });

  return pollRef.id;
};

// Admin: delete a poll
export const deletePoll = async (pollId: string) => {
  if (!db) return;
  const { deleteDoc } = await import('firebase/firestore');
  await deleteDoc(doc(db, 'polls', pollId));
};
