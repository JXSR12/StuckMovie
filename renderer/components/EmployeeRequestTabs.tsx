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
import { Avatar, Button, IconButton, List, ListItem, ListItemAvatar, ListItemSecondaryAction, ListItemText, TextField, Tooltip } from '@material-ui/core';
import { WLRequestListItem, getAllWarningLetters, getWarningLetter, getWarningLetters, updateWarningLetter, WarningLetter, WLInfocard } from '../utils/warningletter_manager';
import { EmployeeUtils } from '../utils/employee_manager';
import { getAuthUser, IAuth } from '../utils/auth_manager';
import StepperDialog, { StepperStepItem } from './StepperDialog';
import { validatePassword } from '../utils/passwordencryptor';
import { ToggleButton, ToggleButtonGroup } from '@material-ui/lab';
import { Request } from '../utils/requests_manager';
import { FiringRequest, FRInfocard, FRRequestListItem, getAllFiringRequests, getFiringRequest, getFiringRequests, updateFiringRequest } from '../utils/firingrequest_manager';
import { getAllLeaveRequests, getLeaveRequest, getLeaveRequests, LeaveRequest, LRInfocard, LRRequestListItem, updateLeaveRequest } from '../utils/leaverequest_manager';
import { FNInfocard, FNRequestListItem, FundRequest, getFundRequest, getFundRequests } from '../utils/fundrequests_manager';

interface TabPanelProps {
  title: string;
  items: Request[];
  index: any;
  value: any;
  handleOpenDialog: any;
  requestType: RequestType;
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
  requestType: RequestType;
}

function GenerateList(props: GenerateListProps) {
  const { items, handleOpenDialog, index, requestType } = props;

  if(requestType === RequestType.WarningLetter){
    return(
      <div>
        {items.map(item => 
          <WLRequestListItem letter={item as WarningLetter} handleOpen={handleOpenDialog}/>
        )}
      </div>);
  }else if(requestType === RequestType.LeaveRequest){
    return(
      <div>
        {items.map(item => 
          <LRRequestListItem request={item as LeaveRequest} handleOpen={handleOpenDialog}/>
        )}
      </div>);
  }else if(requestType === RequestType.FiringRequest){
    return(
      <div>
        {items.map(item => 
          <FRRequestListItem request={item as FiringRequest} handleOpen={handleOpenDialog}/>
        )}
      </div>);
  }else if(requestType === RequestType.FundRequest){
    return(
      <div>
        {items.map(item => 
          <FNRequestListItem request={item as FundRequest} handleOpen={handleOpenDialog}/>
        )}
      </div>);
  }
}

function TabPanel(props: TabPanelProps) {
  const { title, value, index, items, handleOpenDialog, requestType, ...other } = props;

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
            <GenerateList requestType={requestType} index={index} items={items} handleOpenDialog={handleOpenDialog}/>
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

function viewRequestStepperItem(content: any) : StepperStepItem{
  return {title: 'View details', content: 
  content
} as StepperStepItem;
}

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
  },
}));

export enum RequestType{
    WarningLetter,
    LeaveRequest,
    FiringRequest,
    FundRequest
}

