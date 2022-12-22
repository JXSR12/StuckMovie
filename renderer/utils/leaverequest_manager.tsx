import Box from '@material-ui/core/Box';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardContent from '@material-ui/core/CardContent';
import Divider from '@material-ui/core/Divider';
import Typography from '@material-ui/core/Typography';
import { Avatar, Button, IconButton, List, ListItem, ListItemAvatar, ListItemSecondaryAction, ListItemText, TextField, Tooltip } from '@material-ui/core';
import InboxIcon from '@material-ui/icons/MoveToInbox';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import CancelIcon from '@material-ui/icons/Cancel';
import HelpIcon from '@material-ui/icons/Help';
import { addDoc, collection, doc, getDoc, getDocs, query, setDoc, Timestamp, where } from 'firebase/firestore';
import React from 'react';
import { RequestStatus } from '../components/PendingTabs';
import { database } from '../database/firebase';
import { getAuthUser, IAuth } from './auth_manager';
import DeptDivsManager from './deptsdivs_manager';
import { EmployeeUtils } from './employee_manager';
import { Notification } from './notification_manager';
import { Request } from './requests_manager';
import Grid from '@material-ui/core/Grid';
import ExitToApp from '@material-ui/icons/ExitToApp';

const db_leaverequests = collection(database, 'leaverequests');

export class LeaveRequest extends Request{
    leave_date: Timestamp
    leave_duration: number
    constructor(
        eid: string,
        reason: string,
        leave_date: Timestamp,
        leave_duration: number,
        issued_date: Timestamp,
        issuer_eid: string,
        status: RequestStatus,
        finalized_date: Timestamp,
        finalizer_eid : string
    ) {
        super(eid, reason, issued_date, issuer_eid, status, finalized_date, finalizer_eid);
        this.leave_date = leave_date;
        this.leave_duration = leave_duration;
    }

    insert() {
        const q = addDoc(db_leaverequests, {
            eid: this.eid,
            reason: this.reason,
            leave_date: this.leave_date,
            leave_duration: this.leave_duration,
            issued_date: this.issued_date,
            issuer_eid: this.issuer_eid,
            status: this.status,
            finalized_date: this.finalized_date,
            finalizer_eid: this.finalizer_eid,
        });
        return q;
    }
}

export function LRRequestListItem(props: {request: LeaveRequest, handleOpen: any}) {
    const [employee, setEmployee] = React.useState<IAuth>(null);

    const {request, handleOpen} = props;
    
    const retrieveEntities = () => {
        EmployeeUtils.getEmployee(request.eid).then((emp) => {
            setEmployee(emp.docs[0].data() as IAuth);
        });
    }

    React.useEffect(() => {
        retrieveEntities();
        console.log('[LRM] RETRIEVED ENTITIES FROM FIREBASE!');
      }, []);

    // return {id: letter.id, header: employee ? employee.name + ' (EID ' + letter.eid + ')' : 'retrieving data..', caption: letter.reason, status: letter.status, employee: employee} as RequestListItem;
    return (
        <ListItem button key={request.id} onClick={e => handleOpen(request.id)}>
        <ListItemAvatar>
          <Avatar>
            <ExitToApp />
          </Avatar>
        </ListItemAvatar>
        <Grid direction='column'>
            <ListItemText
            primary={employee ? employee.name + ' (EID ' + request.eid + ')' : 'retrieving data..'}
            secondary={"Reason: " + request.reason}
            />
            <ListItemText
            secondary={"on " + request.leave_date.toDate().toLocaleString() + " for " + request.leave_duration + " hours"}
            />
        </Grid>
        <ListItemSecondaryAction>
        <Tooltip title={request.status === RequestStatus.Approved ? 'Request Approved' : request.status === RequestStatus.Declined ? 'Request Declined' : 'Unfinalized Request'}>
          <IconButton edge="start" aria-label="view">
            {request.status === RequestStatus.Approved ? <CheckCircleIcon htmlColor='#36cf5e' /> : request.status === RequestStatus.Declined ? <CancelIcon htmlColor='#cf4536' /> : <HelpIcon htmlColor='#a8a8a8' />}
          </IconButton>
        </Tooltip>
        </ListItemSecondaryAction>
      </ListItem>
    );
}

