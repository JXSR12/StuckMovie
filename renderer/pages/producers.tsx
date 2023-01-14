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
import SupervisedUserCircleIcon from '@material-ui/icons/SupervisedUserCircle';
import Topbar from '../components/Topbar';
import Sidebar from '../components/Sidebar';
import clsx from 'clsx';
import { Box, Grid } from '@material-ui/core';
import { checkAuth, getAuthUser, IAuth, logOut } from '../utils/auth_manager';
import AppGridContainer from '../components/AppGrid';
import { SidebarNav } from '../utils/sidebar_nav_manager';
import { AppManager } from '../utils/apps_manager';
import MovieGridContainer from '../components/MovieGrid';
import SearchBar from 'material-ui-search-bar';
import AddIcon from '@material-ui/icons/Add';
import FormDialog, { FormItemLongText, FormItemShortText } from '../components/InsertFormDialog';
import { insertProducer } from '../utils/producers_manager';
import ProducerGridContainer from '../components/ProducerGrid';

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
    searchBar: {
        width: '100%',
        backgroundColor: '#ddd',
    },
    button: {
        margin: theme.spacing(2)
    }
  })
);

function MovieList() {
  const classes = useStyles({});
  const [ manage, setManage ] = React.useState(false);
  const [ managReq, setManageReq ]  = React.useState(false);
  const [ auth, setAuth ] = React.useState<IAuth>(getAuthUser());
  const [ open, setOpen ] = React.useState(true);
  const [ openCreateForm, setOpenCreateForm ] = React.useState(false);
  
  const [ newLRError, setNewLRError ] = React.useState<boolean>(false);

  const [ newLRErrMsg, setNewLRErrMsg ] = React.useState<string>('Error');

  const [ searched, setSearched ] = React.useState<string>("");

  const [ newProdName, setNewProdName ] = React.useState<string>("");
  const [ newProdEmail, setNewProdEmail ] = React.useState<string>("");
  const [ newProdPhone, setNewProdPhone ] = React.useState<string>("");
  const [ newProdAddress, setNewProdAddress ] = React.useState<string>("");

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

  const cancelSearch = () => {
    setSearched("");
    handleSearch("");
  };

  const handleCreateNew = () => {
    setOpenCreateForm(true);
  }

  const handleCloseForm = () => {
    setOpenCreateForm(false);
  }

  const handleSubmitForm = () => {
    if(newProdName.length < 1){
        setNewLRErrMsg("Producer name must be filled");
        setNewLRError(true);
    }else if(newProdEmail.length < 1){
        setNewLRErrMsg("Producer email address must be filled");
        setNewLRError(true);
    }else if(newProdPhone.length < 1){
        setNewLRErrMsg("Producer phone number must be filled");
        setNewLRError(true);
    }else if(newProdAddress.length < 1){
        setNewLRErrMsg("Producer home address must be filled");
        setNewLRError(true);
    }else{
      insertProducer(newProdName, newProdPhone, newProdEmail, newProdAddress);
      setOpenCreateForm(false);
    }
  }

  const handleNameChange = (event: React.ChangeEvent<{ value: string }>) => {
    setNewProdName(event.target.value);
  }

  const handlePhoneChange = (event: React.ChangeEvent<{ value: string }>) => {
    setNewProdPhone(event.target.value);
  }

  const handleEmailChange = (event: React.ChangeEvent<{ value: string }>) => {
    setNewProdEmail(event.target.value);
  }

  const handleAddressChange = (event: React.ChangeEvent<{ value: string }>) => {
    setNewProdAddress(event.target.value);
  }

  const handleSidebarButton = SidebarNav.handleSidebarButton;

  const handleSearchClick = AppManager.handleDefaultSearchClick;

  React.useEffect(() => {
    handleSearch("");
  }, []);

  return (
    <React.Fragment>
      <Sidebar isManagement={manage} isManagementReq={managReq} handleSearch={handleSearch} handleSearchClick={handleSearchClick} handleSidebarButton={handleSidebarButton} handleLogOut={handleLogOut} handleOpenDrawerParent={handleOpenDrawer}/>
      <div className={clsx(classes.content, {
        [classes.contentShift]: open,
      })}>
        <Head>
          <title>Movie Producers - Stuck in The Movie Cinema System</title>
        </Head>
        <Box p="3rem">
            <Typography align='left' variant="h4" color="primary">
            <SupervisedUserCircleIcon fontSize='small'/>
              {"   Movie Producers"}
              
            </Typography>
        </Box>
        <Box mt={2} mb={2}>
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
        </Box>
        <SearchBar
          value={searched}
          onChange={(searchVal) => handleSearch(searchVal)}
          onCancelSearch={() => cancelSearch()}
          className={classes.searchBar}
          placeholder="Search producer by name, email, phone number, etc.."
        />
        <br/>
        <div className={classes.root}>
            <ProducerGridContainer searched={searched} handleSearch={handleSearch}/>
        </div>
      </div>
      <FormDialog 
                title={"Register New Movie Producer"} 
                success_msg={"Successfully registered new movie producer"} 
                positive_btn_label={"Register"}
                negative_btn_label={"Cancel"}
                generic_err={newLRErrMsg}
                fields={
                    [
                        {
                            id: "1",
                            component: <FormItemShortText value={newProdName} fieldname='Producer Full Name' placeholder='Full name of the producer' minLength={0} maxLength={500} handleChange={handleNameChange}/>
                        },
                        {
                            id: "2",
                            component: <FormItemShortText value={newProdEmail} fieldname='Producer Email Address' placeholder='Email address of the producer' minLength={0} maxLength={500} handleChange={handleEmailChange}/>
                        },
                        {
                            id: "3",
                            component: <FormItemShortText value={newProdPhone} fieldname='Producer Phone Number' placeholder='Phone number of the producer' minLength={0} maxLength={500} handleChange={handlePhoneChange}/>
                        },
                        {
                            id: "4",
                            component: <FormItemLongText value={newProdAddress} fieldname='Producer Home Address' placeholder='Home address of the producer' minLength={0} maxLength={500} handleChange={handleAddressChange}/>
                        }
                    ]
                }
                handleSubmit={handleSubmitForm}
                handleClose={handleCloseForm}
                open={openCreateForm}
                openError={newLRError}
                setOpenError={setNewLRError}
            />
    </React.Fragment>
  );
};

export default MovieList;