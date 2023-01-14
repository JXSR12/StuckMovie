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
import LocalAtmIcon from '@material-ui/icons/LocalAtm';

const db_salaryadjustments = collection(database, 'salaryadjustments');

export class SalaryAdjustment extends Request{
    salary_before: number
    salary_after: number

    constructor(
        eid: string,
        reason: string,
        salary_before: number,
        salary_after: number,
        issued_date: Timestamp,
        issuer_eid: string,
        status: RequestStatus,
        finalized_date: Timestamp,
        finalizer_eid : string
    ) {
        super(eid, reason, issued_date, issuer_eid, status, finalized_date, finalizer_eid);
        this.salary_before = salary_before;
        this.salary_after = salary_after;
    }

    insert() {
        const q = addDoc(db_salaryadjustments, {
            eid: this.eid,
            reason: this.reason,
            issued_date: this.issued_date,
            issuer_eid: this.issuer_eid,
            status: this.status,
            finalized_date: this.finalized_date,
            finalizer_eid: this.finalizer_eid,
            salary_before: this.salary_before,
            salary_after: this.salary_after
        });
        return q;
    }
}

export function SARequestListItem(props: {request: SalaryAdjustment, handleOpen: any}) {
    const [employee, setEmployee] = React.useState<IAuth>(null);

    const {request, handleOpen} = props;
    
    const retrieveEntities = () => {
        EmployeeUtils.getEmployee(request.eid).then((emp) => {
            setEmployee(emp.docs[0].data() as IAuth);
        });
    }

    React.useEffect(() => {
        retrieveEntities();
        console.log('[SAM] RETRIEVED ENTITIES FROM FIREBASE!');
      }, []);

    // return {id: letter.id, header: employee ? employee.name + ' (EID ' + letter.eid + ')' : 'retrieving data..', caption: letter.reason, status: letter.status, employee: employee} as RequestListItem;
    return (
        <ListItem button key={request.id} onClick={e => handleOpen(request.id)}>
        <ListItemAvatar>
          <Avatar>
            <LocalAtmIcon />
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={employee ? employee.name + ' (EID ' + request.eid + ')' : 'retrieving data..'}
          secondary={"from " + request.salary_before + " to " + request.salary_after}
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

export function SAInfocard(props: {request: SalaryAdjustment}) {
    const { request } = props;

    const [selEmpSACount, setSelEmpSACount] = React.useState(-1);
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
        getApprovedSalaryAdjustmentCount(request.eid).then((count) => {
            setSelEmpSACount(count);
        });
        console.log('[SAM] RETRIEVED DEPARTMENTS, DIVISIONS, ENTITIES FROM FIREBASE!');
      }, []);

        return(
            <Card>
                <CardActionArea>
                    <CardContent>
                        <Typography gutterBottom variant="h6" component="h2">
                            {request.status !== RequestStatus.Pending ? "Salary Adjustment" : "Salary Adjustment Request"}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" component="p">
                            You are viewing a salary adjustment request for:<br/><br/>
    
                            Employee Name : <b>{employee ? employee.name : "loading.."} (<i>EID: {request.eid}</i>)</b><br/>
                            Department&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: <b>{employee ? DeptDivsManager.getInstance().getDeptName(employee.dept_id) : "loading.."}</b><br/>
                            Division&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: <b>{employee ? DeptDivsManager.getInstance().getDivName(employee.div_id) : "loading.."}</b><br/><br/>

                            Current Salary&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: IDR <b>{request.salary_before}</b><br/>
                            Proposed New Salary : IDR <b>{request.salary_after}</b><br/><br/>

                            This employee has had <b>{selEmpSACount != -1 ? selEmpSACount : 0}</b> salary adjustments before<br/><br/>
                            
                            Additional note: &nbsp;
                            <b>{request.reason.length == 0 ? "None" : request.reason}</b>
    
                            <Box m={3}>
                                <Divider light variant='fullWidth'/>
                            </Box>
                            
    
                            This salary adjustment was created on <b>{new Date(request.issued_date.seconds*1000).toLocaleString()}</b> by <b>{issuer ? issuer.name : "loading.."}</b> (<i>EID: {request.issuer_eid}</i>)
                            from <b>{issuer ? DeptDivsManager.getInstance().getDeptName(issuer.dept_id) : "loading.."}</b>
    
                            {request.status !== RequestStatus.Pending && (
                            <div>
                                <Box m={3}>
                                    <Divider light variant='fullWidth'/>
                                </Box>
                                This salary adjustment was {request.status === RequestStatus.Approved ? "approved" : "declined"} on <b>{new Date(request.finalized_date.seconds*1000).toLocaleString()}</b> by <b>{finalizer ? finalizer.name : "loading.."}</b> (<i>EID: {request.finalizer_eid}</i>)
                                from <b>{finalizer ? DeptDivsManager.getInstance().getDeptName(finalizer.dept_id) : "loading.."}</b>
                            </div>
                            )}
                        </Typography>
                    </CardContent>
                </CardActionArea>
            </Card>
        );
}

