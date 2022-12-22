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
import { Box } from '@material-ui/core';
import { checkAuth, getAuthUser, IAuth, logOut } from '../utils/auth_manager';
import AppGridContainer from '../components/AppGrid';
import { SidebarNav } from '../utils/sidebar_nav_manager';
import { AppManager } from '../utils/apps_manager';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import RequestTabs, { RequestType } from '../components/EmployeeRequestTabs';
import AddIcon from '@material-ui/icons/Add';
import Grid from '@material-ui/core/Grid';
import FormDialog, { FormItemDateTime, FormItemLabel, FormItemLongText, FormItemNumber } from '../components/InsertFormDialog';
import { issueLeaveRequest } from '../utils/leaverequest_manager';

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
        margin: theme.spacing(2)
    }
  })
);

function MyLeaveRequests() {
  const classes = useStyles({});
  const [ manage, setManage ] = React.useState(false);
  const [ managReq, setManageReq ]  = React.useState(false);
  const [ auth, setAuth ] = React.useState<IAuth>(getAuthUser());
  const [ open, setOpen ] = React.useState(true);

  const [ searched, setSearched ] = React.useState<string>("");

  const [ openCreateForm, setOpenCreateForm ] = React.useState(false);

  const [ newLeaveDate, setNewLeaveDate ] = React.useState<Date>(new Date(Date.now()));

  const [ newLeaveDuration, setNewLeaveDuration ] = React.useState<number>(1);

  const [ newLeaveReason, setNewLeaveReason ] = React.useState<string>('');

  const [ newLRError, setNewLRError ] = React.useState<boolean>(false);

  const [ newLRErrMsg, setNewLRErrMsg ] = React.useState<string>('Error');

  const [refreshList, setRefreshList] = React.useState<boolean>(false);

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

  const handleCreateNew = () => {
    setOpenCreateForm(true);
  }

  const handleCloseForm = () => {
    setOpenCreateForm(false);
  }

  const handleSubmitForm = () => {
    if(newLeaveDate <= new Date(Date.now())){
      setNewLRErrMsg("Leave date must not be before the current time");
      setNewLRError(true);
    }else if(newLeaveDuration < 1 || newLeaveDuration > 8){
      setNewLRErrMsg("Leave duration must be filled and must not exceed 8 hours");
      setNewLRError(true);
    }else if(newLeaveReason.length === 0){
      setNewLRErrMsg("Leave reason must be filled properly or your request will be declined");
      setNewLRError(true);
    }else{
      issueLeaveRequest(getAuthUser().eid, newLeaveReason, Timestamp.fromDate(newLeaveDate), newLeaveDuration).then(
        () => {
          setRefreshList(!refreshList);
        }
      )
      setOpenCreateForm(false);
    }
  }

  const handleDurationChange = (event: React.ChangeEvent<{ value: number }>) => {
    setNewLeaveDuration(event.target.value);
  }

  const handleReasonChange = (event: React.ChangeEvent<{ value: string }>) => {
    setNewLeaveReason(event.target.value);
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
          <title>My Leave Requests - Stuck in The Movie Cinema System</title>
        </Head>
        <Box p="3rem">
            <Typography align='left' variant="h4" color="primary">
            <ExitToAppIcon fontSize='small'/>
              {"   My Leave Requests"}
              
            </Typography>
          </Box>
        <div className={classes.root}>
        <Grid container justifyContent="flex-end">
            <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    className={classes.button}
                    onClick={handleCreateNew}
            >
                Create New
            </Button>
        </Grid>
            
            <RequestTabs refreshList={refreshList} employee={getAuthUser() as IAuth} requestType={RequestType.LeaveRequest} />
            <FormDialog 
                title={"Create New Leave Request"} 
                success_msg={"Successfully created new leave request!"} 
                positive_btn_label={"Add"}
                negative_btn_label={"Cancel"}
                generic_err={newLRErrMsg}
                fields={
                    [
                        {
                            id: "1",
                            component: <FormItemDateTime value={newLeaveDate} fieldname='Leaving on ' min={new Date(Date.now())} max={new Date("2100-12-31")} handleChange={setNewLeaveDate}/>
                        },
                        {
                            id: "2",
                            component: <FormItemNumber value={newLeaveDuration} fieldname='Leave Duration' unit={"hours"} min={1} max={8} handleChange={handleDurationChange}/>
                        },
                        {
                            id: "3",
                            component: <FormItemLongText value={newLeaveReason} fieldname='Leave Reason' placeholder='Please specify your leaving reason' minLength={0} maxLength={500} handleChange={handleReasonChange}/>
                        }
                    ]
                }
                handleSubmit={handleSubmitForm}
                handleClose={handleCloseForm}
                open={openCreateForm}
                openError={newLRError}
                setOpenError={setNewLRError}
            />
        </div>
      </div>
    </React.Fragment>
  );
};

export default MyLeaveRequests;