export function LRInfocard(props: {request: LeaveRequest}) {
    const { request } = props;

    const [selEmpLRCount, setSelEmpLRCount] = React.useState(-1);
    const [employee, setEmployee] = React.useState<IAuth>(null);
    const [issuer, setIssuer] = React.useState<IAuth>(null);
    const [finalizer, setFinalizer] = React.useState<IAuth>(null);

    const retrieveEntities = () => {
        EmployeeUtils.getEmployee(request.eid).then((emp) => {
            setEmployee(emp.docs[0].data() as IAuth);
        });
        EmployeeUtils.getEmployee(request.issuer_eid).then((emp) => {
            setIssuer(emp.docs[0].data() as IAuth);
        });
        if(request.status !== RequestStatus.Pending){
            EmployeeUtils.getEmployee(request.finalizer_eid).then((emp) => {
                setFinalizer(emp.docs[0].data() as IAuth);
            });
        }
    }

    React.useEffect(() => {
        retrieveEntities();
        getApprovedLeaveRequestCount(request.eid).then((count) => {
            setSelEmpLRCount(count);
        });
        console.log('[LRM] RETRIEVED DEPARTMENTS, DIVISIONS, ENTITIES FROM FIREBASE!');
      }, []);

        return(
            <Card>
                <CardActionArea>
                    <CardContent>
                        <Typography gutterBottom variant="h6" component="h2">
                            {request.status !== RequestStatus.Pending ? "Employee Leave Request" : "Employee Leave Request"}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" component="p">
                            The following employee has requested to leave work on <b>{request.leave_date.toDate().toLocaleString()}</b> for <b>{request.leave_duration} hours</b> :<br/><br/>
    
                            Employee Name : <b>{employee ? employee.name : "loading.."} (<i>EID: {request.eid}</i>)</b><br/>
                            Department&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: <b>{employee ? DeptDivsManager.getInstance().getDeptName(employee.dept_id) : "loading.."}</b><br/>
                            Division&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: <b>{employee ? DeptDivsManager.getInstance().getDivName(employee.div_id) : "loading.."}</b><br/><br/>
    
                            This employee has already left work <b>{selEmpLRCount !== -1 ? selEmpLRCount : "loading.."}</b> times before<br/><br/>

                            This employee requested to leave work for the following reasons: &nbsp;
                            <b>{request.reason}</b>
    
                            <Box m={3}>
                                <Divider light variant='fullWidth'/>
                            </Box>
    
                            This leave request was made on <b>{request.issued_date.toDate().toLocaleString()}</b>
    
                            {request.status !== RequestStatus.Pending && (
                            <div>
                                <Box m={3}>
                                    <Divider light variant='fullWidth'/>
                                </Box>
                                This leave request was {request.status === RequestStatus.Approved ? "approved" : "declined"} on <b>{request.finalized_date.toDate().toLocaleString()}</b> by <b>{finalizer ? finalizer.name : "loading.."}</b> (<i>EID: {request.finalizer_eid}</i>)
                                from <b>{finalizer ? DeptDivsManager.getInstance().getDeptName(finalizer.dept_id) : "loading.."}</b>
                            </div>
                            )}
                        </Typography>
                    </CardContent>
                </CardActionArea>
            </Card>
        );
}

export async function issueLeaveRequest(eid: string, reason: string, leave_date: Timestamp, leave_duration: number){
    const fr = new LeaveRequest(eid, reason, leave_date, leave_duration, Timestamp.now(), getAuthUser().eid, RequestStatus.Pending, null, null);
    
    EmployeeUtils.getManagementEmployees().then((data) => {
        data.docs.map((emp) => {
            Notification.insert(emp.data().eid, 'Leave Request', 'A new leave request pending approval for employee ID ' + eid + ' on ' + leave_date.toDate().toLocaleString() + ' for the following reasons : ' + reason );
        })
    });

    return await fr.insert();
}

export async function updateLeaveRequest(requestId: string, response: RequestStatus) {

    const p = await getLeaveRequest(requestId).then((letter) => {
        const req = {id: letter.id, ...letter.data()} as LeaveRequest;
        const eid = req.eid;
        const reason = req.reason;

        if (response === RequestStatus.Approved) {
            Notification.insert(eid, 'Leave Request Approved', 'Your request to leave on ' + req.leave_date.toDate().toLocaleString() + ' for ' + req.leave_duration + ' hours has been approved by management.');
        }else if (response === RequestStatus.Declined){
            Notification.insert(eid, 'Leave Request Declined', 'Your request to leave on ' + req.leave_date.toDate().toLocaleString() + ' for ' + req.leave_duration + ' hours has been declined by management.');
        }

        const docRef = doc(database, 'leaverequests', requestId);
        setDoc(docRef, { status: response, finalizer_eid: getAuthUser().eid, finalized_date: Timestamp.now() }, { merge: true });
    });

    return p;
}

export async function getApprovedLeaveRequestCount(eid: string) {
    var count = 0;
    return await getLeaveRequests(eid).then((data) => {
        data.docs.map((doc) => {
            if (({id: doc.id, ...doc.data()} as LeaveRequest).status === RequestStatus.Approved) {
                count++;
            }
        });

        return count;
    });
}

export async function getLeaveRequest(id: string) {
    const docRef = doc(database, 'leaverequests', id);
    const promise = await getDoc(docRef);

    return promise;
}

export async function getLeaveRequests(eid: string) {
    const q = query(db_leaverequests, where('eid', '==', eid));
    const promise = await getDocs(q);

    return promise;
}

export async function getAllLeaveRequests() {
    const promise = await getDocs(db_leaverequests);

    return promise;
}