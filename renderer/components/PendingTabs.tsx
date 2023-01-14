import React from 'react';
import { makeStyles, Theme } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import InboxIcon from '@material-ui/icons/MoveToInbox';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import CancelIcon from '@material-ui/icons/Cancel';
import HelpIcon from '@material-ui/icons/Help';
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';
import Box from '@material-ui/core/Box';
import { Avatar, Button, IconButton, List, ListItem, ListItemAvatar, ListItemSecondaryAction, ListItemText, Snackbar, TextField, Tooltip } from '@material-ui/core';
import { WLRequestListItem, getAllWarningLetters, getWarningLetter, getWarningLetters, updateWarningLetter, WarningLetter, WLInfocard } from '../utils/warningletter_manager';
import { EmployeeUtils } from '../utils/employee_manager';
import { getAuthUser, IAuth } from '../utils/auth_manager';
import StepperDialog, { StepperStepItem } from './StepperDialog';
import { validatePassword } from '../utils/passwordencryptor';
import { Alert, ToggleButton, ToggleButtonGroup } from '@material-ui/lab';
import { Request } from '../utils/requests_manager';
import { FiringRequest, FRInfocard, FRRequestListItem, getAllFiringRequests, getFiringRequest, updateFiringRequest } from '../utils/firingrequest_manager';
import { getAllLeaveRequests, getLeaveRequest, LeaveRequest, LRInfocard, LRRequestListItem, updateLeaveRequest } from '../utils/leaverequest_manager';
import { getAllSalaryAdjustments, getSalaryAdjustment, SAInfocard, SalaryAdjustment, SARequestListItem, updateSalaryAdjustment } from '../utils/salaryadjustments_manager';
import { FNInfocard, FNRequestListItem, FundRequest, getAllFundRequests, getFundRequest, updateFundRequest } from '../utils/fundrequests_manager';

interface TabPanelProps {
  title: string;
  items: Request[];
  index: any;
  value: any;
  handleOpenDialog: any;
}

export enum RequestStatus{
  Pending,
  Approved,
  Declined
}

export interface RequestListItem {
  id: string;
  header: string;
  caption: string;
  status: RequestStatus;
  employee: IAuth;
}

interface GenerateListProps {
  index: string;
  items: Request[];
  handleOpenDialog: any;
}

function GenerateList(props: GenerateListProps) {
  const { items, handleOpenDialog, index } = props;

  if(index === 'one'){
    return(
      <div>
        {items.map(item => 
          <WLRequestListItem letter={item as WarningLetter} handleOpen={handleOpenDialog}/>
        )}
      </div>);
  }else if(index === 'two'){
    return(
      <div>
        {items.map(item => 
          <LRRequestListItem request={item as LeaveRequest} handleOpen={handleOpenDialog}/>
        )}
      </div>);
  }else if(index === 'three'){
    return(
      <div>
        {items.map(item => 
          <FRRequestListItem request={item as FiringRequest} handleOpen={handleOpenDialog}/>
        )}
      </div>);
  }else if(index === 'four'){
    return(
      <div>
        {items.map(item => 
          <SARequestListItem request={item as SalaryAdjustment} handleOpen={handleOpenDialog}/>
        )}
      </div>);
  }else if(index === 'five'){
    return(
      <div>
        {items.map(item => 
          <FNRequestListItem request={item as FundRequest} handleOpen={handleOpenDialog}/>
        )}
      </div>);
  }
}

