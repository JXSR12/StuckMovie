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

  const [ producers, setProducers ] = React.useState<Producer[]>([]);
  const [ genres, setGenres ] = React.useState<Genre[]>([]);
  const [ ageratings, setAgeRatings ] = React.useState<AgeRating[]>([]);

  React.useEffect(() => {
    getAllProducers().then(e => {
      setProducers(
        e.docs.map(p => {
          const pr = {id: p.id, ...p.data()} as Producer
          return pr;
        })
      )
    })

    getAllGenres().then(e => {
      setGenres(
        e.docs.map(g => {
          const gr = {id: g.id, ...g.data()} as Genre
          return gr;
        })
      )
    })

    getAllAgeRatings().then(e => {
      setAgeRatings(
        e.docs.map(a => {
          const ar = {id: a.id, ...a.data()} as AgeRating
          return ar;
        })
      )
    })
  }, []);


  const placeholderProd : Producer = {id: "",
    name: "string",
    email: "string",
    phone: "string",
    address: "string"} as Producer;

  const placeholderAgeR : AgeRating = {id: "", rating: ""} as AgeRating;

  const [ newTitle, setNewTitle ] = React.useState<string>("");
  const [ newProd, setNewProd ] = React.useState<any>(0);
  const [ newGenres, setNewGenres ] = React.useState<any[]>([]);
  const [ newSyn, setNewSyn ] = React.useState<string>("");
  const [ newPoster, setNewPoster ] = React.useState<string>("");
  const [ newDur, setNewDur ] = React.useState<number>(1);
  const [ newAgeR, setNewAgeR ] = React.useState<any>(0);

  const handleTitleChange = (event: React.ChangeEvent<{ value: string }>) => {
    setNewTitle(event.target.value);
  }
  const handleProdChange = (event: React.ChangeEvent<{ value: Producer }>) => {
    setNewProd(event.target.value);
  }
  const handleGenreChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setNewGenres(event.target.value as MFOption[]);
  };
  const handleSynChange = (event: React.ChangeEvent<{ value: string }>) => {
    setNewSyn(event.target.value);
  }
  const handlePosterChange = (event: React.ChangeEvent<{ value: string }>) => {
    setNewPoster(event.target.value);
  }
  const handleDurChange = (event: React.ChangeEvent<{ value: number }>) => {
    setNewDur(event.target.value);
  }
  const handleAgeRChange = (event: React.ChangeEvent<{ value: AgeRating }>) => {
    setNewAgeR(event.target.value as AgeRating);
  }
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

  function genreLabelsToGenreArr(genrelabels: string[]){
    return genres.filter(g => genrelabels.includes(g.name));
  }

  const handleSubmitForm = () => {
    if(newTitle.length === 0){
      setNewLRErrMsg("Movie title must be filled");
      setNewLRError(true);
    }else if(newSyn.length === 0){
      setNewLRErrMsg("Movie synopsis must be filled");
      setNewLRError(true);
    }else if(newPoster.length === 0){
      setNewLRErrMsg("Movie poster url must be filled");
      setNewLRError(true);
    }else if(newDur < 1){
      setNewLRErrMsg("Movie duration must be more than 0");
      setNewLRError(true);
    }else{
      console.log(genreLabelsToGenreArr(newGenres).map(e => new Genre(e.id, e.name)));
      console.log(producers[newProd as number]);
      console.log(ageratings[newAgeR as number]);
      insertNewMovie(newTitle, newSyn, newDur, genreLabelsToGenreArr(newGenres).map(e => new Genre(e.id, e.name)), ageratings[newAgeR as number], producers[newProd as number], newPoster).then(() => {
        setRefreshList(!refreshList);
      });
      setOpenCreateForm(false);
    }
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
          <title>Movies - Stuck in The Movie Cinema System</title>
        </Head>
        <Box p="3rem">
            <Typography align='left' variant="h4" color="primary">
            <LocalMoviesIcon fontSize='small'/>
              {"   Movies"}
              
            </Typography>
          </Box>
        
          <Grid container justifyContent="flex-end">
            <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    className={classes.button}
                    onClick={handleCreateNew}
            >
                Add New
            </Button>
          </Grid>

        <SearchBar
          value={searched}
          onChange={(searchVal) => handleSearch(searchVal)}
          onCancelSearch={() => cancelSearch()}
          className={classes.searchBar}
          placeholder="Search movie by title, genre, producer name, etc.."
        />
        <br/>
        <div className={classes.root}>
            <MovieGridContainer refreshList={refreshList} searched={searched} handleSearch={handleSearch}/>
        </div>
      </div>
      {genres.length > 0 && (
        <FormDialog 
                title={"Add New Movie"} 
                success_msg={"Successfully added new movie to database"} 
                positive_btn_label={"Add"}
                negative_btn_label={"Cancel"}
                generic_err={newLRErrMsg}
                fields={
                    [
                        {
                          id: "1",
                          component: <FormItemCombo<Producer> value={newProd} fieldname='Movie Producer' placeholder='Producer of the movie' options={producers.map((e, idx) => convertProducerMFOption(idx, e))} handleChange={handleProdChange}/>
                        },
                        {
                          id: "2",
                          component: <FormItemShortText value={newTitle} fieldname='Movie Title' placeholder='Title of the movie' minLength={0} maxLength={500} handleChange={handleTitleChange}/>
                        },
                        {
                          id: "3",
                          component: <FormItemMultipleChip value={newGenres} fieldname='Movie Genres' placeholder='Genres of the movie' options={genres.map((e, idx) => convertGenreMFOption(idx, e))} handleChange={handleGenreChange}/>
                        },
                        {
                          id: "4",
                          component: <FormItemSelect<AgeRating> value={newAgeR} fieldname='Movie Age Rating' placeholder='Age rating classification of the movie' options={ageratings.map((e, idx) => convertAgeRatingMFOption(idx, e))} handleChange={handleAgeRChange}/>
                        },
                        {
                          id: "5",
                          component: <FormItemLongText value={newSyn} fieldname='Movie Synopsis' placeholder='Synopsis of the movie' minLength={0} maxLength={1000} handleChange={handleSynChange}/>
                        },
                        {
                          id: "6",
                          component: <FormItemNumber value={newDur} fieldname='Movie Duration' min={0} max={999999} handleChange={handleDurChange} unit={"minutes"}/>
                        },
                        {
                          id: "7",
                          component: <FormItemShortText value={newPoster} fieldname='Movie Poster URL' placeholder='Direct URL to the poster image' minLength={0} maxLength={500} handleChange={handlePosterChange}/>
                        },
                    ]
                }
                handleSubmit={handleSubmitForm}
                handleClose={handleCloseForm}
                open={openCreateForm}
                openError={newLRError}
                setOpenError={setNewLRError}
            />
      )}
    </React.Fragment>
  );
};

export default MovieList;