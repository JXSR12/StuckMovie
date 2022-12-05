import React from 'react';
import { app, database } from '../database/firebase';
import { collection, getDocs, addDoc, getCountFromServer } from 'firebase/firestore'

const db_departments = collection(database, 'departments');
const db_divisions = collection(database, 'divisions');

