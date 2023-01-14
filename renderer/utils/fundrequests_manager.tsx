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

const db_fundrequests = collection(database, 'fundrequests');

export enum FundRequestFundType{
    Cash,
    Card,
    BankTransfer,
    Reimbursement
}

export class FundRequest extends Request{
    amount: number
    fund_type: FundRequestFundType
    dept_id: string
    constructor(
        eid: string,
        reason: string,
        amount: number,
        fund_type: FundRequestFundType,
        dept_id: string,
        issued_date: Timestamp,
        issuer_eid: string,
        status: RequestStatus,
        finalized_date: Timestamp,
        finalizer_eid : string
    ) {
        super(eid, reason, issued_date, issuer_eid, status, finalized_date, finalizer_eid);
        this.amount = parseInt(amount);
        this.fund_type = fund_type;
        this.dept_id = dept_id;
    }

    insert() {
        const q = addDoc(db_fundrequests, {
            eid: this.eid,
            reason: this.reason,
            amount: this.amount,
            fund_type: this.fund_type,
            dept_id: this.dept_id,
            issued_date: this.issued_date,
            issuer_eid: this.issuer_eid,
            status: this.status,
            finalized_date: this.finalized_date,
            finalizer_eid: this.finalizer_eid,
        });
        return q;
    }
}

export function FNRequestListItem(props: {request: FundRequest, handleOpen: any}) {
    const [employee, setEmployee] = React.useState<IAuth>(null);

    const {request, handleOpen} = props;
    
    const retrieveEntities = () => {
        EmployeeUtils.getEmployee(request.eid).then((emp) => {
            setEmployee(emp.docs[0].data() as IAuth);
        });
    }

    React.useEffect(() => {
        retrieveEntities();
        console.log('[FUNDM] RETRIEVED ENTITIES FROM FIREBASE!');
      }, []);

    // return {id: letter.id, header: employee ? employee.name + ' (EID ' + letter.eid + ')' : 'retrieving data..', caption: letter.reason, status: letter.status, employee: employee} as RequestListItem;
    return (
        <ListItem button key={request.id} onClick={e => handleOpen(request.id)}>
        <ListItemAvatar>
          <Avatar>
            <ExitToApp />
          </Avatar>
        </ListItemAvatar>
        <ListItemText
            primary={request ? DeptDivsManager.getInstance().getDeptName(request.dept_id) : "loading.."}
            secondary={(request ? "IDR " + request.amount + " (" + FundRequestFundType[request.fund_type] + ")" : "loading..")}
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

export function FNInfocard(props: {request: FundRequest}) {
    const { request } = props;

    const [selEmpLRCount, setSelEmpLRCount] = React.useState(-1);
    const [selDeptFundAmount, setSelDeptFundAmount] = React.useState<number>(0);
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
        getApprovedFundRequestCount(request.dept_id).then((count) => {
            setSelEmpLRCount(count);
        });
        getAllocatedFunds(request.dept_id).then((sum) => {
            setSelDeptFundAmount(sum);
        });

        console.log('[FUNDM] RETRIEVED DEPARTMENTS, DIVISIONS, ENTITIES FROM FIREBASE!');
      }, []);

        return(
            <Card>
                <CardActionArea>
                    <CardContent>
                        <Typography gutterBottom variant="h6" component="h2">
                            {request.status !== RequestStatus.Pending ? "Department Fund Request" : "Department Fund Allocation"}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" component="p">
                            Requesting Department: <b>{DeptDivsManager.getInstance().getDeptName(request.dept_id)}</b><br/>
                            Requested Amount : IDR <b>{request.amount}</b><br/>
                            Requested Fund Method: <b>{FundRequestFundType[request.fund_type]}</b><br/>

                            This department has already received a total of IDR <b>{selDeptFundAmount}</b> in <b>{selEmpLRCount}</b> different fund allocations.<br/><br/>

                            This fund request is going to be used for the following: &nbsp;
                            <b>{request.reason}</b>
    
                            <Box m={3}>
                                <Divider light variant='fullWidth'/>
                            </Box>
    
                            This fund request was issued on <b>{request && request.issued_date ? new Date(request.issued_date.seconds*1000).toLocaleString() : "loading.."}</b>
    
                            {request.status !== RequestStatus.Pending && (
                                <div>
                                    <Box m={3}>
                                        <Divider light variant='fullWidth'/>
                                    </Box>
                                    This fund request was {request.status === RequestStatus.Approved ? "approved" : "declined"} on <b>{request && request.finalized_date ? new Date(request.finalized_date.seconds*1000).toLocaleString() : "loading.."}</b> by <b>{finalizer ? finalizer.name : "loading.."}</b> (<i>EID: {request.finalizer_eid}</i>)
                                    from <b>{finalizer ? DeptDivsManager.getInstance().getDeptName(finalizer.dept_id) : "loading.."}</b>
                                </div>
                            )}
                        </Typography>
                    </CardContent>
                </CardActionArea>
            </Card>
        );
}

export async function issueFundRequest(eid: string, reason: string, amount: number, fund_type: FundRequestFundType, dept_id: string){
    const fr = new FundRequest(eid, reason, amount, fund_type, dept_id, Timestamp.now(), getAuthUser().eid, RequestStatus.Pending, null, null);
    
    EmployeeUtils.getFinanceEmployees().then((data) => {
        data.docs.map((emp) => {
            Notification.insert(emp.data().eid, 'Fund Request', 'A new fund request pending approval from ' + DeptDivsManager.getInstance().getDeptName(dept_id) + ' of IDR ' + amount);
        })
    });

    return await fr.insert();
}

export async function updateFundRequest(requestId: string, response: RequestStatus) {

    const p = await getFundRequest(requestId).then((letter) => {
        const req = {id: letter.id, ...letter.data()} as FundRequest;
        const eid = req.eid;
        const amount = req.amount;

        if (response === RequestStatus.Approved) {
            Notification.insert(eid, 'Fund Request Approved', 'A fund request of IDR '+ amount +' that you issued has been approved and should be allocated shortly, please check your department funds regularly.');
        }else if (response === RequestStatus.Declined){
            Notification.insert(eid, 'Fund Request Declined', 'A fund request of IDR '+ amount +' that you issued has been declined, please check your issued fund requests to see');
        }
    }).then(() => {
        const docRef = doc(database, 'fundrequests', requestId);
        setDoc(docRef, { status: response, finalizer_eid: getAuthUser().eid, finalized_date: Timestamp.now() }, { merge: true });
    })

    return p;
}

export async function getApprovedFundRequestCount(dept_id: string) {
    var count = 0;
    return await getFundRequests(dept_id).then((data) => {
        data.docs.map((doc) => {
            if (({id: doc.id, ...doc.data()} as FundRequest).status === RequestStatus.Approved) {
                count++;
            }
        });

        return count;
    });
}

export async function getAllocatedFunds(dept_id: string) {
    var sum = 0;
    return await getFundRequests(dept_id).then((data) => {
        data.docs.map((doc) => {
            const fr = {id: doc.id, ...doc.data()} as FundRequest;
            if (fr.status === RequestStatus.Approved) {
                sum += fr.amount;
            }
        });

        return sum;
    });
}

export async function getFundRequest(id: string) {
    const docRef = doc(database, 'fundrequests', id);
    const promise = await getDoc(docRef);

    return promise;
}

export async function getFundRequests(dept_id: string) {
    const q = query(db_fundrequests, where('dept_id', '==', dept_id));
    const promise = await getDocs(q);

    return promise;
}

export async function getAllFundRequests() {
    const promise = await getDocs(db_fundrequests);

    return promise;
}