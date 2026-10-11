import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  getDocs, 
  onSnapshot, 
  writeBatch,
  Unsubscribe 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { 
  LateRecord, 
  Student, 
  CounselingEntry, 
  GuruBK, 
  KKK, 
  TimKesiswaan, 
  Major, 
  SchoolClass, 
  UserAccount, 
  AppSettings 
} from '../types/patrol';
import { 
  INITIAL_STUDENTS, 
  INITIAL_LATE_RECORDS, 
  INITIAL_COUNSELING_ENTRIES, 
  INITIAL_GURU_BK, 
  INITIAL_KKK, 
  INITIAL_TIM_KESISWAAN, 
  MAJORS, 
  INITIAL_CLASSES, 
  INITIAL_ACCOUNTS 
} from '../data/initialData';
import { DEFAULT_SETTINGS } from '../types/patrol';

export interface CloudSyncStatus {
  isConnected: boolean;
  isSyncing: boolean;
  lastSync: Date | null;
  error: string | null;
}

let syncStatus: CloudSyncStatus = {
  isConnected: false,
  isSyncing: false,
  lastSync: null,
  error: null,
};

const statusListeners = new Set<(status: CloudSyncStatus) => void>();

function updateStatus(updates: Partial<CloudSyncStatus>) {
  syncStatus = { ...syncStatus, ...updates };
  statusListeners.forEach((listener) => {
    try {
      listener(syncStatus);
    } catch (e) {
      console.error('Error in sync status listener', e);
    }
  });
}

export function subscribeSyncStatus(listener: (status: CloudSyncStatus) => void): () => void {
  statusListeners.add(listener);
  listener(syncStatus);
  return () => {
    statusListeners.delete(listener);
  };
}

export function getSyncStatus(): CloudSyncStatus {
  return syncStatus;
}

// Global active unsubscribers
const activeUnsubscribes: Unsubscribe[] = [];

/**
 * Seed initial data to Firestore if collections are empty
 */
export async function seedInitialDataIfEmpty(): Promise<void> {
  try {
    updateStatus({ isSyncing: true });

    // Check students collection
    const studentsSnap = await getDocs(collection(db, 'students'));
    if (studentsSnap.empty) {
      console.log('Seeding initial data into Firestore...');
      
      // Batch write students
      const batch = writeBatch(db);
      INITIAL_STUDENTS.slice(0, 50).forEach((student) => {
        batch.set(doc(db, 'students', student.id), student);
      });
      // Batch write records
      INITIAL_LATE_RECORDS.forEach((rec) => {
        batch.set(doc(db, 'records', rec.id), rec);
      });
      // Batch write counseling
      INITIAL_COUNSELING_ENTRIES.forEach((c) => {
        batch.set(doc(db, 'counseling', c.id), c);
      });
      // Batch write master data
      INITIAL_GURU_BK.forEach((g) => {
        batch.set(doc(db, 'guruBK', g.id), g);
      });
      INITIAL_KKK.forEach((k) => {
        batch.set(doc(db, 'kkk', k.id), k);
      });
      INITIAL_TIM_KESISWAAN.forEach((t) => {
        batch.set(doc(db, 'timKesiswaan', t.id), t);
      });
      MAJORS.forEach((m) => {
        batch.set(doc(db, 'majors', m.id), m);
      });
      INITIAL_CLASSES.forEach((c) => {
        batch.set(doc(db, 'classes', c.id), c);
      });
      INITIAL_ACCOUNTS.forEach((a) => {
        batch.set(doc(db, 'accounts', a.id), a);
      });
      batch.set(doc(db, 'settings', 'school_settings'), DEFAULT_SETTINGS);

      await batch.commit();
      console.log('Initial seed completed successfully');
    }

    updateStatus({ isConnected: true, isSyncing: false, lastSync: new Date(), error: null });
  } catch (err) {
    console.error('Failed to seed or connect to Firestore', err);
    updateStatus({ isConnected: false, isSyncing: false, error: String(err) });
  }
}

/**
 * Setup Realtime Listeners for all collections
 */
