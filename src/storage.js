// Reemplazo de window.storage (exclusivo de Claude.ai) usando Firestore.
// Cada "key" del sistema original (products, current-day, days-index, day:2026-07-05...)
// se guarda como un documento dentro de la colección "mostrador".

import { doc, getDoc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';

const COLLECTION = 'mostrador';

function ref(key) {
  return doc(db, COLLECTION, key);
}

export async function loadJSON(key, fallback) {
  try {
    const snap = await getDoc(ref(key));
    return snap.exists() ? snap.data().value : fallback;
  } catch (e) {
    console.error('Error leyendo', key, e);
    return fallback;
  }
}

export async function saveJSON(key, value) {
  try {
    await setDoc(ref(key), { value });
    return true;
  } catch (e) {
    console.error('Error guardando', key, e);
    return false;
  }
}

export async function removeKey(key) {
  try {
    await deleteDoc(ref(key));
  } catch (e) {
    // no existía, se ignora
  }
}

// Suscripción en tiempo real: cualquier cambio hecho desde OTRO dispositivo
// (por ejemplo, una venta cargada desde el celu de otra persona) llega acá
// automáticamente, sin necesidad de recargar la página.
export function subscribeJSON(key, fallback, onChange) {
  return onSnapshot(
    ref(key),
    (snap) => onChange(snap.exists() ? snap.data().value : fallback),
    (err) => console.error('Error de sincronización', key, err)
  );
}
