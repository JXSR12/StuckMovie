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
import LocalMoviesIcon from '@material-ui/icons/LocalMovies';
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
import FormDialog, { FormItemCombo, FormItemLongText, FormItemMultipleChip, FormItemNumber, FormItemSelect, FormItemShortText, MFOption } from '../components/InsertFormDialog';
import { getAllProducers, Producer } from '../utils/producers_manager';
import { Genre, getAllGenres } from '../utils/genre_manager';
import { AgeRating, getAllAgeRatings } from '../utils/agerating_manager';
import { insertNewMovie } from '../utils/movies_manager';
import MultipleSelect from '../components/MultipleChipDemo';
import FastfoodIcon from '@material-ui/icons/Fastfood';
import { FNBMenu, getAllFNBMenus } from '../utils/fnbmenu_manager';
import ConcessionGridContainer from '../components/ConcessionGrid';

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

function ConcessionList() {
  const classes = useStyles({});
  const [ manage, setManage ] = React.useState(false);
  const [ managReq, setManageReq ]  = React.useState(false);
  const [ auth, setAuth ] = React.useState<IAuth>(getAuthUser());
  const [ open, setOpen ] = React.useState(true);
  const [ openCreateForm, setOpenCreateForm ] = React.useState(false);

  const [ concessions, setConcessions ] = React.useState<FNBMenu[]>([]);

  React.useEffect(() => {
    getAllFNBMenus().then(e => {
        e.docs
    })
  }, []);
  const [ refreshList, setRefreshList ] = React.useState<boolean>(false);

  const [ newLRError, setNewLRError ] = React.useState<boolean>(false);

  const [ newLRErrMsg, setNewLRErrMsg ] = React.useState<string>('Error');

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

  function convertProducerMFOption(index: number, producer: Producer) : MFOption{
    return {id: index, label: producer.name, content: producer} as MFOption;
  }

  function convertGenreMFOption(index: number, genre: Genre) : MFOption{
    const a = {id: index, label: genre.name, content: genre} as MFOption;
    return a;
  }

  function convertAgeRatingMFOption(index: number, agerating: AgeRating) : MFOption{
    return {id: index, label: agerating.rating, content: agerating} as MFOption;
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
          <title>Concessions - Stuck in The Movie Cinema System</title>
        </Head>
        <Box p="3rem">
            <Typography align='left' variant="h4" color="primary">
            <FastfoodIcon fontSize='small'/>
              {"   Concessions"}
              
            </Typography>
          </Box>
        <br/>
        <div className={classes.root}>
            <ConcessionGridContainer/>
        </div>
      </div>
    </React.Fragment>
  );
};

export default ConcessionList;