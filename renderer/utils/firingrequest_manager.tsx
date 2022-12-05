import { addDoc, collection, getDocs, query, Timestamp, where } from 'firebase/firestore';
import { database } from '../database/firebase';
import { EmployeeUtils } from './employee_manager';
import { Notification } from './notification_manager';
import { getWarningLetters } from './warningletter_manager';

const db_firingrequests = collection(database, 'firingrequests');

export class FiringRequest{
    eid: string;
    reason: string;
    isApproved: false;

    static insert(eid: string, reason: string, isApproved: boolean){
        addDoc(db_firingrequests, {
            eid: eid,
            reason: reason,
            isApproved: isApproved,
        });
    }
}

export function issueFiringRequest(eid: string, reason: string){
    FiringRequest.insert(eid, reason, false);
    EmployeeUtils.getManagementEmployees().then((data) => {
        data.docs.map((emp) => {
            Notification.insert(emp.data().eid, 'Firing Request', 'A new firing request pending approval for employee ID ' + eid + ' for the following reasons : ' + reason );
        })
    })
}