import React from 'react';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import PeopleIcon from '@material-ui/icons/People';
import InboxIcon from '@material-ui/icons/MoveToInbox';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import ScheduleIcon from '@material-ui/icons/Schedule';
import LocalMoviesIcon from '@material-ui/icons/LocalMovies';
import MeetingRoomIcon from '@material-ui/icons/MeetingRoom';
import FastfoodIcon from '@material-ui/icons/Fastfood';
import AssignmentLateIcon from '@material-ui/icons/AssignmentLate';
import ConfirmationNumberIcon from '@material-ui/icons/ConfirmationNumber';
import CategoryIcon from '@material-ui/icons/Category';
import TodayIcon from '@material-ui/icons/Today';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Router from 'next/router';
import { App, AppManager } from '../utils/apps_manager';
import { SidebarNav } from '../utils/sidebar_nav_manager';
import { getAllMovies, getAllMoviesRTU, Movie } from '../utils/movies_manager';
import { Box, CardMedia, Chip, Divider } from '@material-ui/core';
import { getProducer, Producer, getAllProducers } from '../utils/producers_manager';
import { AgeRating, getAgeRating } from '../utils/agerating_manager';
import { Genre, getGenre } from '../utils/genre_manager';
import { FNBMenuInfocard, ProducerInfocard } from './EmployeeCardDialog';
import { FNBMenu, FNBMenuCategory, getAllFNBMenus } from '../utils/fnbmenu_manager';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
    },
    paper: {
      padding: theme.spacing(1),
      textAlign: 'center',
      color: theme.palette.text.secondary,
    },
    rating : {
      fontSize: 13,
    },
    producer : {
      fontSize: 14,
    },
    media: {
      height: 140,
    },
  }),
);

export function ConcessionCard(props: {concession : FNBMenu}){
    const { concession } = props;
    const classes = useStyles();

    const [openConcession, setOpenConcession] = React.useState(false);

    return(
        <Card className={classes.root}>
                <CardContent>
                    <Typography variant="h6" component="h2">
                      {concession.name}
                    </Typography>
                    <br/>
                    <Divider />
                    <br/>
                    <Typography className={classes.rating} color="textSecondary" gutterBottom>
                      <Chip size="small" label={"About"} color="primary"/>{' ' + concession.description}
                    </Typography>
                    <Typography className={classes.producer} color="textSecondary" gutterBottom>
                      <Chip size="small" label={"Category"} color="primary"/> {' ' + FNBMenuCategory[concession.category]}
                    </Typography>
                </CardContent>
                <CardActions>
                    <Button size="medium" onClick={e => setOpenConcession(true)}>View Details</Button>
                </CardActions>
                <FNBMenuInfocard item={concession} openDialog={openConcession} setOpenDialog={setOpenConcession} onDialogFinish={e => setOpenConcession(false)}/>
            </Card>
    );
}

export default function ConcessionGridContainer(props: {}) {
  const classes = useStyles();

  const [concessions, setConcessions] = React.useState<FNBMenu[]>([]);

  const [refreshList, setRefreshList] = React.useState(false);

  React.useEffect(() => {
    getAllFNBMenus().then((prod) => {
        setConcessions(
        prod.docs.map((pr) => {
            return {id: pr.id, ...pr.data()} as FNBMenu
        }));
    });
    
  }, [refreshList]);

  function ProdGrid() {
    return (
        <Grid container spacing={3}>
            <Grid container item xs={12} spacing={4}>
                {concessions.map((conc, index) => 
                    <Grid key={index} item xs={3}>
                        <ConcessionCard concession={conc as FNBMenu}/>
                    </Grid>
                )}
            </Grid>
        </Grid>
    );
  }

  return (
    <div className={classes.root}>
      <ProdGrid/>
    </div>
  );
}