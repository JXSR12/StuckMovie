import React from 'react';
import Head from 'next/head';
import { Theme, makeStyles, createStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import Snackbar from '@material-ui/core/Snackbar';
import Alert, {AlertProps} from '@material-ui/lab/Alert'
import HelpIcon from '@material-ui/icons/Help';
import PersonIcon from '@material-ui/icons/Person';
import Typography from '@material-ui/core/Typography';
import Link from '../components/Link';
import { Avatar, Box, FormControl, InputLabel, List, ListItem, ListItemAvatar, ListItemText, MenuItem, Select, TextField } from '@material-ui/core';
import { blue } from '@material-ui/core/colors';
import { app, database } from '../database/firebase';
import { collection, getDocs, addDoc, getCountFromServer, query, where, Query, DocumentData, Timestamp, doc, getDoc } from 'firebase/firestore'
import { hashPassword, validatePassword } from '../utils/passwordencryptor';
import Router from 'next/router';
import secureLocalStorage from 'nextjs-secure-local-storage';
import { populateOtherEmployees } from '../database/seeders';
import { PatternFormat } from 'react-number-format';
import DeptDivsManager from '../utils/deptsdivs_manager';
import { SidebarNav } from '../utils/sidebar_nav_manager';
import { Attendance } from '../utils/attendance_manager';
import { WorkingTime } from '../utils/workingtime_manager';
import { AgeRating } from '../utils/agerating_manager';
import { Genre } from '../utils/genre_manager';
import { Producer } from '../utils/producers_manager';
import { Movie } from '../utils/movies_manager';

const db_departments = collection(database, 'departments');
const db_divisions = collection(database, 'divisions');
const db_employees = collection(database, 'employees');

let queried = false;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      textAlign: 'center',
      paddingTop: theme.spacing(4),
    },
    avatar: {
      backgroundColor: blue[200],
      color: blue[700],
    },
    icon: {
      height: 350,
      width: 350,
    },
  })
);

export interface SelectDeptProps {
  open: boolean;
  selectedDeptName: string;
  selectedDeptNo: number;
  onClose: (value: string, no: number) => void;
}

export interface LoginFormProps {
  open: boolean;
  deptNo: number;
  handleClose: () => void;
  handleClickOpen: () => void;
  handleSubmit: (eid: string, pwd: string) => void;
}

function DepartmentDialog(props: SelectDeptProps) {
  // const [ departmentsArray, setDepartmentsArray ] = React.useState([]);
  const { onClose, selectedDeptName, selectedDeptNo, open } = props;

  const classes = useStyles({});

  // const getDepts = () => {
  //   getDocs(db_departments)
  //       .then((data) => {
  //         setDepartmentsArray(data.docs.map((item) => {
  //           console.log(item);
  //           return { ...item.data(), id: item.id };
  //       }));
  //       });
  // }

  React.useEffect(() => {
    // getDepts();
    DeptDivsManager.getInstance();
    console.log('Retrieved instance of DDM!');
  }, []);

  const handleClose = () => {
    onClose(selectedDeptName, selectedDeptNo);
  };

  const handleListItemClick = (name: string, no: number) => {
    onClose(name, no);
  };

  return (
        <Dialog onClose={handleClose} aria-labelledby="simple-dialog-title" open={open}>
          <DialogTitle id="simple-dialog-title">Select department</DialogTitle>
          <List>
            {DeptDivsManager.getInstance().getAllDepartments().map((dept) => (
              <ListItem button onClick={() => handleListItemClick(dept.name, dept.number)} key={dept.number}>
                <ListItemAvatar>
                  <Avatar className={classes.avatar}>
                    <PersonIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText primary={dept.name} />
              </ListItem>
            ))}

            <ListItem autoFocus button onClick={() => handleListItemClick('NULL', -1)}>
              <ListItemAvatar>
                <Avatar>
                  <HelpIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText primary="Request assistance" />
            </ListItem>
          </List>
        </Dialog>
  );
};

