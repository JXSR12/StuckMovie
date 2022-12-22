import React from 'react';
import { alpha, makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import InputBase from '@material-ui/core/InputBase';
import Badge from '@material-ui/core/Badge';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import MenuIcon from '@material-ui/icons/Menu';
import SearchIcon from '@material-ui/icons/Search';
import AccountCircle from '@material-ui/icons/AccountCircle';
import MailIcon from '@material-ui/icons/Mail';
import NotificationsIcon from '@material-ui/icons/Notifications';
import ClearIcon from '@material-ui/icons/Clear';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Divider from '@material-ui/core/Divider';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import MoreIcon from '@material-ui/icons/MoreVert';
import clsx from 'clsx';
import secureLocalStorage from 'nextjs-secure-local-storage';
import { Notification } from '../utils/notification_manager';
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en'
import { collection, doc, onSnapshot, Timestamp } from 'firebase/firestore';
import { database } from '../database/firebase';
import { IAuth } from '../utils/auth_manager';
import SearchBar from 'material-ui-search-bar';
import Router from 'next/router';
import { SidebarNav } from '../utils/sidebar_nav_manager';

TimeAgo.addDefaultLocale(en);

const drawerWidth = 240;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    grow: {
      flexGrow: 1,
    },
    notifList: {
      width: '100%',
      maxWidth: '36ch',
      backgroundColor: theme.palette.background.paper,
    },
    inline: {
      display: 'inline',
    },
    menuButton: {
      marginRight: theme.spacing(2),
    },
    title: {
      display: 'none',
      [theme.breakpoints.up('sm')]: {
        display: 'block',
      },
    },
    search: {
      position: 'relative',
      borderRadius: theme.shape.borderRadius,
      backgroundColor: alpha(theme.palette.common.white, 0.15),
      '&:hover': {
        backgroundColor: alpha(theme.palette.common.white, 0.25),
      },
      marginRight: theme.spacing(2),
      marginLeft: 0,
      width: '100%',
      [theme.breakpoints.up('sm')]: {
        marginLeft: theme.spacing(3),
        width: 'auto',
      },
    },
    inputRoot: {
      color: 'inherit',
    },
    inputInput: {
      padding: theme.spacing(1, 1, 1, 0),
      // vertical padding + font size from searchIcon
      paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
      transition: theme.transitions.create('width'),
      width: '100%',
      [theme.breakpoints.up('md')]: {
        width: '20ch',
      },
    },
    sectionDesktop: {
      display: 'none',
      [theme.breakpoints.up('md')]: {
        display: 'flex',
      },
    },
    sectionMobile: {
      display: 'flex',
      [theme.breakpoints.up('md')]: {
        display: 'none',
      },
    },
    appBar: {
      width: `calc(100% + ${drawerWidth}px)`,
      transition: theme.transitions.create(['margin', 'width'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
    },
    appBarShift: {
      width: '100%',
      marginLeft: drawerWidth,
      transition: theme.transitions.create(['margin', 'width'], {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
    },
    searchBar: {
      width: '100%',
      backgroundColor: '#f7e686',
    }
  }),
);

export interface TopbarProps {
  handleOpenDrawer: () => void;
  handleLogOut: () => void;
  handleSearch: (searched: string) => void;
  handleSearchClick: () => void;
}

export default function Topbar(props: TopbarProps) {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [notifAnchorEl, setNotifAnchorEl] = React.useState<null | HTMLElement>(null);
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = React.useState<null | HTMLElement>(null);
  const [notifCount, setNotifCount]  = React.useState(0);
  const [unreadNotifCount, setUnreadNotifCount]  = React.useState(0);
  const [notifs, setNotifs] = React.useState<Notification[]>([]);
  const { handleOpenDrawer, handleLogOut, handleSearch, handleSearchClick } = props;
  const [open, setOpen] = React.useState(true);
  var auth = secureLocalStorage.getItem('auth') as IAuth;
  const db_notifcounts = collection(database, 'notifcounts');
  var unsub;

  React.useEffect(() => {
    unsub = onSnapshot(doc(db_notifcounts, auth.eid), (doc) => {
      getAllNotifications();
    });
  }, []);

  const handleNotifOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotifAnchorEl(event.currentTarget);
  };

  const handleNotifClose = () => {
    setNotifAnchorEl(null);
  };

  const showAllNotifications = (event: React.MouseEvent<HTMLElement>) => {
    var unreads = unreadNotifCount;
    notifs.forEach(e => {
      if(e.isRead === false){
        e.isRead = true;
        unreads--;
        setUnreadNotifCount(unreads);
        Notification.readNotification(e.id);
      }
      
    })
    handleNotifOpen(event);
  }

  const getAllNotifications = () => {
    Notification.getNotifications(auth.eid).then((notifs) => {
      var unreads = 0;
      var allnotifs = 0;
      setNotifs(notifs.docs.map((item) => {
        if(item.data().isRead === false){
          unreads++;
          setUnreadNotifCount(unreads);
          console.log('Unread notifs: ' + unreadNotifCount);
        }
        allnotifs++;
        setNotifCount(allnotifs);
        return {id: item.id, eid: item.data().eid, title: item.data().title, message: item.data().message, time: item.data().time, isRead: item.data().isRead, key: item.id};
      }));
    });
  }

  React.useEffect(() => {
    getAllNotifications();
    console.log('RETRIEVED NOTIFICATIONS FROM FIREBASE!');
  }, []);

  const isNotifOpen = Boolean(notifAnchorEl);
  const timeAgo = new TimeAgo('en-US');

  const renderNotificationList = (
    <Menu
      anchorEl={notifAnchorEl}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      id='notification-list'
      keepMounted
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      open={isNotifOpen}
      onClose={handleNotifClose}
    >
      {notifCount > 0 ? (
        <List className={classes.notifList}>
          {notifs.map((notif) => (
            <ListItem alignItems="flex-start">
            <ListItemAvatar>
              <NotificationsIcon/>
            </ListItemAvatar>
            <ListItemText
              primary={notif.title}
              secondary={
                <React.Fragment>
                  <Typography
                    component="span"
                    variant="body2"
                    className={classes.inline}
                  >
                    {notif.message}<br/>
                  </Typography>
                  <Typography
                  variant="caption"
                  color="textPrimary">
                    {timeAgo.format(notif.time.seconds*1000)}
                  </Typography>
                </React.Fragment>
              }
            />
          </ListItem>
          ))}
        </List>
      ) : (
        <List className={classes.notifList}>
          <ListItem alignItems="flex-start">
          <ListItemAvatar>
            <ClearIcon/>
          </ListItemAvatar>
          <ListItemText
            primary=""
            secondary={
              <React.Fragment>
                <Typography
                  component="span"
                  variant="body2"
                  className={classes.inline}
                >
                  {"No notifications for you"}
                </Typography>
              </React.Fragment>
            }
          />
        </ListItem>
      </List>
      )}
    </Menu>
  )

  const handleOpenDrawerInternal = () => {
    handleOpenDrawer();
    setOpen(!open);
  }

  const isMenuOpen = Boolean(anchorEl);
  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMoreAnchorEl(null);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    handleMobileMenuClose();
  };

  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMobileMoreAnchorEl(event.currentTarget);
  };

  const menuId = 'primary-search-account-menu';
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      id={menuId}
      keepMounted
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      open={isMenuOpen}
      onClose={handleMenuClose}
    >
      <MenuItem onClick={handleMenuClose}>My Employee Profile</MenuItem>
      <MenuItem onClick={handleLogOut}>Log Out</MenuItem>
    </Menu>
  );

  const mobileMenuId = 'primary-search-account-menu-mobile';
  const renderMobileMenu = (
    <Menu
      anchorEl={mobileMoreAnchorEl}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      id={mobileMenuId}
      keepMounted
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      open={isMobileMenuOpen}
      onClose={handleMobileMenuClose}
    >
      <MenuItem>
        <IconButton aria-label="show-mails" color="inherit">
          <Badge badgeContent={0} color="secondary">
            <MailIcon />
          </Badge>
        </IconButton>
        <p>Private Messages</p>
      </MenuItem>
      <MenuItem onClick={showAllNotifications}>
        <IconButton aria-label="show-notifications" color="inherit">
          <Badge badgeContent={unreadNotifCount} color="secondary">
            <NotificationsIcon />
          </Badge>
        </IconButton>
        <p>Notifications</p>
      </MenuItem>
      <MenuItem onClick={handleProfileMenuOpen}>
        <IconButton
          aria-label="account of current user"
          aria-controls="primary-search-account-menu"
          aria-haspopup="true"
          color="inherit"
        >
          <AccountCircle />
        </IconButton>
        <p>Profile</p>
      </MenuItem>
    </Menu>
  );

  const [searched, setSearched] = React.useState<string>("");
  
  const requestSearch = (searchedVal: string) => {
    handleSearch(searchedVal);
  };

  const cancelSearch = () => {
    setSearched("");
    requestSearch(searched);
  };

  return (
    <div className={classes.grow}>
      <AppBar position="static"
      className={clsx(
        classes.appBar, 
        {
        [classes.appBarShift]: open,
      })}>
        <Toolbar>
          <IconButton
            edge="start"
            className={classes.menuButton}
            color="inherit"
            aria-label="open drawer"
            onClick={handleOpenDrawerInternal}
          >
            <MenuIcon />
          </IconButton>
          <Typography className={classes.title} variant="h6" noWrap>
            Stuck in The Movie
          </Typography>
          {SidebarNav.currentPathname === '/searchlist' && 
            <div className={classes.search}>
              <SearchBar
                value={searched}
                onChange={(searchVal) => requestSearch(searchVal)}
                onCancelSearch={() => cancelSearch()}
                cancelOnEscape
                className={classes.searchBar}
                placeholder="Search anything.."
                autoFocus
              />
          </div>
        }
        {SidebarNav.currentPathname !== '/searchlist' &&
        <div className={classes.search}  onClick={handleSearchClick}> 
          <SearchBar
            value={searched}
            onChange={(searchVal) => requestSearch(searchVal)}
            onCancelSearch={() => cancelSearch()}
            cancelOnEscape
            disabled
            className={classes.searchBar}
            placeholder="Search anything.."
          />
        </div>
      }

          <div className={classes.grow} />
          <div className={classes.sectionDesktop}>
            <IconButton aria-label="show-new-mails" color="inherit">
              <Badge badgeContent={0} color="secondary">
                <MailIcon />
              </Badge>
            </IconButton>
            <IconButton aria-label="show-new-notifications" color="inherit" onClick={showAllNotifications}>
              <Badge badgeContent={unreadNotifCount} color="secondary">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            <IconButton
              edge="end"
              aria-label="account of current user"
              aria-controls={menuId}
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              color="inherit"
            >
              <AccountCircle />
            </IconButton>
          </div>
          <div className={classes.sectionMobile}>
            <IconButton
              aria-label="show more"
              aria-controls={mobileMenuId}
              aria-haspopup="true"
              onClick={handleMobileMenuOpen}
              color="inherit"
            >
              <MoreIcon />
            </IconButton>
          </div>
        </Toolbar>
      </AppBar>
      {renderMobileMenu}
      {renderMenu}
      {renderNotificationList}
    </div>
  );
}