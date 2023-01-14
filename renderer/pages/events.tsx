import React from 'react';
import Head from 'next/head';
import { Theme, makeStyles, createStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Router from 'next/router';
import { collection, DocumentData, getDocs, QueryDocumentSnapshot, QuerySnapshot, Timestamp } from 'firebase/firestore';
import { database } from '../database/firebase';
import InboxIcon from '@material-ui/icons/MoveToInbox';
import Sidebar from '../components/Sidebar';
import clsx from 'clsx';
import { Box, Divider } from '@material-ui/core';
import PendingTabs from '../components/PendingTabs';
import { getAuthUser, IAuth, logOut } from '../utils/auth_manager';
import { SidebarNav } from '../utils/sidebar_nav_manager';
import { AppManager } from '../utils/apps_manager';
import { GridColDef, GridSelectionModel, GridValueGetterParams } from '@mui/x-data-grid';
import ModularDataGrid from '../components/DataGrid';
import CategoryIcon from '@material-ui/icons/Category';
import { Grid } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import AddIcon from '@material-ui/icons/Add';
import EventIcon from '@material-ui/icons/Event';
import { changeStatus, deleteStorageItem, getAllStorageItems, getStorageItem, insertNewStorageItem, StorageItem, StorageItemCategory, StorageItemStatus } from '../utils/storageitem_manager';
import FormDialog, { FormItemDate, FormItemDateTime, FormItemLongText, FormItemMultipleChip, FormItemNumber, FormItemPreFilledShortText, FormItemSelect, FormItemShortText } from '../components/InsertFormDialog';
import EmptyDialog, { ShowcaseDialog } from '../components/EmptyDialog';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import InfoIcon from '@material-ui/icons/Info';
import QRCode from "react-qr-code";
import { EventInfocard, MemberInfocard, StorageItemInfocard } from '../components/EmployeeCardDialog';
import { getAllMembers, getMember, getMemberByCardNo, insertMember, Member, MemberLevel } from '../utils/members_manager';
import { faker } from '@faker-js/faker';
import { getAllEvents, getEvent, insertEvent, PromotionEvent } from '../utils/events_manager';

const drawerWidth = 240;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      textAlign: 'center',
      padding: theme.spacing(1),
    },
    menuButton: {
      marginRight: theme.spacing(2),
    },
    hide: {
      display: 'none',
    },
    content: {
      flexGrow: 1,
      padding: theme.spacing(3),
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      marginLeft: 0,
    },
    contentShift: {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: drawerWidth,
    },
    button: {
        margin: theme.spacing(2)
    },
    greenbtn: {
      margin: theme.spacing(2),
      backgroundColor: '#35d45f',
      color: '#fff'
    },
    redbtn: {
      margin: theme.spacing(2),
      backgroundColor: '#d43535',
      color: '#fff'
  }
  })
);

