import { addDoc, collection, doc, getDocs, orderBy, query, Timestamp, updateDoc, where } from 'firebase/firestore';
import { database } from '../database/firebase';

const db_notifications = collection(database, 'notifications');

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
    }

    static async getNotifications (eid: string){
        const q = query(db_notifications, where('eid', '==', eid), orderBy('time'));
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



