import { addDoc, collection, doc, getDoc, getDocs, query, setDoc, Timestamp, where } from 'firebase/firestore';
import { RequestListItem, RequestStatus } from '../components/PendingTabs';
import { database } from '../database/firebase';
import { getAuthUser, IAuth } from './auth_manager';
import { EmployeeUtils } from './employee_manager';
import { issueFiringRequest } from './firingrequest_manager';
import { Notification } from './notification_manager';

import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Chip from '@material-ui/core/Chip';
import Typography from '@material-ui/core/Typography';
import { Avatar, Button, IconButton, List, ListItem, ListItemAvatar, ListItemSecondaryAction, ListItemText, TextField, Tooltip } from '@material-ui/core';
import React from 'react';
import Divider from '@material-ui/core/Divider';
import WarningIcon from '@material-ui/icons/Warning';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import CancelIcon from '@material-ui/icons/Cancel';
import HelpIcon from '@material-ui/icons/Help';
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';
import { Box } from '@material-ui/core';
import { Request } from './requests_manager';
import DeptDivsManager from './deptsdivs_manager';

const db_warningletters = collection(database, 'warningletters');

export class WarningLetter extends Request{
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
        const q = addDoc(db_warningletters, {
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

export function WLRequestListItem(props: {letter: WarningLetter, handleOpen: any}) {
    const [employee, setEmployee] = React.useState<IAuth>(null);

    const {letter, handleOpen} = props;
    
    const retrieveEntities = () => {
        EmployeeUtils.getEmployee(letter.eid).then((emp) => {
            setEmployee(emp.docs[0].data() as IAuth);
        });
    }

    React.useEffect(() => {
        retrieveEntities();
        console.log('[WLM] RETRIEVED ENTITIES FROM FIREBASE!');
      }, []);

    // return {id: letter.id, header: employee ? employee.name + ' (EID ' + letter.eid + ')' : 'retrieving data..', caption: letter.reason, status: letter.status, employee: employee} as RequestListItem;
    return (
        <ListItem button key={letter.id} onClick={e => handleOpen(letter.id)}>
        <ListItemAvatar>
          <Avatar>
            <WarningIcon />
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={employee ? employee.name + ' (EID ' + letter.eid + ')' : 'retrieving data..'}
          secondary={letter.reason}
        />
        <ListItemSecondaryAction>
        <Tooltip title={letter.status === RequestStatus.Approved ? 'Request Approved' : letter.status === RequestStatus.Declined ? 'Request Declined' : 'Unfinalized Request'}>
          <IconButton edge="start" aria-label="view">
            {letter.status === RequestStatus.Approved ? <CheckCircleIcon htmlColor='#36cf5e' /> : letter.status === RequestStatus.Declined ? <CancelIcon htmlColor='#cf4536' /> : <HelpIcon htmlColor='#a8a8a8' />}
          </IconButton>
        </Tooltip>
        </ListItemSecondaryAction>
      </ListItem>
    );
}

export function WLInfocard(props: {letter: WarningLetter}) {
    const { letter } = props;

    const [selEmpLettersCount, setSelEmpLettersCount] = React.useState(-1);
    const [employee, setEmployee] = React.useState<IAuth>(null);
    const [issuer, setIssuer] = React.useState<IAuth>(null);
    const [finalizer, setFinalizer] = React.useState<IAuth>(null);

    const retrieveEntities = () => {
        EmployeeUtils.getEmployee(letter.eid).then((emp) => {
            setEmployee(emp.docs[0].data() as IAuth);
        });
        EmployeeUtils.getEmployee(letter.issuer_eid).then((emp) => {
            setIssuer(emp.docs[0].data() as IAuth);
        });
        if(letter.status !== RequestStatus.Pending){
            EmployeeUtils.getEmployee(letter.finalizer_eid).then((emp) => {
                setFinalizer(emp.docs[0].data() as IAuth);
            });
        }
    }

    React.useEffect(() => {
        retrieveEntities();
        getApprovedWarningLetterCount(letter.eid).then((count) => {
            setSelEmpLettersCount(count);
        });
        console.log('[WLM] RETRIEVED DEPARTMENTS, DIVISIONS, ENTITIES FROM FIREBASE!');
      }, []);

        return(
            <Card>
                <CardActionArea>
                    <CardContent>
                        <Typography gutterBottom variant="h6" component="h2">
                            {letter.status !== RequestStatus.Pending ? "Warning Letter" : "Warning Letter Request"}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" component="p">
                            You are viewing a warning letter issued on the following employee:<br/><br/>
    
                            Employee Name : <b>{employee ? employee.name : "loading.."} (<i>EID: {letter.eid}</i>)</b><br/>
                            Department&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: <b>{employee ? DeptDivsManager.getInstance().getDeptName(employee.dept_id) : "loading.."}</b><br/>
                            Division&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: <b>{employee ? DeptDivsManager.getInstance().getDivName(employee.div_id) : "loading.."}</b><br/><br/>
    
                            which currently has <b>{selEmpLettersCount !== -1 ? selEmpLettersCount : "loading.."}</b> active warning letters.<br/><br/>

                            This letter was issued for the following reasons: &nbsp;
                            <b>{letter.reason}</b>


                            <Box m={3}>
                                <Divider light variant='fullWidth'/>
                            </Box>
                            
    
                            This letter was issued on <b>{letter.issued_date.toDate().toLocaleString()}</b> by <b>{issuer ? issuer.name : "loading.."}</b> (<i>EID: {letter.issuer_eid}</i>)
                            from <b>{issuer ? DeptDivsManager.getInstance().getDeptName(issuer.dept_id) : "loading.."}</b>
    
                            {letter.status !== RequestStatus.Pending && (
                            <div>
                                <Box m={3}>
                                    <Divider light variant='fullWidth'/>
                                </Box>
                                This letter was {letter.status === RequestStatus.Approved ? "approved" : "declined"} on <b>{letter.finalized_date.toDate().toLocaleString()}</b> by <b>{finalizer ? finalizer.name : "loading.."}</b> (<i>EID: {letter.finalizer_eid}</i>)
                                from <b>{finalizer ? DeptDivsManager.getInstance().getDeptName(finalizer.dept_id) : "loading.."}</b>
                            </div>
                            )}
                        </Typography>
                    </CardContent>
                </CardActionArea>
            </Card>
        );
}

export async function issueWarningLetter(eid: string, reason: string) {
    const warnLetter = new WarningLetter(eid, reason, Timestamp.now(), getAuthUser().eid, RequestStatus.Pending, null, null);
    
    EmployeeUtils.getManagementEmployees().then((data) => {
        data.docs.map((emp) => {
            Notification.insert(emp.data().eid, 'Warning Letter', 'A new warning letter pending approval for employee ID ' + eid + ' for the following reasons : ' + reason);
        })
    });

    return await warnLetter.insert();
}

export async function updateWarningLetter(letterId: string, response: RequestStatus) {

    const p = await getWarningLetter(letterId).then((letter) => {
        const eid = ({id: letter.id, ...letter.data()} as WarningLetter).eid;
        const reason = ({id: letter.id, ...letter.data()} as WarningLetter).reason;

        if (response === RequestStatus.Approved) {
            Notification.insert(eid, 'Warning Letter', 'You have received a warning letter for ' + reason);
        }

        const docRef = doc(database, 'warningletters', letterId);
        setDoc(docRef, { status: response, finalizer_eid: getAuthUser().eid, finalized_date: Timestamp.now() }, { merge: true }).then(() => {
                getApprovedWarningLetterCount(eid).then((count) => {
                    if (count >= 3) {
                        issueFiringRequest(eid, "Already received a cumulative of 3 or more warning letters");
                    }
                });
            }
        );

        
    });

    return p;
}

export async function getApprovedWarningLetterCount(eid: string) {
    var count = 0;
    return await getWarningLetters(eid).then((data) => {
        data.docs.map((doc) => {
            if (({id: doc.id, ...doc.data()} as WarningLetter).status === RequestStatus.Approved) {
                count++;
            }
        });

        return count;
    });
}

export async function getWarningLetter(id: string) {
    const docRef = doc(database, 'warningletters', id);
    const promise = await getDoc(docRef);

    return promise;
}

export async function getWarningLetters(eid: string) {
    const q = query(db_warningletters, where('eid', '==', eid));
    const promise = await getDocs(q);

    return promise;
}

export async function getAllWarningLetters() {
    const promise = await getDocs(db_warningletters);

    return promise;
}