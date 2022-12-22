import { collection, getDocs } from "firebase/firestore";
import React from "react";
import { database } from "../database/firebase";

const db_departments = collection(database, 'departments');
const db_divisions = collection(database, 'divisions');

var DDM_Instance : DeptDivsManager;

export default class DeptDivsManager{
    departmentsArray = [];
    divisionsArray = [];

    constructor() {
        this.getDepts();
        this.getDivs();
    }

    setDepartmentsArray(arr: any){
        this.departmentsArray = arr;
    }

    setDivisionsArray(arr: any){
        this.divisionsArray = arr;
    }

    static getInstance() : DeptDivsManager{
        if(DDM_Instance == null){
            DDM_Instance = new DeptDivsManager();
        }
        return DDM_Instance;
    }

    getDepts(){
        getDocs(db_departments)
            .then((data) => {
              this.setDepartmentsArray(
              data.docs.map((item) => {
                return { ...item.data(), id: item.id };
            }));
            });
    }
    
    getDivs(){
      getDocs(db_divisions)
          .then((data) => {
            this.setDivisionsArray(
                data.docs.map((item) => {
                  return { ...item.data(), id: item.id };
              }));
          });
    }

    getAllDivisions(){
        const arr = this.divisionsArray;
        return arr;
    }

    getAllDepartments(){
        const arr = this.departmentsArray;
        return arr;
    }

    getDivisions(deptNo : number){
        function filterByDeptNo(div){
            return div.department_no == deptNo;
        }

        const arr = this.divisionsArray.filter(filterByDeptNo);
        return arr;
    }
    
    getDeptName(deptId: string | number) : string{
      var ret = 'No department set';
      this.departmentsArray.forEach(element => {
        if(deptId === element.id){
          ret = element.name;
        }
      });
    
      return ret;
    }
    
    getDivName(divId: string | number) : string{
      var ret = 'No division set';
      this.divisionsArray.forEach(element => {
        if(divId === element.id){
          ret = element.name
        }
      });

      return ret;
    }
}