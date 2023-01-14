import React from 'react';
import { Theme, createStyles, makeStyles } from '@material-ui/core/styles';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import EmptyDialog from './EmptyDialog';
import { IAuth } from '../utils/auth_manager';
import DeptDivsManager from '../utils/deptsdivs_manager';
import { Producer } from '../utils/producers_manager';
import Grid from '@material-ui/core/Grid';
import { Timestamp } from 'firebase/firestore';
import { StorageItem, StorageItemCategory, StorageItemStatus } from '../utils/storageitem_manager';
import { Member, MemberLevel } from '../utils/members_manager';
import { getTheatre, getTheatreRTU, Theatre, TheatreStatus } from '../utils/theatres_manager';
import { PromotionEvent } from '../utils/events_manager';
import { FNBMenu, FNBMenuCategory } from '../utils/fnbmenu_manager';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
    },
    heading: {
        fontSize: theme.typography.pxToRem(15),
        flexBasis: '33.33%',
        flexShrink: 0,
      },
    secondaryHeading: {
        fontSize: theme.typography.pxToRem(15),
        color: theme.palette.text.secondary,
    },
  }),
);

export interface InfoSection{
    title: string
    infofields: InfoField[]
}

export interface InfoField{
    key: string
    value: string
}

export function StorageItemInfocard(props: {storageitem: StorageItem, openDialog: any, setOpenDialog: any, onDialogFinish: any}){
    const classes = useStyles();
    const { storageitem, openDialog, setOpenDialog, onDialogFinish } = props;

    const sections : InfoSection[] = [
        {title: "Status: " + (storageitem.status !== null ? StorageItemStatus[storageitem.status] : "loading.."), infofields: [
         ]} as InfoSection,
        {title: "Classification", infofields: [
           {key: "Category", value: storageitem.category !== null ? StorageItemCategory[storageitem.category] : "loading.."} as InfoField,
           {key: "Item Type", value: storageitem.type ? storageitem.type : "loading.."} as InfoField,
        ]} as InfoSection,
        {title: "Item Details", infofields: [
            {key: "Item Name", value: storageitem.name ? storageitem.name : "loading.."} as InfoField,
            {key: "Item Description", value: storageitem.description ? storageitem.description : "loading.."} as InfoField,
            {key: "Item Purchase Date", value: storageitem.purchase_date ? new Date(storageitem.purchase_date.seconds * 1000).toLocaleDateString() : "loading.."} as InfoField,
            {key: "Item Purchase Price", value: storageitem.purchase_price ? "IDR " + storageitem.purchase_price : "loading.."} as InfoField,
            {key: "Item Serial Code", value: storageitem.serial ? storageitem.serial : "loading.."} as InfoField,
         ]} as InfoSection,
    ]

    return(
        <Infocard title="Item Details" openDialog={openDialog} setOpenDialog={setOpenDialog} onDialogFinish={onDialogFinish} sections={sections} />
    )
}

export function ProducerInfocard(props: {producer: Producer, openDialog: any, setOpenDialog: any, onDialogFinish: any}){
    const classes = useStyles();
    const { producer, openDialog, setOpenDialog, onDialogFinish } = props;

    const sections : InfoSection[] = [
        {title: "General Information", infofields: [
           {key: "Producer Name", value: producer ? producer.name : "loading.."} as InfoField,
           {key: "Producer Email", value: producer ? producer.email : "loading.."} as InfoField,
        ]} as InfoSection,
        {title: "Personal Information", infofields: [
            {key: "Phone Number", value: producer ? producer.phone : "loading.."} as InfoField,
            {key: "Home Address", value: producer ? producer.address : "loading.."} as InfoField,
         ]} as InfoSection,
    ]

    return(
        <Infocard title="Producer Details" openDialog={openDialog} setOpenDialog={setOpenDialog} onDialogFinish={onDialogFinish} sections={sections} />
    )
}