function LoginForm(props: LoginFormProps){
  const {open, handleClose, handleClickOpen, handleSubmit, deptNo } = props;
  const [divNo, setDivNo] = React.useState<string | number>('NODIVISION');
  const [openDiv, setOpenDiv] = React.useState(false);
  // const [ divisionsArray , setDivisionsArray ] = React.useState([]);

  const handleLocalClose = () => {
    setDivNo('NODIVISION');
    handleClose();
  }

  const [ eid, setEid ] = React.useState<string>('');
  const [ pwd, setPwd ] = React.useState<string>('');

  const classes = useStyles({});

  var q : Query<DocumentData>;

  // const getDivs = () => {
  //   getDocs(q)
  //       .then((data) => {
  //         setDivisionsArray(data.docs.map((item) => {
  //           console.log('Query Result : ' + item);
  //           return { ...item.data(), id: item.id};
  //       }));
  //       });
  // }

  const handleChange = (event: React.ChangeEvent<{ value: number }>) => {
    setDivNo(event.target.value as number);
    // console.log('Selected : ' + event.target.value);
  };

  const handleChangeEid = (event: React.ChangeEvent<{ value: string }>) => {
    setEid(event.target.value as string);
    // console.log('Selected : ' + event.target.value);
  };

  const handleChangePwd = (event: React.ChangeEvent<{ value: string }>) => {
    setPwd(event.target.value as string);
    // console.log('Selected : ' + event.target.value);
  };

  const handleCloseDiv = () => {
    setOpenDiv(false);
  };

  const handleOpenDiv = () => {
    setOpenDiv(true);
  };

    return(
      <Dialog open={open} onClose={handleLocalClose} aria-labelledby="form-dialog-title">
            <DialogTitle id="form-dialog-title">Authentication</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Please authenticate yourself before accessing the Stuck In The Movie system.
              </DialogContentText>
              {DeptDivsManager.getInstance().getDivisions(deptNo).length > 0 && (
                <FormControl>
                <InputLabel id="demo-controlled-open-select-label">Select your division</InputLabel>
                <Select
                 labelId="demo-controlled-open-select-label"
                 id="demo-controlled-open-select"
                 open={openDiv}
                 onClose={handleCloseDiv}
                 onOpen={handleOpenDiv}
                 value={divNo}
                 onChange={handleChange}
                >
                 <MenuItem value="NODIVISION">
                   <em>Select a division</em>
                 </MenuItem>
                 {DeptDivsManager.getInstance().getDivisions(deptNo).map((div) => (
                   <MenuItem value={div.division_no} key={div.id}>{div.name}</MenuItem>
                 ))}
                </Select>
               </FormControl>
              )}
              <PatternFormat format={String(deptNo * 10 + ((divNo === 'NODIVISION' ? 0 : divNo) as number)).padStart(3, '0') + "-#####"} allowEmptyFormatting mask=" " customInput={
                TextField
              }
                autoFocus
                margin="dense"
                id="eid"
                label="Employee ID"
                type="text"
                onChange={handleChangeEid}
                fullWidth/>

              <TextField
                margin="dense"
                id="pwd"
                label="Password"
                type="password"
                onChange={handleChangePwd}
                fullWidth
              />
            </DialogContent>
            <DialogActions>
              <Button variant="contained" onClick={handleLocalClose} color="secondary">
                Cancel
              </Button>
              <Button type="submit" variant="contained" onClick={e => handleSubmit(eid,pwd)} color="primary">
                Authenticate
              </Button>
            </DialogActions>
      </Dialog>
      )
}

