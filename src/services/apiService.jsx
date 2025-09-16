import { 
    doc, 
    getDoc, 
    setDoc, 
    updateDoc, 
    collection, 
    query, 
    where, 
    getDocs, 
    orderBy, 
    limit, 
    addDoc,
    deleteDoc,
    serverTimestamp,
    increment
  } from 'firebase/firestore';
  import { 
    ref, 
    uploadBytes, 
    getDownloadURL, 
    deleteObject 
  } from 'firebase/storage';
  import { db, storage } from '../config/firebase';
  
  export const apiService = {
    // ===== ARTISAN PROFILE METHODS =====
    
    async getArtisanProfile(userId) {
      try {
        const docRef = doc(db, 'users', userId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          return {
            success: true,
            data: { id: docSnap.id, ...docSnap.data() }
          };
        } else {
          // Create default profile if doesn't exist
          const defaultProfile = {
            name: 'New Artisan',
            username: `artisan_${userId.slice(-6)}`,
            email: '',
            craftType: 'General Craft',
            region: 'Unknown',
            bio: '',
            aboutMe: '',
            location: '',
            experience: 'Beginner',
            profileImage: '',
            coverImage: '',
            skills: [],
            achievements: [],
            contact: {
              phone: '',
              website: '',
              social: {
                instagram: '',
                facebook: '',
                twitter: ''
              }
            },
            isPublic: true,
            verified: false,
            followers: 0,
            following: 0,
            postsCount: 0,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          };
          
          await setDoc(docRef, defaultProfile);
          return {
            success: true,
            data: { id: userId, ...defaultProfile }
          };
        }
      } catch (error) {
        console.error('Error fetching artisan profile:', error);
        return { success: false, error: error.message };
      }
    },
  
    async updateArtisanProfile(userId, profileData) {
      try {
        const docRef = doc(db, 'users', userId);
        await updateDoc(docRef, {
          ...profileData,
          updatedAt: serverTimestamp()
        });
        
        return { success: true, message: 'Profile updated successfully' };
      } catch (error) {
        console.error('Error updating artisan profile:', error);
        return { success: false, error: error.message };
      }
    },
  
    async updateUsername(userId, newUsername) {
      try {
        // Check if username is already taken
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('username', '==', newUsername));
        const querySnapshot = await getDocs(q);
  
        if (!querySnapshot.empty && querySnapshot.docs[0].id !== userId) {
          return { success: false, error: 'Username already taken' };
        }
  
        // Update username
        const docRef = doc(db, 'users', userId);
        await updateDoc(docRef, {
          username: newUsername,
          updatedAt: serverTimestamp()
        });
  
        return { success: true, message: 'Username updated successfully' };
      } catch (error) {
        console.error('Error updating username:', error);
        return { success: false, error: error.message };
      }
    },
  
    // ===== IMAGE UPLOAD METHODS =====
    
    async uploadImage(file, userId, type = 'general') {
      try {
        const timestamp = Date.now();
        const fileName = `${userId}/${type}/${timestamp}_${file.name}`;
        const storageRef = ref(storage, fileName);
        
        // Upload file
        const uploadResult = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(uploadResult.ref);
        
        return {
          success: true,
          data: {
            url: downloadURL,
            path: fileName,
            name: file.name,
            size: file.size
          }
        };
      } catch (error) {
        console.error('Error uploading image:', error);
        return { success: false, error: error.message };
      }
    },
  
    async deleteImage(imagePath) {
      try {
        const storageRef = ref(storage, imagePath);
        await deleteObject(storageRef);
        return { success: true, message: 'Image deleted successfully' };
      } catch (error) {
        console.error('Error deleting image:', error);
        return { success: false, error: error.message };
      }
    },
  
    // ===== POSTS METHODS =====
    
    async getArtisanPosts(userId, options = {}) {
      try {
        const { limit: postLimit = 10, orderByField = 'createdAt' } = options;
        
        const postsRef = collection(db, 'posts');
        const q = query(
          postsRef,
          where('authorId', '==', userId),
          orderBy(orderByField, 'desc'),
          limit(postLimit)
        );
        
        const querySnapshot = await getDocs(q);
        const posts = [];
        
        querySnapshot.forEach((doc) => {
          posts.push({ id: doc.id, ...doc.data() });
        });
        
        return {
          success: true,
          data: { posts, total: posts.length }
        };
      } catch (error) {
        console.error('Error fetching artisan posts:', error);
        return { success: false, error: error.message };
      }
    },
  
    async createPost(postData, userId) {
      try {
        const postsRef = collection(db, 'posts');
        const newPost = {
          ...postData,
          authorId: userId,
          likes: 0,
          comments: 0,
          shares: 0,
          views: 0,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        
        const docRef = await addDoc(postsRef, newPost);
        
        // Update user's posts count
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
          postsCount: increment(1)
        });
        
        return {
          success: true,
          data: { id: docRef.id, ...newPost }
        };
      } catch (error) {
        console.error('Error creating post:', error);
        return { success: false, error: error.message };
      }
    },
  
    async updatePost(postId, postData) {
      try {
        const docRef = doc(db, 'posts', postId);
        await updateDoc(docRef, {
          ...postData,
          updatedAt: serverTimestamp()
        });
        
        return { success: true, message: 'Post updated successfully' };
      } catch (error) {
        console.error('Error updating post:', error);
        return { success: false, error: error.message };
      }
    },
  
    async deletePost(postId, userId) {
      try {
        const docRef = doc(db, 'posts', postId);
        await deleteDoc(docRef);
        
        // Update user's posts count
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
          postsCount: increment(-1)
        });
        
        return { success: true, message: 'Post deleted successfully' };
      } catch (error) {
        console.error('Error deleting post:', error);
        return { success: false, error: error.message };
      }
    },
  
    // ===== ANALYTICS METHODS =====
    
    async getArtisanAnalytics(userId, options = {}) {
      try {
        const { days = 30 } = options;
        
        // Get user's posts for analytics calculation
        const postsResponse = await this.getArtisanPosts(userId, { limit: 100 });
        const posts = postsResponse.data?.posts || [];
        
        // Calculate analytics
        const totalViews = posts.reduce((sum, post) => sum + (post.views || 0), 0);
        const totalLikes = posts.reduce((sum, post) => sum + (post.likes || 0), 0);
        const totalComments = posts.reduce((sum, post) => sum + (post.comments || 0), 0);
        const totalPosts = posts.length;
        
        const avgEngagement = totalPosts > 0 
          ? Math.round(((totalLikes + totalComments) / totalPosts) * 100) / 100 
          : 0;
        
        return {
          success: true,
          data: {
            totalViews,
            totalPosts,
            totalLikes,
            totalComments,
            avgEngagement,
            inquiries: Math.floor(Math.random() * 10), // Mock data for now
            period: `${days} days`
          }
        };
      } catch (error) {
        console.error('Error fetching analytics:', error);
        return { success: false, error: error.message };
      }
    },
  
    // ===== SEARCH METHODS =====
    
    async searchArtisans(searchTerm, filters = {}) {
      try {
        const { craftType, limit: searchLimit = 20 } = filters;
        
        const usersRef = collection(db, 'users');
        let q;
        
        if (craftType && craftType !== 'all') {
          q = query(
            usersRef,
            where('craftType', '==', craftType),
            where('isPublic', '==', true),
            limit(searchLimit)
          );
        } else {
          q = query(
            usersRef,
            where('isPublic', '==', true),
            limit(searchLimit)
          );
        }
        
        const querySnapshot = await getDocs(q);
        let users = [];
        
        querySnapshot.forEach((doc) => {
          const userData = doc.data();
          // Client-side filtering for search term
          if (!searchTerm || 
              userData.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              userData.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              userData.craftType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              userData.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              userData.skills?.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))) {
            users.push({ id: doc.id, ...userData });
          }
        });
        
        return {
          success: true,
          data: users
        };
      } catch (error) {
        console.error('Error searching artisans:', error);
        return { success: false, error: error.message };
      }
    },
  
    // ===== INTERACTION METHODS =====
    
    async likePost(postId, userId) {
      try {
        const postRef = doc(db, 'posts', postId);
        await updateDoc(postRef, {
          likes: increment(1)
        });
        
        // You could also track who liked what in a separate collection
        const likeRef = doc(db, 'likes', `${postId}_${userId}`);
        await setDoc(likeRef, {
          postId,
          userId,
          createdAt: serverTimestamp()
        });
        
        return { success: true, message: 'Post liked successfully' };
      } catch (error) {
        console.error('Error liking post:', error);
        return { success: false, error: error.message };
      }
    },
  
    async followUser(followerId, followingId) {
      try {
        // Create follow relationship
        const followRef = doc(db, 'follows', `${followerId}_${followingId}`);
        await setDoc(followRef, {
          followerId,
          followingId,
          createdAt: serverTimestamp()
        });
        
        // Update follower counts
        const followerRef = doc(db, 'users', followerId);
        const followingRef = doc(db, 'users', followingId);
        
        await Promise.all([
          updateDoc(followerRef, { following: increment(1) }),
          updateDoc(followingRef, { followers: increment(1) })
        ]);
        
        return { success: true, message: 'User followed successfully' };
      } catch (error) {
        console.error('Error following user:', error);
        return { success: false, error: error.message };
      }
    }
  };
  