export async function issueSalaryAdjustment(eid: string, reason: string, from: number, to: number){
    const sa = new SalaryAdjustment(eid, reason, from, to, Timestamp.now(), getAuthUser().eid, RequestStatus.Pending, null, null);
    
    EmployeeUtils.getManagementEmployees().then((data) => {
        data.docs.map((emp) => {
            Notification.insert(emp.data().eid, 'Salary Adjustment Request', 'A new salary adjustment request pending approval for employee ID ' + eid + ' with a proposed change of ' + ((to > from) ? '+' : '-') + (Math.abs(to-from)*100/from).toFixed(2) + '%');
        })
    })

    return await sa.insert();
}

export async function updateSalaryAdjustment(requestId: string, response: RequestStatus) {

    const p = await getSalaryAdjustment(requestId).then((letter) => {
        const eid = ({id: letter.id, ...letter.data()} as SalaryAdjustment).eid;
        const reason = ({id: letter.id, ...letter.data()} as SalaryAdjustment).reason;
        const from = ({id: letter.id, ...letter.data()} as SalaryAdjustment).salary_before;
        const to = ({id: letter.id, ...letter.data()} as SalaryAdjustment).salary_after;

        if (response === RequestStatus.Approved) {
            Notification.insert(eid, 'Salary Adjustment', 'There has been a ' + ((to > from) ? '+' : '-') + (Math.abs(to-from)*100/from).toFixed(2) + '%' + ' change in your salary which will take effect on the next payroll');
        }

        const docRef = doc(database, 'salaryadjustments', requestId);
        setDoc(docRef, { status: response, finalizer_eid: getAuthUser().eid, finalized_date: Timestamp.now() }, { merge: true });

        EmployeeUtils.getEmployee(eid).then((e) => {
            const empRef = doc(database, 'employees', e.docs[0].id);
            setDoc(empRef, {salary: to}, { merge: true });
        })  
    });

    return p;
}

export async function getApprovedSalaryAdjustmentCount(eid: string) {
    var count = 0;
    return await getSalaryAdjustments(eid).then((data) => {
        data.docs.map((doc) => {
            if (({id: doc.id, ...doc.data()} as SalaryAdjustment).status === RequestStatus.Approved) {
                count++;
            }
        });

        return count;
    });
}

export async function getSalaryAdjustment(id: string) {
    const docRef = doc(database, 'salaryadjustments', id);
    const promise = await getDoc(docRef);

    return promise;
}

export async function getSalaryAdjustments(eid: string) {
    const q = query(db_salaryadjustments, where('eid', '==', eid));
    const promise = await getDocs(q);

    return promise;
}

export async function getAllSalaryAdjustments() {
    const promise = await getDocs(db_salaryadjustments);

    return promise;
}