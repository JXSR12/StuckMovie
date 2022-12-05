import React from 'react';
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import AppBar from '@material-ui/core/AppBar';
import CssBaseline from '@material-ui/core/CssBaseline';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import InboxIcon from '@material-ui/icons/MoveToInbox';
import MailIcon from '@material-ui/icons/Mail';
import Topbar from './Topbar';
import PeopleRoundedIcon from '@material-ui/icons/PeopleRounded'
import LocalMoviesIcon from '@material-ui/icons/LocalMovies';
import MeetingRoomIcon from '@material-ui/icons/MeetingRoom';
import TodayIcon from '@material-ui/icons/Today';
import clsx from 'clsx';

const drawerWidth = 240;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
    },
    appBar: {
      zIndex: theme.zIndex.drawer + 1,
    },
    drawer: {
      width: drawerWidth,
      flexShrink: 0,
    },
    drawerItem: {
      color: 'white'
    },
    drawerDivider: {
      backgroundColor: '#333'
    },
    drawerPaper: {
      width: drawerWidth,
      backgroundColor: '#111',
    },
    drawerContainer: {
      overflow: 'auto',
    },
    drawerHeader: {
      display: 'flex',
      alignItems: 'center',
      padding: theme.spacing(0, 1),
      // necessary for content to be below app bar
      ...theme.mixins.toolbar,
      justifyContent: 'flex-end',
    },
  }),
);

export interface SidebarProps {
  handleOpenDrawerParent: () => void;
  handleLogOut: () => void;
  handleSidebarButton: (key: string) => void;
  isManagement: boolean;
}

export default function Sidebar(props: SidebarProps) {
  const classes = useStyles();
  const [openDrawer, setOpenDrawer] = React.useState(true);
  const { handleOpenDrawerParent, handleLogOut, handleSidebarButton, isManagement} = props;

  const handleOpenDrawer = () =>{
    setOpenDrawer(!openDrawer);
    handleOpenDrawerParent();
  }

  return (
    <div className={classes.root}>
      
      <CssBaseline />
      <Topbar handleLogOut={handleLogOut} handleOpenDrawer={handleOpenDrawer}/>
      <Drawer
        open={openDrawer}
        className={classes.drawer}
        variant="persistent"
        classes={{
          paper: classes.drawerPaper,
        }}
      >
        <Toolbar />
        <div className={classes.drawerContainer}>
          <List>
            {['Movies', 'Theaters', 'Schedules'].map((text, index) => (
              <ListItem button key={text} className={classes.drawerItem}>
                <ListItemIcon className={classes.drawerItem}>{index == 0 ? <LocalMoviesIcon/> : index == 1 ? <MeetingRoomIcon/> : <TodayIcon/>}</ListItemIcon>
                <ListItemText primary={text} className={classes.drawerItem}/>
              </ListItem>
            ))}
          </List>
          <Divider className={classes.drawerDivider}/>
          
          {isManagement && (
            <List>
            {['Employees'].map((text, index) => (
              <ListItem button onClick={e => handleSidebarButton(text)} key={text} className={classes.drawerItem}>
                <ListItemIcon className={classes.drawerItem}>{index == 0 ? <PeopleRoundedIcon /> : <InboxIcon />}</ListItemIcon>
                <ListItemText primary={text} className={classes.drawerItem}/>
              </ListItem>
            ))}
          </List>
          )}

        </div>
      </Drawer>
    </div>
  );
}