export function EmployeeInfocard(props: {employee: IAuth, openDialog: any, setOpenDialog: any, onDialogFinish: any}){
    const classes = useStyles();
    const { employee, openDialog, setOpenDialog, onDialogFinish } = props;

    const sections : InfoSection[] = [
        {title: "General Information", infofields: [
           {key: "Employee ID", value: employee ? employee.eid : "loading.."} as InfoField,
           {key: "Employee Name", value: employee ? employee.name : "loading.."} as InfoField,
           {key: "Employee Email", value: employee ? employee.email : "loading.."} as InfoField,
           {key: "Department", value: employee ? DeptDivsManager.getInstance().getDeptName(employee.dept_id) : "loading.."} as InfoField,
           {key: "Division", value: employee ? DeptDivsManager.getInstance().getDivName(employee.div_id) : "loading.."} as InfoField,
        ]} as InfoSection,
        {title: "Personal Information", infofields: [
            {key: "Date of Birth", value:employee ? employee.dob ? new Date(employee.dob.seconds*1000).toLocaleDateString() : "loading.." : "loading.."} as InfoField,
            {key: "Phone Number", value: employee ? employee.phone : "loading.."} as InfoField,
            {key: "Home Address", value: employee ? employee.address : "loading.."} as InfoField,
         ]} as InfoSection,
    ]

    return(
        <Infocard title="Employee Details" openDialog={openDialog} setOpenDialog={setOpenDialog} onDialogFinish={onDialogFinish} sections={sections} />
    )
}

export function MemberInfocard(props: {member: Member, openDialog: any, setOpenDialog: any, onDialogFinish: any}){
    const classes = useStyles();
    const { member, openDialog, setOpenDialog, onDialogFinish } = props;

    const sections : InfoSection[] = [
        {title: "General Information", infofields: [
           {key: "Member Card Number", value: member ? member.card_no : "loading.."} as InfoField,
           {key: "Member Name", value: member ? member.name : "loading.."} as InfoField,
        ]} as InfoSection,
        {title: "Personal Information", infofields: [
            {key: "Phone Number", value: member ? member.phone : "loading.."} as InfoField,
            {key: "Email Address", value: member ? member.email : "loading.."} as InfoField,
            {key: "Home Address", value: member ? member.address : "loading.."} as InfoField,
         ]} as InfoSection,
         {title: "Membership Information", infofields: [
            {key: "Membership Level", value: member ? MemberLevel[member.level] : "loading.."} as InfoField,
            {key: "Membership Points", value: member ? member.points : "loading.."} as InfoField,
         ]} as InfoSection,
    ]

    return(
        <Infocard title="Member Details" openDialog={openDialog} setOpenDialog={setOpenDialog} onDialogFinish={onDialogFinish} sections={sections} />
    )
}

export function EventInfocard(props: {event: PromotionEvent, openDialog: any, setOpenDialog: any, onDialogFinish: any}){
    const classes = useStyles();
    const { event, openDialog, setOpenDialog, onDialogFinish } = props;

    const sections : InfoSection[] = [
        {title: "Promotion Event Information", infofields: [
           {key: "Event Title", value: event ? event.title : "loading.."} as InfoField,
           {key: "Event Description", value: event ? event.description : "loading.."} as InfoField,
           {key: "Event Start Date", value: event && event.start_time ? new Date(event.start_time.seconds*1000).toLocaleDateString() : "loading.."} as InfoField,
           {key: "Event End Date", value: event && event.end_time ? new Date(event.end_time.seconds*1000).toLocaleDateString() : "loading.."} as InfoField,
        ]} as InfoSection
    ]

    return(
        <Infocard title="Event Details" openDialog={openDialog} setOpenDialog={setOpenDialog} onDialogFinish={onDialogFinish} sections={sections} />
    )
}