function TabPanel(props: TabPanelProps) {
  const { title, value, index, items, handleOpenDialog, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`wrapped-tabpanel-${index}`}
      aria-labelledby={`wrapped-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={5}>
          <Typography>{title}</Typography>
          <List dense={false}>
            <GenerateList index={index} items={items} handleOpenDialog={handleOpenDialog}/>
          </List>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: any) {
  return {
    id: `wrapped-tab-${index}`,
    'aria-controls': `wrapped-tabpanel-${index}`,
  };
}

function reviewRequestStepperItem(content: any) : StepperStepItem{
  return {title: 'Review the request', content: 
  content
} as StepperStepItem;
}

function viewRequestStepperItem(content: any) : StepperStepItem{
  return {title: 'View finalized request', content: 
  content
} as StepperStepItem;
}

function ChooseDecisionStepperContent(props: {handleDecision: any}) {
  const [localDecision, setLocalDecision] = React.useState("approve");
  const {handleDecision} = props;

  const handleLocalDecision = (event: React.MouseEvent<HTMLElement>, newDecision: string) => {
    setLocalDecision(newDecision);
    handleDecision(event, newDecision);
  }

  return (
    <div>
    <ToggleButtonGroup
      value={localDecision}
      exclusive
      onChange={handleLocalDecision}
      aria-label="request-decision"
    >
      <ToggleButton value="approve" aria-label="approve">
        <CheckCircleIcon htmlColor='#36cf5e' />
        &nbsp;Approve
      </ToggleButton>
      <ToggleButton value="decline" aria-label="decline">
        <CancelIcon htmlColor='#cf4536' />
        &nbsp;Decline
      </ToggleButton>
    </ToggleButtonGroup>
  </div>
  )
}

function chooseDecisionStepperItem(handleDecision: any) : StepperStepItem{
  return {title: 'Choose your decision', content: <ChooseDecisionStepperContent handleDecision={handleDecision} />} as StepperStepItem;
}

function confirmPasswordStepperItem(setPwd: any) : StepperStepItem{
  const handleChangePwd = (event: React.ChangeEvent<{ value: string }>) => {
    setPwd(event.target.value as string);
  };

  return {title: 'Confirm your password', content: 
  <TextField
    margin="dense"
    id="pwd"
    label="Enter your password"
    type="password"
    onChange={handleChangePwd}
    fullWidth
  />
} as StepperStepItem;
}

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
  },
}));

export default function PendingTabs(props: {auth: boolean}) {
  const {auth} = props;
  const classes = useStyles();
  const [value, setValue] = React.useState('one');
  const [openDialog, setOpenDialog] = React.useState(false);
  const [warningLetters, setWarningLetters] = React.useState<WarningLetter[]>([]);
  const [leaveRequests, setLeaveRequests] = React.useState<LeaveRequest[]>([]);
  const [firingRequests, setFiringRequests] = React.useState<FiringRequest[]>([]);
  const [salaryAdjustments, setSalaryAdjustments] = React.useState<SalaryAdjustment[]>([]);
  const [fundRequests, setFundRequests] = React.useState<FundRequest[]>([]);
  const [pwd, setPwd] = React.useState<string>('');
  const [reqItemId, setReqItemId] = React.useState<string>('');
  const [reviewContent, setReviewContent] = React.useState<Element>(null);
  const [refreshList, setRefreshList] = React.useState<boolean>(false);
  const [decision, setDecision] = React.useState<string>('approve');

  const handleDecision = (event: React.MouseEvent<HTMLElement>, newDecision: string) => {
    setDecision(newDecision);
  };

  const [stepperItems, setStepperItems] = React.useState<StepperStepItem[]>([reviewRequestStepperItem("No content"), chooseDecisionStepperItem(handleDecision), confirmPasswordStepperItem(setPwd)]);

  React.useEffect(() => {
    getAllWarningLetters().then((data) => {
      setWarningLetters(
        data.docs.map((doc) => {
          const letter = {id: doc.id, ...doc.data()} as WarningLetter;
          console.log(letter);
          return letter;
        }));
      console.log('Retrieved all warning letters');
    });

    getAllLeaveRequests().then((data) => {
      setLeaveRequests(
        data.docs.map((doc) => {
          const request = {id: doc.id, ...doc.data()} as LeaveRequest;
          console.log(request);
          return request;
        }));
      console.log('Retrieved all leave requests');
    });

    getAllFiringRequests().then((data) => {
      setFiringRequests(
        data.docs.map((doc) => {
          const request = {id: doc.id, ...doc.data()} as FiringRequest;
          console.log(request);
          return request;
        }));
      console.log('Retrieved all firing requests');
    });

    getAllSalaryAdjustments().then((data) => {
      setSalaryAdjustments(
        data.docs.map((doc) => {
          const request = {id: doc.id, ...doc.data()} as SalaryAdjustment;
          console.log(request);
          return request;
        }));
      console.log('Retrieved all salary adjustments');
    });

    getAllFundRequests().then((data) => {
      setFundRequests(
        data.docs.map((doc) => {
          const request = {id: doc.id, ...doc.data()} as FundRequest;
          console.log(request);
          return request;
        }));
      console.log('Retrieved all fund requests');
    });

  }, [refreshList]);

  const handleOpenWLDialog = (id: string) => {
    setReqItemId(id);
    getWarningLetter(id).then((doc) => {
      const letter = {id: doc.id, ...doc.data()} as WarningLetter;
      if(letter.status === RequestStatus.Pending){
        setStepperItems([reviewRequestStepperItem(<WLInfocard letter={letter}/>), chooseDecisionStepperItem(handleDecision), confirmPasswordStepperItem(setPwd)]);
      }else{
        setStepperItems([viewRequestStepperItem(<WLInfocard letter={letter}/>)]);
      }
      setOpenDialog(true);
    });
  }

  const handleOpenFRDialog = (id: string) => {
    setReqItemId(id);
    getFiringRequest(id).then((doc) => {
      const request = {id: doc.id, ...doc.data()} as FiringRequest;
      if(request.status === RequestStatus.Pending){
        setStepperItems([reviewRequestStepperItem(<FRInfocard request={request}/>), chooseDecisionStepperItem(handleDecision), confirmPasswordStepperItem(setPwd)]);
      }else{
        setStepperItems([viewRequestStepperItem(<FRInfocard request={request}/>)]);
      }
      setOpenDialog(true);
    });
  }

  const handleOpenLRDialog = (id: string) => {
    setReqItemId(id);
    getLeaveRequest(id).then((doc) => {
      const request = {id: doc.id, ...doc.data()} as LeaveRequest;
      if(request.status === RequestStatus.Pending){
        setStepperItems([reviewRequestStepperItem(<LRInfocard request={request}/>), chooseDecisionStepperItem(handleDecision), confirmPasswordStepperItem(setPwd)]);
      }else{
        setStepperItems([viewRequestStepperItem(<LRInfocard request={request}/>)]);
      }
      setOpenDialog(true);
    });
  }

  const handleOpenSADialog = (id: string) => {
    setReqItemId(id);
    getSalaryAdjustment(id).then((doc) => {
      const request = {id: doc.id, ...doc.data()} as SalaryAdjustment;
      if(request.status === RequestStatus.Pending){
        setStepperItems([reviewRequestStepperItem(<SAInfocard request={request}/>), chooseDecisionStepperItem(handleDecision), confirmPasswordStepperItem(setPwd)]);
      }else{
        setStepperItems([viewRequestStepperItem(<SAInfocard request={request}/>)]);
      }
      setOpenDialog(true);
    });
  }

  const handleOpenFNDialog = (id: string) => {
    setReqItemId(id);
    getFundRequest(id).then((doc) => {
      const request = {id: doc.id, ...doc.data()} as FundRequest;
      if(request.status === RequestStatus.Pending){
        setStepperItems([reviewRequestStepperItem(<FNInfocard request={request}/>), chooseDecisionStepperItem(handleDecision), confirmPasswordStepperItem(setPwd)]);
      }else{
        setStepperItems([viewRequestStepperItem(<FNInfocard request={request}/>)]);
      }
      setOpenDialog(true);
    });
  }

  const handleChange = (event: React.ChangeEvent<{}>, newValue: string) => {
    setValue(newValue);
  };

  const handleFinishDialog = () => {
    validatePassword(pwd, getAuthUser().password).then((res) => {
      
      if(res === true){
        if(decision === 'approve'){
          if(value === 'one'){
            updateWarningLetter(reqItemId, RequestStatus.Approved).then(() => {
              setRefreshList(!refreshList);
            });
          }else if(value === 'two'){
            updateLeaveRequest(reqItemId, RequestStatus.Approved).then(() => {
              setRefreshList(!refreshList);
            });
          }else if(value === 'three'){
            updateFiringRequest(reqItemId, RequestStatus.Approved).then(() => {
              setRefreshList(!refreshList);
            });
          }else if(value === 'four'){
            updateSalaryAdjustment(reqItemId, RequestStatus.Approved).then(() => {
              setRefreshList(!refreshList);
            });
          }else if(value === 'five'){
            updateFundRequest(reqItemId, RequestStatus.Approved).then(() => {
              setRefreshList(!refreshList);
            });
          }
          
          setDecision('approve');
        }else if (decision === 'decline'){
          if(value === 'one'){
            updateWarningLetter(reqItemId, RequestStatus.Declined).then(() => {
              setRefreshList(!refreshList);
            });
          }else if(value === 'two'){
            updateLeaveRequest(reqItemId, RequestStatus.Declined).then(() => {
              setRefreshList(!refreshList);
            });
          }else if(value === 'three'){
            updateFiringRequest(reqItemId, RequestStatus.Declined).then(() => {
              setRefreshList(!refreshList);
            });
          }else if(value === 'four'){
            updateSalaryAdjustment(reqItemId, RequestStatus.Declined).then(() => {
              setRefreshList(!refreshList);
            });
          }else if(value === 'five'){
            updateFundRequest(reqItemId, RequestStatus.Declined).then(() => {
              setRefreshList(!refreshList);
            });
          }
          
          setDecision('approve');
        }
      }else if(pwd.length !== 0){
        setOpenSnackbar(true);
      }

      setPwd('');
      
    });
  }

  const [openSnackbar, setOpenSnackbar] = React.useState(false);

    const handleSnackbarClose = () => {
        setOpenSnackbar(false);
    }

  return (
    <div className={classes.root}>
      <AppBar position="static">
        
          {auth && getAuthUser().dept_id === 'qIvZZoS7Bnro7bD7DpWs' && (
            <Tabs value={value} onChange={handleChange} aria-label="request-tabs">
              <Tab value="one" label="Warning Letters" wrapped {...a11yProps('one')} />
              <Tab value="two" label="Leave Requests" wrapped {...a11yProps('two')} />
              <Tab value="three" label="Firing Requests" wrapped {...a11yProps('three')} />
              <Tab value="four" label="Salary Adjustments" wrapped {...a11yProps('four')} />
            </Tabs>
          )}
          {auth && getAuthUser().dept_id === '8vJjhyQeZh12eb9MBe1U' && (
            <Tabs value={value} onChange={handleChange} aria-label="request-tabs">
              <Tab value="five" label="Fund Requests" wrapped {...a11yProps('five')} />
            </Tabs>
          )}
          
      </AppBar>
      {auth && getAuthUser().dept_id === 'qIvZZoS7Bnro7bD7DpWs' && (
        <div>
          <TabPanel handleOpenDialog={handleOpenWLDialog} items={warningLetters} title={'Below are the warning letters pending your approval'} value={value} index="one"/>
          <TabPanel handleOpenDialog={handleOpenLRDialog} items={leaveRequests} title={'Below are the leave requests pending your approval'} value={value} index="two"/>
          <TabPanel handleOpenDialog={handleOpenFRDialog} items={firingRequests} title={'Below are the firing requests pending your approval'} value={value} index="three"/>
          <TabPanel handleOpenDialog={handleOpenSADialog} items={salaryAdjustments} title={'Below are the salary adjustments pending your approval'} value={value} index="four"/>
        </div>
      )}
      {auth && getAuthUser().dept_id === '8vJjhyQeZh12eb9MBe1U' && (
        <TabPanel handleOpenDialog={handleOpenFNDialog} items={fundRequests} title={'Below are the fund requests pending your approval'} value={value} index="five"/>
      )}
      

      <StepperDialog openDialog={openDialog} setOpenDialog={setOpenDialog} onDialogFinish={handleFinishDialog} items={stepperItems}/>
      <Snackbar open={openSnackbar} autoHideDuration={3000} onClose={handleSnackbarClose}>
          <Alert onClose={handleSnackbarClose} severity="error">
              Provided account password is incorrect
          </Alert>
      </Snackbar>
    </div>
  );
}