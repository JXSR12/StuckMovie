import React from 'react';
import { addDoc, collection, doc, Timestamp } from "firebase/firestore";
import { hashPassword } from "../utils/passwordencryptor";
import { database } from "./firebase";
import { faker } from '@faker-js/faker';

const db_departments = collection(database, 'departments');
const db_divisions = collection(database, 'divisions');
const db_employees = collection(database, 'employees');

export const populateDivisions = () => {
    addDoc(db_divisions, {
      department_no: 6,
      division_no: 0,
      name: 'Schedule Division'
    },);
    addDoc(db_divisions, {
      department_no: 6,
      division_no: 1,
      name: 'Front Office Division'
    },);
    addDoc(db_divisions, {
      department_no: 6,
      division_no: 2,
      name: 'Operation Division'
    },);
    addDoc(db_divisions, {
      department_no: 7,
      division_no: 0,
      name: 'Front Office Division'
    },);
    addDoc(db_divisions, {
      department_no: 7,
      division_no: 1,
      name: 'Kitchen Division'
    },);
  }
  
  export const populateDepartments = () => {
    addDoc(db_departments, {
      number: 0,
      name: 'Management'
    },);
    addDoc(db_departments, {
      number: 1,
      name: 'Human Resource Department'
    },);
    addDoc(db_departments, {
      number: 2,
      name: 'Accounting and Finance Department'
    },);
    addDoc(db_departments, {
      number: 3,
      name: 'Storage Department'
    },);
    addDoc(db_departments, {
      number: 4,
      name: 'External Department'
    },);
    addDoc(db_departments, {
      number: 5,
      name: 'Promotion and Event Department'
    },);
    addDoc(db_departments, {
      number: 6,
      name: 'Movie Department'
    },);
    addDoc(db_departments, {
      number: 7,
      name: 'Cafe Department'
    },);
    addDoc(db_departments, {
      number: 8,
      name: 'Administrative Department'
    },);
  }

  function createEmployee(eNumber: number, eName: string, deptId: string, deptNo: number, divId: string, divNo: number, eEmail: string, password: string, dobString: string, address: string, phone: string, salary: number){
    //IF EMPLOYEE HAS NO DIVISION -> Fill in DIV ID with 'NODIVISION'
    //IF EMPLOYEE USES DEFAULT EMAIL FORMAT (firstName.lastName@sitmcinemas.id), then fill in email with 'DEFAULTMAIL'
    var defaultMailDomain = 'sitmcinemas.id';
    var splitted = eName.split(" ");
    var firstName = splitted[0];
    var lastName = splitted[splitted.length - 1];
    var defaultPass = lastName.toLowerCase() + firstName.toLowerCase();

    var frontNumber = deptNo * 10 + divNo;

    hashPassword(password === 'DEFAULTPASS' ? defaultPass : password).then((hash: string) => {
        addDoc(db_employees, {
          eid: String(frontNumber).padStart(3, '0') +'-'+ String(eNumber).padStart(5, '0'),
          name: eName,
          dept_id: deptId,
          div_id: divId,
          email: eEmail === 'DEFAULTMAIL' ? firstName.toLowerCase()+'.'+lastName.toLowerCase()+'@'+defaultMailDomain : eEmail,
          password: hash,
          dob: Timestamp.fromDate(new Date(dobString)),
          address: address,
          phone: phone,
          salary: salary,
        },);
  
      });
  }

  function randomDepartmentDivsion(){
    var divisionId = 'NODIVISION';
    var departmentId = 'NODEPARTMENT';
    var deptNo = -1;
    var divNo = 0;

    const deptIds = 
    [
    'qIvZZoS7Bnro7bD7DpWs', 
    '44dnLCF6Mksm8k2jn09w', 
    '8vJjhyQeZh12eb9MBe1U', 
    '8jiatLXQduupF4AS336N', 
    'wCJy9XqT0YXd1ZC6KKOo', 
    'h9zYKUS55V6PBv9665PJ', 
    'mJAh88rjZT6ZwT9kLLh6', 
    'S0Oz1WXwdELnqGq80oir', 
    'SXRWT46KSMLlZoizJqkV'
  ];

    const divIds_Movie = ['7Z4ERLjoHiUxAlf8Pxtq', 'U6B3JPiUgcucTPnuqH4V', 'erKkreXH05jE0kKmbajf'];
    const divIds_Cafe = ['N9w5mtTIAIobQo0NMPdb', 'V3babib0l3p7v1f1uSvq'];

    var randomDeptIdx = Math.floor(Math.random() * deptIds.length);
    deptNo = randomDeptIdx;

    departmentId = deptIds[randomDeptIdx];

    if(deptNo === 7){
        var randomDivIdx = Math.floor(Math.random() * divIds_Cafe.length);
        divNo = randomDivIdx;
        divisionId = divIds_Cafe[randomDivIdx];

    }else if(deptNo === 6){
        var randomDivIdx = Math.floor(Math.random() * divIds_Movie.length);
        divNo = randomDivIdx;
        divisionId = divIds_Movie[randomDivIdx];
    }

    return {departmentId, divisionId, deptNo, divNo};

  }

  export const populateOtherEmployees = () => {
    var seedingNumber = 1;

    createEmployee(seedingNumber++, 'Mathijs Vollasen Hart', 'qIvZZoS7Bnro7bD7DpWs', 0, 'NODIVISION', 0, 'DEFAULTMAIL', 'thispassword', '28 August 2003', faker.address.streetAddress(true) + ', ' + faker.address.city() + ', ' + faker.address.country() + ' ' + faker.address.zipCode(), faker.phone.number('+## ### #### ####'), Math.floor(Math.random() * (80000000 - 4000000 + 1)) + 4000000);
    createEmployee(seedingNumber++, 'Rennerie Albert', 'qIvZZoS7Bnro7bD7DpWs', 0, 'NODIVISION', 0, 'DEFAULTMAIL', 'pwdpwdpwd', '19 January 2000', faker.address.streetAddress(true) + ', ' + faker.address.city() + ', ' + faker.address.country() + ' ' + faker.address.zipCode(), faker.phone.number('+## ### #### ####'), Math.floor(Math.random() * (80000000 - 4000000 + 1)) + 4000000);
    createEmployee(seedingNumber++, 'Jaunnisans Edger Lee', 'mJAh88rjZT6ZwT9kLLh6', 6, '7Z4ERLjoHiUxAlf8Pxtq', 0, 'DEFAULTMAIL', 'pwdpwdpwd', '06 January 1998', faker.address.streetAddress(true) + ', ' + faker.address.city() + ', ' + faker.address.country() + ' ' + faker.address.zipCode(), faker.phone.number('+## ### #### ####'), Math.floor(Math.random() * (80000000 - 4000000 + 1)) + 4000000);
    createEmployee(seedingNumber++, 'Richard', 'S0Oz1WXwdELnqGq80oir', 7, 'V3babib0l3p7v1f1uSvq', 1, 'DEFAULTMAIL', 'pwdpwdpwd', '19 October 2000', faker.address.streetAddress(true) + ', ' + faker.address.city() + ', ' + faker.address.country() + ' ' + faker.address.zipCode(), faker.phone.number('+## ### #### ####'), Math.floor(Math.random() * (80000000 - 4000000 + 1)) + 4000000);

    for(var i = 0; i < 50; i++){
        var deptDiv = randomDepartmentDivsion();
        var deptId = deptDiv.departmentId;
        var divId = deptDiv.divisionId;
        var deptNo = deptDiv.deptNo;
        var divNo = deptDiv.divNo;

        createEmployee(seedingNumber++, faker.name.firstName() + ' ' + faker.name.middleName() + ' ' + faker.name.lastName(), deptId, deptNo, divId, divNo,'DEFAULTMAIL', 'DEFAULTPASS', faker.date.birthdate({min: 17, max: 45, mode: 'age'}).toDateString(), faker.address.streetAddress(true) + ', ' + faker.address.city() + ', ' + faker.address.country() + ' ' + faker.address.zipCode(), faker.phone.number('+## ### #### ####'), Math.floor(Math.random() * (80000000 - 4000000 + 1)) + 4000000);
    }

  }