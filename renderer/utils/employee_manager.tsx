import { addDoc, collection, doc, getDoc, getDocs, query, setDoc, Timestamp, where } from 'firebase/firestore';
import { database } from '../database/firebase';
import { hashPassword } from './passwordencryptor';

const db_employees = collection(database, 'employees');

export class EmployeeUtils {
    static async getManagementEmployees(){
        const q = query(db_employees, where('dept_id','==','qIvZZoS7Bnro7bD7DpWs'));
        const notifications = [];
        const promise = await getDocs(q);
    
        return promise;
    }

    static async getFinanceEmployees(){
        const q = query(db_employees, where('dept_id','==','8vJjhyQeZh12eb9MBe1U'));
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

    static async getEmployeesByIds(eids: string[]){
        const q = query(db_employees, where('eid','in', eids));
        const promise = await getDocs(q);

        return promise;
    }

    static async updatePassword(eid: string, newPass: string){

        this.getEmployee(eid).then(e => {
            const id = e.docs[0].id;
            const docRef = doc(database, 'employees', id);
            hashPassword(newPass).then((hashed) => {
                setDoc(docRef, { password: hashed }, { merge: true });
            })
        })
        
    }
}

