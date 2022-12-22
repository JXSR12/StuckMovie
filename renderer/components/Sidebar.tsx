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
import Chip from '@material-ui/core/Chip';
import MailIcon from '@material-ui/icons/Mail';
import AppsIcon from '@material-ui/icons/Apps';
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
  handleSearchClick: () => void;
  handleSearch: (search: string) => void;
  handleSidebarButton: (key: string) => void;
  isManagement: boolean;
  isManagementReq: boolean;
}

export default function Sidebar(props: SidebarProps) {
  const classes = useStyles();
  const [openDrawer, setOpenDrawer] = React.useState(true);
  const { handleOpenDrawerParent, handleLogOut, handleSidebarButton, handleSearch, handleSearchClick, isManagement, isManagementReq} = props;

  const handleOpenDrawer = () =>{
    setOpenDrawer(!openDrawer);
    handleOpenDrawerParent();
  }

  return (
    <div className={classes.root}>
      
      <CssBaseline />
      <Topbar handleSearchClick={handleSearchClick} handleSearch={handleSearch} handleLogOut={handleLogOut} handleOpenDrawer={handleOpenDrawer}/>
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
          <Divider component={'li'} className={classes.drawerDivider}/>
            <li>
              <Typography
                color="primary"
                display="block"
                variant="caption"
                align="center"
              >
                <Chip label="Operations"/>
              </Typography>
            </li>
          <List>
            <ListItem button key={'Movies'} className={classes.drawerItem}>
                <ListItemIcon className={classes.drawerItem}><LocalMoviesIcon/></ListItemIcon>
                <ListItemText primary={'Movies'} className={classes.drawerItem}/>
            </ListItem>
            <ListItem button key={'Theatres'} className={classes.drawerItem}>
                <ListItemIcon className={classes.drawerItem}><MeetingRoomIcon/></ListItemIcon>
                <ListItemText primary={'Theatres'} className={classes.drawerItem}/>
            </ListItem>
            <ListItem button key={'Schedules'} className={classes.drawerItem}>
                <ListItemIcon className={classes.drawerItem}><TodayIcon/></ListItemIcon>
                <ListItemText primary={'Schedules'} className={classes.drawerItem}/>
            </ListItem>
          </List>
          
          {isManagement && (
            <div>
            <Divider component={'li'} className={classes.drawerDivider}/>
            <li>
              <Typography
                color="primary"
                display="block"
                variant="caption"
                align="center"
              >
                <Chip label="Management"/>
              </Typography>
            </li>
            <List>
              <ListItem button onClick={e => handleSidebarButton('Employees')} key={'Employees'} className={classes.drawerItem}>
                  <ListItemIcon className={classes.drawerItem}><PeopleRoundedIcon /></ListItemIcon>
                  <ListItemText primary={'Employees'} className={classes.drawerItem}/>
              </ListItem>
              {isManagementReq && (
                <ListItem button onClick={e => handleSidebarButton('Approvals')} key={'Approvals'} className={classes.drawerItem}>
                  <ListItemIcon className={classes.drawerItem}><InboxIcon /></ListItemIcon>
                  <ListItemText primary={'Requests'} className={classes.drawerItem}/>
                </ListItem>
              )}
            </List>
            </div>
          )}

          <Divider component={'li'} className={classes.drawerDivider}/>
            <li>
              <Typography
                color="primary"
                display="block"
                variant="caption"
                align="center"
              >
                <Chip label="Services"/>
              </Typography>
            </li>

          <List>
            <ListItem button onClick={e => handleSidebarButton('ESS')} key={'ESS'} className={classes.drawerItem}>
              <ListItemIcon className={classes.drawerItem}><AppsIcon /></ListItemIcon>
              <ListItemText primary={'Employee Services'} className={classes.drawerItem}/>
            </ListItem>
          </List>

        </div>
      </Drawer>
    </div>
  );
}