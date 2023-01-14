import React from 'react';
import Head from 'next/head';
import { Theme, makeStyles, createStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Router from 'next/router';
import ManageTable from '../components/ManageTable';
import PeopleRoundedIcon from '@material-ui/icons/PeopleRounded'
import Sidebar from '../components/Sidebar';
import clsx from 'clsx';
import { Box } from '@material-ui/core';
import { getAuthUser, IAuth, logOut } from '../utils/auth_manager';
import { SidebarNav } from '../utils/sidebar_nav_manager';
import { AppManager } from '../utils/apps_manager';

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

function Next() {
  const classes = useStyles({});
  const [ manage, setManage ] = React.useState(false);
  const [ managReq, setManageReq ]  = React.useState(false);
  const [ warnletter, setWarnletter ] = React.useState(false);
  const [ changeWorkTime, setChangeWorkTime ] = React.useState(false);
  const [ adjustSalary, setAdjustSalary ] = React.useState(false);
  const [ auth, setAuth ] = React.useState<IAuth>(getAuthUser());
  const [ open, setOpen ] = React.useState(true);

  React.useEffect(() => {
    if(auth && (auth.dept_id === 'qIvZZoS7Bnro7bD7DpWs' || auth.dept_id === '44dnLCF6Mksm8k2jn09w')){
      setManage(true);
    }

    if(auth && (auth.dept_id === 'qIvZZoS7Bnro7bD7DpWs')){
      setManageReq(true);
    }

    if(auth.dept_id === '44dnLCF6Mksm8k2jn09w'){
      setWarnletter(true);
      setChangeWorkTime(true);
      setAdjustSalary(true);
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
          <title>Employees - Stuck in The Movie Cinema System</title>
        </Head>
        <div className={classes.root}>
          <Box p="3rem">
            <Typography align='left' variant="h4" color="primary">
            <PeopleRoundedIcon fontSize='small'/>
              {"   Manage Employees"}
              
            </Typography>
          </Box>
          {manage && (<ManageTable adjustSalary={adjustSalary} changeWorkTime={changeWorkTime} access={manage} giveWarnLetter={warnletter}></ManageTable>)}
        </div>
      </div>
    </React.Fragment>
  );
};

export default Next;
