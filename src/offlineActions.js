import { openDB } from 'idb';

const DB_NAME = 'time-track-offline';
const STORE_NAME = 'actions';

export async function getDb() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
    }
  });
}

export async function addOfflineAction(action) {
  const db = await getDb();
  await db.add(STORE_NAME, { ...action, timestamp: Date.now() });
}

export async function getOfflineActions() {
  const db = await getDb();
  return db.getAll(STORE_NAME);
}

export async function clearOfflineActions() {
  const db = await getDb();
  await db.clear(STORE_NAME);
}