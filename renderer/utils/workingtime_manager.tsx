import { addDoc, collection, doc, getDoc, getDocs, query, setDoc, where } from "firebase/firestore";
import { database } from "../database/firebase";
import { IAuth } from "./auth_manager";
import { EmployeeUtils } from "./employee_manager";
import { Notification } from "./notification_manager";

const db_workingtimes = collection(database, 'workingtimes');

export interface WorkingTimeDetail {
    weekday: number
    starthour: number
    startminute: number
    endhour: number
    endminute: number
}

export class WorkingTime {
    eid: string
    details: WorkingTimeDetail[]

    constructor(eid: string, details: WorkingTimeDetail[]) {
        this.eid = eid
        this.details = details
    }

    insert() {
        const q = addDoc(db_workingtimes, {
            eid: this.eid,
            details: this.details
        });
        return q;
    }

    static async seedWorkingTimes() {
        EmployeeUtils.getAllEmployees().then((emps) => {
            emps.docs.map((emp) => {
                const e = { ...emp.data() } as IAuth;

                var details: WorkingTimeDetail[] = [];

                for (let i = 1; i <= 6; i++) {
                    var start_hour = 8 + Math.floor(Math.random() * 8);
                    var start_minute = 15 * Math.floor(Math.random() * 4);
                    details.push({ weekday: i, starthour: start_hour, startminute: start_minute, endhour: start_hour + 8, endminute: start_minute} as WorkingTimeDetail);
                }

                const worktime = new WorkingTime(e.eid, details);
                worktime.insert();
            })
        });
    }
}

export async function updateWorkingTime(wtId: string, newdetails: WorkingTimeDetail[]) {
    const p = await getWorkingTime(wtId).then((wt) => {
        const worktime = {...wt.data()} as WorkingTime;
        const docRef = doc(database, 'workingtimes', wtId);

        setDoc(docRef, { details: newdetails }, { merge: true }).then(() => {
            Notification.insert(worktime.eid, 'Working Time Changes', 'Changes are made to your working time, please check it in the \'My Working Time\' app.');
            }
        );
    });

    return p;
}

export async function getWorkingTime(id: string) {
    const docRef = doc(database, 'workingtimes', id);
    const promise = await getDoc(docRef);

    return promise;
}


export async function getWorkingTimes(eid: string) {
    const q = query(db_workingtimes, where('eid', '==', eid))
    const promise = await getDocs(q);

    return promise;
}