export interface RealtimeSyncCallbacks {
  onRecordsChange?: (records: LateRecord[]) => void;
  onStudentsChange?: (students: Student[]) => void;
  onCounselingChange?: (entries: CounselingEntry[]) => void;
  onGuruBKChange?: (items: GuruBK[]) => void;
  onKKKChange?: (items: KKK[]) => void;
  onTimKesiswaanChange?: (items: TimKesiswaan[]) => void;
  onMajorsChange?: (items: Major[]) => void;
  onClassesChange?: (items: SchoolClass[]) => void;
  onAccountsChange?: (accounts: UserAccount[]) => void;
  onSettingsChange?: (settings: AppSettings) => void;
}

export function startRealtimeSync(callbacks: RealtimeSyncCallbacks): () => void {
  // Clear any existing listeners
  stopRealtimeSync();

  try {
    // 1. Records
    if (callbacks.onRecordsChange) {
      const unsub = onSnapshot(
        collection(db, 'records'),
        (snap) => {
          updateStatus({ isConnected: true, lastSync: new Date() });
          const items: LateRecord[] = [];
          snap.forEach((d) => items.push(d.data() as LateRecord));
          callbacks.onRecordsChange!(items);
        },
        (error) => handleFirestoreError(error, OperationType.LIST, 'records')
      );
      activeUnsubscribes.push(unsub);
    }

    // 2. Students
    if (callbacks.onStudentsChange) {
      const unsub = onSnapshot(
        collection(db, 'students'),
        (snap) => {
          updateStatus({ isConnected: true, lastSync: new Date() });
          const items: Student[] = [];
          snap.forEach((d) => items.push(d.data() as Student));
          callbacks.onStudentsChange!(items);
        },
        (error) => handleFirestoreError(error, OperationType.LIST, 'students')
      );
      activeUnsubscribes.push(unsub);
    }

    // 3. Counseling
    if (callbacks.onCounselingChange) {
      const unsub = onSnapshot(
        collection(db, 'counseling'),
        (snap) => {
          updateStatus({ isConnected: true, lastSync: new Date() });
          const items: CounselingEntry[] = [];
          snap.forEach((d) => items.push(d.data() as CounselingEntry));
          callbacks.onCounselingChange!(items);
        },
        (error) => handleFirestoreError(error, OperationType.LIST, 'counseling')
      );
      activeUnsubscribes.push(unsub);
    }

    // 4. Guru BK
    if (callbacks.onGuruBKChange) {
      const unsub = onSnapshot(
        collection(db, 'guruBK'),
        (snap) => {
          const items: GuruBK[] = [];
          snap.forEach((d) => items.push(d.data() as GuruBK));
          callbacks.onGuruBKChange!(items);
        },
        (error) => handleFirestoreError(error, OperationType.LIST, 'guruBK')
      );
      activeUnsubscribes.push(unsub);
    }

    // 5. KKK
    if (callbacks.onKKKChange) {
      const unsub = onSnapshot(
        collection(db, 'kkk'),
        (snap) => {
          const items: KKK[] = [];
          snap.forEach((d) => items.push(d.data() as KKK));
          callbacks.onKKKChange!(items);
        },
        (error) => handleFirestoreError(error, OperationType.LIST, 'kkk')
      );
      activeUnsubscribes.push(unsub);
    }

    // 6. Tim Kesiswaan
    if (callbacks.onTimKesiswaanChange) {
      const unsub = onSnapshot(
        collection(db, 'timKesiswaan'),
        (snap) => {
          const items: TimKesiswaan[] = [];
          snap.forEach((d) => items.push(d.data() as TimKesiswaan));
          callbacks.onTimKesiswaanChange!(items);
        },
        (error) => handleFirestoreError(error, OperationType.LIST, 'timKesiswaan')
      );
      activeUnsubscribes.push(unsub);
    }

    // 7. Majors
    if (callbacks.onMajorsChange) {
      const unsub = onSnapshot(
        collection(db, 'majors'),
        (snap) => {
          const items: Major[] = [];
          snap.forEach((d) => items.push(d.data() as Major));
          callbacks.onMajorsChange!(items);
        },
        (error) => handleFirestoreError(error, OperationType.LIST, 'majors')
      );
      activeUnsubscribes.push(unsub);
    }

    // 8. Classes
    if (callbacks.onClassesChange) {
      const unsub = onSnapshot(
        collection(db, 'classes'),
        (snap) => {
          const items: SchoolClass[] = [];
          snap.forEach((d) => items.push(d.data() as SchoolClass));
          callbacks.onClassesChange!(items);
        },
        (error) => handleFirestoreError(error, OperationType.LIST, 'classes')
      );
      activeUnsubscribes.push(unsub);
    }

    // 9. Accounts
    if (callbacks.onAccountsChange) {
      const unsub = onSnapshot(
        collection(db, 'accounts'),
        (snap) => {
          const items: UserAccount[] = [];
          snap.forEach((d) => items.push(d.data() as UserAccount));
          callbacks.onAccountsChange!(items);
        },
        (error) => handleFirestoreError(error, OperationType.LIST, 'accounts')
      );
      activeUnsubscribes.push(unsub);
    }

    // 10. Settings
    if (callbacks.onSettingsChange) {
      const unsub = onSnapshot(
        doc(db, 'settings', 'school_settings'),
        (snap) => {
          if (snap.exists()) {
            callbacks.onSettingsChange!(snap.data() as AppSettings);
          }
        },
        (error) => handleFirestoreError(error, OperationType.GET, 'settings/school_settings')
      );
      activeUnsubscribes.push(unsub);
    }

    updateStatus({ isConnected: true });
  } catch (err) {
    console.error('Failed to setup realtime listeners', err);
    updateStatus({ isConnected: false, error: String(err) });
  }

  return stopRealtimeSync;
}

