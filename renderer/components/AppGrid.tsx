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
    title : {
      fontSize: 12,
    }
  }),
);

export function AppCard(props: {app : App}){
    const {title, category, icon, path } = props.app;
    const classes = useStyles();

    return(
        <Card className={classes.root}>
                <CardContent>
                    <Typography className={classes.title} color="textSecondary" gutterBottom>
                    {category}
                    </Typography>
                    {icon}
                    <Typography variant="h6" component="h2">
                    {title}
                    </Typography>
                </CardContent>
                <CardActions>
                    <Button size="medium" onClick={e => {
                        Router.push(path);
                        SidebarNav.currentPathname = path;
                        }}>Go to App</Button>
                </CardActions>
            </Card>
    );
}

export default function AppGridContainer(props: {searched : string}) {
  const classes = useStyles();

  const {searched} = props;

  const [applications, setApplications] = React.useState<App[]>(AppManager.applications);

  function filterSearch(app){
    const appl = app as App;
    return appl.title.toLowerCase().includes(searched.toLowerCase()) || appl.category.toLowerCase().includes(searched.toLowerCase()) || appl.access.toLowerCase().includes(searched.toLowerCase())
  }

  function AppGrid() {
    return (
        <Grid container spacing={3}>
            <Grid container item xs={12} spacing={4}>
                {applications.filter(filterSearch).map((app, index) => 
                    <Grid key={index} item xs={4}>
                        <AppCard app={app as App}/>
                    </Grid>
                )}
            </Grid>
        </Grid>
    );
  }

  return (
    <div className={classes.root}>
      <AppGrid/>
    </div>
  );
}