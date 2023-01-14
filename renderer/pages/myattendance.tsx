import React from 'react';
import Head from 'next/head';
import { Theme, makeStyles, createStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Link from '../components/Link';
import Router from 'next/router';
import secureLocalStorage from 'nextjs-secure-local-storage';
import ManageTable from '../components/ManageTable';
import { collection, DocumentData, getDocs, QueryDocumentSnapshot, QuerySnapshot, Timestamp } from 'firebase/firestore';
import { database } from '../database/firebase';
import PeopleRoundedIcon from '@material-ui/icons/PeopleRounded'
import AppsIcon from '@material-ui/icons/Apps';
import Topbar from '../components/Topbar';
import Sidebar from '../components/Sidebar';
import clsx from 'clsx';
import { Box, setRef } from '@material-ui/core';
import { checkAuth, getAuthUser, IAuth, logOut } from '../utils/auth_manager';
import AppGridContainer from '../components/AppGrid';
import { SidebarNav } from '../utils/sidebar_nav_manager';
import { AppManager } from '../utils/apps_manager';
import TableChartIcon from '@material-ui/icons/TableChart';
import Clock from 'react-live-clock';
import SingleWorkTime from '../components/SingleWorkTime';
import AttendanceIndicator from '../components/AttendanceIndicator';
import Grid from '@material-ui/core/Grid';
import InputIcon from '@material-ui/icons/Input';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import { Attendance, AttendanceItem, getEmployeeAttendance, insertNewAttendance, resetAttendance } from '../utils/attendance_manager';
import { getWorkingTimes, WorkingTime, WorkingTimeDetail } from '../utils/workingtime_manager';
import { Alert } from '@material-ui/lab';
import Snackbar from '@material-ui/core/Snackbar';
import RestoreIcon from '@material-ui/icons/Restore';

const drawerWidth = 240;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      textAlign: 'center',
      padding: theme.spacing(1),
    },
    menuButton: {
      marginRight: theme.spacing(2),
    },
    hide: {
      display: 'none',
    },
    content: {
      flexGrow: 1,
      padding: theme.spacing(3),
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      marginLeft: 0,
    },
    contentShift: {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: drawerWidth,
    },
  })
);

