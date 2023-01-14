import { faker } from "@faker-js/faker";
import { addDoc, arrayRemove, arrayUnion, collection, doc, getDocs, query, setDoc, Timestamp, where } from "firebase/firestore";
import { database } from "../database/firebase";
import { IAuth } from "./auth_manager";
import { EmployeeUtils } from "./employee_manager";
import { getWorkingTimes, WorkingTime, WorkingTimeDetail } from "./workingtime_manager";
import _ from 'lodash'

const db_attendances = collection(database, 'attendances');

export const MONTH_DAYS = [[31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31], [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ]];

export interface AttendanceItem {
    year: number
    month: number
    day: number
    weekday: number
    attend_time: Timestamp
    leave_time: Timestamp
    working_attend_time: Timestamp
    working_leave_time: Timestamp
}

export interface AttendanceChartData {
    labels: string[]
    datasets: any[]
}

export class Attendance {
    eid: string
    attendances: AttendanceItem[]

    constructor(
        eid: string,
        attendances: AttendanceItem[]
    ) {
        this.eid = eid
        this.attendances = attendances
    }

    insert() {
        const q = addDoc(db_attendances, {
            eid: this.eid,
            attendances: this.attendances
        });
        return q;
    }

    static async getAttendancesChartData(year: string | number[], month: string | number[], day: string | number[]){
        function filterTimeRange(atd : AttendanceItem){
            return (year !== "any" ? (atd.year >= year[0] && atd.year <= year[1]) : (true)) && (month !== "any" ? (atd.month >= month[0] && atd.month <= month[1]) : (true)) && (day !== "any" ? (atd.day >= day[0] && atd.day <= day[1]) : (true));
        }

        var chartData : AttendanceChartData = {
            labels: [],
            datasets: [
                {
                    label: 'On Time',
                    data: [],
                    backgroundColor: '#fff4b3',
                },
                {
                    label: 'Absences',
                    data: [],
                    backgroundColor: '#ffe657',
                },
                {
                    label: 'Late Entries',
                    data: [],
                    backgroundColor:'#ccb324',
                },
                {
                    label: 'Early Leaves',
                    data: [],
                    backgroundColor: '#aa9102',
                },
            ]
          } as AttendanceChartData;

        const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        
        if(year === "any"){
            year = [1000, 2500];
        }
        if(month === "any"){
            month = [1, 12];
        }
        if(day === "any"){
            day = [1, 31];
        }

        var onTimeCounts : number[] = [];
        var absenceCounts : number[] = [];
        var lateCounts : number[] = [];
        var earlyLeaveCounts : number[] = [];

        var supposedDays : number[] = [];
        var attendedDays : number[] = [];

        for(let i : number = month[0] as number; i <= (month[1] as number); i++){
            supposedDays.push(0);
            attendedDays.push(0);
        }

        for(let i : number = month[0] as number; i <= (month[1] as number); i++){
            chartData.labels.push(MONTH_NAMES[i - 1]);
            onTimeCounts.push(0);
            absenceCounts.push(0);
            lateCounts.push(0);
            earlyLeaveCounts.push(0);
        }

        function getSundaysCount(month, year) {
            month -= 1;
            var day, counter, date;
        
            day = 1;
            counter = 0;
            date = new Date(year, month, day);
            while (date.getMonth() === month) {
                if (date.getDay() === 0) { // Sun=0, Mon=1, Tue=2, etc.
                    counter += 1;
                }
                day += 1;
                date = new Date(year, month, day);
            }
            return counter;
        }

        const p = await getAllAttendances().then((data) => {
            data.docs.map((att) => {
                const attendance : Attendance = {...att.data()} as Attendance;
                const attendance_details : AttendanceItem[] = attendance.attendances as AttendanceItem[];

                for(let i : number = month[0] as number; i <= (month[1] as number); i++){
                    const fullDays = new Date(year[0] as number, i, 0).getDate();
                    const fullWorkDays = fullDays - getSundaysCount(i, year[0]);
                    console.log('Full Days in Month ' + MONTH_NAMES[i - (month[0] as number)] + ' : ' + fullDays + ', sundays: ' +  getSundaysCount(i, year[0]) + ' working days : ' + fullWorkDays);
                    supposedDays[i - (month[0] as number)] += fullWorkDays;
                }

                attendance_details.filter(filterTimeRange).map((atd) => {
                    for(let i : number = month[0] as number; i <= (month[1] as number); i++){
                        if(atd.month === i && atd.year >= year[0] && atd.year <= year[1] && atd.day >= day[0] && atd.day <= day[1]){
                            if(atd.attend_time > atd.working_attend_time){
                                lateCounts[i - (month[0] as number)]++;
                            }
                            if(atd.leave_time < atd.working_leave_time){
                                earlyLeaveCounts[i - (month[0] as number)]++;
                            }
                            if(atd.attend_time <= atd.working_attend_time && atd.leave_time >= atd.working_leave_time){
                                onTimeCounts[i - (month[0] as number)]++;
                            }
                            attendedDays[i - (month[0] as number)]++;
                        }
                    }
                })


            });

            for(let i : number = month[0] as number; i <= (month[1] as number); i++){
                absenceCounts[i - (month[0] as number)] += (supposedDays[i - (month[0] as number)] - attendedDays[i - (month[0] as number)]);
            }

            for(let i : number = month[0] as number; i <= (month[1] as number); i++){
                chartData.datasets[0].data.push(onTimeCounts[i - (month[0] as number)]);
                chartData.datasets[1].data.push(absenceCounts[i - (month[0] as number)]);
                chartData.datasets[2].data.push(lateCounts[i - (month[0] as number)]);
                chartData.datasets[3].data.push(earlyLeaveCounts[i - (month[0] as number)]);
            }

            return chartData;
        })

        return p;
    }

