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
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import SupervisedUserCircleIcon from '@material-ui/icons/SupervisedUserCircle';
import { changeStatus, deleteStorageItem, getAllStorageItems, getStorageItem, insertNewStorageItem, StorageItem, StorageItemCategory, StorageItemStatus } from '../utils/storageitem_manager';
import FormDialog, { FormItemDate, FormItemDateTime, FormItemLongText, FormItemNumber, FormItemPreFilledShortText, FormItemSelect, FormItemShortText } from '../components/InsertFormDialog';
import EmptyDialog, { ShowcaseDialog } from '../components/EmptyDialog';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import InfoIcon from '@material-ui/icons/Info';
import QRCode from "react-qr-code";
import { MemberInfocard, StorageItemInfocard } from '../components/EmployeeCardDialog';
import { getAllMembers, getMember, getMemberByCardNo, insertMember, Member, MemberLevel } from '../utils/members_manager';
import { faker } from '@faker-js/faker';

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

function Members() {
  const classes = useStyles({});
  const [ manage, setManage ] = React.useState(false);
  const [ managReq, setManageReq ]  = React.useState(false);
  const [ open, setOpen ] = React.useState(true);
  const [ auth, setAuth ] = React.useState(getAuthUser());
  const [ openCreateForm, setOpenCreateForm ] = React.useState(false);
  const [ openConfirmDialog, setOpenConfirmDialog ] = React.useState(false);

  const [ newLRError, setNewLRError ] = React.useState<boolean>(false);
  const [ newLRErrMsg, setNewLRErrMsg ] = React.useState<string>('Error');

  const [ newName, setNewName ] = React.useState<string>("");
  const [ newPhone, setNewPhone ] = React.useState<string>("");
  const [ newEmail, setNewEmail ] = React.useState<string>("");
  const [ newLevel, setNewLevel ] = React.useState<MemberLevel>(MemberLevel.Standard);
  const [ newAddress, setNewAddress ] = React.useState<string>("");
  const [ genMemberCard, setGenMemberCard ] = React.useState<string>("");

  const [ refreshList, setRefreshList ] = React.useState(false);

  const [ members, setMembers ] = React.useState<Member[]>([]);

  const [selectionModel, setSelectionModel] = React.useState<GridSelectionModel>([]);

  const [ openDetails, setOpenDetails ] = React.useState(false);
  const [ openLabel, setOpenLabel] = React.useState(false);

  const [ labelText, setLabelText ] = React.useState<string>("");
  const [ showCardLevel, setShowCardLevel ] = React.useState<string>("");
  const [ showCardName, setShowCardName ] = React.useState<string>("");
  const dummyMember = {id: "string",
    name: "string",
    email: "string",
    phone: "string",
    address: "string",
    card_no: "string",
    points: 0,
    level: MemberLevel.Standard} as Member;
  const [ selMember, setSelMember ] = React.useState<Member>(dummyMember);

  function QRIcon(){
    return(
      <svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000"><g><rect fill="none" height="24" width="24"/></g><path d="M15,21h-2v-2h2V21z M13,14h-2v5h2V14z M21,12h-2v4h2V12z M19,10h-2v2h2V10z M7,12H5v2h2V12z M5,10H3v2h2V10z M12,5h2V3h-2V5 z M4.5,4.5v3h3v-3H4.5z M9,9H3V3h6V9z M4.5,16.5v3h3v-3H4.5z M9,21H3v-6h6V21z M16.5,4.5v3h3v-3H16.5z M21,9h-6V3h6V9z M19,19v-3 l-4,0v2h2v3h4v-2H19z M17,12l-4,0v2h4V12z M13,10H7v2h2v2h2v-2h2V10z M14,9V7h-2V5h-2v4L14,9z M6.75,5.25h-1.5v1.5h1.5V5.25z M6.75,17.25h-1.5v1.5h1.5V17.25z M18.75,5.25h-1.5v1.5h1.5V5.25z"/></svg>
    )
  }

  React.useEffect(() => {
    getAllMembers().then(d => {
      setMembers(
        d.docs.map((dd => {
          const ddd = {id: dd.id, ...dd.data()} as Member;
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
    if(newName.length === 0){
      setNewLRErrMsg("Member name must be filled");
      setNewLRError(true);
    }else if(newPhone.length === 0){
      setNewLRErrMsg("Member phone number must be filled");
      setNewLRError(true);
    }else if(newEmail.length === 0){
        setNewLRErrMsg("Member email address must be filled");
        setNewLRError(true);
    }else if(newAddress.length === 0){
        setNewLRErrMsg("Member home address must be filled");
        setNewLRError(true);
    }else if(newLevel === null){
      setNewLRErrMsg("Membership level must be selected");
      setNewLRError(true);
    }else{
        insertMember(newName, newPhone, newEmail, newAddress, genMemberCard).then(() => {
          setRefreshList(!refreshList);
        })
      setOpenCreateForm(false);
    }
  }

  const handleNameChange = (event: React.ChangeEvent<{ value: string }>) => {
    setNewName(event.target.value);
  }

  const handlePhoneChange = (event: React.ChangeEvent<{ value: string }>) => {
    setNewPhone(event.target.value);
  }

  const handleEmailChange = (event: React.ChangeEvent<{ value: string }>) => {
    setNewEmail(event.target.value);
  }

  const handleLevelChange = (event: React.ChangeEvent<{ value: number }>) => {
    setNewLevel(event.target.value as MemberLevel);
  }

  const handleAddressChange = (event: React.ChangeEvent<{ value: string }>) => {
    setNewAddress(event.target.value);
  }

  const resetForm = () => {
    setNewName("");
    setNewPhone("");
    setNewAddress("");
    setNewEmail("");
    setNewLevel(MemberLevel.Standard);
    setGenMemberCard(faker.phone.number('#### #### #### ####'));
  }

  const handleSearch = () => {

  }

  const handleClickDetails = (event, cellValues) => {
    getMemberByCardNo(cellValues.row.id).then(e => {
      const a = {...e.docs[0].data()} as Member;
      setSelMember(a)
      setOpenDetails(true);
    })
  };

  const handleClickLabel = (event, cellValues) => {
    setLabelText(cellValues.row.id);
    setShowCardLevel(cellValues.row.level);
    setShowCardName(cellValues.row.name);
    setOpenLabel(true);
  };

  const cols: GridColDef[] = [
    {
      field: 'id',
      headerName: 'Card No',
      width: 200,
    },
    {
      field: 'name',
      headerName: 'Member Name',
      width: 180,
    },
    {
      field: 'phone',
      headerName: 'Phone Number',
      width: 160,
    },
    {
      field: 'email',
      headerName: 'Email Address',
      width: 200,
    },
    {
      field: 'level',
      headerName: 'Membership',
      width: 160,
    },
    {
      field: 'points',
      headerName: 'Points',
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

  function convertModeltoRow(item: Member) : any{
    return { id: item.card_no, name: item.name, phone: item.phone, level: MemberLevel[item.level], points: item.points, email: item.email};
  }

  return (
    <React.Fragment>
      <Sidebar isManagement={manage} handleSearch={handleSearch} handleSearchClick={handleSearchClick} isManagementReq={managReq} handleSidebarButton={handleSidebarButton} handleLogOut={handleLogOut} handleOpenDrawerParent={handleOpenDrawer}/>
      <div className={clsx(classes.content, {
        [classes.contentShift]: open,
      })}>
        <Head>
          <title>Members - Stuck in The Movie Cinema System</title>
        </Head>
        <div className={classes.root}>
          <Box p="3rem">
            <Typography align='left' variant="h4" color="primary">
            <SupervisedUserCircleIcon fontSize='small'/>
              {"   Members"}
              
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
                    Register New Member
                </Button>
            </Grid>
          </Box>
          <ModularDataGrid columns={cols} rows={members.map(e => convertModeltoRow(e))} setSelModel={setSelectionModel} selModel={selectionModel} pageSize={7} checkbox={true} density={'compact'}/>
        </div>
      </div>
      <FormDialog 
                title={"Add New Member"} 
                success_msg={"Successfully added new member"} 
                positive_btn_label={"Add"}
                negative_btn_label={"Cancel"}
                generic_err={newLRErrMsg}
                fields={
                    [
                        {
                          id: "1",
                          component: <FormItemShortText value={newName} fieldname='Full Name' placeholder='New member full name' minLength={0} maxLength={500} handleChange={handleNameChange}/>
                        },
                        {
                          id: "2",
                          component: <FormItemShortText value={newPhone} fieldname='Phone Number' placeholder='New member phone number' minLength={0} maxLength={500} handleChange={handlePhoneChange}/>
                        },
                        {
                          id: "3",
                          component: <FormItemShortText value={newEmail} fieldname='Email Address' placeholder='New member email address' minLength={0} maxLength={500} handleChange={handleEmailChange}/>
                        },
                        {
                          id: "4",
                          component: <FormItemLongText value={newAddress} fieldname='Home Address' placeholder='New member home address' minLength={0} maxLength={1000} handleChange={handleAddressChange}/>
                        },
                        {
                          id: "5",
                          component: <FormItemSelect<number> value={newLevel} fieldname='Membership Level' placeholder='Selected membership level' options={[
                            {id: 0, label: "Standard", content: MemberLevel.Standard},
                          ]} handleChange={handleLevelChange}/>
                        },
                        {
                          id: "6",
                          component: <FormItemPreFilledShortText value={genMemberCard} fieldname='Generated Member Card Number'/>
                        },
                    ]
                }
                handleSubmit={handleSubmitForm}
                handleClose={handleCloseForm}
                open={openCreateForm}
                openError={newLRError}
                setOpenError={setNewLRError}
            />
            <ShowcaseDialog openDialog={openLabel} setOpenDialog={setOpenLabel} onDialogFinish={e => setOpenLabel(false)} content={
              <Grid container direction='column' spacing={2} alignItems="flex-start"
              justifyContent="center">
                <Grid item>
                  <Typography variant='h3'>
                    {labelText ? labelText : "Card Number"}
                  </Typography>
                  <br/>
                  <Typography variant='h5'>
                    {showCardName ? showCardName.toUpperCase() : "Member Name"}
                  </Typography>
                  <Typography variant='body1'>
                    {showCardLevel ? showCardLevel : "Levelum"}
                  </Typography>
                </Grid>
                <br/>
                <Grid item>
                  <QRCode
                    size={64}
                    style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                    value={labelText ? "https://firestore.googleapis.com/v1/projects/stuckinthemovie-57b60/databases/(default)/documents/storageitems/" + labelText : "UNDEFINED"}
                    viewBox={`0 0 128 128`}
                    fgColor={"#000"}
                    bgColor={"#ffe657"}
                  />
                </Grid>
              </Grid>
            }/>
            <MemberInfocard member={selMember} openDialog={openDetails} setOpenDialog={setOpenDetails} onDialogFinish={e => setOpenDetails(false)} />
    </React.Fragment>
  );
};

export default Members;