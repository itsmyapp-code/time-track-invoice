import { db, storage } from "./firebase";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc
} from "firebase/firestore";

/**
 * Upload an image to Firebase Storage and save its metadata (including storage path) in Firestore
 * @param {Object} params
 * @param {string} params.userId
 * @param {string} params.jobId
 * @param {string} params.stage
 * @param {string} params.date
 * @param {File} params.file
 */
export async function uploadJobPhoto({ userId, jobId, stage, date, file }) {
  // 1. Build storage path and upload image
  const storagePath = `jobPhotos/${userId}/${jobId}/${Date.now()}_${file.name}`;
  const storageRef = ref(storage, storagePath);
  await uploadBytes(storageRef, file);
  const imageUrl = await getDownloadURL(storageRef);

  // 2. Save metadata (including storagePath) to Firestore
  await addDoc(collection(db, "users", userId, "jobs", jobId, "photos"), {
    stage,
    date,
    imageUrl,
    storagePath,        // Store the Firebase Storage path
    createdAt: Date.now(),
  });
}

/**
 * Fetch all photos for a job from Firestore
 * @param {string} userId
 * @param {string} jobId
 * @returns {Promise<Array<{id, stage, date, imageUrl, storagePath, createdAt}>>}
 */
export async function fetchJobPhotos(jobId, userId) {
  const colRef = collection(db, "users", userId, "jobs", jobId, "photos");
  const snapshot = await getDocs(colRef);
  return snapshot.docs.map(docItem => ({
    id: docItem.id,
    ...docItem.data()
  }));
}

/**
 * Delete a photo from both Firebase Storage (using storagePath) and Firestore
 * @param {string} userId
 * @param {string} jobId
 * @param {Object} photo - Photo object with id and storagePath
 */
export async function deleteJobPhoto(userId, jobId, photo) {
  // Remove from storage using storagePath
  if (photo.storagePath) {
    const storageRef = ref(storage, photo.storagePath);
    try {
      await deleteObject(storageRef);
    } catch (e) {
      // Ignore, often due to permissions or not found
    }
  }
  // Remove from Firestore
  await deleteDoc(doc(db, "users", userId, "jobs", jobId, "photos", photo.id));
}