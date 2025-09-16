import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove,
  deleteDoc
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL
} from 'firebase/storage';
import { auth, db, storage } from '../config/firebase';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Authentication functions
  const signup = async (email, password, additionalData = {}) => {
    try {
      setLoading(true);
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update the user's display name
      if (additionalData.displayName) {
        await updateProfile(result.user, {
          displayName: additionalData.displayName
        });
      }

      // Create user profile in Firestore
      const userProfileData = {
        uid: result.user.uid,
        email: result.user.email,
        displayName: additionalData.displayName || result.user.displayName || 'Artisan',
        username: `user_${result.user.uid.slice(-6)}`,
        craftType: additionalData.craftType || 'General',
        experience: additionalData.experience || 'Beginner',
        location: additionalData.location || '',
        bio: additionalData.bio || '',
        skills: additionalData.skills || [],
        isPublic: true,
        followers: 0,
        following: 0,
        postsCount: 0,
        profileImage: '',
        coverImage: '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await setDoc(doc(db, 'users', result.user.uid), userProfileData);
      
      console.log('✅ User created successfully:', result.user.email);
      return { success: true, user: result.user };
    } catch (error) {
      console.error('❌ Signup failed:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log('✅ Login successful:', result.user.email);
      return { success: true, user: result.user };
    } catch (error) {
      console.error('❌ Login failed:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setUserProfile(null);
      console.log('✅ Logout successful');
      return { success: true };
    } catch (error) {
      console.error('❌ Logout failed:', error);
      return { success: false, error: error.message };
    }
  };

  const loginWithGoogle = async () => {
    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Check if user profile exists, if not create one
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      if (!userDoc.exists()) {
        const userProfileData = {
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName || 'Artisan',
          username: `user_${result.user.uid.slice(-6)}`,
          craftType: 'General',
          experience: 'Beginner',
          location: '',
          bio: '',
          skills: [],
          isPublic: true,
          followers: 0,
          following: 0,
          postsCount: 0,
          profileImage: result.user.photoURL || '',
          coverImage: '',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        await setDoc(doc(db, 'users', result.user.uid), userProfileData);
      }
      
      console.log('✅ Google login successful:', result.user.email);
      return { success: true, user: result.user };
    } catch (error) {
      console.error('❌ Google login failed:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Profile management functions
  const saveUserProfile = async (profileData) => {
    if (!currentUser) return { success: false, error: 'Not authenticated' };

    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      const updateData = {
        ...profileData,
        updatedAt: serverTimestamp()
      };
      
      await updateDoc(userDocRef, updateData);
      console.log('✅ Profile updated successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ Profile update failed:', error);
      return { success: false, error: error.message };
    }
  };

  const uploadImage = async (file, type = 'profile') => {
    if (!currentUser) return { success: false, error: 'Not authenticated' };

    try {
      setUploading(true);
      
      // Create unique filename
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substr(2, 9);
      const extension = file.name.split('.').pop();
      const fileName = `${timestamp}_${randomId}.${extension}`;
      
      // Upload to appropriate folder based on type
      const folder = type === 'cover' ? 'covers' : type === 'post' ? 'posts' : 'profiles';
      const storageRef = ref(storage, `${currentUser.uid}/${folder}/${fileName}`);
      
      console.log(`📤 Uploading ${type} image:`, fileName);
      
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      console.log(`✅ ${type} image uploaded successfully:`, downloadURL);
      
      return {
        success: true,
        data: {
          url: downloadURL,
          path: snapshot.ref.fullPath,
          type: type
        }
      };
      
    } catch (error) {
      console.error(`❌ ${type} image upload failed:`, error);
      return { success: false, error: error.message };
    } finally {
      setUploading(false);
    }
  };

  // Post management functions
  const createPost = async (postData) => {
    if (!currentUser || !userProfile) return { success: false, error: 'Not authenticated' };

    try {
      const postDoc = {
        ...postData,
        authorId: currentUser.uid,
        authorName: userProfile.displayName,
        authorAvatar: userProfile.profileImage,
        authorUsername: userProfile.username,
        craftType: userProfile.craftType,
        likes: 0,
        likedBy: [],
        comments: 0,
        shares: 0,
        views: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'posts'), postDoc);
      
      // Update user's post count
      await updateDoc(doc(db, 'users', currentUser.uid), {
        postsCount: increment(1)
      });

      console.log('✅ Post created successfully:', docRef.id);
      return { success: true, postId: docRef.id };
    } catch (error) {
      console.error('❌ Post creation failed:', error);
      return { success: false, error: error.message };
    }
  };

  const getUserPosts = async (userId = null) => {
    const targetUserId = userId || currentUser?.uid;
    if (!targetUserId) return [];

    try {
      const postsRef = collection(db, 'posts');
      const q = query(
        postsRef,
        where('authorId', '==', targetUserId),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const posts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      }));
      
      console.log(`📬 Found ${posts.length} posts for user`);
      return posts;
    } catch (error) {
      console.error('❌ Error fetching user posts:', error);
      return [];
    }
  };

  // Post interaction functions
  const likePost = async (postId) => {
    if (!currentUser) return { success: false, error: 'Not authenticated' };

    try {
      const postRef = doc(db, 'posts', postId);
      const postDoc = await getDoc(postRef);
      
      if (!postDoc.exists()) {
        return { success: false, error: 'Post not found' };
      }

      const postData = postDoc.data();
      const likedBy = postData.likedBy || [];
      const hasLiked = likedBy.includes(currentUser.uid);

      if (hasLiked) {
        // Unlike the post
        await updateDoc(postRef, {
          likes: increment(-1),
          likedBy: arrayRemove(currentUser.uid)
        });
        console.log('👎 Post unliked');
      } else {
        // Like the post
        await updateDoc(postRef, {
          likes: increment(1),
          likedBy: arrayUnion(currentUser.uid)
        });
        console.log('👍 Post liked');
      }

      return { success: true, liked: !hasLiked };
    } catch (error) {
      console.error('❌ Error liking post:', error);
      return { success: false, error: error.message };
    }
  };

  const commentOnPost = async (postId, commentText) => {
    if (!currentUser || !userProfile) return { success: false, error: 'Not authenticated' };

    try {
      const commentData = {
        postId,
        authorId: currentUser.uid,
        authorName: userProfile.displayName,
        authorAvatar: userProfile.profileImage,
        content: commentText,
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, 'comments'), commentData);
      
      // Update post comment count
      await updateDoc(doc(db, 'posts', postId), {
        comments: increment(1)
      });

      console.log('💬 Comment added successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ Error adding comment:', error);
      return { success: false, error: error.message };
    }
  };

  const getPostComments = async (postId) => {
    try {
      const commentsRef = collection(db, 'comments');
      const q = query(
        commentsRef,
        where('postId', '==', postId),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const comments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      }));
      
      return comments;
    } catch (error) {
      console.error('❌ Error fetching comments:', error);
      return [];
    }
  };

  const sharePost = async (postId) => {
    if (!currentUser) return { success: false, error: 'Not authenticated' };

    try {
      // Update post share count
      await updateDoc(doc(db, 'posts', postId), {
        shares: increment(1)
      });

      // Copy post URL to clipboard
      const postURL = `${window.location.origin}/post/${postId}`;
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(postURL);
        console.log('📤 Post URL copied to clipboard');
      }

      console.log('📤 Post shared successfully');
      return { success: true, url: postURL };
    } catch (error) {
      console.error('❌ Error sharing post:', error);
      return { success: false, error: error.message };
    }
  };

  // User search and follow functions
  const searchUsers = async (searchTerm) => {
    if (!searchTerm.trim()) return [];

    try {
      const usersRef = collection(db, 'users');
      const queries = [
        query(usersRef, where('displayName', '>=', searchTerm), where('displayName', '<=', searchTerm + '\uf8ff'), limit(10)),
        query(usersRef, where('username', '>=', searchTerm), where('username', '<=', searchTerm + '\uf8ff'), limit(10)),
        query(usersRef, where('craftType', '>=', searchTerm), where('craftType', '<=', searchTerm + '\uf8ff'), limit(10))
      ];

      const results = await Promise.all(queries.map(q => getDocs(q)));
      const allUsers = [];
      const seenIds = new Set();

      results.forEach(snapshot => {
        snapshot.docs.forEach(doc => {
          if (!seenIds.has(doc.id)) {
            seenIds.add(doc.id);
            allUsers.push({
              id: doc.id,
              ...doc.data()
            });
          }
        });
      });

      console.log(`🔍 Found ${allUsers.length} users for search: ${searchTerm}`);
      return allUsers.slice(0, 20); // Limit to 20 results
    } catch (error) {
      console.error('❌ Error searching users:', error);
      return [];
    }
  };

  const followUser = async (targetUserId) => {
    if (!currentUser || targetUserId === currentUser.uid) {
      return { success: false, error: 'Cannot follow yourself' };
    }

    try {
      const currentUserRef = doc(db, 'users', currentUser.uid);
      const targetUserRef = doc(db, 'users', targetUserId);

      // Add to current user's following list
      await updateDoc(currentUserRef, {
        following: increment(1)
      });

      // Add to target user's followers list
      await updateDoc(targetUserRef, {
        followers: increment(1)
      });

      // Create follow relationship document
      await addDoc(collection(db, 'follows'), {
        followerId: currentUser.uid,
        followingId: targetUserId,
        createdAt: serverTimestamp()
      });

      console.log('✅ Successfully followed user');
      return { success: true };
    } catch (error) {
      console.error('❌ Error following user:', error);
      return { success: false, error: error.message };
    }
  };

  const unfollowUser = async (targetUserId) => {
    if (!currentUser || targetUserId === currentUser.uid) {
      return { success: false, error: 'Cannot unfollow yourself' };
    }

    try {
      const currentUserRef = doc(db, 'users', currentUser.uid);
      const targetUserRef = doc(db, 'users', targetUserId);

      // Remove from current user's following list
      await updateDoc(currentUserRef, {
        following: increment(-1)
      });

      // Remove from target user's followers list
      await updateDoc(targetUserRef, {
        followers: increment(-1)
      });

      // Find and delete follow relationship document
      const followsRef = collection(db, 'follows');
      const q = query(
        followsRef,
        where('followerId', '==', currentUser.uid),
        where('followingId', '==', targetUserId)
      );
      
      const snapshot = await getDocs(q);
      snapshot.docs.forEach(async (doc) => {
        await deleteDoc(doc.ref);
      });

      console.log('✅ Successfully unfollowed user');
      return { success: true };
    } catch (error) {
      console.error('❌ Error unfollowing user:', error);
      return { success: false, error: error.message };
    }
  };

  const checkIfFollowing = async (targetUserId) => {
    if (!currentUser || targetUserId === currentUser.uid) return false;

    try {
      const followsRef = collection(db, 'follows');
      const q = query(
        followsRef,
        where('followerId', '==', currentUser.uid),
        where('followingId', '==', targetUserId)
      );
      
      const snapshot = await getDocs(q);
      return !snapshot.empty;
    } catch (error) {
      console.error('❌ Error checking follow status:', error);
      return false;
    }
  };

  // Load user profile
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        console.log('✅ User authenticated:', user.email);
        
        try {
          setProfileLoading(true);
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const profileData = userDoc.data();
            setUserProfile(profileData);
            console.log('✅ User profile loaded:', profileData);
          } else {
            console.log('❌ User profile not found');
            setUserProfile(null);
          }
        } catch (error) {
          console.error('❌ Error loading user profile:', error);
          setUserProfile(null);
        } finally {
          setProfileLoading(false);
        }
      } else {
        setCurrentUser(null);
        setUserProfile(null);
        setProfileLoading(false);
        console.log('❌ User not authenticated');
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile,
    loading,
    profileLoading,
    uploading,
    signup,
    login,
    logout,
    loginWithGoogle,
    saveUserProfile,
    uploadImage,
    createPost,
    getUserPosts,
    likePost,
    commentOnPost,
    getPostComments,
    sharePost,
    searchUsers,
    followUser,
    unfollowUser,
    checkIfFollowing
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
