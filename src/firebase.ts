import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInAnonymously,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  getDocs,
  getDocFromServer,
  collection,
  onSnapshot,
  writeBatch,
  Unsubscribe,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { DayReportData, Settings } from './utils/reportLogic';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// CRITICAL: The app will break without this explicit firestoreDatabaseId line
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Validate connection on boot
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'reports', 'connection_test'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): FirestoreErrorInfo {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.warn('Firestore Error Context: ', JSON.stringify(errInfo));
  return errInfo;
}

/**
 * Strips heavy data (like huge raw base64 images) before pushing to Firestore
 * to protect against the 1MB document limit.
 */
function sanitizeReportForFirestore(data: DayReportData): Record<string, unknown> {
  const safePhotos = (data.photos || []).map((p) => {
    // If URL is longer than 50KB base64, truncate to prevent 1MB limit crash
    if (p.url && p.url.length > 50000) {
      return {
        id: p.id,
        name: p.name,
        url: p.url.substring(0, 500) + '...[compacted]',
      };
    }
    return p;
  });

  return {
    date: data.date,
    orders: data.orders || [],
    customFrames: data.customFrames || [],
    incomes: data.incomes || [],
    boothCondition: data.boothCondition,
    stockCondition: data.stockCondition,
    issues: data.issues || [],
    purchases: data.purchases || [],
    photos: safePhotos,
    notes: data.notes || '',
    heldMoneys: data.heldMoneys || [],
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Save / Update a single day's report in Firestore
 */
export async function saveDayReportToFirestore(report: DayReportData): Promise<boolean> {
  const path = `reports/${report.date}`;
  try {
    const docRef = doc(db, 'reports', report.date);
    const sanitized = sanitizeReportForFirestore(report);
    await setDoc(docRef, sanitized, { merge: true });
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    return false;
  }
}

/**
 * Subscribe in real-time to all reports in Firestore
 * Whenever any day is modified (by HP Kasir or Laptop Owner), this notifies listener.
 */
export function subscribeToAllReports(
  onData: (reportsMap: Record<string, DayReportData>) => void,
  onError?: (err: FirestoreErrorInfo) => void
): Unsubscribe {
  const path = 'reports';
  const reportsCol = collection(db, path);

  return onSnapshot(
    reportsCol,
    (snapshot) => {
      const map: Record<string, DayReportData> = {};
      snapshot.forEach((docSnap) => {
        const d = docSnap.data() as DayReportData;
        if (d && d.date) {
          map[d.date] = {
            date: d.date,
            orders: Array.isArray(d.orders) ? d.orders : [],
            customFrames: Array.isArray(d.customFrames) ? d.customFrames : [],
            incomes: Array.isArray(d.incomes) ? d.incomes : [],
            boothCondition: d.boothCondition || {
              camera: 'OK',
              ringLight: 'OK',
              screen: 'OK',
              printer: 'OK',
              cleanliness: 'OK',
            },
            stockCondition: d.stockCondition || {
              bk: 'OK',
              c: 'OK',
              y: 'OK',
              m: 'OK',
              lc: 'OK',
              lm: 'OK',
              paper: 'OK',
              inkBox: 'OK',
            },
            issues: Array.isArray(d.issues) ? d.issues : [],
            purchases: Array.isArray(d.purchases) ? d.purchases : [],
            photos: Array.isArray(d.photos) ? d.photos : [],
            notes: d.notes || '',
            heldMoneys: Array.isArray(d.heldMoneys) ? d.heldMoneys : [],
          };
        }
      });
      onData(map);
    },
    (error) => {
      const info = handleFirestoreError(error, OperationType.LIST, path);
      if (onError) onError(info);
    }
  );
}

/**
 * Save settings to Firestore
 */
export async function saveSettingsToFirestore(settings: Settings): Promise<boolean> {
  const path = 'settings/general';
  try {
    const docRef = doc(db, 'settings', 'general');
    await setDoc(
      docRef,
      {
        ...settings,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    return false;
  }
}

/**
 * Subscribe in real-time to general settings
 */
export function subscribeToSettings(
  onData: (settings: Settings) => void,
  onError?: (err: FirestoreErrorInfo) => void
): Unsubscribe {
  const path = 'settings/general';
  const docRef = doc(db, 'settings', 'general');

  return onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as Settings;
        if (data && data.boothName) {
          onData({
            boothName: data.boothName,
            attendantName: data.attendantName,
            ownerPhone: data.ownerPhone,
            logoUrl: data.logoUrl || '',
          });
        }
      }
    },
    (error) => {
      const info = handleFirestoreError(error, OperationType.GET, path);
      if (onError) onError(info);
    }
  );
}

/**
 * Force bidirectional re-synchronization of all reports and settings with Firebase Firestore.
 * Pushes any local data that isn't on Firestore or is newer, and pulls all documents from Firestore.
 */
export async function forceResyncAllData(
  localReports: Record<string, DayReportData>,
  localSettings: Settings
): Promise<{
  success: boolean;
  pushedCount: number;
  fetchedCount: number;
  mergedReports: Record<string, DayReportData>;
  mergedSettings: Settings;
  error?: string;
}> {
  try {
    // 1. Fetch all documents directly from Firestore server
    const reportsCol = collection(db, 'reports');
    const snapshot = await getDocs(reportsCol);
    const remoteMap: Record<string, DayReportData> = {};

    snapshot.forEach((docSnap) => {
      if (docSnap.id === 'connection_test') return;
      const d = docSnap.data() as DayReportData;
      if (d && d.date) {
        remoteMap[d.date] = {
          date: d.date,
          orders: Array.isArray(d.orders) ? d.orders : [],
          customFrames: Array.isArray(d.customFrames) ? d.customFrames : [],
          incomes: Array.isArray(d.incomes) ? d.incomes : [],
          boothCondition: d.boothCondition || {
            camera: 'OK',
            ringLight: 'OK',
            screen: 'OK',
            printer: 'OK',
            cleanliness: 'OK',
          },
          stockCondition: d.stockCondition || {
            bk: 'OK',
            c: 'OK',
            y: 'OK',
            m: 'OK',
            lc: 'OK',
            lm: 'OK',
            paper: 'OK',
            inkBox: 'OK',
          },
          issues: Array.isArray(d.issues) ? d.issues : [],
          purchases: Array.isArray(d.purchases) ? d.purchases : [],
          photos: Array.isArray(d.photos) ? d.photos : [],
          notes: d.notes || '',
          heldMoneys: Array.isArray(d.heldMoneys) ? d.heldMoneys : [],
        };
      }
    });

    const fetchedCount = Object.keys(remoteMap).length;
    let pushedCount = 0;

    // 2. Identify local reports that need to be uploaded to Firestore
    for (const [dateKey, localData] of Object.entries(localReports)) {
      if (!remoteMap[dateKey]) {
        // Upload local report to Firestore so cloud has it
        await saveDayReportToFirestore(localData);
        pushedCount++;
      }
    }

    // 3. Merged reports: Remote takes precedence for live cloud sync, plus any local additions
    const mergedReports: Record<string, DayReportData> = {
      ...localReports,
      ...remoteMap,
    };

    // 4. Sync Settings
    let mergedSettings = { ...localSettings };
    const settingsDoc = await getDoc(doc(db, 'settings', 'general'));
    if (settingsDoc.exists()) {
      const data = settingsDoc.data() as Settings;
      if (data && data.boothName) {
        mergedSettings = {
          boothName: data.boothName,
          attendantName: data.attendantName,
          ownerPhone: data.ownerPhone,
          logoUrl: data.logoUrl || localSettings.logoUrl || '',
        };
      }
    } else {
      await saveSettingsToFirestore(localSettings);
    }

    return {
      success: true,
      pushedCount,
      fetchedCount,
      mergedReports,
      mergedSettings,
    };
  } catch (error) {
    const info = handleFirestoreError(error, OperationType.GET, 'reports');
    return {
      success: false,
      pushedCount: 0,
      fetchedCount: 0,
      mergedReports: localReports,
      mergedSettings: localSettings,
      error: info.error,
    };
  }
}


export async function resetAllFirestoreReports(): Promise<boolean> {
  const path = 'reports';
  try {
    const reportsCol = collection(db, path);
    const snapshot = await getDocs(reportsCol);
    const batch = writeBatch(db);

    snapshot.forEach((d) => {
      batch.delete(d.ref);
    });

    await batch.commit();
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
    return false;
  }
}

/**
 * Reset / Delete reports in Firestore for a specific date range [startDate, endDate]
 */
export async function resetDateRangeReports(
  startDate: string,
  endDate: string
): Promise<{ success: boolean; deletedDates: string[] }> {
  const path = 'reports';
  try {
    const reportsCol = collection(db, path);
    const snapshot = await getDocs(reportsCol);
    const batch = writeBatch(db);
    const deletedDates: string[] = [];

    snapshot.forEach((d) => {
      const docDate = d.id;
      if (docDate >= startDate && docDate <= endDate) {
        batch.delete(d.ref);
        deletedDates.push(docDate);
      }
    });

    if (deletedDates.length > 0) {
      await batch.commit();
    }
    return { success: true, deletedDates };
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
    return { success: false, deletedDates: [] };
  }
}

/**
 * Helper to sign in with Google Popup
 */
export async function signInWithGoogle(): Promise<User | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Google Sign In Error:', error);
    throw error;
  }
}

/**
 * Auto sign-in anonymously if available, or listen to auth changes
 */
export function initAuthListener(onUserChange: (user: User | null) => void): Unsubscribe {
  return onAuthStateChanged(auth, (user) => {
    onUserChange(user);
  });
}

export default db;
