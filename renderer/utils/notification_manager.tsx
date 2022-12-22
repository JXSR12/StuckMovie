import { addDoc, collection, doc, FieldValue, Firestore, getDoc, getDocs, increment, onSnapshot, orderBy, query, setDoc, Timestamp, updateDoc, where } from 'firebase/firestore';
import { database } from '../database/firebase';

const db_notifications = collection(database, 'notifications');
const db_notifcounts = collection(database, 'notifcounts');

export class Notification {
    id: string;
    eid: string;
    title: string;
    message: string;
    time: Timestamp;
    isRead: boolean;

    static insert(eid: string, title: string, message: string){
        addDoc(db_notifications, {
            eid: eid,
            title: title,
            message: message,
            time: Timestamp.now(),
            isRead: false
        });

        const countRef = doc(db_notifcounts, eid);
        updateDoc(countRef, {count: increment(1)}).catch((error => {
            setDoc(countRef, {count: increment(1)});
        }));
    }

    static async getNotifications (eid: string){
        const q = query(db_notifications, where('eid', '==', eid), orderBy('time', 'desc'));
        const promise = await getDocs(q);

        return promise;
    }

    static readNotification(id: string){
        const notifRef = doc(db_notifications, id);
        updateDoc(notifRef, {isRead: true});
    }

    static getNotification(id: string){
        
    }
}



