import { 
  collection, 
  getDocs, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot,
  serverTimestamp,
  doc,
  setDoc,
  deleteDoc,
  getDoc,
  Timestamp,
  GeoPoint
} from 'firebase/firestore';
import { db, auth, Route, CrowdReport, CrowdStatus, OperationType, handleFirestoreError } from '../lib/firebase';

const ROUTES_COLLECTION = 'routes';
const ADMINS_COLLECTION = 'admins';

export const busService = {
  async getRoutes(): Promise<Route[]> {
    try {
      const querySnapshot = await getDocs(collection(db, ROUTES_COLLECTION));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Route));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, ROUTES_COLLECTION);
      return [];
    }
  },

  async isAdmin(): Promise<boolean> {
    if (!auth.currentUser) return false;
    try {
      const adminDoc = await getDoc(doc(db, ADMINS_COLLECTION, auth.currentUser.uid));
      return adminDoc.exists();
    } catch (error) {
      return false;
    }
  },

  async seedRoutes() {
    const initialRoutes = [
      {
        number: "H-01",
        name: "Hassan KSRTC Stand to Hemavathi Nagar",
        sharedAutos: [
          { name: "Manjunath Auto", phone: "9845012345" },
          { name: "Hassan Shared", phone: "9845054321" }
        ]
      },
      {
        number: "H-05",
        name: "Old Bus Stand to Salagame Road colleges",
        sharedAutos: [
          { name: "Suresh Shared", phone: "9900112233" }
        ]
      },
      {
        number: "H-08",
        name: "Dairy Circle to Malnad Engineering College (MCE)",
        sharedAutos: [
          { name: "College Auto Service", phone: "8877665544" }
        ]
      }
    ];

    for (const route of initialRoutes) {
      await addDoc(collection(db, ROUTES_COLLECTION), route);
    }
    
    // Seed the first user as admin for development if they don't exist
    if (auth.currentUser) {
      await setDoc(doc(db, ADMINS_COLLECTION, auth.currentUser.uid), {
        email: auth.currentUser.email,
        role: 'admin'
      });
    }
  },

  async addRoute(route: Omit<Route, 'id'>) {
    try {
      await addDoc(collection(db, ROUTES_COLLECTION), route);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, ROUTES_COLLECTION);
    }
  },

  async deleteRoute(routeId: string) {
    try {
      await deleteDoc(doc(db, ROUTES_COLLECTION, routeId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${ROUTES_COLLECTION}/${routeId}`);
    }
  },

  subscribeToReports(routeId: string, callback: (reports: CrowdReport[]) => void) {
    const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000);
    const q = query(
      collection(db, ROUTES_COLLECTION, routeId, 'reports'),
      where('timestamp', '>=', Timestamp.fromDate(fifteenMinsAgo)),
      orderBy('timestamp', 'desc'),
      limit(10)
    );

    return onSnapshot(q, (snapshot) => {
      const reports = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as CrowdReport));
      callback(reports);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `${ROUTES_COLLECTION}/${routeId}/reports`);
    });
  },

  async submitReport(routeId: string, status: CrowdStatus, location?: { lat: number, lng: number }) {
    if (!auth.currentUser) throw new Error("Must be signed in to report");

    const path = `${ROUTES_COLLECTION}/${routeId}/reports`;
    try {
      const reportData = {
        routeId,
        status,
        userId: auth.currentUser.uid,
        timestamp: serverTimestamp(),
        ...(location && { location: new GeoPoint(location.lat, location.lng) })
      };
      await addDoc(collection(db, path), reportData);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  }
};
