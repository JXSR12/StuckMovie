import React from 'react';
import Head from 'next/head';
import { Theme, makeStyles, createStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Router from 'next/router';
import { collection, DocumentData, getDocs, QueryDocumentSnapshot, QuerySnapshot, Timestamp } from 'firebase/firestore';
import { database } from '../database/firebase';
import InboxIcon from '@material-ui/icons/MoveToInbox';
import Sidebar from '../components/Sidebar';
import clsx from 'clsx';
import { Box } from '@material-ui/core';
import PendingTabs from '../components/PendingTabs';
import { getAuthUser, IAuth, logOut } from '../utils/auth_manager';
import { SidebarNav } from '../utils/sidebar_nav_manager';
import { AppManager } from '../utils/apps_manager';

const db_employees = collection(database, 'employees');

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

function Pendings() {
  const classes = useStyles({});
  const [ manage, setManage ] = React.useState(false);
  const [ managReq, setManageReq ]  = React.useState(false);
  const [ open, setOpen ] = React.useState(true);
  const [ auth, setAuth ] = React.useState(getAuthUser());

  // React.useEffect(() => {
  //   checkAuth().then((res) => {
  //     setAuthed(res);
  //     setAuth(secureLocalStorage.getItem('auth') as IAuth);
  //     if(auth && (auth.dept_id === 'qIvZZoS7Bnro7bD7DpWs' || auth.dept_id === '44dnLCF6Mksm8k2jn09w')){
  //       setManage(true);
  //     }
  //     if(auth.dept_id === '44dnLCF6Mksm8k2jn09w'){
  //       setWarnletter(true);
  //     }

  //     console.log('Authed: ' + authed + '| object: ' + secureLocalStorage.getItem('auth'));
  //     console.log(secureLocalStorage.getItem('auth'));

  //     if(!authed){
  //       Router.push('/home');
  //     }
  //   });
  // }, [authed]);

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

  const handleSidebarButton = SidebarNav.handleSidebarButton;

  const handleSearchClick = AppManager.handleDefaultSearchClick;

  const handleSearch = () => {
    
  }

  return (
    <React.Fragment>
      <Sidebar isManagement={manage} handleSearch={handleSearch} handleSearchClick={handleSearchClick} isManagementReq={managReq} handleSidebarButton={handleSidebarButton} handleLogOut={handleLogOut} handleOpenDrawerParent={handleOpenDrawer}/>
      <div className={clsx(classes.content, {
        [classes.contentShift]: open,
      })}>
        <Head>
          <title>Requests - Stuck in The Movie Cinema System</title>
        </Head>
        <div className={classes.root}>
          <Box p="3rem">
            <Typography align='left' variant="h4" color="primary">
            <InboxIcon fontSize='small'/>
              {"   Requests"}
              
            </Typography>
          </Box>
          <PendingTabs/>
        </div>
      </div>
    </React.Fragment>
  );
};

export default Pendings;
