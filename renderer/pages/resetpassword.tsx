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
import { Box, FormControl, IconButton, InputAdornment, InputLabel, OutlinedInput, Tooltip } from '@material-ui/core';
import { checkAuth, getAuthUser, IAuth, logOut } from '../utils/auth_manager';
import AppGridContainer from '../components/AppGrid';
import { SidebarNav } from '../utils/sidebar_nav_manager';
import { AppManager } from '../utils/apps_manager';
import TableChartIcon from '@material-ui/icons/TableChart';
import VpnKeyIcon from '@material-ui/icons/VpnKey';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { EmployeeUtils } from '../utils/employee_manager';
import StepperDialog, { StepperStepItem } from '../components/StepperDialog';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import { faker } from '@faker-js/faker';

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
    button: {
        margin: theme.spacing(1),
      
    },
  })
);

function ResetPassword() {
  const classes = useStyles({});
  const [ manage, setManage ] = React.useState(false);
  const [ managReq, setManageReq ]  = React.useState(false);
  const [ resetPass, setResetPass ]  = React.useState(false);
  const [ auth, setAuth ] = React.useState<IAuth>(getAuthUser());
  const [ open, setOpen ] = React.useState(true);

  const [ searched, setSearched ] = React.useState<string>("");

  const [ openDialog, setOpenDialog ] = React.useState(false);

  const [ selEmp, setSelEmp ] = React.useState<IAuth>();

  const [ employees, setEmployees ] = React.useState<IAuth[]>([]);

  const [ genPassword, setGenPassword] = React.useState<string>("DEFAULT_GEN");

  React.useEffect(() => {
    if(auth && (auth.dept_id === 'qIvZZoS7Bnro7bD7DpWs' || auth.dept_id === '44dnLCF6Mksm8k2jn09w')){
      setManage(true);
    }
    if(auth && (auth.dept_id === 'qIvZZoS7Bnro7bD7DpWs')){
      setManageReq(true);
    }
    if(auth && (auth.dept_id === 'SXRWT46KSMLlZoizJqkV')){
        setResetPass(true);
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

  const handleGenerateNewPass = () => {
    const password = faker.internet.password(15);
    EmployeeUtils.updatePassword(selEmp.eid, password).then(() =>{
        setGenPassword(password);
    }
    )
  }

  const handleDialogFinish = () => {
    //NOTHING
  }

  const handleOpenDialog = () => {
    setGenPassword("DEFAULT_GEN");
    setOpenDialog(true);
  }

  const handleClickCopyPassword = () => {
    navigator.clipboard.writeText(genPassword);
  }


  React.useEffect(() => {
    EmployeeUtils.getAllEmployees().then(emps => {
        setEmployees(
            emps.docs.map((emp) => {
                const e = {id: emp.id, ...emp.data()} as IAuth;
                return e;
            })
        );
    })
  }, []);

  React.useEffect(() => {
    setSelEmp(employees[0]);
  }, [employees]);

  function selectEmployeeStepperItem() : StepperStepItem{
    return {title: 'Select an employee to reset password', content: <Autocomplete
    id="combo-box-demo"
    defaultValue={employees[0]}
    options={employees}
    onChange={(event: any, newValue: IAuth) => {
        setSelEmp(newValue);
        setGenPassword("DEFAULT_GEN");
    }}
    getOptionLabel={(emp) => emp.name + " (" + emp.eid + ")"}
    style={{ width: 300 }}
    renderInput={(params) => <TextField {...params} label="Select an employee" variant="outlined" />}
/>} as StepperStepItem;
  }

  function confirmPasswordResetStepperItem() : StepperStepItem{
    return {title: 'Confirm password reset', content: <div>{genPassword === 'DEFAULT_GEN' && (<div><Typography>
    Are you sure you want to reset the account password for EID {selEmp ? selEmp.eid : "loading.."}?
</Typography><Button
                variant="contained"
                color="primary"
                className={classes.button}
                onClick={handleGenerateNewPass}
            >
                Confirm Password Reset
            </Button></div>)}{genPassword !== 'DEFAULT_GEN' && (<Box m={4}><FormControl variant="outlined">
    <InputLabel htmlFor="outlined-adornment-password">Generated Password</InputLabel>
    <OutlinedInput
      id="outlined-adornment-password"
      type='text'
      value={genPassword}
      readOnly
      endAdornment={
        <InputAdornment position="end">
            <Tooltip title={"Copy to Clipboard"}>
                <IconButton
                aria-label="copy-new-password"
                onClick={handleClickCopyPassword}
                edge="end">
                    <FileCopyIcon />
                </IconButton>
            </Tooltip>
        </InputAdornment>
      }
      labelWidth={150}
    />
  </FormControl></Box>)}</div>} as StepperStepItem;
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
          <title>Reset Password - Stuck in The Movie Cinema System</title>
        </Head>
        <Box p="3rem">
            <Typography align='left' variant="h4" color="primary">
            <VpnKeyIcon fontSize='small'/>
              {"   Reset Employee Account Password"}
              
            </Typography>
          </Box>
        <div className={classes.root}>
            {resetPass && (
                <Button
                variant="contained"
                color="primary"
                className={classes.button}
                startIcon={<VpnKeyIcon />}
                onClick={handleOpenDialog}
            >
                Reset an Employee Password
            </Button>
            )}
            {!resetPass && (
                <Typography variant='h6'>
                    Unauthorized
                </Typography>
            )}
            
        </div>
      </div>
      <StepperDialog openDialog={openDialog} setOpenDialog={setOpenDialog} onDialogFinish={handleDialogFinish} items={[
        selectEmployeeStepperItem(),
        confirmPasswordResetStepperItem()
      ]}/>
    </React.Fragment>
  );
};

export default ResetPassword;