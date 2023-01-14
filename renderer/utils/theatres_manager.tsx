import { addDoc, collection, doc, getDoc, getDocs, query, setDoc, Timestamp, where } from 'firebase/firestore';
import { database } from '../database/firebase';
import { faker } from '@faker-js/faker';
import { Branch, getAllBranches, getBranch } from './branch_manager';
import { getAllTheatreLayouts, getTheatreLayout, TheatreLayout } from './theatrelayouts_manager';

const db_theatres = collection(database, 'theatres');

export enum TheatreStatus {
    Showing,
    Waiting,
    Readying,
    Open
}

export class Theatre {
    id: string
    branch: Branch
    name: string
    layout: TheatreLayout
    status: TheatreStatus

    constructor(
        id: string,
        branch: Branch,
        name: string,
        layout: TheatreLayout,
        status: TheatreStatus
    ) {
        this.id = id
        this.branch = branch
        this.name = name
        this.layout = layout
        this.status = status
    }

    insert() {
        const q = addDoc(db_theatres, {
            branch_id: this.branch.id,
            name: this.name,
            layout_id: this.layout.id,
            status: this.status
        });
        return q;
    }

    static async seedTheatres() {
        getAllBranches().then(br => {
            getAllTheatreLayouts().then(tl => {
                const branches : Branch[] = [];
                const layouts : TheatreLayout[] = [];

                br.docs.map(brn => {
                    branches.push({id: brn.id, ...brn.data()} as Branch);
                })
                tl.docs.map(tla => {
                    layouts.push({id: tla.id, ...tla.data()} as TheatreLayout);
                })

                for(let i = 0; i < branches.length; i++){
                    const x = Math.floor(Math.random() * 4) + 3
                    for(let j = 0; j < x; j++){
                        new Theatre("BLANK", branches[i], "Theatre " + (j+1), layouts[Math.floor(Math.random()*layouts.length)], TheatreStatus.Waiting).insert();
                    }
                }

            })
        })
    }
}

export async function insertTheatre(
    branch: Branch,
    name: string,
    layout: TheatreLayout,
    status: TheatreStatus
) {
    const mv: Theatre = new Theatre("", branch, name, layout, status);
    mv.insert();
}

export async function getTheatre(id: string) {
    const docRef = doc(database, 'theatres', id);
    const promise = await getDoc(docRef);

    return promise;
}

export async function getAllTheatres() {
    const promise = await getDocs(db_theatres);

    return promise;
}


export async function getTheatreRTU(id: string){
    var theatre : Theatre = null;
    const docRef = doc(database, 'theatres', id);

    await getDoc(docRef).then((data) => {
        getBranch(data.data().branch_id).then(p => {
            const br = {id: p.id, ...p.data()} as Branch;
            getTheatreLayout(data.data().layout_id).then(ag => {
            const ly = {id: ag.id, ...ag.data()} as TheatreLayout;
            const th = {id: data.id, ...data.data(), layout: ly, branch: br} as Theatre;

            console.log(th);
            return th;
            })
        })
    });

    return theatre;
}

export async function getAllTheatresRTU(){
    var theatres : Theatre[] = [];

    await getAllTheatres().then((data) => {
        data.docs.map((doc) => {
            getBranch(doc.data().branch_id).then(p => {
              const br = {id: p.id, ...p.data()} as Branch;
              getTheatreLayout(doc.data().layout_id).then(ag => {
                const ly = {id: ag.id, ...ag.data()} as TheatreLayout;
                const th = {id: doc.id, ...doc.data(), layout: ly, branch: br} as Theatre;
                theatres.push(th);
              })
            })
          })
    });

    return await theatres;
}