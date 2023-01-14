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
import Button from '@material-ui/core/Button';
import AddIcon from '@material-ui/icons/Add';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import { changeStatus, deleteStorageItem, getAllStorageItems, getStorageItem, insertNewStorageItem, StorageItem, StorageItemCategory, StorageItemStatus } from '../utils/storageitem_manager';
import FormDialog, { FormItemDate, FormItemDateTime, FormItemLongText, FormItemNumber, FormItemSelect, FormItemShortText } from '../components/InsertFormDialog';
import EmptyDialog, { ShowcaseDialog } from '../components/EmptyDialog';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import InfoIcon from '@material-ui/icons/Info';
import QRCode from "react-qr-code";
import { StorageItemInfocard } from '../components/EmployeeCardDialog';

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

function StorageItems() {
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
  const [ newType, setNewType ] = React.useState<string>("");
  const [ newCat, setNewCat ] = React.useState<StorageItemCategory>(StorageItemCategory.Equipment);
  const [ newDesc, setNewDesc ] = React.useState<string>("");
  const [ newPrice, setNewPrice ] = React.useState<number>(100000);
  const [ newDate, setNewDate ] = React.useState<Date>(new Date());
  const [ newQuantity, setNewQuantity ] = React.useState<number>(1);

  const [ refreshList, setRefreshList ] = React.useState(false);

  const [ storageItems, setStorageItems ] = React.useState<StorageItem[]>([]);

  const [selectionModel, setSelectionModel] = React.useState<GridSelectionModel>([]);

  const [ openDetails, setOpenDetails ] = React.useState(false);
  const [ openLabel, setOpenLabel ] = React.useState(false);

  const [ labelText, setLabelText ] = React.useState<string>("");
  const dummySI = {serial: "string",
    name: "string",
    type: "string",
    category: StorageItemCategory.Equipment,
    description: "string",
    purchase_price: 0,
    purchase_date: Timestamp.now(),
    status: StorageItemStatus.Unusable} as StorageItem;
  const [ selItem, setSelItem ] = React.useState<StorageItem>(dummySI);

  function QRIcon(){
    return(
      <svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000"><g><rect fill="none" height="24" width="24"/></g><path d="M15,21h-2v-2h2V21z M13,14h-2v5h2V14z M21,12h-2v4h2V12z M19,10h-2v2h2V10z M7,12H5v2h2V12z M5,10H3v2h2V10z M12,5h2V3h-2V5 z M4.5,4.5v3h3v-3H4.5z M9,9H3V3h6V9z M4.5,16.5v3h3v-3H4.5z M9,21H3v-6h6V21z M16.5,4.5v3h3v-3H16.5z M21,9h-6V3h6V9z M19,19v-3 l-4,0v2h2v3h4v-2H19z M17,12l-4,0v2h4V12z M13,10H7v2h2v2h2v-2h2V10z M14,9V7h-2V5h-2v4L14,9z M6.75,5.25h-1.5v1.5h1.5V5.25z M6.75,17.25h-1.5v1.5h1.5V17.25z M18.75,5.25h-1.5v1.5h1.5V5.25z"/></svg>
    )
  }

  React.useEffect(() => {
    getAllStorageItems().then(d => {
      setStorageItems(
        d.docs.map((dd => {
          const ddd = {serial: dd.id, ...dd.data()} as StorageItem;
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

  const handleSetUsable = () => {
    selectionModel.map(e => {
      changeStatus(e as string, StorageItemStatus.Usable).then(() => {
        setRefreshList(!refreshList);
      })
    })
  }

  const handleSetUnusable = () => {
    selectionModel.map(e => {
      changeStatus(e as string, StorageItemStatus.Unusable).then(() => {
        setRefreshList(!refreshList);
      })
    })
  }

  const handleCloseForm = () => {
    setOpenCreateForm(false);
  }

  const handleSubmitForm = () => {
    if(newName.length === 0){
      setNewLRErrMsg("Item name must be filled");
      setNewLRError(true);
    }else if(newType.length === 0){
      setNewLRErrMsg("Item type must be filled");
      setNewLRError(true);
    }else if(newCat === null){
      setNewLRErrMsg("Category must be selected");
      setNewLRError(true);
    }else if(newPrice < 0){
      setNewLRErrMsg("Item price cannot be less than 0");
      setNewLRError(true);
    }else if(!newDate || newDate > new Date(Date.now())){
      setNewLRErrMsg("Purchase date must not be in the future");
      setNewLRError(true);
    }else{
      for(let i = 0; i < newQuantity; i++){
        insertNewStorageItem(newName, newType, newCat, newPrice, Timestamp.fromDate(newDate), newDesc).then(() => {
          setRefreshList(!refreshList);
        })
      }

      setOpenCreateForm(false);
    }
  }

  const handleNameChange = (event: React.ChangeEvent<{ value: string }>) => {
    setNewName(event.target.value);
  }

  const handleTypeChange = (event: React.ChangeEvent<{ value: string }>) => {
    setNewType(event.target.value);
  }

  const handleDescChange = (event: React.ChangeEvent<{ value: string }>) => {
    setNewDesc(event.target.value);
  }

  const handlePriceChange = (event: React.ChangeEvent<{ value: number }>) => {
    setNewPrice(event.target.value);
  }

  const handleCatChange = (event: React.ChangeEvent<{ value: number }>) => {
    setNewCat(event.target.value as StorageItemCategory);
  }

  const handleQuantityChange = (event: React.ChangeEvent<{ value: number }>) => {
    setNewQuantity(event.target.value);
  }

  const resetForm = () => {
    setNewName("");
    setNewType("");
    setNewDesc("");
    setNewPrice(100000);
    setNewCat(StorageItemCategory.Equipment);
    setNewDate(new Date(Date.now()));
    setNewQuantity(1);
  }

  const handleSearch = () => {

  }

  const handleClickDetails = (event, cellValues) => {
    getStorageItem(cellValues.row.id).then(e => {
      const a = {serial: e.id, ...e.data()} as StorageItem;
      setSelItem(a)
      setOpenDetails(true);
    })
  };

  const handleClickLabel = (event, cellValues) => {
    setLabelText(cellValues.row.id);
    setOpenLabel(true);

  };

  const cols: GridColDef[] = [
    {
      field: 'category',
      headerName: 'Category',
      width: 150,
    },
    { field: 'id', 
      headerName: 'Serial Code', 
      width: 250,
    },
    {
      field: 'name',
      headerName: 'Item Name',
      width: 250,
    },
    {
      field: 'type',
      headerName: 'Item Type',
      width: 160,
    },
    {
      field: 'status',
      headerName: 'Item Status',
      width: 150,
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 200,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: (cellValues) => {
        return (
          <div>
            <Tooltip title="View Item Details">
              <IconButton 
                aria-label="details" 
                style={{color: '#222'}} 
                onClick={(event) => {
                    handleClickDetails(event, cellValues);
                  }}>
                <InfoIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Show Label">
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

  function convertModeltoRow(item: StorageItem) : any{
    return { id: item.serial, name: item.name, type: item.type, category: StorageItemCategory[item.category], description: item.description, status: StorageItemStatus[item.status]};
  }

  return (
    <React.Fragment>
      <Sidebar isManagement={manage} handleSearch={handleSearch} handleSearchClick={handleSearchClick} isManagementReq={managReq} handleSidebarButton={handleSidebarButton} handleLogOut={handleLogOut} handleOpenDrawerParent={handleOpenDrawer}/>
      <div className={clsx(classes.content, {
        [classes.contentShift]: open,
      })}>
        <Head>
          <title>Storage Items - Stuck in The Movie Cinema System</title>
        </Head>
        <div className={classes.root}>
          <Box p="3rem">
            <Typography align='left' variant="h4" color="primary">
            <CategoryIcon fontSize='small'/>
              {"   Storage Items"}
              
            </Typography>
          </Box>
          <Box mt={2} mb={2}>
            <Grid container justifyContent="flex-end">
              {selectionModel.length > 0 && (
                <div>
                <Button
                  variant="contained"
                  className={classes.redbtn}
                  onClick={handleSetUnusable}
                >
                    Set Unusable
                </Button>
                <Button
                  variant="contained"
                  className={classes.greenbtn}
                  onClick={handleSetUsable}
                >
                    Set Usable
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<DeleteForeverIcon />}
                  className={classes.button}
                  onClick={handleDelete}
                >
                    Delete Item
                </Button>
                </div>
              )}
                
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  className={classes.button}
                  onClick={handleCreateNew}
                >
                    Add Item
                </Button>
            </Grid>
          </Box>
          <ModularDataGrid columns={cols} rows={storageItems.map(e => convertModeltoRow(e))} setSelModel={setSelectionModel} selModel={selectionModel} pageSize={7} checkbox={true} density={'compact'}/>
        </div>
      </div>
      <FormDialog 
                title={"Add New Item to Storage"} 
                success_msg={"Successfully added new item to storage"} 
                positive_btn_label={"Add"}
                negative_btn_label={"Cancel"}
                generic_err={newLRErrMsg}
                fields={
                    [
                        {
                          id: "1",
                          component: <FormItemSelect<number> value={newCat} fieldname='Category' placeholder='Category of the item' options={[
                            {id: 0, label: "Facility", content: StorageItemCategory.Facility},
                            {id: 1, label: "Equipment", content: StorageItemCategory.Equipment},
                          ]} handleChange={handleCatChange}/>
                        },
                        {
                          id: "2",
                          component: <FormItemShortText value={newName} fieldname='Item Name' placeholder='Full name of the item' minLength={0} maxLength={500} handleChange={handleNameChange}/>
                        },
                        {
                          id: "3",
                          component: <FormItemShortText value={newType} fieldname='Item Type' placeholder='Descriptive type of the item' minLength={0} maxLength={500} handleChange={handleTypeChange}/>
                        },
                        {
                          id: "4",
                          component: <FormItemLongText value={newDesc} fieldname='Item Description' placeholder='Description of the item (optional)' minLength={0} maxLength={1000} handleChange={handleDescChange}/>
                        },
                        {
                          id: "5",
                          component: <FormItemNumber value={newPrice} fieldname='Item Purchase Price' min={0} max={9999999999} handleChange={handlePriceChange} unit={"IDR"}/>
                        },
                        {
                          id: "6",
                          component: <FormItemDate value={newDate} fieldname='Item Purchase Date' min={new Date("1950-01-01")} max={new Date(Date.now())} handleChange={setNewDate}/>
                        },
                        {
                          id: "7",
                          component: <FormItemNumber value={newQuantity} fieldname='Item Quantity' min={1} max={9999999} handleChange={handleQuantityChange} unit={"unit"}/>
                        },
                    ]
                }
                handleSubmit={handleSubmitForm}
                handleClose={handleCloseForm}
                open={openCreateForm}
                openError={newLRError}
                setOpenError={setNewLRError}
            />
            <EmptyDialog title={"Confirm item deletion"} openDialog={openConfirmDialog} setOpenDialog={setOpenConfirmDialog} onDialogFinish={e => setOpenConfirmDialog(false)} content={
              <div>
                <Typography>
                  Are you sure you want to delete these <b>{selectionModel.length}</b> items?
                </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    className={classes.button}
                    onClick={handleDeleteItem}
                  >
                      Confirm Deletion
                  </Button>
              </div>
            } />
            <ShowcaseDialog openDialog={openLabel} setOpenDialog={setOpenLabel} onDialogFinish={e => setOpenLabel(false)} content={
              <Grid container direction='column' spacing={2} alignItems="center"
              justifyContent="center">
                <Grid item>
                  <Typography variant='caption'>
                    SITM-{labelText ? labelText : "SERIALCODE"}
                  </Typography>
                </Grid>
                <Grid item>
                  <QRCode
                    size={128}
                    style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                    value={labelText ? "https://firestore.googleapis.com/v1/projects/stuckinthemovie-57b60/databases/(default)/documents/storageitems/" + labelText : "SERIALCODE"}
                    viewBox={`0 0 128 128`}
                    fgColor={"#000"}
                    bgColor={"#ffe657"}
                  />
                </Grid>
              </Grid>
            }/>
            <StorageItemInfocard storageitem={selItem} openDialog={openDetails} setOpenDialog={setOpenDetails} onDialogFinish={e => setOpenDetails(false)} />
    </React.Fragment>
  );
};

export default StorageItems;