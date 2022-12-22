import { addDoc, collection, doc, getDoc, getDocs, Timestamp } from "firebase/firestore";
import { database } from "../database/firebase";

const db_storageitems = collection(database, 'storageitems');

export enum StorageItemCategory {
    Facility,
    Equipment
}

export class StorageItem {
    id: string
    serial: string
    name: string
    category: StorageItemCategory
    description: string
    purchase_price: number
    purchase_date: Timestamp

    constructor(
        id: string,
        serial: string,
        name: string,
        category: StorageItemCategory,
        description: string,
        purchase_price: number,
        purchase_date: Timestamp
    ) {
        this.id = id
        this.serial = serial
        this.name = name
        this.category = category
        this.description = description
        this.purchase_price = purchase_price
        this.purchase_date = purchase_date
    }

    insert() {
        const q = addDoc(db_storageitems, {
            id: this.id,
            name: this.name,
            category: this.category,
            description: this.description,
            purchase_price: this.purchase_price,
            purchase_date: this.purchase_date
        });
        return q;
    }
}

export async function getStorageItem(id: string) {
    const docRef = doc(database, 'producers', id);
    const promise = await getDoc(docRef);

    return promise;
}


export async function getAllStorageItems() {
    const promise = await getDocs(db_storageitems);

    return promise;
}