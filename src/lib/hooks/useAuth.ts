'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { db, getFirebaseAuth } from '@/lib/firebase/config';
import type { UserProfile } from '@/lib/types';

interface UseAuthResult {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
}

export function useAuth(): UseAuthResult {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getFirebaseAuth(), (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const ref = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(ref, (snapshot) => {
      setProfile(snapshot.exists() ? (snapshot.data() as UserProfile) : null);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  return { user, profile, loading };
}