    static async seedAttendances(){
        EmployeeUtils.getAllEmployees().then((emps) => {
            emps.docs.map((emp) => {
                const e = {...emp.data()} as IAuth
                getWorkingTimes(e.eid).then((d) => {
                    d.docs.map((worktime) => {
                        var attendances = [];
                        for(let j = 2021; j <= 2022; j++){
                            for(let i = 1; i <= 12; i++){
                                var isLeap = false;
                                if(j % 4 === 0){
                                    if(j % 100 === 0 && j % 400 === 0){
                                        isLeap = true;
                                    }else if(j % 100 !== 0){
                                        isLeap = true;
                                    }
                                }

                                for(let k = 1; k <= MONTH_DAYS[isLeap ? 1 : 0][i-1]; k++){
                                    if(j === 2022 && i === 12 && k > 22){
                                        continue;
                                    }

                                    var att_item = {
                                        year: j,
                                        month: i, 
                                        day: 0, 
                                        weekday: 0, 
                                        attend_time: Timestamp.fromMillis(Date.parse("2022-10-11")), 
                                        leave_time: Timestamp.fromMillis(Date.parse("2022-10-11")), 
                                        working_attend_time: Timestamp.fromMillis(Date.parse("2022-10-11")), 
                                        working_leave_time: Timestamp.fromMillis(Date.parse("2022-10-11"))
                                        } as AttendanceItem

                                    var rand_attend = Math.floor(Math.random() * 100);

                                    att_item.day = k;

                                    var dateString = ""+String(j).padStart(2, '0')+"-"+String(i).padStart(2, '0')+"-"+String(k).padStart(2, '0')+" ";

                                    var date : Date = new Date(dateString);

                                    var weekday = date.getDay() == 0 ? 6 : (date.getDay()-1);

                                    var timeZoneString = " GMT+0700";

                                    var startTimeString : string = "";

                                    var endTimeString : string = "";

                                    var absent = false;

                                    if(weekday !== 6){
                                        
                                        var workTimes : WorkingTime = {...worktime.data()} as WorkingTime;
                                        var workTime : WorkingTimeDetail = workTimes.details[weekday] as WorkingTimeDetail;

                                        var workStartTimeString : string = "";
                                        workStartTimeString += String(workTime.starthour).padStart(2, '0');
                                        workStartTimeString += ":"
                                        workStartTimeString += String(workTime.startminute).padStart(2, '0');

                                        var workEndTimeString : string = "";
                                        workEndTimeString += String(workTime.endhour).padStart(2, '0');
                                        workEndTimeString += ":"
                                        workEndTimeString += String(workTime.endminute).padStart(2, '0');

                                        att_item.working_attend_time = Timestamp.fromMillis(Date.parse(dateString + workStartTimeString + timeZoneString));
                                        att_item.working_leave_time = Timestamp.fromMillis(Date.parse(dateString + workEndTimeString + timeZoneString));

                                        if(rand_attend < 4){
                                            absent = true;
                                        }else if(rand_attend < 6){
                                            var lateness_minutes = Math.floor(Math.random() * 128);
                                            var late_minute = lateness_minutes % 60;
                                            var late_hour = Math.floor(lateness_minutes / 60);

                                            if(60 - workTime.startminute <= late_minute){
                                                startTimeString += String(workTime.starthour + late_hour + 1).padStart(2, '0');
                                                startTimeString += ":"
                                                startTimeString += String(workTime.startminute - 60 + late_minute).padStart(2, '0');
                                            }else{
                                                startTimeString += String(workTime.starthour + late_hour).padStart(2, '0');
                                                startTimeString += ":"
                                                startTimeString += String(workTime.startminute + late_minute).padStart(2, '0');
                                            }

                                        }else if(rand_attend < 20){
                                            var lateness_minutes = Math.floor(Math.random() * 30);
                                            var late_minute = lateness_minutes % 60;
                                            var late_hour = Math.floor(lateness_minutes / 60);

                                            if(60 - workTime.startminute <= late_minute){
                                                startTimeString += String(workTime.starthour + late_hour + 1).padStart(2, '0');
                                                startTimeString += ":"
                                                startTimeString += String(workTime.startminute - 60 + late_minute).padStart(2, '0');
                                            }else{
                                                startTimeString += String(workTime.starthour + late_hour).padStart(2, '0');
                                                startTimeString += ":"
                                                startTimeString += String(workTime.startminute + late_minute).padStart(2, '0');
                                            }
                                            

                                        }else{
                                            var earliness_minutes = Math.floor(Math.random() * 40);
                                            var early_minute = earliness_minutes % 60;
                                            var early_hour = Math.floor(earliness_minutes / 60);

                                            if(workTime.startminute < early_minute){
                                                startTimeString += String(workTime.starthour - early_hour - 1).padStart(2, '0');
                                                startTimeString += ":"
                                                startTimeString += String(workTime.startminute + 60 - early_minute).padStart(2, '0');
                                            }else{
                                                startTimeString += String(workTime.starthour - early_hour).padStart(2, '0');
                                                startTimeString += ":"
                                                startTimeString += String(workTime.startminute - early_minute).padStart(2, '0');
                                            }
                                            
                                        }
            
                                        if(rand_attend >= 4){
                                            var rand_leave = Math.floor(Math.random() * 100);
                                            if(rand_leave < 18){
                                                var earliness_minutes = Math.floor(Math.random() * 80);
                                                var early_minute = earliness_minutes % 60;
                                                var early_hour = Math.floor(earliness_minutes / 60);

                                                if(workTime.endminute < early_minute ){
                                                    endTimeString += String(workTime.endhour - early_hour - 1).padStart(2, '0');
                                                    endTimeString += ":"
                                                    endTimeString += String(workTime.endminute + 60 - early_minute).padStart(2, '0');
                                                }else{
                                                    endTimeString += String(workTime.endhour - early_hour).padStart(2, '0');
                                                    endTimeString += ":"
                                                    endTimeString += String(workTime.endminute - early_minute).padStart(2, '0');
                                                }
                                                
                                            }else{
                                                var lateness_minutes = Math.floor(Math.random() * 27);
                                                var late_minute = lateness_minutes % 60;
                                                var late_hour = Math.floor(lateness_minutes / 60);

                                                if(60 - workTime.endminute <= late_minute){
                                                    endTimeString += String(workTime.endhour + late_hour + 1).padStart(2, '0');
                                                    endTimeString += ":"
                                                    endTimeString += String(workTime.endminute - 60 + late_minute).padStart(2, '0');
                                                }else{
                                                    endTimeString += String(workTime.endhour + late_hour).padStart(2, '0');
                                                    endTimeString += ":"
                                                    endTimeString += String(workTime.endminute + late_minute).padStart(2, '0');
                                                }
                                            }
                                        }

                                        if(!absent){
                                            att_item.attend_time = Timestamp.fromMillis(Date.parse(dateString + startTimeString + timeZoneString));
                                            att_item.leave_time = Timestamp.fromMillis(Date.parse(dateString + endTimeString + timeZoneString));
                                            att_item.weekday = weekday;

                                            // console.log("FROM "+ dateString + startTimeString + timeZoneString + " TO " + dateString + endTimeString + timeZoneString);
                                            // console.log(att_item);
                                            attendances.push(att_item);
                                        }
                                    }
                                }
                            }
                        }
                        const att = new Attendance(e.eid, attendances);
                        att.insert();
                    })
                });
            })
        })
    }
}

