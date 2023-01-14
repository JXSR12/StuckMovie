import { faker } from "@faker-js/faker";
import { addDoc, collection, doc, getDoc, getDocs } from "firebase/firestore";
import { database } from "../database/firebase";

const db_theatrelayouts = collection(database, 'theatrelayouts');

export enum TheatreLayoutItemType {
    Seat,
    Aisle,
}

export interface TheatreLayoutRow{
    cols: TheatreLayoutItemType[]
}

export class TheatreLayout {
    id: string
    name: string
    capacity: number
    layout: TheatreLayoutRow[]

    constructor(
        id: string,
        name: string,
        capacity: number,
        layout: TheatreLayoutRow[]
    ) {
        this.id = id
        this.name = name
        this.capacity = capacity
        this.layout = layout
    }

    insert() {
        const q = addDoc(db_theatrelayouts, {
            name: this.name,
            capacity: this.capacity,
            layout: this.layout,
        });
        return q;
    }

    computeCapacity() : TheatreLayout{
        let count = 0;
        for(let i = 0; i < this.layout.length; i++){
            for(let j = 0; j < this.layout[i].cols.length; j++){
                if(this.layout[i][j] === TheatreLayoutItemType.Seat){
                    count++;
                }
            }
        }

        this.capacity = count;

        return this;
    }

    static async seedTheatreLayouts() {
        const S = TheatreLayoutItemType.Seat;
        const A = TheatreLayoutItemType.Aisle;

        new TheatreLayout("BLANK", "Regular", 270, [
            {cols: [S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, A, A, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S]},
            {cols: [S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, A, A, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S]},
            {cols: [S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, A, A, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S]},
            {cols: [S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, A, A, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S]},
            {cols: [S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, A, A, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S]},
            {cols: [S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, A, A, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S]},
            {cols: [S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, A, A, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S]},
            {cols: [S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, A, A, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S]},
            {cols: [S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, A, A, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S]},
        ]).computeCapacity().insert();

        new TheatreLayout("BLANK", "Deluxe", 108, [
            {cols: [S, S, S, S, A, S, S, S, S, S, A, A, S, S, S, S, S, A, S, S, S, S]},
            {cols: [S, S, S, S, A, S, S, S, S, S, A, A, S, S, S, S, S, A, S, S, S, S]},
            {cols: [S, S, S, S, A, S, S, S, S, S, A, A, S, S, S, S, S, A, S, S, S, S]},
            {cols: [S, S, S, S, A, S, S, S, S, S, A, A, S, S, S, S, S, A, S, S, S, S]},
            {cols: [S, S, S, S, A, S, S, S, S, S, A, A, S, S, S, S, S, A, S, S, S, S]},
            {cols: [S, S, S, S, A, S, S, S, S, S, A, A, S, S, S, S, S, A, S, S, S, S]},
        ]).computeCapacity().insert();

        new TheatreLayout("BLANK", "ImmensiPro", 302, [
            {cols: [S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, A, A, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S]},
            {cols: [S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, A, A, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S]},
            {cols: [S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, A, A, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S]},
            {cols: [S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, A, A, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S]},
            {cols: [S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, A, A, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S]},
            {cols: [A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A]},
            {cols: [S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, A, A, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S]},
            {cols: [S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, A, A, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S]},
            {cols: [S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, A, A, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S]},
            {cols: [S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, A, A, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S]},
            {cols: [S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S]},
        ]).computeCapacity().insert();
    }
}

export async function insertTheatreLayout(id: string,
    name: string,
    capacity: number,
    layout: TheatreLayoutRow[]) {

    const pr: TheatreLayout = new TheatreLayout("ID", name, capacity, layout);
    pr.insert();
}

export async function getTheatreLayout(id: string) {
    const docRef = doc(database, 'theatrelayouts', id);
    const promise = await getDoc(docRef);

    return promise;
}


export async function getAllTheatreLayouts() {
    const promise = await getDocs(db_theatrelayouts);

    return promise;
}