export function FNBMenuInfocard(props: {item: FNBMenu, openDialog: any, setOpenDialog: any, onDialogFinish: any}){
    const classes = useStyles();
    const { item, openDialog, setOpenDialog, onDialogFinish } = props;

    const sections : InfoSection[] = [
        {title: "Item Information", infofields: [
        {key: "Item Category", value: item ? FNBMenuCategory[item.category] : "loading.."} as InfoField,
           {key: "Item Name", value: item ? item.name : "loading.."} as InfoField,
           {key: "Item Description", value: item ? item.description : "loading.."} as InfoField,
           {key: "Item Selling Price", value: item ? "IDR " + item.price : "loading.."} as InfoField,
           {key: "Item Production Cost", value: item ? "IDR " + item.cost : "loading.."} as InfoField,
           {key: "Item Stock", value: item ? item.stock : "loading.."} as InfoField,
        ]} as InfoSection
    ]

    return(
        <Infocard title="Item Details" openDialog={openDialog} setOpenDialog={setOpenDialog} onDialogFinish={onDialogFinish} sections={sections} />
    )
}

export function TheatreInfocard(props: {theatre: Theatre, openDialog: any, setOpenDialog: any, onDialogFinish: any}){
    const classes = useStyles();
    const { theatre, openDialog, setOpenDialog, onDialogFinish } = props;

    // const [theatre, setTheatre] = React.useState<Theatre>(null);

    // React.useEffect(() => {
    //     getTheatre(theatreid).then(e => {
    //         console.log("TEST");
    //         setTheatre({id: e.id, ...e.data()} as Theatre);
    //     })
    // }, []);

    const sections : InfoSection[] = [
        {title: "Theatre Information", infofields: [
           {key: "Branch Name", value: theatre && theatre.branch ? theatre.branch.name : "loading.."} as InfoField,
           {key: "Branch Address", value: theatre && theatre.branch ? theatre.branch.address : "loading.."} as InfoField,
           {key: "Theatre", value: theatre ? theatre.name.split(" ")[1] : "loading.."} as InfoField,
        ]} as InfoSection,
        {title: "Layout Information", infofields: [
            {key: "Layout Name", value: theatre && theatre.layout ? theatre.layout.name : "loading.."} as InfoField,
            {key: "Layout Capacity", value: theatre && theatre.layout ? theatre.layout.capacity + " pax": "loading.."} as InfoField,
         ]} as InfoSection,
         {title: "Status: " + (theatre && theatre.status !== null ? TheatreStatus[theatre.status] : "loading.."), infofields: [
        ]} as InfoSection,
    ]

    return(
        <Infocard title="Theatre Details" openDialog={openDialog} setOpenDialog={setOpenDialog} onDialogFinish={onDialogFinish} sections={sections} />
    )
}

export default function Infocard(props: {title: string, openDialog: any, setOpenDialog: any, onDialogFinish: any, sections: InfoSection[]}) {
  const classes = useStyles();
  const { title, openDialog, setOpenDialog, onDialogFinish, sections } = props;

  const content = <div className={classes.root}>
                    {
                        sections.map((sec) => (
                            <Accordion>
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                    aria-controls="panel1a-content"
                                    id="panel1a-header"
                                >
                                <Typography className={classes.heading}>{sec.title}</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                <Grid container direction='column' spacing={0}>
                                    {sec.infofields.map((inf) => (
                                            <Grid item>
                                                <AccordionSummary
                                                expandIcon={<br/>}
                                                aria-controls="panel1a-content"
                                                id="panel1a-header"
                                            >
                                                <Typography className={classes.heading}>{inf.key}</Typography>
                                                <Typography className={classes.secondaryHeading}>{inf.value}</Typography>
                                            </AccordionSummary>    
                                            </Grid>
                                    ))}
                                    </Grid>
                                </AccordionDetails>
                            </Accordion>
                        ))
                    }

                </div>

  return (
    <EmptyDialog title={title} openDialog={openDialog} setOpenDialog={setOpenDialog} onDialogFinish={onDialogFinish} 
    content={content}/>
    
  );
}