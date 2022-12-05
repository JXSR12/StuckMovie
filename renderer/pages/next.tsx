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
import Topbar from '../components/Topbar';
import Sidebar from '../components/Sidebar';
import clsx from 'clsx';
import { Box } from '@material-ui/core';

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


async function checkAuth() {
  return secureLocalStorage.getItem('auth') != null && Object.keys(secureLocalStorage.getItem('auth')).length > 0;
}

const logOut = (setAuthed: any) => {
  secureLocalStorage.removeItem('auth');
  checkAuth().then((res) => {
    setAuthed(res);
    console.log('After log out ' + secureLocalStorage.getItem('auth'));
  })
}

export interface IAuth {
  address?: string;
  dept_id?: string;
  div_id?: string;
  dob?: Timestamp;
  eid?: string;
  email?: string;
  name?: string;
  password?: string;
  phone?: string;
  salary?: number;
}

function Next() {
  const classes = useStyles({});
  const [ authed, setAuthed ] = React.useState(true);
  const [ manage, setManage ] = React.useState(false);
  const [ auth, setAuth ] = React.useState<IAuth>(secureLocalStorage.getItem('auth') as IAuth);
  const [ open, setOpen ] = React.useState(true);

  React.useEffect(() => {
    checkAuth().then((res) => {
      setAuthed(res);
      setAuth(secureLocalStorage.getItem('auth') as IAuth);
      if(auth && auth.dept_id === 'qIvZZoS7Bnro7bD7DpWs'){
        setManage(true);
      }

      console.log('Authed: ' + authed + '| object: ' + secureLocalStorage.getItem('auth'));
      console.log(secureLocalStorage.getItem('auth'));

      if(!authed){
        Router.push('/home');
      }
    });
  }, [authed]);

  const handleOpenDrawer = () => {
    setOpen(!open);
  }

  const handleLogOut = () => {
    logOut(setAuthed);
  }

  const handleSidebarButton = (key: string) => {
    if(key === 'Employees'){
      if(Router.pathname !== '/next'){
        Router.push('/next');
      }
    }
  }

  return (
    <React.Fragment>
      <Sidebar isManagement={manage} handleSidebarButton={handleSidebarButton} handleLogOut={handleLogOut} handleOpenDrawerParent={handleOpenDrawer}/>
      <div className={clsx(classes.content, {
        [classes.contentShift]: open,
      })}>
        <Head>
          <title>Dashboard - Stuck in The Movie Cinema System</title>
        </Head>
        <div className={classes.root}>
          <Box p="3rem">
            <Typography align='left' variant="h4" color="primary">
            <PeopleRoundedIcon fontSize='small'/>
              {"   Manage Employees"}
              
            </Typography>
          </Box>
          {manage && (<ManageTable access={manage}></ManageTable>)}
        </div>
      </div>
    </React.Fragment>
  );
};

export default Next;
