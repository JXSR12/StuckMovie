import { addDoc, collection, doc, getDoc, getDocs } from "firebase/firestore";
import { database } from "../database/firebase";

const db_ageratings = collection(database, 'ageratings');

export class AgeRating {
    id: string
    rating: string

    constructor(id: string, rating: string) {
        this.id = id
        this.rating = rating
    }

    insert() {
        const q = addDoc(db_ageratings, {
            rating: this.rating
        });
        return q;
    }

    static async seedAgeRatings(){
        const ratings = [
            "G (General Audience)", 
            "PG (Parental Guidance Needed)", 
            "PG-13 (Parental Guidance Below 13)", 
            "R (Restricted 17+)", 
            "NC-17 (No Children 17+)"
        ]
        ratings.map(r => {
            var rt = new AgeRating("BLANK", r);
            rt.insert();
        })
    }
}

export async function getAgeRating(id: string) {
    const docRef = doc(database, 'ageratings', id);
    const promise = await getDoc(docRef);

    return promise;
}


export async function getAllAgeRatings() {
    const promise = await getDocs(db_ageratings);

    return promise;
}