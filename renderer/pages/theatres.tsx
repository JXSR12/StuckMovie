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
import { Box } from '@material-ui/core';
import PendingTabs from '../components/PendingTabs';
import { getAuthUser, IAuth, logOut } from '../utils/auth_manager';
import { SidebarNav } from '../utils/sidebar_nav_manager';
import { AppManager } from '../utils/apps_manager';
import { GridColDef, GridSelectionModel, GridValueGetterParams } from '@mui/x-data-grid';
import ModularDataGrid from '../components/DataGrid';
import CategoryIcon from '@material-ui/icons/Category';
import { Grid } from '@material-ui/core';
import MeetingRoomIcon from '@material-ui/icons/MeetingRoom';
import Button from '@material-ui/core/Button';
import AddIcon from '@material-ui/icons/Add';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import { changeStatus, deleteStorageItem, getAllStorageItems, getStorageItem, insertNewStorageItem, StorageItem, StorageItemCategory, StorageItemStatus } from '../utils/storageitem_manager';
import FormDialog, { FormItemDate, FormItemDateTime, FormItemLongText, FormItemNumber, FormItemPreFilledShortText, FormItemSelect, FormItemShortText } from '../components/InsertFormDialog';
import EmptyDialog, { ShowcaseDialog } from '../components/EmptyDialog';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import InfoIcon from '@material-ui/icons/Info';
import QRCode from "react-qr-code";
import { MemberInfocard, StorageItemInfocard, TheatreInfocard } from '../components/EmployeeCardDialog';
import { getAllMembers, getMember, getMemberByCardNo, insertMember, Member, MemberLevel } from '../utils/members_manager';
import { faker } from '@faker-js/faker';
import { getAllTheatres, getAllTheatresRTU, getTheatre, getTheatreRTU, Theatre, TheatreStatus } from '../utils/theatres_manager';

const db_employees = collection(database, 'employees');

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

function Theatres() {
  const classes = useStyles({});
  const [ manage, setManage ] = React.useState(false);
  const [ managReq, setManageReq ]  = React.useState(false);
  const [ open, setOpen ] = React.useState(true);
  const [ auth, setAuth ] = React.useState(getAuthUser());

  const [ refreshList, setRefreshList ] = React.useState(false);

  const [ theatres, setTheatres ] = React.useState<Theatre[]>([]);

  const [selectionModel, setSelectionModel] = React.useState<GridSelectionModel>([]);

  const [ openDetails, setOpenDetails ] = React.useState(false);
  const [ openLabel, setOpenLabel] = React.useState(false);

  const [ labelText, setLabelText ] = React.useState<string>("");
  const dummyTheatre = {id: "string",
    branch: null,
    name: "string",
    layout: null, 
    status: 0} as Theatre;
  const [ selTheatre, setSelTheatre ] = React.useState<Theatre>(dummyTheatre);

  function QRIcon(){
    return(
      <svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000"><g><rect fill="none" height="24" width="24"/></g><path d="M15,21h-2v-2h2V21z M13,14h-2v5h2V14z M21,12h-2v4h2V12z M19,10h-2v2h2V10z M7,12H5v2h2V12z M5,10H3v2h2V10z M12,5h2V3h-2V5 z M4.5,4.5v3h3v-3H4.5z M9,9H3V3h6V9z M4.5,16.5v3h3v-3H4.5z M9,21H3v-6h6V21z M16.5,4.5v3h3v-3H16.5z M21,9h-6V3h6V9z M19,19v-3 l-4,0v2h2v3h4v-2H19z M17,12l-4,0v2h4V12z M13,10H7v2h2v2h2v-2h2V10z M14,9V7h-2V5h-2v4L14,9z M6.75,5.25h-1.5v1.5h1.5V5.25z M6.75,17.25h-1.5v1.5h1.5V17.25z M18.75,5.25h-1.5v1.5h1.5V5.25z"/></svg>
    )
  }

  React.useEffect(() => {
    getAllTheatresRTU().then(d => {
      setTheatres(d);
      console.log('Retrieved all theatres : ' + d.length + ' theatres found.');
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

  const handleSearch = () => {

  }

  const handleClickDetails = (event, cellValues) => {
    getTheatreRTU(cellValues.row.id).then(e => {
        setSelTheatre(e);
        setOpenDetails(true);
    })
  };

  const handleClickLabel = (event, cellValues) => {
    setLabelText(cellValues.row.cardno);
    setOpenLabel(true);

  };

  const cols: GridColDef[] = [
    {
      field: 'id',
      headerName: 'ID',
      width: 200,
    },
    {
      field: 'branch',
      headerName: 'Branch',
      width: 200,
    },
    {
      field: 'name',
      headerName: 'Theatre',
      width: 150,
    },
    {
      field: 'layoutname',
      headerName: 'Layout',
      width: 150,
    },
    {
      field: 'layoutcap',
      headerName: 'Capacity',
      width: 150,
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 150,
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
            <Tooltip title="View Member Details">
              <IconButton 
                aria-label="details" 
                style={{color: '#222'}} 
                onClick={(event) => {
                    handleClickDetails(event, cellValues);
                  }}>
                <InfoIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Show Member Card QR">
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

  function convertModeltoRow(item: Theatre) : any{
    return { id: item.id, branch: item.branch.name, name: item.name, layoutname: item.layout.name, layoutcap: item.layout.capacity, status: TheatreStatus[item.status]};
  }

  return (
    <React.Fragment>
      <Sidebar isManagement={manage} handleSearch={handleSearch} handleSearchClick={handleSearchClick} isManagementReq={managReq} handleSidebarButton={handleSidebarButton} handleLogOut={handleLogOut} handleOpenDrawerParent={handleOpenDrawer}/>
      <div className={clsx(classes.content, {
        [classes.contentShift]: open,
      })}>
        <Head>
          <title>Theatres - Stuck in The Movie Cinema System</title>
        </Head>
        <div className={classes.root}>
          <Box p="3rem">
            <Typography align='left' variant="h4" color="primary">
            <MeetingRoomIcon fontSize='small'/>
              {"   Theatres"}
              
            </Typography>
          </Box>
          <ModularDataGrid columns={cols} rows={theatres.map(e => convertModeltoRow(e))} setSelModel={setSelectionModel} selModel={selectionModel} pageSize={7} checkbox={true} density={'compact'}/>
        </div>
      </div>
      <TheatreInfocard theatre={selTheatre} openDialog={openDetails} setOpenDialog={setOpenDetails} onDialogFinish={e => setOpenDetails(false)} />
    </React.Fragment>
  );
};

export default Theatres;