import { addDoc, collection, getDocs, query, Timestamp, where } from 'firebase/firestore';
import { database } from '../database/firebase';
import { issueFiringRequest } from './firingrequest_manager';
import { Notification } from './notification_manager';

const db_warningletters = collection(database, 'warningletters');

export class WarningLetter{
    eid: string;
    reason: string;

    static insert(eid: string, reason: string){
        const q = addDoc(db_warningletters, {
            eid: eid,
            reason: reason,
        });
        return q;
    }
}

export function issueWarningLetter(eid: string, reason: string){
    WarningLetter.insert(eid, reason).then((e) => {
        getWarningLetters(eid).then((data) => {
            const count = data.size;
            if(count >= 3){
                issueFiringRequest(eid, "Received three (3) warning letters")
            }
        })
    })
    
    Notification.insert(eid, 'Warning Letter', 'You have received a warning letter for ' + reason);
    
}

export async function getWarningLetters(eid :string){
    const q = query(db_warningletters, where('eid','==',eid));
    const promise = await getDocs(q);

    return promise;
}