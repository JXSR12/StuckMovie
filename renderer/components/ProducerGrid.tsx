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
import { ProducerInfocard } from './EmployeeCardDialog';

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

export function ProducerCard(props: {producer : Producer}){
    const { producer } = props;
    const classes = useStyles();

    const [openProducer, setOpenProducer] = React.useState(false);

    return(
        <Card className={classes.root}>
                <CardContent>
                    <Typography variant="h6" component="h2">
                      {producer.name}
                    </Typography>
                    <br/>
                    <Divider />
                    <br/>
                    <Typography className={classes.rating} color="textSecondary" gutterBottom>
                      <Chip size="small" label={"Phone"} color="primary"/>{' ' + producer.phone}
                    </Typography>
                    <Typography className={classes.producer} color="textSecondary" gutterBottom>
                      <Chip size="small" label={"Email"} color="primary"/> {' ' + producer.email}
                    </Typography>
                </CardContent>
                <CardActions>
                    <Button size="medium" onClick={e => setOpenProducer(true)}>View Details</Button>
                </CardActions>
                <ProducerInfocard producer={producer} openDialog={openProducer} setOpenDialog={setOpenProducer} onDialogFinish={e => setOpenProducer(false)}/>
            </Card>
    );
}

export default function ProducerGridContainer(props: {searched : string, handleSearch: any}) {
  const classes = useStyles();

  const {searched, handleSearch} = props;

  const [producers, setProducers] = React.useState<Producer[]>([]);

  const [refreshList, setRefreshList] = React.useState(false);

  React.useEffect(() => {
    getAllProducers().then((prod) => {
        setProducers(
        prod.docs.map((pr) => {
            return {id: pr.id, ...pr.data()} as Producer
        }));
    });
    
  }, [refreshList]);

  function filterSearch(producer){
    const prod = producer as Producer;

    return prod.name.toLowerCase().includes(searched.toLowerCase()) || prod.phone.toLowerCase().includes(searched.toLowerCase()) || prod.email.toLowerCase().includes(searched.toLowerCase()) || prod.address.toLowerCase().includes(searched.toLowerCase())
  }

  function ProdGrid() {
    return (
        <Grid container spacing={3}>
            <Grid container item xs={12} spacing={4}>
                {producers.filter(filterSearch).map((prod, index) => 
                    <Grid key={index} item xs={3}>
                        <ProducerCard producer={prod as Producer}/>
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