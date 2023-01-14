import { faker } from "@faker-js/faker";
import { quartersToMonths } from "date-fns";
import { addDoc, collection, doc, getDoc, getDocs, query, setDoc, Timestamp, where } from "firebase/firestore";
import { database } from "../database/firebase";
import { getAuthUser } from "./auth_manager";
import { FNBMenu } from "./fnbmenu_manager";
import { Payment, PaymentStatus } from "./payment_manager";

const db_kitchen = collection(database, 'kitchens');
const db_transactions = collection(database, 'transactions');

export const FNB_TAX_PERCENTAGE = 0.11;

export class FNBTransaction {
    id: string
    time: Timestamp
    order_id: string
    payment_id: string
    member_id: string
    handler_id: string
    applied_voucher_id: string
    sub_total: number
    tax_percentage: number

    constructor(
        id: string,
        time: Timestamp,
        order_id: string,
        payment_id: string,
        member_id: string,
        handler_id: string,
        applied_voucher_id: string,
        sub_total: number
    ) {
        this.id = id
        this.time = time
        this.order_id = order_id
        this.payment_id = payment_id
        this.member_id = member_id
        this.handler_id = handler_id
        this.applied_voucher_id = applied_voucher_id
        this.tax_percentage = FNB_TAX_PERCENTAGE
        this.sub_total = sub_total
    }

    insert() {
        const q = addDoc(db_transactions, {
            id: this.id,
            type: 'FNB',
            time: this.time,
            order_id: this.order_id,
            payment_id: this.payment_id,
            member_id: this.member_id,
            handler_id: this.handler_id,
            applied_voucher_id: this.applied_voucher_id,
            tax_percentage: this.tax_percentage,
            sub_total: this.sub_total
        });
        return q;
    }
}

export async function insertFNBNewOrder(member_id: string, handler_id: string, method_id: string, payment_identifier: string, applied_voucher_id: string, items : OrderDetail[], itemsTotalPrice: number){

    const oid = faker.random.alphaNumeric(12);
    const pid = faker.random.alphaNumeric(12);
    const tid = faker.random.alphaNumeric(12);
    const ft : FNBTransaction = new FNBTransaction(tid, Timestamp.now(), oid, pid, member_id, handler_id, applied_voucher_id, itemsTotalPrice);
    const o : Order = {id: oid, time: Timestamp.now(), status: OrderStatus.Waiting, items: items} as Order;
    const p : Payment = new Payment(pid, PaymentStatus.Unconfirmed, method_id, itemsTotalPrice + (ft.tax_percentage*itemsTotalPrice), payment_identifier);
    
}


export async function getTransaction(id: string) {
    const docRef = doc(database, 'transactions', id);
    const promise = await getDoc(docRef);

    return promise;
}


export async function getAllFNBTransactions() {
    const q = query(db_transactions, where('type', '==', 'FNB'));
    const promise = await getDocs(q);

    return promise;
}

export enum OrderStatus {
    Waiting,
    Processing,
    Done
}

export interface OrderDetail {
    item: FNBMenu
    quantity: number
}

export interface Order {
    id: string
    time: Timestamp
    status: OrderStatus
    items: OrderDetail[]
}

export class Kitchen {
    id: string
    name: string
    active: boolean
    queue: Order[]

    constructor(id: string, name: string, active: boolean) {
        this.id = id
        this.name = name
        this.active = active
    }

    insert() {
        const q = addDoc(db_kitchen, {
            name: this.name,
            active: this.active
        });
        return q;
    }

    updateQueue() {
        const docRef = doc(database, 'kitchens', this.id);
        setDoc(docRef, { queue: this.queue }, { merge: true });
    }

    addToQueue(order: Order) {
        this.queue.push(order);
        this.updateQueue();
    }

    removeFromQueue(order_id: string) {
        for (let i = 0; i < this.queue.length; i++) {
            if (this.queue[i].id === order_id) {
                this.queue = this.queue.splice(i, 1);
            }
        }
        this.updateQueue();
    }
}



export async function getKitchen(id: string) {
    const docRef = doc(database, 'kitchens', id);
    const promise = await getDoc(docRef);

    return promise;
}


export async function getAllKitchens() {
    const promise = await getDocs(db_kitchen);

    return promise;
}