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
import BlockIcon from '@material-ui/icons/Block';

const db_firingrequests = collection(database, 'firingrequests');

export class FiringRequest extends Request{
    constructor(
        eid: string,
        reason: string,
        issued_date: Timestamp,
        issuer_eid: string,
        status: RequestStatus,
        finalized_date: Timestamp,
        finalizer_eid : string
    ) {
        super(eid, reason, issued_date, issuer_eid, status, finalized_date, finalizer_eid);
    }

    insert() {
        const q = addDoc(db_firingrequests, {
            eid: this.eid,
            reason: this.reason,
            issued_date: this.issued_date,
            issuer_eid: this.issuer_eid,
            status: this.status,
            finalized_date: this.finalized_date,
            finalizer_eid: this.finalizer_eid,
        });
        return q;
    }
}

export function FRRequestListItem(props: {request: FiringRequest, handleOpen: any}) {
    const [employee, setEmployee] = React.useState<IAuth>(null);

    const {request, handleOpen} = props;
    
    const retrieveEntities = () => {
        EmployeeUtils.getEmployee(request.eid).then((emp) => {
            setEmployee(emp.docs[0].data() as IAuth);
        });
    }

    React.useEffect(() => {
        retrieveEntities();
        console.log('[WLM] RETRIEVED ENTITIES FROM FIREBASE!');
      }, []);

    // return {id: letter.id, header: employee ? employee.name + ' (EID ' + letter.eid + ')' : 'retrieving data..', caption: letter.reason, status: letter.status, employee: employee} as RequestListItem;
    return (
        <ListItem button key={request.id} onClick={e => handleOpen(request.id)}>
        <ListItemAvatar>
          <Avatar>
            <BlockIcon />
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={employee ? employee.name + ' (EID ' + request.eid + ')' : 'retrieving data..'}
          secondary={request.reason}
        />
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

export function FRInfocard(props: {request: FiringRequest}) {
    const { request } = props;

    const [selEmpFRCount, setSelEmpFRCount] = React.useState(-1);
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
        getApprovedFiringRequestCount(request.eid).then((count) => {
            setSelEmpFRCount(count);
        });
        console.log('[FRM] RETRIEVED DEPARTMENTS, DIVISIONS, ENTITIES FROM FIREBASE!');
      }, []);

        return(
            <Card>
                <CardActionArea>
                    <CardContent>
                        <Typography gutterBottom variant="h6" component="h2">
                            {request.status !== RequestStatus.Pending ? "Employee Termination" : "Employee Termination Request"}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" component="p">
                            You are viewing an employee termination request issued on:<br/><br/>
    
                            Employee Name : <b>{employee ? employee.name : "loading.."} (<i>EID: {request.eid}</i>)</b><br/>
                            Department&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: <b>{employee ? DeptDivsManager.getInstance().getDeptName(employee.dept_id) : "loading.."}</b><br/>
                            Division&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: <b>{employee ? DeptDivsManager.getInstance().getDivName(employee.div_id) : "loading.."}</b><br/><br/>
    
                            This employee <b>{selEmpFRCount > 0 ? "is already" : "is not"}</b> in a termination process at the moment<br/><br/>

                            This termination request was issued for the following reasons: &nbsp;
                            <b>{request.reason}</b>
    
                            <Box m={3}>
                                <Divider light variant='fullWidth'/>
                            </Box>
                            
    
                            This termination request was issued on <b>{request.issued_date.toDate().toLocaleString()}</b> by <b>{issuer ? issuer.name : "loading.."}</b> (<i>EID: {request.issuer_eid}</i>)
                            from <b>{issuer ? DeptDivsManager.getInstance().getDeptName(issuer.dept_id) : "loading.."}</b>
    
                            {request.status !== RequestStatus.Pending && (
                            <div>
                                <Box m={3}>
                                    <Divider light variant='fullWidth'/>
                                </Box>
                                This termination request was {request.status === RequestStatus.Approved ? "approved" : "declined"} on <b>{request.finalized_date.toDate().toLocaleString()}</b> by <b>{finalizer ? finalizer.name : "loading.."}</b> (<i>EID: {request.finalizer_eid}</i>)
                                from <b>{finalizer ? DeptDivsManager.getInstance().getDeptName(finalizer.dept_id) : "loading.."}</b>
                            </div>
                            )}
                        </Typography>
                    </CardContent>
                </CardActionArea>
            </Card>
        );
}

export async function issueFiringRequest(eid: string, reason: string){
    const fr = new FiringRequest(eid, reason, Timestamp.now(), getAuthUser().eid, RequestStatus.Pending, null, null);
    
    EmployeeUtils.getManagementEmployees().then((data) => {
        data.docs.map((emp) => {
            Notification.insert(emp.data().eid, 'Firing Request', 'A new firing request pending approval for employee ID ' + eid + ' for the following reasons : ' + reason );
        })
    })

    return await fr.insert();
}

export async function updateFiringRequest(requestId: string, response: RequestStatus) {

    const p = await getFiringRequest(requestId).then((letter) => {
        const eid = ({id: letter.id, ...letter.data()} as FiringRequest).eid;
        const reason = ({id: letter.id, ...letter.data()} as FiringRequest).reason;

        if (response === RequestStatus.Approved) {
            Notification.insert(eid, 'Termination', 'You are being processed for contract termination for the following reasons: ' + reason);
        }

        const docRef = doc(database, 'firingrequests', requestId);
        setDoc(docRef, { status: response, finalizer_eid: getAuthUser().eid, finalized_date: Timestamp.now() }, { merge: true });
    });

    return p;
}

export async function getApprovedFiringRequestCount(eid: string) {
    var count = 0;
    return await getFiringRequests(eid).then((data) => {
        data.docs.map((doc) => {
            if (({id: doc.id, ...doc.data()} as FiringRequest).status === RequestStatus.Approved) {
                count++;
            }
        });

        return count;
    });
}

export async function getFiringRequest(id: string) {
    const docRef = doc(database, 'firingrequests', id);
    const promise = await getDoc(docRef);

    return promise;
}

export async function getFiringRequests(eid: string) {
    const q = query(db_firingrequests, where('eid', '==', eid));
    const promise = await getDocs(q);

    return promise;
}

export async function getAllFiringRequests() {
    const promise = await getDocs(db_firingrequests);

    return promise;
}