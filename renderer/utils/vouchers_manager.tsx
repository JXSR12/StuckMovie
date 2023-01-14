import { addDoc, collection, doc, getDoc, getDocs, Timestamp } from "firebase/firestore";
import { database } from "../database/firebase";

const db_vouchers = collection(database, 'vouchers');

export enum VoucherCategory {
    Ticket,
    Concession
}

export enum VoucherType {
    Discount,
    Cashback
}

export class Voucher {
    id: string
    valid_until: Timestamp
    linked_member_id: string
    category: VoucherCategory
    type: VoucherType
    value: number
    is_used: boolean

    constructor(
        id: string,
        valid_until: Timestamp,
        linked_member_id: string,
        category: VoucherCategory,
        type: VoucherType,
        value: number,
        is_used: boolean
    ) {
        this.id = id
        this.valid_until = valid_until
        this.linked_member_id = linked_member_id
        this.category = category
        this.type = type
        this.value = value
        this.is_used = is_used
    }

    
}