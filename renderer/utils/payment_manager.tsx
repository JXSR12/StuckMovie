import { addDoc, collection, doc, getDoc, getDocs, setDoc, Timestamp } from "firebase/firestore";
import { database } from "../database/firebase";

const db_payments = collection(database, 'payments');
const db_paymentmethods = collection(database, 'payments');

export class PaymentMethod {
    id: string
    name: string

    constructor(id: string, name: string) {
        this.id = id
        this.name = name
    }

    insert(){
        const q = addDoc(db_paymentmethods, {
            id: this.id,
            name: this.name
        });
        return q;
    }
}

export enum PaymentStatus {
    Unconfirmed,
    Success,
    Failed
}

export class Payment {
    id: string
    status: PaymentStatus
    method_id: string
    amount: number
    identifier: string

    constructor(
        id: string,
        status: PaymentStatus,
        method_id: string,
        amount: number,
        identifier: string
    ) {
        this.id = id
        this.status = status
        this.method_id = method_id
        this.amount = amount
        this.identifier = identifier
    }

    insert(){
        const q = addDoc(db_payments, {
            id: this.id,
            status: this.status,
            method_id: this.method_id,
            amount: this.amount,
            identifier: this.identifier
        });
        return q;
    }

    verifyPayment(){
        this.status = PaymentStatus.Success
        const docRef = doc(database, 'payments', this.id);
        setDoc(docRef, { status: this.status}, { merge: true });
    }

    simulatePayment(){
        setTimeout(this.verifyPayment, 5000);
    }
}