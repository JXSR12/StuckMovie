import { faker } from "@faker-js/faker";
import { addDoc, collection, doc, getDoc, getDocs } from "firebase/firestore";
import { database } from "../database/firebase";

const db_branches = collection(database, 'branches');

export class Branch {
    id: string
    name: string
    lotArea: number
    buildingArea: number
    address: string

    constructor(
        id: string,
        name: string,
        lotArea: number,
        buildingArea: number,
        address: string
    ) {
        this.id = id
        this.name = name
        this.lotArea = lotArea
        this.buildingArea = buildingArea
        this.address = address
    }

    insert() {
        const q = addDoc(db_branches, {
            name: this.name,
            lotArea: this.lotArea,
            buildingArea: this.buildingArea,
            address: this.address
        });
        return q;
    }

    static async seedBranches() {
        new Branch("BLANK", "Ribox Square", 12515, 8756, faker.address.streetAddress(true) + ', ' + faker.address.city() + ', ' + faker.address.country() + ' ' + faker.address.zipCode()).insert();
        new Branch("BLANK", "Threosa 1", 17502, 11546, faker.address.streetAddress(true) + ', ' + faker.address.city() + ', ' + faker.address.country() + ' ' + faker.address.zipCode()).insert();
        new Branch("BLANK", "Threosa 2", 8673, 7882, faker.address.streetAddress(true) + ', ' + faker.address.city() + ', ' + faker.address.country() + ' ' + faker.address.zipCode()).insert();
        new Branch("BLANK", "Antelpoenn", 7782, 7692, faker.address.streetAddress(true) + ', ' + faker.address.city() + ', ' + faker.address.country() + ' ' + faker.address.zipCode()).insert();
        new Branch("BLANK", "Tavkholm", 13290, 10825, faker.address.streetAddress(true) + ', ' + faker.address.city() + ', ' + faker.address.country() + ' ' + faker.address.zipCode()).insert();
    }
}

export async function insertBranch(name: string, lotArea: number, buildingArea: number, address: string) {
    const pr: Branch = new Branch("ID", name, lotArea, buildingArea, address);
    pr.insert();
}

export async function getBranch(id: string) {
    const docRef = doc(database, 'branches', id);
    const promise = await getDoc(docRef);

    return promise;
}


export async function getAllBranches() {
    const promise = await getDocs(db_branches);

    return promise;
}