export function stopRealtimeSync(): void {
  while (activeUnsubscribes.length > 0) {
    const unsub = activeUnsubscribes.pop();
    if (unsub) {
      try {
        unsub();
      } catch (e) {
        console.error('Error closing firestore listener', e);
      }
    }
  }
}

// ================= CLOUD MUTATION ACTIONS ================= //

export async function saveRecordCloud(record: LateRecord): Promise<void> {
  const path = `records/${record.id}`;
  try {
    updateStatus({ isSyncing: true });
    await setDoc(doc(db, 'records', record.id), record, { merge: true });
    updateStatus({ isSyncing: false, lastSync: new Date() });
  } catch (error) {
    updateStatus({ isSyncing: false });
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteRecordCloud(recordId: string): Promise<void> {
  const path = `records/${recordId}`;
  try {
    updateStatus({ isSyncing: true });
    await deleteDoc(doc(db, 'records', recordId));
    updateStatus({ isSyncing: false, lastSync: new Date() });
  } catch (error) {
    updateStatus({ isSyncing: false });
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveStudentCloud(student: Student): Promise<void> {
  const path = `students/${student.id}`;
  try {
    updateStatus({ isSyncing: true });
    await setDoc(doc(db, 'students', student.id), student, { merge: true });
    updateStatus({ isSyncing: false, lastSync: new Date() });
  } catch (error) {
    updateStatus({ isSyncing: false });
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function saveStudentsBatchCloud(students: Student[]): Promise<void> {
  try {
    updateStatus({ isSyncing: true });
    const batch = writeBatch(db);
    students.forEach((s) => {
      batch.set(doc(db, 'students', s.id), s, { merge: true });
    });
    await batch.commit();
    updateStatus({ isSyncing: false, lastSync: new Date() });
  } catch (error) {
    updateStatus({ isSyncing: false });
    handleFirestoreError(error, OperationType.WRITE, 'students');
  }
}

export async function deleteStudentCloud(studentId: string): Promise<void> {
  const path = `students/${studentId}`;
  try {
    updateStatus({ isSyncing: true });
    await deleteDoc(doc(db, 'students', studentId));
    updateStatus({ isSyncing: false, lastSync: new Date() });
  } catch (error) {
    updateStatus({ isSyncing: false });
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveCounselingCloud(entry: CounselingEntry): Promise<void> {
  const path = `counseling/${entry.id}`;
  try {
    updateStatus({ isSyncing: true });
    await setDoc(doc(db, 'counseling', entry.id), entry, { merge: true });
    updateStatus({ isSyncing: false, lastSync: new Date() });
  } catch (error) {
    updateStatus({ isSyncing: false });
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteCounselingCloud(id: string): Promise<void> {
  const path = `counseling/${id}`;
  try {
    updateStatus({ isSyncing: true });
    await deleteDoc(doc(db, 'counseling', id));
    updateStatus({ isSyncing: false, lastSync: new Date() });
  } catch (error) {
    updateStatus({ isSyncing: false });
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveAccountCloud(account: UserAccount): Promise<void> {
  const path = `accounts/${account.id}`;
  try {
    updateStatus({ isSyncing: true });
    await setDoc(doc(db, 'accounts', account.id), account, { merge: true });
    updateStatus({ isSyncing: false, lastSync: new Date() });
  } catch (error) {
    updateStatus({ isSyncing: false });
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteAccountCloud(accountId: string): Promise<void> {
  const path = `accounts/${accountId}`;
  try {
    updateStatus({ isSyncing: true });
    await deleteDoc(doc(db, 'accounts', accountId));
    updateStatus({ isSyncing: false, lastSync: new Date() });
  } catch (error) {
    updateStatus({ isSyncing: false });
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveMasterGuruBKCloud(item: GuruBK): Promise<void> {
  const path = `guruBK/${item.id}`;
  try {
    await setDoc(doc(db, 'guruBK', item.id), item, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteMasterGuruBKCloud(id: string): Promise<void> {
  const path = `guruBK/${id}`;
  try {
    await deleteDoc(doc(db, 'guruBK', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveMasterKKKCloud(item: KKK): Promise<void> {
  const path = `kkk/${item.id}`;
  try {
    await setDoc(doc(db, 'kkk', item.id), item, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteMasterKKKCloud(id: string): Promise<void> {
  const path = `kkk/${id}`;
  try {
    await deleteDoc(doc(db, 'kkk', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveMasterTimKesiswaanCloud(item: TimKesiswaan): Promise<void> {
  const path = `timKesiswaan/${item.id}`;
  try {
    await setDoc(doc(db, 'timKesiswaan', item.id), item, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteMasterTimKesiswaanCloud(id: string): Promise<void> {
  const path = `timKesiswaan/${id}`;
  try {
    await deleteDoc(doc(db, 'timKesiswaan', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveMasterMajorCloud(item: Major): Promise<void> {
  const path = `majors/${item.id}`;
  try {
    await setDoc(doc(db, 'majors', item.id), item, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteMasterMajorCloud(id: string): Promise<void> {
  const path = `majors/${id}`;
  try {
    await deleteDoc(doc(db, 'majors', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function resetViolationsCloud(): Promise<void> {
  try {
    updateStatus({ isSyncing: true });
    const recordsSnap = await getDocs(collection(db, 'records'));
    const counselingSnap = await getDocs(collection(db, 'counseling'));
    const batch = writeBatch(db);
    recordsSnap.forEach((d) => batch.delete(d.ref));
    counselingSnap.forEach((d) => batch.delete(d.ref));
    await batch.commit();
    updateStatus({ isSyncing: false, lastSync: new Date() });
  } catch (error) {
    updateStatus({ isSyncing: false });
    handleFirestoreError(error, OperationType.DELETE, 'records/counseling');
  }
}

export async function wipeAllCloudData(): Promise<void> {
  try {
    updateStatus({ isSyncing: true });
    const [recSnap, cslSnap, stdSnap, clsSnap] = await Promise.all([
      getDocs(collection(db, 'records')),
      getDocs(collection(db, 'counseling')),
      getDocs(collection(db, 'students')),
      getDocs(collection(db, 'classes')),
    ]);
    const batch = writeBatch(db);
    recSnap.forEach((d) => batch.delete(d.ref));
    cslSnap.forEach((d) => batch.delete(d.ref));
    stdSnap.forEach((d) => batch.delete(d.ref));
    clsSnap.forEach((d) => batch.delete(d.ref));
    await batch.commit();
    updateStatus({ isSyncing: false, lastSync: new Date() });
  } catch (error) {
    updateStatus({ isSyncing: false });
    handleFirestoreError(error, OperationType.DELETE, 'operational-data');
  }
}

export async function saveMasterClassCloud(item: SchoolClass): Promise<void> {
  const path = `classes/${item.id}`;
  try {
    await setDoc(doc(db, 'classes', item.id), item, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteMasterClassCloud(id: string): Promise<void> {
  const path = `classes/${id}`;
  try {
    await deleteDoc(doc(db, 'classes', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveSettingsCloud(settings: AppSettings): Promise<void> {
  const path = 'settings/school_settings';
  try {
    updateStatus({ isSyncing: true });
    await setDoc(doc(db, 'settings', 'school_settings'), settings, { merge: true });
    updateStatus({ isSyncing: false, lastSync: new Date() });
  } catch (error) {
    updateStatus({ isSyncing: false });
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}
