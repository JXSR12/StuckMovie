import { faker } from "@faker-js/faker";
import { addDoc, collection, doc, getDoc, getDocs, setDoc, Timestamp } from "firebase/firestore";
import { database } from "../database/firebase";
import { Branch } from "./branch_manager";

const db_events = collection(database, 'events');

export class PromotionEvent {
    id: string
    title: string
    description: string
    start_time: Timestamp
    end_time: Timestamp
    branches: Branch[]

    constructor(
        id: string,
        title: string,
        description: string,
        start_time: Timestamp,
        end_time: Timestamp,
        branches: Branch[]
    ) {
        this.id = id
        this.title = title
        this.description = description
        this.start_time = start_time
        this.end_time = end_time
        this.branches = branches
    }

    insert() {
        const q = addDoc(db_events, {
            title: this.title,
            description: this.description,
            start_time: this.start_time,
            end_time: this.end_time,
            branches: this.branches
        });
        return q;
    }
}

export async function insertEvent(title: string, description: string, start_time : Timestamp, end_time : Timestamp, branches: Branch[]) {
    const ev: PromotionEvent = new PromotionEvent("ID", title, description, start_time, end_time, branches);
    ev.insert();
}

export async function getEvent(id: string) {
    const docRef = doc(database, 'events', id);
    const promise = await getDoc(docRef);

    return promise;
}


export async function getAllEvents() {
    const promise = await getDocs(db_events);

    return promise;
}