function MyAttendance() {
  const classes = useStyles({});
  const [ manage, setManage ] = React.useState(false);
  const [ managReq, setManageReq ]  = React.useState(false);
  const [ auth, setAuth ] = React.useState<IAuth>(getAuthUser());
  const [ open, setOpen ] = React.useState(true);
  const placeholderWD : WorkingTimeDetail = {starthour: 0, startminute: 0, endhour: 0, endminute: 0, weekday: 0}
  const [todayWorkTime, setTodayWorkTime] = React.useState<WorkingTimeDetail>(placeholderWD);
  const placeholderATD : Attendance = new Attendance("PLACEHOLDER", []);
  const [attendance, setAttendance] = React.useState<Attendance>(placeholderATD);

  const placeholderATDI : AttendanceItem = {
    year: 0,
    month: 0,
    day: 0,
    weekday: 0,
    attend_time: Timestamp.fromMillis(0),
    leave_time: Timestamp.fromMillis(0),
    working_attend_time: Timestamp.fromMillis(0),
    working_leave_time: Timestamp.fromMillis(0)
};

  const [today_att_item, setTodayAttItem] = React.useState<AttendanceItem>(placeholderATDI);
  const [refreshAtt, setRefreshAtt] = React.useState(false);

  const [openError, setOpenError] = React.useState(false);
  const [errorText, setErrorText] = React.useState("Please clock in first before trying to clock out");
  
  const [ searched, setSearched ] = React.useState<string>("");

  React.useEffect(() => {
    if(auth && (auth.dept_id === 'qIvZZoS7Bnro7bD7DpWs' || auth.dept_id === '44dnLCF6Mksm8k2jn09w')){
      setManage(true);
    }
    if(auth && (auth.dept_id === 'qIvZZoS7Bnro7bD7DpWs')){
      setManageReq(true);
    }

    console.log('Authed: ' + auth + '| object: ' + auth);

    if(!auth){
      Router.push('/home');
      SidebarNav.currentPathname = '/home';
    }
  }, [auth]);

  React.useEffect(() => {
    getWorkingTimes(getAuthUser().eid).then((w) => {
        w.docs.map((wt) => {
            var workTimes = ({...wt.data()}) as WorkingTime;
            var workTimeDetails : WorkingTimeDetail[] = workTimes.details as WorkingTimeDetail[];
            let date = new Date();
            const day = date.getDay();
            setTodayWorkTime(workTimeDetails[day === 0 ? 6 : day-1]);
        })
    })
  }, []);

  React.useEffect(() => {
    getEmployeeAttendance(getAuthUser().eid).then((a) => {
      setAttendance({...a.docs[0].data()} as Attendance);
    })
  }, []);

  React.useEffect(() => {
    setTodayAttItem(attendance.attendances.filter(filterToday).length > 0 ? attendance.attendances.filter(filterToday)[0] : null);
  }, [attendance]);

  const handleOpenDrawer = () => {
    setOpen(!open);
  }

  const handleLogOut = () => {
    logOut(setAuth);
  }

  const handleReset = () => {
    resetAttendance(getAuthUser().eid, new Date()).then(() => {
      setRefreshAtt(!refreshAtt);
      setTodayAttItem(null);
    }
    )
  }

  function filterToday(attendanceItem : AttendanceItem){
    const today = new Date();
    return attendanceItem.year === today.getFullYear() && attendanceItem.month === today.getMonth()+1 && attendanceItem.day === today.getDate()
  }

  const handleClockIn = () => {
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

    const today = new Date();

    if(!today_att_item){
      var today_att_item_new = {
        year: today.getFullYear(),
        month: today.getMonth() + 1,
        day: today.getDate(),
        weekday: today.getDay() === 0 ? 6 : today.getDay() - 1,
        attend_time: Timestamp.now(),
        leave_time: null,
        working_attend_time: Timestamp.fromMillis(Date.parse(dateString + " " + workStartTimeString + ":00" + " " + timeZoneString)),
        working_leave_time: Timestamp.fromMillis(Date.parse(dateString + " " + workEndTimeString + ":00" + " " + timeZoneString))
      };

      insertNewAttendance(getAuthUser().eid, today_att_item_new).then(() => {
        setRefreshAtt(!refreshAtt);
        setTodayAttItem(today_att_item_new);
      });
    }else{
      setErrorText("Cannot clock in after clock out, press reset instead to reset attendance");
      setOpenError(true);
    }
  }

  const handleClockOut = () => {
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

    const today = new Date();

    if(!today_att_item){
      setErrorText("Cannot clock out before clock in, please clock in first");
      setOpenError(true);

    }else{
      console.log("WORK TIME")
      var today_att_item_new = {
        year: today.getFullYear(),
        month: today.getMonth() + 1,
        day: today.getDate(),
        weekday: today.getDay() === 0 ? 6 : today.getDay() - 1,
        attend_time: today_att_item.attend_time,
        leave_time: Timestamp.now(),
        working_attend_time: Timestamp.fromMillis(Date.parse(dateString + " " + workStartTimeString + ":00" + " " + timeZoneString)),
        working_leave_time: Timestamp.fromMillis(Date.parse(dateString + " " + workEndTimeString + ":00" + " " + timeZoneString))
      };

      insertNewAttendance(getAuthUser().eid, today_att_item_new).then(() => {
        setRefreshAtt(!refreshAtt);
        setTodayAttItem(today_att_item_new);
      });
    }
  }

  const handleSearch = (searched: string) => {
    setSearched(searched);
  }

  const handleSidebarButton = SidebarNav.handleSidebarButton;

  const handleSearchClick = AppManager.handleDefaultSearchClick;

  return (
    <React.Fragment>
      <Sidebar isManagement={manage} isManagementReq={managReq} handleSearch={handleSearch} handleSearchClick={handleSearchClick} handleSidebarButton={handleSidebarButton} handleLogOut={handleLogOut} handleOpenDrawerParent={handleOpenDrawer}/>
      <div className={clsx(classes.content, {
        [classes.contentShift]: open,
      })}>
        <Head>
          <title>My Attendance - Stuck in The Movie Cinema System</title>
        </Head>
        <Box p="3rem">
            <Typography align='left' variant="h4" color="primary">
            <TableChartIcon fontSize='small'/>
              {"   My Attendance"}
              
            </Typography>
          </Box>
        <div className={classes.root}>
          <Typography variant='h1' color='primary'>
            <Clock format="HH:mm:ss" interval={1000} ticking={true} />
          </Typography>
          <Box m={6}>
            <SingleWorkTime />
            <AttendanceIndicator type="in" todaysAttendance={today_att_item}/>
            <AttendanceIndicator type="out" todaysAttendance={today_att_item}/>
          </Box>
          <Grid container direction="column" spacing={5}>
            <Grid container justifyContent="center" spacing={4}>
              <Grid item>
                <Button
                        variant="contained"
                        color="primary"
                        startIcon={<InputIcon />}
                        onClick={handleClockIn}
                >
                    Clock In
                </Button>
              </Grid>
              <Grid item>
                <Button
                        variant="contained"
                        color="primary"
                        startIcon={<ExitToAppIcon />}
                        onClick={handleClockOut}
                >
                    Clock Out
                </Button>
              </Grid>
            </Grid>
            <Grid item>
                <Button
                        variant="contained"
                        color="secondary"
                        startIcon={<RestoreIcon />}
                        onClick={handleReset}
                >
                    Reset
                </Button>
            </Grid>
          </Grid>
        </div>
      </div>
      <Snackbar open={openError} autoHideDuration={6000} onClose={e => setOpenError(false)}>
        <Alert onClose={e => setOpenError(false)} severity="error">
          {errorText}
        </Alert>
      </Snackbar>
    </React.Fragment>
  );
};

export default MyAttendance;