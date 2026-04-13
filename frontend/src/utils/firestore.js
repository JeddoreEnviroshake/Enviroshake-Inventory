import { db } from '../firebase';
import {
  collection, doc, getDocs, getDoc, addDoc, setDoc,
  updateDoc, deleteDoc, onSnapshot, query, orderBy
} from 'firebase/firestore';

// Generic helpers
export const getCollection = async (collectionName) => {
  const snap = await getDocs(collection(db, collectionName));
  return snap.docs.map(d => ({ ...d.data(), _id: d.id }));
};

export const addDocument = async (collectionName, data) => {
  const ref = await addDoc(collection(db, collectionName), data);
  return ref.id;
};

export const updateDocument = async (collectionName, docId, data) => {
  await updateDoc(doc(db, collectionName, docId), data);
};

export const deleteDocument = async (collectionName, docId) => {
  await deleteDoc(doc(db, collectionName, docId));
};

export const setDocument = async (collectionName, docId, data) => {
  await setDoc(doc(db, collectionName, docId), data);
};

export const getDocument = async (collectionName, docId) => {
  const snap = await getDoc(doc(db, collectionName, docId));
  return snap.exists() ? { ...snap.data(), _id: snap.id } : null;
};

// Real-time listeners
export const subscribeToCollection = (collectionName, callback, orderByField = null) => {
  const ref = orderByField
    ? query(collection(db, collectionName), orderBy(orderByField, 'desc'))
    : collection(db, collectionName);
  return onSnapshot(ref, snap => {
    callback(snap.docs.map(d => ({ ...d.data(), _id: d.id })));
  });
};

export const subscribeToDocument = (collectionName, docId, callback) => {
  return onSnapshot(doc(db, collectionName, docId), snap => {
    callback(snap.exists() ? { ...snap.data(), _id: snap.id } : null);
  });
};
