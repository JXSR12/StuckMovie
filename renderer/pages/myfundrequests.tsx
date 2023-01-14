import React from 'react';
import Head from 'next/head';
import { Theme, makeStyles, createStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Link from '../components/Link';
import Router from 'next/router';
import secureLocalStorage from 'nextjs-secure-local-storage';
import ManageTable from '../components/ManageTable';
import { collection, DocumentData, getDocs, QueryDocumentSnapshot, QuerySnapshot, Timestamp } from 'firebase/firestore';
import { database } from '../database/firebase';
import PeopleRoundedIcon from '@material-ui/icons/PeopleRounded'
import AppsIcon from '@material-ui/icons/Apps';
import Topbar from '../components/Topbar';
import Sidebar from '../components/Sidebar';
import clsx from 'clsx';
import { Box } from '@material-ui/core';
import { checkAuth, getAuthUser, IAuth, logOut } from '../utils/auth_manager';
import AppGridContainer from '../components/AppGrid';
import { SidebarNav } from '../utils/sidebar_nav_manager';
import { AppManager } from '../utils/apps_manager';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import RequestTabs, { RequestType } from '../components/EmployeeRequestTabs';
import AddIcon from '@material-ui/icons/Add';
import Grid from '@material-ui/core/Grid';
import FormDialog, { FormItemDateTime, FormItemLabel, FormItemLongText, FormItemNumber, FormItemSelect } from '../components/InsertFormDialog';
import { issueLeaveRequest } from '../utils/leaverequest_manager';
import DeptDivsManager from '../utils/deptsdivs_manager';
import { FundRequestFundType, issueFundRequest } from '../utils/fundrequests_manager';
import MonetizationOnIcon from '@material-ui/icons/MonetizationOn';

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
    }
  })
);

function MyFundRequests() {
  const classes = useStyles({});
  const [ manage, setManage ] = React.useState(false);
  const [ managReq, setManageReq ]  = React.useState(false);
  const [ auth, setAuth ] = React.useState<IAuth>(getAuthUser());
  const [ open, setOpen ] = React.useState(true);

  const [ searched, setSearched ] = React.useState<string>("");

  const [ openCreateForm, setOpenCreateForm ] = React.useState(false);

  const [ newAmount, setNewAmount ] = React.useState<number>(1);

  const [ newReason, setNewReason ] = React.useState<string>('');

  const [ newAlloc, setNewAlloc ] = React.useState<FundRequestFundType>(FundRequestFundType.Cash);

  const [ newLRError, setNewLRError ] = React.useState<boolean>(false);

  const [ newLRErrMsg, setNewLRErrMsg ] = React.useState<string>('Error');

  const [refreshList, setRefreshList] = React.useState<boolean>(false);

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

  const handleSearch = (searched: string) => {
    setSearched(searched);
  }

  const handleCreateNew = () => {
    setOpenCreateForm(true);
  }

  const handleCloseForm = () => {
    setOpenCreateForm(false);
  }

  const handleSubmitForm = () => {
    if(newAmount < 1){
      setNewLRErrMsg("Request amount must be more than 0");
      setNewLRError(true);
    }else if(newReason.length === 0){
      setNewLRErrMsg("Request reason must be filled properly or your request will be declined");
      setNewLRError(true);
    }else{
      issueFundRequest(getAuthUser().eid, newReason, newAmount, newAlloc, getAuthUser().dept_id).then(
        () => {
          setRefreshList(!refreshList);
        }
      )
      setOpenCreateForm(false);
    }
  }

  const handleAmountChange = (event: React.ChangeEvent<{ value: number }>) => {
    setNewAmount(event.target.value);
  }

  const handleReasonChange = (event: React.ChangeEvent<{ value: string }>) => {
    setNewReason(event.target.value);
  }

  const handleAllocChange = (event: React.ChangeEvent<{ value: number }>) => {
    setNewAlloc(event.target.value as FundRequestFundType);
  }

  const handleSidebarButton = SidebarNav.handleSidebarButton;

  const handleSearchClick = AppManager.handleDefaultSearchClick;

  return (
    <React.Fragment>
      <Sidebar isManagement={manage} isManagementReq={managReq} handleSearch={handleSearch} handleSearchClick={handleSearchClick} handleSidebarButton={handleSidebarButton} handleLogOut={handleLogOut} handleOpenDrawerParent={handleOpenDrawer}/>
      <div className={clsx(classes.content, {
        [classes.contentShift]: open,
      })}>
        <Head>
          <title>Fund Requests - Stuck in The Movie Cinema System</title>
        </Head>
        <Box p="3rem">
            <Typography align='left' variant="h4" color="primary">
            <MonetizationOnIcon fontSize='small'/>
              {"   " + (getAuthUser() ? DeptDivsManager.getInstance().getDeptName(getAuthUser().dept_id) : "") + " Funds"}
              
            </Typography>
          </Box>
        <div className={classes.root}>
        <Grid container justifyContent="flex-end">
            <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    className={classes.button}
                    onClick={handleCreateNew}
            >
                Make New Fund Request
            </Button>
        </Grid>
            
            <RequestTabs refreshList={refreshList} employee={getAuthUser() as IAuth} requestType={RequestType.FundRequest} auth={auth ? true : false}/>
            <FormDialog 
                title={"Make New Fund Request"} 
                success_msg={"Successfully made new fund request!"} 
                positive_btn_label={"Add"}
                negative_btn_label={"Cancel"}
                generic_err={newLRErrMsg}
                fields={
                    [
                        {
                            id: "1",
                            component: <FormItemSelect<number> value={newAlloc} fieldname='Fund Allocation Method' placeholder='Preferred method of allocation' options={[
                                {id: 0, label: "Cash", content: FundRequestFundType.Cash},
                                {id: 1, label: "Company Card", content: FundRequestFundType.Card},
                                {id: 2, label: "Bank Transfer", content: FundRequestFundType.BankTransfer},
                                {id: 3, label: "Reimbursement", content: FundRequestFundType.Reimbursement},
                            ]} handleChange={handleAllocChange}/>
                        },
                        {
                            id: "2",
                            component: <FormItemNumber value={newAmount} fieldname='Request Amount' min={0} max={99999999999} handleChange={handleAmountChange} unit={"IDR"}/>
                        },
                        {
                            id: "3",
                            component: <FormItemLongText value={newReason} fieldname='Request Reason/Purpose' placeholder='Please specify the reason or purpose of this fund request' minLength={0} maxLength={500} handleChange={handleReasonChange}/>
                        }
                    ]
                }
                handleSubmit={handleSubmitForm}
                handleClose={handleCloseForm}
                open={openCreateForm}
                openError={newLRError}
                setOpenError={setNewLRError}
            />
        </div>
      </div>
    </React.Fragment>
  );
};

export default MyFundRequests;