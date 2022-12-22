import { addDoc, collection, getDoc, getDocs, query, Timestamp, where } from 'firebase/firestore';
import { database } from '../database/firebase';

const db_employees = collection(database, 'employees');

export class EmployeeUtils {
    static async getManagementEmployees(){
        const q = query(db_employees, where('dept_id','==','qIvZZoS7Bnro7bD7DpWs'));
        const notifications = [];
        const promise = await getDocs(q);
    
        return promise;
    }

    static async getEmployee(eid: string){
        const q = query(db_employees, where('eid','==', eid));
        const promise = await getDocs(q);

        return promise;
    }

    static async getAllEmployees(){
        const promise = await getDocs(db_employees);

        return promise;
    }
}

