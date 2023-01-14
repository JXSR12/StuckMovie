import { faker } from "@faker-js/faker";
import { addDoc, collection, doc, getDoc, getDocs, increment, query, setDoc, where } from "firebase/firestore";
import { database } from "../database/firebase";

const db_members = collection(database, 'members');

export enum MemberLevel{
    Standard,
    Gold,
    Diamond,
    Priority
}

export class Member {
    id: string
    name: string
    email: string
    phone: string
    address: string
    card_no: string
    points: number
    level: MemberLevel

    constructor(
        id: string,
        name: string,
        email: string,
        phone: string,
        address: string,
        card_no: string,
        points: number,
        level: MemberLevel
    ) {
        this.id = id
        this.name = name
        this.email = email
        this.phone = phone
        this.address = address
        this.card_no = card_no
        this.points = points
        this.level = level
    }

    insert() {
        const q = addDoc(db_members, {
            name: this.name,
            email: this.email,
            phone: this.phone,
            address: this.address,
            card_no: this.card_no,
            points: this.points,
            level: this.level
        });
        return q;
    }

    static async seedMembers(){
        for(let i = 0; i < 42; i++){
            var mm = new Member("BLANK", faker.name.firstName() + ' ' + faker.name.lastName(), "EMAIL" ,faker.phone.number('+## ### #### ####'), faker.address.streetAddress(true) + ', ' + faker.address.city() + ', ' + faker.address.country() + ' ' + faker.address.zipCode(), faker.phone.number('#### #### #### ####'), Math.floor(Math.random() * 1500), Math.floor(Math.random() * 4) as MemberLevel);
            mm.email = faker.internet.email(mm.name.split(' ')[0], mm.name.split(' ')[1]);
            mm.insert();
        }
    }
}

export async function addMemberPoints(cardNumber: string, amount: number){
    const q = query(db_members, where("card_no", "==", cardNumber));
    getDocs(q).then((d) => {
       const m : Member = {id: d.docs[0].id, ...d.docs[0].data} as Member;
       const docRef = doc(database, 'members', m.id);
       setDoc(docRef, { points: increment(amount) }, { merge: true });
    })
}

export async function insertMember(name: string, phone: string, email: string, address: string, cardNumber: string){
    const mm : Member = new Member("ID", name, email, phone, address, cardNumber, 0, MemberLevel.Standard);
    mm.insert();
}

export async function getMember(id: string) {
    const docRef = doc(database, 'members', id);
    const promise = await getDoc(docRef);

    return promise;
}

export async function getMemberByCardNo(cardno: string) {
    const q = query(db_members, where("card_no", "==", cardno));

    const promise = await getDocs(q);

    return promise;
}


export async function getAllMembers() {
    const promise = await getDocs(db_members);

    return promise;
}