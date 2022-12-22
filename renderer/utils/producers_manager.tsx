import { faker } from "@faker-js/faker";
import { addDoc, collection, doc, getDoc, getDocs } from "firebase/firestore";
import { database } from "../database/firebase";

const db_producers = collection(database, 'producers');

export class Producer {
    id: string
    name: string
    email: string
    phone: string
    address: string

    constructor(
        id: string,
        name: string,
        email: string,
        phone: string,
        address: string
    ) {
        this.id = id
        this.name = name
        this.email = email
        this.phone = phone
        this.address = address
    }

    insert() {
        const q = addDoc(db_producers, {
            name: this.name,
            email: this.email,
            phone: this.phone,
            address: this.address
        });
        return q;
    }

    static async seedProducers(){
        for(let i = 0; i < 36; i++){
            var pr = new Producer("BLANK", faker.name.firstName() + ' ' + faker.name.lastName(), "EMAIL" ,faker.phone.number('+## ### #### ####'), faker.address.streetAddress(true) + ', ' + faker.address.city() + ', ' + faker.address.country() + ' ' + faker.address.zipCode());
            pr.email = faker.internet.email(pr.name.split(' ')[0], pr.name.split(' ')[1]);

            pr.insert();
        }
    }
}

export async function getProducer(id: string) {
    const docRef = doc(database, 'producers', id);
    const promise = await getDoc(docRef);

    return promise;
}


export async function getAllProducers() {
    const promise = await getDocs(db_producers);

    return promise;
}