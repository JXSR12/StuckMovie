import { addDoc, collection, doc, getDoc, getDocs } from "firebase/firestore";
import { database } from "../database/firebase";

const db_genres = collection(database, 'genres');

export class Genre {
    id: string
    name: string

    constructor(id: string, name: string) {
        this.id = id
        this.name = name
    }

    insert() {
        const q = addDoc(db_genres, {
            name: this.name
        });
        return q;
    }

    static async seedGenres(){
        const genres = [
            "Action",
            "Drama",
            "Horror",
            "Adventure",
            "Romance",
            "Thriller",
            "Science Fiction",
            "History",
            "Fiction",
            "Historical Fiction",
            "Musical",
            "Crime",
            "Mystery",
            "Psychological",
            "Disaster",
            "Biographical",
            "Martial Arts",
            "Sports",
            "Documentary",
            "Comedy",
            "Animation",
            "Experimental",
            "Fantasy",
        ]
        genres.map(g => {
            var ge = new Genre("BLANK", g);
            ge.insert();
        })
    }
}

export async function getGenre(id: string) {
    const docRef = doc(database, 'genres', id);
    const promise = await getDoc(docRef);

    return promise;
}


export async function getAllGenres() {
    const promise = await getDocs(db_genres);

    return promise;
}