function Events() {
  const classes = useStyles({});
  const [ manage, setManage ] = React.useState(false);
  const [ managReq, setManageReq ]  = React.useState(false);
  const [ open, setOpen ] = React.useState(true);
  const [ auth, setAuth ] = React.useState(getAuthUser());
  const [ openCreateForm, setOpenCreateForm ] = React.useState(false);
  const [ openConfirmDialog, setOpenConfirmDialog ] = React.useState(false);

  const [ newLRError, setNewLRError ] = React.useState<boolean>(false);
  const [ newLRErrMsg, setNewLRErrMsg ] = React.useState<string>('Error');

  const [ newTitle, setNewTitle ] = React.useState<string>("");
  const [ newDescription, setNewDescription ] = React.useState<string>("");
  const [ newStartDate, setNewStartDate ] = React.useState<Date>(new Date(Date.now()));
  const [ newEndDate, setNewEndDate ] = React.useState<Date>(new Date(Date.now()));

  const [ genMemberCard, setGenMemberCard ] = React.useState<string>("");

  const [ refreshList, setRefreshList ] = React.useState(false);

  const [ events, setEvents ] = React.useState<PromotionEvent[]>([]);

  const [selectionModel, setSelectionModel] = React.useState<GridSelectionModel>([]);

  const [ openDetails, setOpenDetails ] = React.useState(false);
  const [ openLabel, setOpenLabel] = React.useState(false);

  const [ labelText, setLabelText ] = React.useState<string>("");
  const [ showCardLevel, setShowCardLevel ] = React.useState<string>("");
  const [ showCardName, setShowCardName ] = React.useState<string>("");
  const dummyEvent = {id: "",
    title: "",
    description: "",
    start_time: null,
    end_time: null,
    branches: []} as PromotionEvent;
  const [ selEvent, setSelEvent ] = React.useState<PromotionEvent>(dummyEvent);

  function QRIcon(){
    return(
      <svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000"><g><rect fill="none" height="24" width="24"/></g><path d="M15,21h-2v-2h2V21z M13,14h-2v5h2V14z M21,12h-2v4h2V12z M19,10h-2v2h2V10z M7,12H5v2h2V12z M5,10H3v2h2V10z M12,5h2V3h-2V5 z M4.5,4.5v3h3v-3H4.5z M9,9H3V3h6V9z M4.5,16.5v3h3v-3H4.5z M9,21H3v-6h6V21z M16.5,4.5v3h3v-3H16.5z M21,9h-6V3h6V9z M19,19v-3 l-4,0v2h2v3h4v-2H19z M17,12l-4,0v2h4V12z M13,10H7v2h2v2h2v-2h2V10z M14,9V7h-2V5h-2v4L14,9z M6.75,5.25h-1.5v1.5h1.5V5.25z M6.75,17.25h-1.5v1.5h1.5V17.25z M18.75,5.25h-1.5v1.5h1.5V5.25z"/></svg>
    )
  }

  React.useEffect(() => {
    getAllEvents().then(d => {
      setEvents(
        d.docs.map((dd => {
          const ddd = {id: dd.id, ...dd.data()} as PromotionEvent;
          return ddd;
        }))
      );
    })
  }, [refreshList]);

  React.useEffect(() => {
    if(auth && (auth.dept_id === 'qIvZZoS7Bnro7bD7DpWs' || auth.dept_id === '44dnLCF6Mksm8k2jn09w')){
      setManage(true);
    }
    if(auth && (auth.dept_id === 'qIvZZoS7Bnro7bD7DpWs')){
      setManageReq(true);
    }

    console.log('Authed: ' + auth + '| object: ' + auth);

    if(!auth){
      Router.push('/home');
      SidebarNav.currentPathname = '/home';
    }
  }, [auth]);

  const handleOpenDrawer = () => {
    setOpen(!open);
  }

  const handleLogOut = () => {
    logOut(setAuth);
  }

  const handleSidebarButton = SidebarNav.handleSidebarButton;

  const handleSearchClick = AppManager.handleDefaultSearchClick;

  const handleCreateNew = () => {
    resetForm();
    setNewLRError(false);
    setOpenCreateForm(true);
  }

  const handleDelete = () => {
    setOpenConfirmDialog(true);
  }

  const handleDeleteItem = () => {
    setOpenConfirmDialog(false);
    selectionModel.map(e => {
      deleteStorageItem(e as string).then(() => {
        setRefreshList(!refreshList);
      })
    })
  }

  const handleCloseForm = () => {
    setOpenCreateForm(false);
  }

  const handleSubmitForm = () => {
    if(newTitle.length === 0){
      setNewLRErrMsg("Event title must be filled");
      setNewLRError(true);
    }else if(newDescription.length === 0){
      setNewLRErrMsg("Event description must be filled");
      setNewLRError(true);
    }else{
      insertEvent(newTitle, newDescription, Timestamp.fromDate(newStartDate), Timestamp.fromDate(newEndDate), []).then(() => {
        setRefreshList(!refreshList);
      })
      setOpenCreateForm(false);
    }
  }

  const handleNameChange = (event: React.ChangeEvent<{ value: string }>) => {
    setNewTitle(event.target.value);
  }

  const handleDescChange = (event: React.ChangeEvent<{ value: string }>) => {
    setNewDescription(event.target.value);
  }

  const resetForm = () => {
    setNewTitle("");
    setNewDescription("");
    setNewStartDate(new Date())
    setNewEndDate(new Date())
  }

  const handleSearch = () => {

  }

  const handleClickDetails = (event, cellValues) => {
    getEvent(cellValues.row.id).then(e => {
      const a = {id: e.id, ...e.data()} as PromotionEvent;
      setSelEvent(a)
      setOpenDetails(true);
    })
  };

  const handleClickLabel = (event, cellValues) => {
    setLabelText(cellValues.row.title);
    setOpenLabel(true);
  };

  const cols: GridColDef[] = [
    {
      field: 'id',
      headerName: 'Event ID',
      width: 200,
    },
    {
      field: 'title',
      headerName: 'Event Title',
      width: 180,
    },
    {
      field: 'description',
      headerName: 'Event Description',
      width: 160,
    },
    {
      field: 'start_date',
      headerName: 'Starting Date',
      width: 200,
    },
    {
      field: 'end_date',
      headerName: 'Ending Date',
      width: 160,
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: (cellValues) => {
        return (
          <div>
            <Tooltip title="View Event Details">
              <IconButton 
                aria-label="details" 
                style={{color: '#222'}} 
                onClick={(event) => {
                    handleClickDetails(event, cellValues);
                  }}>
                <InfoIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Show Event QR Code">
              <IconButton 
                aria-label="qrlabel" 
                style={{color: '#222'}} 
                onClick={(event) => {
                    handleClickLabel(event, cellValues);
                  }}>
                <QRIcon />
              </IconButton>
            </Tooltip>
          </div>
        );
      }
    }
  ];

  function convertModeltoRow(item: PromotionEvent) : any{
    return { id: item.id, title: item.title, description: item.description, start_date: new Date(item.start_time.seconds*1000).toLocaleDateString(), end_date: new Date(item.end_time.seconds*1000).toLocaleDateString()};
  }

  return (
    <React.Fragment>
      <Sidebar isManagement={manage} handleSearch={handleSearch} handleSearchClick={handleSearchClick} isManagementReq={managReq} handleSidebarButton={handleSidebarButton} handleLogOut={handleLogOut} handleOpenDrawerParent={handleOpenDrawer}/>
      <div className={clsx(classes.content, {
        [classes.contentShift]: open,
      })}>
        <Head>
          <title>Promotion and Events - Stuck in The Movie Cinema System</title>
        </Head>
        <div className={classes.root}>
          <Box p="3rem">
            <Typography align='left' variant="h4" color="primary">
            <EventIcon fontSize='small'/>
              {"   Promotion and Events"}
              
            </Typography>
          </Box>
          <Box mt={2} mb={2}>
            <Grid container justifyContent="flex-end">
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  className={classes.button}
                  onClick={handleCreateNew}
                >
                    Create New Event
                </Button>
            </Grid>
          </Box>
          <ModularDataGrid columns={cols} rows={events.map(e => convertModeltoRow(e))} setSelModel={setSelectionModel} selModel={selectionModel} pageSize={7} checkbox={true} density={'compact'}/>
        </div>
      </div>
      <FormDialog 
                title={"Create New Event"} 
                success_msg={"Successfully created new promotion / event"} 
                positive_btn_label={"Create"}
                negative_btn_label={"Cancel"}
                generic_err={newLRErrMsg}
                fields={
                    [
                        {
                          id: "1",
                          component: <FormItemShortText value={newTitle} fieldname='Event Title' placeholder='New event title' minLength={0} maxLength={500} handleChange={handleNameChange}/>
                        },
                        {
                          id: "2",
                          component: <FormItemLongText value={newDescription} fieldname='Event Description' placeholder='New event description' minLength={0} maxLength={1000} handleChange={handleDescChange}/>
                        },
                        {
                          id: "3",
                          component: <FormItemDateTime value={newStartDate} fieldname='Start Time' min={new Date(Date.now())} max={new Date("2100-12-31")} handleChange={setNewStartDate}/>
                        },
                        {
                          id: "4",
                          component: <FormItemDateTime value={newEndDate} fieldname='End Time' min={new Date(Date.now())} max={new Date("2100-12-31")} handleChange={setNewEndDate}/>
                        }
                    ]
                }
                handleSubmit={handleSubmitForm}
                handleClose={handleCloseForm}
                open={openCreateForm}
                openError={newLRError}
                setOpenError={setNewLRError}
            />
            <ShowcaseDialog openDialog={openLabel} setOpenDialog={setOpenLabel} onDialogFinish={e => setOpenLabel(false)} content={
              <Grid container direction='column' spacing={2} alignItems="center"
              justifyContent="center">
                <Grid item>
                  <Typography variant='caption'>
                    {labelText ? labelText : "Event Name"}
                  </Typography>
                </Grid>
                <br/>
                <Grid item>
                  <QRCode
                    size={128}
                    style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                    value={labelText ? "https://firestore.googleapis.com/v1/projects/stuckinthemovie-57b60/databases/(default)/documents/storageitems/" + labelText : "UNDEFINED"}
                    viewBox={`0 0 128 128`}
                    fgColor={"#000"}
                    bgColor={"#ffe657"}
                  />
                </Grid>
              </Grid>
            }/>
            <EventInfocard event={selEvent} openDialog={openDetails} setOpenDialog={setOpenDetails} onDialogFinish={e => setOpenDetails(false)} />
    </React.Fragment>
  );
};

export default Events;