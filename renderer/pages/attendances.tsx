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
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import clsx from 'clsx';
import { Box } from '@material-ui/core';
import { checkAuth, getAuthUser, IAuth, logOut } from '../utils/auth_manager';
import AppGridContainer from '../components/AppGrid';
import { SidebarNav } from '../utils/sidebar_nav_manager';
import { AppManager } from '../utils/apps_manager';
import { AttendanceChart } from '../components/AttendanceChart';
import { Attendance, AttendanceChartData } from '../utils/attendance_manager';
import Paper from '@material-ui/core/Paper';

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
    formControl: {
      margin: theme.spacing(1),
      minWidth: 120,
    },
    selectEmpty: {
      marginTop: theme.spacing(2),
    },
    input: {
      backgroundColor: '#222',
      color: '#fff'
    },
    inputText: {
      color: '#ffe657'
    }
  })
);

export interface AttendancePeriod{
  year: number
  startMonth: number
  endMonth: number
  name: string
}

function Attendances() {
  const classes = useStyles({});
  const [ manage, setManage ] = React.useState(false);
  const [ managReq, setManageReq ]  = React.useState(false);
  const [ auth, setAuth ] = React.useState<IAuth>(getAuthUser());
  const [ open, setOpen ] = React.useState(true);
  const [ year, setYear ] = React.useState<number>(2022);
  const [ endMonth, setEndMonth ] = React.useState<number>(11);
  const [ startMonth, setStartMonth ] = React.useState<number>(1);

  const [ searched, setSearched ] = React.useState<string>("");

  const periods : AttendancePeriod[] = [
    {year: 2021, startMonth: 1, endMonth: 6, name: "January - June 2021"},
    {year: 2021, startMonth: 7, endMonth: 12, name: "July - December 2021"},
    {year: 2022, startMonth: 1, endMonth: 6, name: "January - June 2022"},
    {year: 2022, startMonth: 7, endMonth: 11, name: "July - November 2022"},
  ];
  const [ period, setPeriod ] = React.useState<AttendancePeriod>(periods[3]);

  const handleChange = (event: React.ChangeEvent<{ value: number }>) => {
    setPeriod(periods[event.target.value]);
    setYear(periods[event.target.value].year);
    setStartMonth(periods[event.target.value].startMonth);
    setEndMonth(periods[event.target.value].endMonth);
  };

  const dummyData = {
    labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November'],
    datasets: [
        {
            label: 'On Time',
            data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            backgroundColor: '#fff',
        },
        {
            label: 'Absences',
            data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            backgroundColor: '#ffe657',
        },
        {
            label: 'Late Entry',
            data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            backgroundColor:'#ccb324',
        },
        {
            label: 'Early Leave',
            data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            backgroundColor: '#aa9102',
        },
    ]
  }

  const [ chartData, setChartData ] = React.useState<AttendanceChartData>(dummyData);

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

  const handleOpenDrawer = () => {
    setOpen(!open);
  }

  const handleLogOut = () => {
    logOut(setAuth);
  }

  const handleSearch = (searched: string) => {
    setSearched(searched);
  }

  const handleSidebarButton = SidebarNav.handleSidebarButton;

  const handleSearchClick = AppManager.handleDefaultSearchClick;

  React.useEffect(() => {
    Attendance.getAttendancesChartData([year, year], [startMonth, endMonth], "any").then((att) => {
      setChartData(att);
    })
  }, [period]);

  return (
    <React.Fragment>
      <Sidebar isManagement={manage} isManagementReq={managReq} handleSearch={handleSearch} handleSearchClick={handleSearchClick} handleSidebarButton={handleSidebarButton} handleLogOut={handleLogOut} handleOpenDrawerParent={handleOpenDrawer}/>
      <div className={clsx(classes.content, {
        [classes.contentShift]: open,
      })}>
        <Head>
          <title>Employees Attendance - Stuck in The Movie Cinema System</title>
        </Head>
        <Box p="3rem">
            <Typography align='left' variant="h4" color="primary">
            <AppsIcon fontSize='small'/>
              {"   Employees Attendance"}
              
            </Typography>
          </Box>
        <div className={classes.root}>
              <FormControl variant="filled" className={classes.formControl}>
                  <InputLabel id="demo-controlled-open-select-label" className={classes.inputText}>Change Attendance Data Period</InputLabel>
                  <Select
                    labelId="demo-controlled-open-select-label"
                    value={period.name}
                    onChange={handleChange}
                    className={classes.input}
                    displayEmpty
                  >
                    {periods.map((p, idx) => (<MenuItem value={idx}>{p.name}</MenuItem>))}
                  </Select>
              </FormControl>
            <AttendanceChart chartData={chartData} periodName={period.name}/>
        </div>
      </div>
    </React.Fragment>
  );
};

export default Attendances;