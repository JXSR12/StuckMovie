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
import { getProducer, Producer } from '../utils/producers_manager';
import { AgeRating, getAgeRating } from '../utils/agerating_manager';
import { Genre, getGenre } from '../utils/genre_manager';

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

export function MovieCard(props: {movie : Movie}){
    const { movie } = props;
    const classes = useStyles();

    return(
        <Card className={classes.root}>
                <CardMedia
                  className={classes.media}
                  image={movie.poster_url}
                  title="Poster"
                />
                <CardContent>
                    <Typography variant="h6" component="h2">
                      {movie.title}
                    </Typography>
                    <br/>
                    <Divider />
                    <br/>
                    <Grid container justifyContent="center" spacing={1}>
                    {movie.genres.map(m => (
                      <Grid item>
                        <Chip size="small" label={m.name} />
                      </Grid>
                    ))}
                    </Grid><br/>
                    <Divider />
                    <br/>
                    <Typography className={classes.rating} color="textSecondary" gutterBottom>
                      <Chip size="small" label={"Age Rating"} color="primary"/>{' ' + movie.ageRating.rating}
                    </Typography>
                    <Typography className={classes.producer} color="textSecondary" gutterBottom>
                      <Chip size="small" label={"Producer"} color="secondary"/> {' ' + movie.producer.name}
                    </Typography>
                </CardContent>
                <CardActions>
                    <Button size="medium" onClick={e => {}}>View Details</Button>
                </CardActions>
            </Card>
    );
}

export default function MovieGridContainer(props: {searched : string, handleSearch: any}) {
  const classes = useStyles();

  const {searched, handleSearch} = props;

  const [movies, setMovies] = React.useState<Movie[]>([]);

  const [refreshList, setRefreshList] = React.useState(false);

  React.useEffect(() => {
    getAllMoviesRTU().then((movies) => {
      setMovies(movies);
      handleSearch("");
      console.log('Retrieved all movies');
    });
    
  }, [refreshList]);

  function filterSearch(movie){
    const mov = movie as Movie;
    var genrenames = [];
    mov.genres.map(g => {
      genrenames.push(g.name.toLowerCase());
    })
    return mov.title.toLowerCase().includes(searched.toLowerCase()) || mov.producer.name.toLowerCase().includes(searched.toLowerCase()) || mov.ageRating.rating.toLowerCase().includes(searched.toLowerCase()) || genrenames.includes(searched.toLowerCase() || mov.synopsis.toLowerCase().includes(searched.toLowerCase()))
  }

  function MovGrid() {
    return (
        <Grid container spacing={3}>
            <Grid container item xs={12} spacing={8}>
                {movies.filter(filterSearch).map((movie, index) => 
                    <Grid key={index} item xs={4}>
                        <MovieCard movie={movie as Movie}/>
                    </Grid>
                )}
            </Grid>
        </Grid>
    );
  }

  return (
    <div className={classes.root}>
      <MovGrid/>
    </div>
  );
}