import { faker } from "@faker-js/faker";
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, setDoc, Timestamp } from "firebase/firestore";
import { database } from "../database/firebase";

const db_storageitems = collection(database, 'storageitems');

export enum StorageItemCategory {
    Facility,
    Equipment
}

export enum StorageItemStatus {
    Usable,
    Unusable,
}

export class StorageItem {
    serial: string
    name: string
    type: string
    category: StorageItemCategory
    description: string
    purchase_price: number
    purchase_date: Timestamp
    status: StorageItemStatus

    constructor(
        serial: string,
        name: string,
        type: string,
        category: StorageItemCategory,
        description: string,
        purchase_price: number,
        purchase_date: Timestamp,
        status: StorageItemStatus
    ) {
        this.serial = serial
        this.name = name
        this.type = type
        this.category = category
        this.description = description
        this.purchase_price = purchase_price
        this.purchase_date = purchase_date
        this.status = status
    }

    insert() {
        const docc = doc(database, "storageitems", this.serial);
        const q = setDoc(docc, {
            name: this.name,
            type: this.type,
            category: this.category,
            description: this.description,
            purchase_price: this.purchase_price,
            purchase_date: this.purchase_date,
            status: this.status
        });
        return q;
    }
}

export async function changeStatus(id: string, status: StorageItemStatus){
    const docRef = doc(database, 'storageitems', id);

    await setDoc(docRef, {status: status}, {merge: true});
}

export async function deleteStorageItem(id: string){
    const docRef = doc(database, 'storageitems', id);

    await deleteDoc(docRef);
}

export async function insertNewStorageItem(name: string, type: string, category: StorageItemCategory, purchase_price: number, purchase_date: Timestamp, description?: string){
    var serial = faker.database.mongodbObjectId();
    var si = new StorageItem(serial, name, type, category, description ? description : "", purchase_price, purchase_date, StorageItemStatus.Usable);
    si.insert();
}

export async function getStorageItem(id: string) {
    const docRef = doc(database, 'storageitems', id);
    const promise = await getDoc(docRef);

    return promise;
}


export async function getAllStorageItems() {
    const promise = await getDocs(db_storageitems);

    return promise;
}