export async function insertNewAttendance(eid: string, att_item: AttendanceItem){
    function filterToday(attendanceItem : AttendanceItem){
        const today = new Date();
        return attendanceItem.year === today.getFullYear() && attendanceItem.month === today.getMonth()+1 && attendanceItem.day === today.getDate()
    }

    getEmployeeAttendance(eid).then(e => {
       const att_id = e.docs[0].id
       const docRef = doc(database, 'attendances', att_id);

       const attendances = ({...e.docs[0].data()} as Attendance).attendances;
       var att = attendances.filter(filterToday).length > 0 ? attendances.filter(filterToday)[0] : null;

       var newAtt = attendances.filter(attn => !_.isEqual(attn, att));
       newAtt.push(att_item);

        setDoc(docRef, {
            attendances: newAtt
        }, {merge: true});
    })
}

export async function resetAttendance(eid: string, date: Date){
    function filterDate(attendanceItem : AttendanceItem){
        return attendanceItem.year === date.getFullYear() && attendanceItem.month === date.getMonth()+1 && attendanceItem.day === date.getDate()
    }

    getEmployeeAttendance(eid).then(e => {
        const att_id = e.docs[0].id
        const docRef = doc(database, 'attendances', att_id);
 
        const attendances = ({...e.docs[0].data()} as Attendance).attendances;
        var att = attendances.filter(filterDate).length > 0 ? attendances.filter(filterDate)[0] : null;

        setDoc(docRef, {
            attendances: arrayRemove(att)
        }, {merge: true});
     })
}



export async function getEmployeeAttendance(eid: string){
    const q = await query(db_attendances, where("eid", "==", eid));
    
    return getDocs(q);
}

export async function getAllAttendances() {
    const promise = await getDocs(db_attendances);

    return promise;
}