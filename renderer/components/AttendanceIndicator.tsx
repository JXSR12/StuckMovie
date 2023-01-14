import { Accordion, AccordionDetails, AccordionSummary, Chip, createStyles, Divider, FormControl, FormHelperText, makeStyles, Select, Theme, Typography } from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import { Timestamp } from "firebase/firestore";
import React from "react";
import { Attendance, AttendanceItem, getEmployeeAttendance } from "../utils/attendance_manager";
import { getAuthUser } from "../utils/auth_manager";
import { getWorkingTimes, WorkingTime, WorkingTimeDetail } from "../utils/workingtime_manager";

const GreenText = withStyles({
    root: {
        fontSize: 15,
        color: "#5cb541"
    }
  })(Typography);

const RedText = withStyles({
    root: {
        fontSize: 15,
        color: "#c20e0e"
    }
})(Typography);

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: "100%"
    },
    heading: {
      fontSize: 15
    },
    secondaryHeading: {
      fontSize: 15,
      color: theme.palette.text.secondary
    },
    icon: {
      verticalAlign: "bottom",
      height: 20,
      width: 20
    },
    details: {
      alignItems: "center"
    },
    column: {
      flexBasis: "33.33%"
    },
    helper: {
      borderLeft: `2px solid ${theme.palette.divider}`,
      padding: theme.spacing(1, 2)
    },
    link: {
      color: theme.palette.primary.main,
      textDecoration: "none",
      "&:hover": {
        textDecoration: "underline"
      }
    }
  })
);

export default function AttendanceIndicator(props: {type: string, todaysAttendance: AttendanceItem}){
    const  {type, todaysAttendance } = props;
    const classes = useStyles();

    const weekday = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    const placeholderWD : WorkingTimeDetail = {starthour: 0, startminute: 0, endhour: 0, endminute: 0, weekday: 0}
    const [todayWorkTime, setTodayWorkTime] = React.useState<WorkingTimeDetail>(placeholderWD);
    const [todayName, setTodayName] = React.useState<string>("");

    const [workAttendTimestamp, setWorkAttendTimestamp] = React.useState<Timestamp>(Timestamp.fromMillis(0));
    const [workLeaveTimestamp, setWorkLeaveTimestamp] = React.useState<Timestamp>(Timestamp.fromMillis(0));

    React.useEffect(() => {
        getWorkingTimes(getAuthUser().eid).then((w) => {
            w.docs.map((wt) => {
                var workTimes = ({...wt.data()}) as WorkingTime;
                var workTimeDetails : WorkingTimeDetail[] = workTimes.details as WorkingTimeDetail[];
                let date = new Date();
                const day = date.getDay();
                setTodayWorkTime(workTimeDetails[day === 0 ? 6 : day-1]);
                setTodayName(weekday[day]);
            })
        })
    }, []);

    function filterToday(attendanceItem : AttendanceItem){
        const today = new Date();
        return attendanceItem.year === today.getFullYear() && attendanceItem.month === today.getMonth()+1 && attendanceItem.day === today.getDate()
    }

    function isAttendLate(attend_time: Timestamp){
        return attend_time.seconds > workAttendTimestamp.seconds
    }

    function isLeaveEarly(leave_time: Timestamp){
        return leave_time.seconds < workLeaveTimestamp.seconds
    }

    React.useEffect(() => {
        const dateString = new Date().toLocaleDateString();
        const timeZoneString = "GMT+0700";

        var workStartTimeString : string = "";
        workStartTimeString += String(todayWorkTime.starthour).padStart(2, '0');
        workStartTimeString += ":"
        workStartTimeString += String(todayWorkTime.startminute).padStart(2, '0');

        var workEndTimeString : string = "";
        workEndTimeString += String(todayWorkTime.endhour).padStart(2, '0');
        workEndTimeString += ":"
        workEndTimeString += String(todayWorkTime.endminute).padStart(2, '0');

        setWorkAttendTimestamp(Timestamp.fromMillis(Date.parse(dateString + " " + workStartTimeString + ":00" + " " + timeZoneString)));
        setWorkLeaveTimestamp(Timestamp.fromMillis(Date.parse(dateString + " " + workEndTimeString + ":00" + " " + timeZoneString)));
    }, [todayWorkTime])

    return(
        <Accordion expanded={false}>
            <AccordionSummary
              expandIcon={<br/>}
              aria-controls="panel1c-content"
              id="panel1c-header"
            >
              <div className={classes.column}>
                <Typography className={classes.heading}>Today's Last Clock {type === "in" ? "In" : "Out"}</Typography>
              </div>
              <div className={classes.column}>
                {type === "in" && todaysAttendance && todaysAttendance.attend_time && todaysAttendance.attend_time.seconds !== Timestamp.fromMillis(0).seconds && !isAttendLate(todaysAttendance.attend_time) && (
                    <GreenText>
                        {new Date(todaysAttendance.attend_time.seconds*1000).toTimeString().split(' ')[0]}
                    </GreenText>
                )}
                {type === "in" && todaysAttendance && todaysAttendance.attend_time && todaysAttendance.attend_time.seconds !== Timestamp.fromMillis(0).seconds && isAttendLate(todaysAttendance.attend_time) && (
                    <RedText>
                        {new Date(todaysAttendance.attend_time.seconds*1000).toTimeString().split(' ')[0]}
                    </RedText>
                )}
                {type === "in" && todaysAttendance && todaysAttendance.attend_time && todaysAttendance.attend_time.seconds === Timestamp.fromMillis(0).seconds && (
                    <Typography className={classes.secondaryHeading}>
                        No clock in yet
                    </Typography>
                )}
                {type === "in" && (!todaysAttendance || !todaysAttendance.attend_time) && (
                    <Typography className={classes.secondaryHeading}>
                        No clock in yet
                    </Typography>
                )}
                {type === "out" && todaysAttendance && todaysAttendance.leave_time && todaysAttendance.leave_time.seconds !== Timestamp.fromMillis(0).seconds && !isLeaveEarly(todaysAttendance.attend_time) && (
                    <GreenText>
                        {new Date(todaysAttendance.leave_time.seconds*1000).toTimeString().split(' ')[0]}
                    </GreenText>
                )}
                {type === "out" && todaysAttendance && todaysAttendance.leave_time && todaysAttendance.leave_time.seconds !== Timestamp.fromMillis(0).seconds && isLeaveEarly(todaysAttendance.attend_time) && (
                    <RedText>
                        {new Date(todaysAttendance.leave_time.seconds*1000).toTimeString().split(' ')[0]}
                    </RedText>
                )}
                {type === "out" && todaysAttendance && todaysAttendance.leave_time && todaysAttendance.leave_time.seconds === Timestamp.fromMillis(0).seconds && (
                    <Typography className={classes.secondaryHeading}>
                        No clock out yet
                    </Typography>
                )}
                {type === "out" && (!todaysAttendance || !todaysAttendance.leave_time) && (
                    <Typography className={classes.secondaryHeading}>
                        No clock out yet
                    </Typography>
                )}
              </div>
            </AccordionSummary>
            <Divider />
        </Accordion>
    )
}