function Home() {
  const classes = useStyles({});
  const [open, setOpen] = React.useState(false);
  const [ authed, setAuthed ] = React.useState(true);
  const [selectedDeptName, setSelectedDeptName] = React.useState('NULL');
  const [selectedDeptNo, setSelectedDeptNo] = React.useState(-1);
  const [openLogin, setOpenLogin] = React.useState(false);
  const [openSnackbar, setOpenSnackbar] = React.useState(false);

  React.useEffect(() => {
    setAuthed(secureLocalStorage.getItem('auth') != null && Object.keys(secureLocalStorage.getItem('auth')).length > 0);
  }, []);

    // Uncomment below to seed DEPARTMENTS and DIVISIONS
  // let seeded = false;
  React.useEffect(() => {
    // populateDepartments();
    // populateDivisions();
    // populateOtherEmployees();
    // Attendance.seedAttendances().then(() => {
    //   console.log("Attendance seeding complete!");
    // })
    // seeded = true;
    // WorkingTime.seedWorkingTimes().then(() => {
    //   console.log("Working time seeding complete!");
    // })
    // AgeRating.seedAgeRatings().then(() => {
    //   console.log("Age rating seeding complete!");
    // })
    // Genre.seedGenres().then(() => {
    //   console.log("Genre seeding complete!");
    // })
    // Producer.seedProducers().then(() => {
    //   console.log("Movie producer seeding complete!");
    // })
    // Movie.seedMovies().then(() => {
    //   console.log("Movie seeding complete!");
    // })
  }, []);
  // Comment after use
  
  const handleSnackbarClose = () => {
    setOpenSnackbar(false);
  }

  const handleClickOpenLogin = () => {
    setOpenLogin(true);
  };

  const handleCloseLogin = () => {
    setOpenLogin(false);
  };

  const handleSubmitLogin = (eid: string, pwd: string) => {
    // console.log('Authenticating for');
    // console.log('Employee : ' + eid);
    // console.log('Password : ' + pwd);

    var q = query(db_employees, where("eid", "==", eid));
    getDocs(q).then((data) => {
      validatePassword(pwd, data.docs[0] == null ? '' : data.docs[0].data().password).then((res) => {
        if(res == true){
          secureLocalStorage.setItem('auth', {...data.docs[0].data(), id: data.docs[0].id});
          setAuthed(secureLocalStorage.getItem('auth') != null && Object.keys(secureLocalStorage.getItem('auth')).length > 0);
          Router.push('/next');
          SidebarNav.currentPathname = '/next';
        }else{
          setOpenSnackbar(true);
        }
      })
    })
  }

  var loginButton : any;
  var selectedText : any;

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = (name: string, no: number) => {
    setOpen(false);
    if(selectedDeptNo != no){
      queried = false;
    }
    setSelectedDeptName(name);
    setSelectedDeptNo(no);
  };

  if(selectedDeptName != 'NULL'){
    loginButton = <Box m={1}>
                      <Button variant="contained" color="primary" onClick={handleClickOpenLogin}>Login</Button>
                  </Box>;
    selectedText = <Typography color="secondary" variant="h6">Login as {selectedDeptName}</Typography>;
  }else{
    loginButton = <Box m={1} />;
    selectedText = <Typography color="secondary" variant="h6">Select a department first</Typography>;
  }

  return (
    <React.Fragment>
      <Head>
        <title>Login - Stuck in The Movie Cinema System</title>
      </Head>
      <div className={classes.root}>
        <Typography color="secondary" variant="subtitle2" gutterBottom>
          Stuck in The Movie - Cinema Management System
        </Typography>
        <img className={classes.icon} src="/images/icon.png" />
        {selectedText}
      <div>
      
      {loginButton}

      <Button variant="outlined" color="primary" onClick={handleClickOpen}>
        Select a department
      </Button>
      <LoginForm deptNo={selectedDeptNo} open={openLogin} handleSubmit={handleSubmitLogin} handleClickOpen={handleClickOpenLogin} handleClose={handleCloseLogin}/>
      <DepartmentDialog selectedDeptName={selectedDeptName} selectedDeptNo={selectedDeptNo} open={open} onClose={handleClose} />
      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity="error">
          Invalid account credentials, please try again
        </Alert>
      </Snackbar>
      </div>
      </div>
    </React.Fragment>
  );
}

export default Home;