export default function RequestTabs(props: {employee: IAuth, requestType: RequestType, refreshList: boolean, auth: boolean}) {
  const classes = useStyles();
  const [value, setValue] = React.useState('one');
  const [openDialog, setOpenDialog] = React.useState(false);
  const [requests, setRequests] = React.useState<Request[]>([]);

  const [pwd, setPwd] = React.useState<string>('');
  const [reqItemId, setReqItemId] = React.useState<string>('');

  const {employee, requestType, refreshList, auth} = props;

  const [stepperItems, setStepperItems] = React.useState<StepperStepItem[]>([]);

  React.useEffect(() => {
    if(requestType === RequestType.WarningLetter){
        getWarningLetters(employee.eid).then((data) => {
            setRequests(
              data.docs.map((doc) => {
                const letter = {id: doc.id, ...doc.data()} as WarningLetter;
                console.log(letter);
                return letter;
              }));
            console.log('Retrieved all warning letters for employee');
          });
    }else if(requestType === RequestType.LeaveRequest){
        getLeaveRequests(employee.eid).then((data) => {
            setRequests(
              data.docs.map((doc) => {
                const request = {id: doc.id, ...doc.data()} as LeaveRequest;
                console.log(request);
                return request;
              }));
            console.log('Retrieved all leave requests for employee');
          });
    }else if(requestType === RequestType.FiringRequest){
        getFiringRequests(employee.eid).then((data) => {
            setRequests(
              data.docs.map((doc) => {
                const request = {id: doc.id, ...doc.data()} as FiringRequest;
                console.log(request);
                return request;
              }));
            console.log('Retrieved all firing requests for employee');
          });
    }else if(requestType === RequestType.FundRequest){
      getFundRequests(employee.dept_id).then((data) => {
          setRequests(
            data.docs.map((doc) => {
              const request = {id: doc.id, ...doc.data()} as FundRequest;
              console.log(request);
              return request;
            }));
          console.log('Retrieved all fund requests for employee\'s department');
        });
    
  }
    
  }, [refreshList]);

  const handleOpenDialog = (id: string) => {
    setReqItemId(id);
    if(requestType === RequestType.WarningLetter){
        getWarningLetter(id).then((doc) => {
            const request = {id: doc.id, ...doc.data()} as WarningLetter;
            setStepperItems([viewRequestStepperItem(<WLInfocard letter={request}/>)]);
            setOpenDialog(true);
        });
    }else if(requestType === RequestType.LeaveRequest){
        getLeaveRequest(id).then((doc) => {
            const request = {id: doc.id, ...doc.data()} as LeaveRequest;
            setStepperItems([viewRequestStepperItem(<LRInfocard request={request}/>)]);
            setOpenDialog(true);
        });
    }else if(requestType === RequestType.FiringRequest){
        getFiringRequest(id).then((doc) => {
            const request = {id: doc.id, ...doc.data()} as FiringRequest;
            setStepperItems([viewRequestStepperItem(<FRInfocard request={request}/>)]);
            setOpenDialog(true);
        });
    }else if(requestType === RequestType.FundRequest){
      getFundRequest(id).then((doc) => {
          const request = {id: doc.id, ...doc.data()} as FundRequest;
          setStepperItems([viewRequestStepperItem(<FNInfocard request={request}/>)]);
          setOpenDialog(true);
      });
  }
  }

  const handleChange = (event: React.ChangeEvent<{}>, newValue: string) => {
    setValue(newValue);
  };

  const handleFinishDialog = () => {
  }

  const requestName = requestType === RequestType.WarningLetter ? "warning letter" : requestType === RequestType.LeaveRequest ? "leave request" : requestType === RequestType.FiringRequest ? "firing request" : "fund request";

  return (
    <div className={classes.root}>
      <AppBar position="static">
        <Tabs value={value} onChange={handleChange} aria-label="request-tabs">
          <Tab value="one" label={requestType === RequestType.WarningLetter ? "Active" : "Approved"} wrapped {...a11yProps('one')} />
          {requestType !== RequestType.WarningLetter && (
            <Tab value="two" label="Declined" wrapped {...a11yProps('two')} />
          )}
          {requestType !== RequestType.WarningLetter && (
            <Tab value="three" label="Pending" wrapped {...a11yProps('three')} />
          )}
        </Tabs>
      </AppBar>
        <TabPanel requestType={requestType} handleOpenDialog={handleOpenDialog} items={requests.filter(r => r.status === RequestStatus.Approved)} title={(requestType !== RequestType.WarningLetter ? "Your approved " : "Your active ") + requestName + 's'} value={value} index="one"/>
        <TabPanel requestType={requestType} handleOpenDialog={handleOpenDialog} items={requests.filter(r => r.status === RequestStatus.Declined)} title={'Your declined ' + requestName + 's'} value={value} index="two"/>
        <TabPanel requestType={requestType} handleOpenDialog={handleOpenDialog} items={requests.filter(r => r.status === RequestStatus.Pending)} title={'Your pending ' + requestName + 's'} value={value} index="three"/>
      
      <StepperDialog openDialog={openDialog} setOpenDialog={setOpenDialog} onDialogFinish={handleFinishDialog} items={stepperItems}/>
    </div>
  );
}