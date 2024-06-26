import React from 'react';
import clsx from 'clsx';
import { createStyles, lighten, makeStyles, Theme } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Checkbox from '@material-ui/core/Checkbox';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import HighlightOffIcon from '@material-ui/icons/HighlightOff';
import AssignmentLateRoundedIcon from '@material-ui/icons/AssignmentLateRounded';
import PermIdentityIcon from '@material-ui/icons/PermIdentity';
import FilterListIcon from '@material-ui/icons/FilterList';
import LocalAtmIcon from '@material-ui/icons/LocalAtm';
import ScheduleIcon from '@material-ui/icons/Schedule';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { database } from '../database/firebase';
import { Alert, Skeleton } from '@material-ui/lab';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, FormControl, Grid, InputLabel, MenuItem, Select, Snackbar } from '@material-ui/core';
import SearchBar from 'material-ui-search-bar';
import { getApprovedWarningLetterCount, issueWarningLetter } from '../utils/warningletter_manager';
import EmptyDialog from './EmptyDialog';
import WorkingTimeAccordion from './WorkingTimes';
import { EmployeeUtils } from '../utils/employee_manager';
import { EmployeeInfocard } from './EmployeeCardDialog';
import { getAuthUser, IAuth } from '../utils/auth_manager';
import FormDialog, { FormItem, FormItemBeforeAfterNumber } from './InsertFormDialog';
import { issueSalaryAdjustment } from '../utils/salaryadjustments_manager';

const db_employees = collection(database, 'employees');
const db_departments = collection(database, 'departments');
const db_divisions = collection(database, 'divisions');
const db_warningletters = collection(database, 'warningletters');

interface Data {
  eid: string;
  ename: string;
  edept: string;
  ediv: string;
  eemail: string;
  ephone: string;
  esalary: number;
}

function createData(
  name: string,
  email: string,
  dept: string,
  div: string,
  id: string,
  phone: string,
  salary: number,
): Data {
  return { ediv: div, eid: id, edept: dept, ename: name, eemail: email, ephone: phone, esalary: salary};
}

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

type Order = 'asc' | 'desc';

function getComparator<Key extends keyof any>(
  order: Order,
  orderBy: Key,
): (a: { [key in Key]: number | string }, b: { [key in Key]: number | string }) => number {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort<T>(array: T[], comparator: (a: T, b: T) => number) {
  const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

interface HeadCell {
  disablePadding: boolean;
  id: keyof Data;
  label: string;
  numeric: boolean;
}

const headCells: HeadCell[] = [
  { id: 'eid', numeric: false, disablePadding: false, label: 'Employee ID' },
  { id: 'ename', numeric: false, disablePadding: false, label: 'Name' },
  { id: 'edept', numeric: false, disablePadding: false, label: 'Department' },
  { id: 'ediv', numeric: false, disablePadding: false, label: 'Division' },
  { id: 'eemail', numeric: false, disablePadding: false, label: 'Email' },
  { id: 'ephone', numeric: false, disablePadding: false, label: 'Phone Number'},
  { id: 'esalary', numeric: true, disablePadding: false, label: 'Salary (IDR)'},
];

interface EnhancedTableProps {
  classes: ReturnType<typeof useStyles>;
  numSelected: number;
  onRequestSort: (event: React.MouseEvent<unknown>, property: keyof Data) => void;
  onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
  order: Order;
  orderBy: string;
  rowCount: number;
}

function EnhancedTableHead(props: EnhancedTableProps) {
  const { classes, onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort } = props;
  const createSortHandler = (property: keyof Data) => (event: React.MouseEvent<unknown>) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead style={{backgroundColor: '#222', color: 'white'}}>
      <TableRow style={{backgroundColor: '#222', color: 'white'}}>
        <TableCell padding="checkbox" style={{backgroundColor: '#222', color: 'white'}}>
          <Checkbox
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
            inputProps={{ 'aria-label': 'select all employees' }}
            style={{backgroundColor: '#222', color: 'white'}}
          />
        </TableCell>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? 'right' : 'left'}
            padding={headCell.disablePadding ? 'none' : 'normal'}
            sortDirection={orderBy === headCell.id ? order : false}
            style={{backgroundColor: '#222', color: 'white'}}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
              style={{backgroundColor: '#222', color: 'white'}}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <span className={classes.visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </span>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

const useToolbarStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(1),
    },
    highlight:
      theme.palette.type === 'light'
        ? {
            color: theme.palette.secondary.main,
            backgroundColor: lighten(theme.palette.secondary.light, 0.85),
          }
        : {
            color: theme.palette.text.primary,
            backgroundColor: theme.palette.secondary.dark,
          },
    title: {
      flex: '1 1 50%',
    },
  }),
);

interface EnhancedTableToolbarProps {
  numSelected: number;
  selected: string;
  searchBar: any;
  giveWarnLetter: boolean;
  adjustSalary: boolean;
  changeWorkTime: boolean;
  
  handleIssueLetterOpen: (eid: string) => void;
  handleWorkingTime: (eid: string) => void;
  handleEmployeeDetails: (eid: string) => void;
  handleAdjustSalary: (eid: string) => void;
  handleClearSelection: () => void;
}

const EnhancedTableToolbar = (props: EnhancedTableToolbarProps) => {
  const classes = useToolbarStyles();
  const { numSelected, selected, searchBar, handleIssueLetterOpen, handleWorkingTime, handleClearSelection, giveWarnLetter, adjustSalary, changeWorkTime, handleEmployeeDetails, handleAdjustSalary} = props;

  const handleIssueLetterClick = () => {
    handleIssueLetterOpen(selected)
  }

  const handleWorkingTimeClick = () => {
    handleWorkingTime(selected)
  }

  const handleEmployeeDetailsClick = () => {
    handleEmployeeDetails(selected)
  }

  const handleAdjustSalaryClick = () => {
    handleAdjustSalary(selected)
  }

  return (
    <Toolbar
      className={clsx(classes.root, {
        [classes.highlight]: numSelected > 0,
      })}
      style={{backgroundColor: '#222', color: 'white'}}
    >
      {searchBar}
      {numSelected > 0 ? (
        <Typography className={classes.title} color="inherit" variant="subtitle1" component="div">
          Selected {numSelected} employees
        </Typography>
      ) : (
        <Typography className={classes.title} variant="subtitle1" id="tableTitle" component="div">
          No selected employees
        </Typography>
      )}
      {numSelected == 1 && changeWorkTime && (
        <div>
        <Tooltip title="View Working Time">
          <IconButton aria-label="working-time" style={{color: 'white'}} onClick={handleWorkingTimeClick}>
            <ScheduleIcon />
          </IconButton>
        </Tooltip>
        </div>
      )}
      {numSelected == 1 && giveWarnLetter && (
        <div>
        <Tooltip title="Issue Warning Letter">
          <IconButton aria-label="warning-letter" style={{color: 'white'}} onClick={handleIssueLetterClick}>
            <AssignmentLateRoundedIcon />
          </IconButton>
        </Tooltip>
        </div>
      )}
      {numSelected > 0 && numSelected <= 10 && adjustSalary && (
        <div>
        <Tooltip title="Adjust Salaries">
          <IconButton aria-label="adjust-salary" style={{color: 'white'}} onClick={handleAdjustSalaryClick}>
            <LocalAtmIcon />
          </IconButton>
        </Tooltip>
        </div>
      )}
      {numSelected == 1 && (
        <div>
        <Tooltip title="View Employee Details">
          <IconButton aria-label="details" style={{color: 'white'}} onClick={handleEmployeeDetailsClick}>
            <PermIdentityIcon />
          </IconButton>
        </Tooltip>
        </div>
      )}
      {numSelected > 0 && (
        <Tooltip title="Clear Selection">
        <IconButton aria-label="clear" style={{color: 'white'}} onClick={handleClearSelection}>
          <HighlightOffIcon />
        </IconButton>
      </Tooltip>
      )}
    </Toolbar>
  );
};

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
    },
    paper: {
      width: '100%',
      marginBottom: theme.spacing(2),
    },
    table: {
      minWidth: 750,
      backgroundColor: '#222',
    },
    searchBar: {
      width: '50%',
      backgroundColor: '#AAA',
    },
    visuallyHidden: {
      border: 0,
      clip: 'rect(0 0 0 0)',
      height: 1,
      margin: -1,
      overflow: 'hidden',
      padding: 0,
      position: 'absolute',
      top: 20,
      width: 1,
    },
  }),
);

const departmentsArray = [];
const divisionsArray = [];

const getDepts = () => {
    getDocs(db_departments)
        .then((data) => {
          data.docs.map((item) => {
            departmentsArray.push({ ...item.data(), id: item.id });
        });
        });
}

const getDivs = () => {
  getDocs(db_divisions)
      .then((data) => {
        data.docs.map((item) => {
          console.log(item);
          divisionsArray.push({ ...item.data(), id: item.id });
      });
      });
}

function getDeptName(deptId: string | number) : string{
  var ret = 'No department set';
  departmentsArray.forEach(element => {
    if(deptId === element.id){
      ret = element.name;
    }
  });

  return ret;
}

function getDivName(divId: string | number) : string{
  var ret = 'No division set';
  divisionsArray.forEach(element => {
    if(divId === element.id){
      ret = element.name
    }
  });

  return ret;
}

export interface SalaryChange{
  eid: string
  from: string
  to: string
}

export default function ManageTable({access, giveWarnLetter, changeWorkTime, adjustSalary}: {access: boolean, giveWarnLetter: boolean, changeWorkTime: boolean, adjustSalary: boolean}) {

  const classes = useStyles();
  const [order, setOrder] = React.useState<Order>('asc');
  const [orderBy, setOrderBy] = React.useState<keyof Data>('eid');
  const [selected, setSelected] = React.useState<string[]>([]);
  const [page, setPage] = React.useState(0);
  const [dense, setDense] = React.useState(false);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [loading, setLoading] = React.useState(true);
  const [fetched, setFetched] = React.useState(false);
  const [searched, setSearched] = React.useState<string>("");
  const [originalRows, setOriginalRows] = React.useState<Data[]>([]);
  const [internalRows, setInternalRows] = React.useState<Data[]>([]);
  const [openIssueLetter, setOpenIssueLetter] = React.useState(false);
  const [openWorktimeDialog, setOpenWorktimeDialog] = React.useState(false);

  const [openDetailsDialog, setOpenDetailsDialog] = React.useState(false);
  const [openSalaryDialog, setOpenSalaryDialog] = React.useState(false);

  const [salaryAdjustmentFields, setSalaryAdjustmentFields] = React.useState<FormItem[]>([]);

  const [openSnackbar, setOpenSnackbar] = React.useState(false);

  const [openDiv, setOpenDiv] = React.useState(false);
  const [warningReason, setWarningReason] = React.useState<string>('UNDEFINEDREASON');

  const [adjEmployees, setAdjEmployees] = React.useState<string[]>([]);
  const [empDocs, setEmpDocs] = React.useState([]);

  const [selEmployee, setSelEmployee] = React.useState<Data>();
  const [fullSelEmployee, setFullSelEmployee ] = React.useState<IAuth>();
  const [selEmpLettersCount, setSelEmpLettersCount] = React.useState(0);
  const [selEmpLettersFetched, setSelEmpLettersFetched] = React.useState(false);

  const [oldSalaries, setOldSalaries] = React.useState<number[]>([]);
  const [newSalaries, setNewSalaries] = React.useState<number[]>([]);

  const [openIssueLetterAlert, setOpenIssueLetterAlert] = React.useState(false);

  const handleChangeReason = (event: React.ChangeEvent<{ value: string }>) => {
    setWarningReason(event.target.value as string);
  };

  const handleSnackbarClose = () => {
    setOpenSnackbar(false);
  }

  const handleIssueLetterClose = () => {
    setOpenIssueLetter(false);
  }

  const handleIssueLetterOpen = (eid: string) => {
    setSelEmpLettersFetched(false);
    const q = query(db_employees, where('eid', '==', eid));

    const wl = query(db_warningletters,  where('eid', '==', eid));

    getDocs(q)
        .then((data) => {
          setSelEmployee({
            eid: data.docs[0].data().eid,
            ename: data.docs[0].data().name,
            edept: data.docs[0].data().dept_id,
            ediv: data.docs[0].data().div_id,
            eemail: data.docs[0].data().email,
            ephone: data.docs[0].data().phone,
            esalary: data.docs[0].data().salary,
          });
          getApprovedWarningLetterCount(eid).then((count) => {
            setSelEmpLettersCount(count);
            setSelEmpLettersFetched(true);
          });
          setOpenIssueLetter(true);
        });
  }

  const handleWorkingTime = (eid: string) => {
    EmployeeUtils.getEmployee(eid).then((data) => {
      setSelEmployee({
        eid: data.docs[0].data().eid,
        ename: data.docs[0].data().name,
        edept: data.docs[0].data().dept_id,
        ediv: data.docs[0].data().div_id,
        eemail: data.docs[0].data().email,
        ephone: data.docs[0].data().phone,
        esalary: data.docs[0].data().salary,
      });
      setOpenWorktimeDialog(true);
    })
  }

  const handleViewDetails = (eid: string) => {
    EmployeeUtils.getEmployee(eid).then((data) => {
      setFullSelEmployee(
        {...data.docs[0].data()} as IAuth
      );
      setOpenDetailsDialog(true);
    })
  }

  const handleSalaryAdjustmentChange = (event: React.ChangeEvent<{ value: string }>, index: number) => {
    newSalaries[index] = Number.parseInt(event.target.value);

    setNewSalaries(JSON.parse(JSON.stringify(newSalaries)));
    console.log('EID: ' + adjEmployees)
    console.log('Before: ' + oldSalaries);
    console.log('After: ' + newSalaries);
  }

  React.useEffect(() => {
    console.log('New Salaries: ' + newSalaries);
  }, [newSalaries])

  const handleCloseSalaryAdjustment = () => {
    setOpenSalaryDialog(false);
  }

  const [ salaryAdjustmentError, setSalaryAdjustmentError ] = React.useState<boolean>(false);

  function validateSalaryAdjustments() : boolean{
    newSalaries.forEach(e => {
      if(e === 0) return false;
    })

    return true;
  }

  React.useEffect(() => {
    setOldSalaries([]);
    setNewSalaries([]);
  }, [selected]);

  const handleSalaryAdjustmentSubmit = () => {
    console.log("OLD: " + oldSalaries);
    console.log("NEW: " + newSalaries);
    if(!validateSalaryAdjustments()){
      setSalaryAdjustmentError(true);
    }else{
      adjEmployees.map((eid, idx) => {
        var today = new Date();
        var year = today.getFullYear();
        var month = today.getMonth();
        var quarter;
        if (month < 3)
          quarter = 1;
        else if (month < 6)
          quarter = 2;
        else if (month < 9)
          quarter = 3;
        else if (month < 12)
          quarter = 4;
        issueSalaryAdjustment(eid, "HRD Quarterly Salary Adjustment (Q"+quarter + " " + year +")", oldSalaries[idx], newSalaries[idx]);
      })
      setOpenSalaryDialog(false);
    }
  }

  const handleSalaryAdjustment = (eids : string[]) => {
    setOldSalaries([]);
    setNewSalaries([]);
    EmployeeUtils.getEmployeesByIds(eids).then((emps) => {
      var count = 0;
      var newsalaries = [];
      var oldsalaries = [];
      for(let i = 0; i < emps.size; i++){
        newsalaries.push(emps.docs[i].data().salary + 1000000);
        oldsalaries.push(emps.docs[i].data().salary);
      }
      setOldSalaries(oldsalaries);
      setNewSalaries(newsalaries);

      adjEmployees.splice(0, adjEmployees.length);

      setEmpDocs(emps.docs);
    })
  }

  React.useEffect(() => {
    if(newSalaries.length > 0){
      var count = 0;
      setSalaryAdjustmentFields(
        empDocs.map((emp) => {
          count++;
          const em = {id: emp.id, ...emp.data()} as IAuth;
          adjEmployees.push(em.eid);
          return {id: em.eid, component: 
          <FormItemBeforeAfterNumber
            index={count-1}
            contexttitle={em.name} 
            contextcaption={em.eid}
            fieldname="Proposed Salary"
            beforeFieldname="Current Salary"
            beforeValue={em.salary}
            unit="IDR"
            min={1}
            max={9999999999}
            value={newSalaries[count-1]}
            handleChange={handleSalaryAdjustmentChange}
             /> 
          } as FormItem;
        })
      );
      setOpenSalaryDialog(true);
    }
  }, [empDocs]);

  const handleIssueLetterConfirm = (eid: string, reason: string) => {
    if(reason !== "UNDEFINEDREASON"){
      issueWarningLetter(eid, reason);
      setOpenSnackbar(true);
      setOpenIssueLetter(false);
    }else{
      setOpenIssueLetterAlert(true);
    }
    
  }

  const getAllEmployees = (setFetched: any) => {
    setOriginalRows([]);
    getDocs(db_employees)
        .then((data) => {
          setOriginalRows(
          data.docs.map((item) => {
            return createData(item.data().name, item.data().email, item.data().dept_id, item.data().div_id, item.data().eid, item.data().phone, item.data().salary);
          }));
          cancelSearch();
        });
    
  }

  const requestSearch = (searchedVal: string) => {
    const filteredRows = originalRows.filter((row) => {

      return row.ename.toLowerCase().includes(searchedVal.toLowerCase()) || 
      getDeptName(row.edept).toLowerCase().includes(searchedVal.toLowerCase()) ||
      getDivName(row.ediv).toLowerCase().includes(searchedVal.toLowerCase()) ||
      row.eemail.toLowerCase().includes(searchedVal.toLowerCase()) ||
      row.ephone.toLowerCase().includes(searchedVal.toLowerCase()) ||
      row.eid.toLowerCase().includes(searchedVal.toLowerCase());
    });
    setInternalRows(filteredRows);
    setPage(0);
  };

  const cancelSearch = () => {
    setSearched("");
    requestSearch(searched);
  };

  React.useEffect(() => {
    getDepts();
    getDivs();
    getAllEmployees(setFetched);
    console.log('RETRIEVED DEPARTMENTS, DIVISIONS, and EMPLOYEES FROM FIREBASE!');
    setTimeout(() => {
      setLoading(false);
      setFetched(true);
    }, 2500);
  }, []);

  if(fetched){
    console.log(internalRows);
  }

  const handleRequestSort = (event: React.MouseEvent<unknown>, property: keyof Data) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelecteds = internalRows.map((n) => n.ediv);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event: React.MouseEvent<unknown>, name: string) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected: string[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }

    setSelected(newSelected);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleChangeDense = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDense(event.target.checked);
  };

  const handleClearSelection = () => {
    setSelected([]);
  }

  const handleCloseWarningReason = () => {
    setOpenDiv(false);
  };

  const handleOpenWarningReason = () => {
    setOpenDiv(true);
  };


  const isSelected = (name: string) => selected.indexOf(name) !== -1;

  const emptyRows = rowsPerPage - Math.min(rowsPerPage, internalRows.length - page * rowsPerPage);

  const [loadingIssueLetter, setLoadingIssueLetter] = React.useState(false);

  if(!fetched || loading || !access){
    return (
    <div className={classes.root}>
      <Paper className={classes.paper} style={{backgroundColor: '#000'}}>
      <EnhancedTableToolbar adjustSalary={adjustSalary} handleAdjustSalary={e => handleSalaryAdjustment(selected)}  handleEmployeeDetails={handleViewDetails} handleWorkingTime={handleWorkingTime} changeWorkTime={changeWorkTime} selected={selected[0]} giveWarnLetter={giveWarnLetter} handleIssueLetterOpen={handleIssueLetterOpen} handleClearSelection={handleClearSelection} searchBar={
        (<SearchBar
          value={searched}
          onChange={(searchVal) => requestSearch(searchVal)}
          onCancelSearch={() => cancelSearch()}
          placeholder="Loading employees data"
        />)
      }
      numSelected={selected.length} />
        <Skeleton style={{backgroundColor: '#444'}} animation="wave" />
        <Skeleton style={{backgroundColor: '#333'}} variant="rect" animation="wave" />
        <Skeleton style={{backgroundColor: '#444'}} variant="rect" animation="wave" />
        <Skeleton style={{backgroundColor: '#444'}} animation="wave" />
        <Skeleton style={{backgroundColor: '#333'}} variant="rect" animation="wave" />
        <Skeleton style={{backgroundColor: '#444'}} variant="rect" animation="wave" />
        <Skeleton style={{backgroundColor: '#444'}} animation="wave" />
        <Skeleton style={{backgroundColor: '#333'}} variant="rect" animation="wave" />
        <Skeleton style={{backgroundColor: '#444'}} variant="rect" animation="wave" />
        <Skeleton style={{backgroundColor: '#444'}} animation="wave" />
        <Skeleton style={{backgroundColor: '#333'}} variant="rect" animation="wave" />
        <Skeleton style={{backgroundColor: '#444'}} variant="rect" animation="wave" />
        <Skeleton style={{backgroundColor: '#444'}} animation="wave" />
        <Skeleton style={{backgroundColor: '#333'}} variant="rect" animation="wave" />
        <Skeleton style={{backgroundColor: '#444'}} variant="rect" animation="wave" />
        <Skeleton style={{backgroundColor: '#444'}} animation="wave" />
        <Skeleton style={{backgroundColor: '#333'}} variant="rect" animation="wave" />
        <Skeleton style={{backgroundColor: '#444'}} variant="rect" animation="wave" />
      </Paper>
    </div>
    )
  }else{
    return (
      <div className={classes.root}>
        <Paper className={classes.paper}>
          <EnhancedTableToolbar adjustSalary={adjustSalary} handleAdjustSalary={e => handleSalaryAdjustment(selected)} handleEmployeeDetails={handleViewDetails} handleWorkingTime={handleWorkingTime} changeWorkTime={changeWorkTime}  selected={selected[0]} giveWarnLetter={giveWarnLetter} handleIssueLetterOpen={handleIssueLetterOpen} handleClearSelection={handleClearSelection} searchBar={
        (<SearchBar
          value={searched}
          onChange={(searchVal) => requestSearch(searchVal)}
          onCancelSearch={() => cancelSearch()}
          className={classes.searchBar}
          placeholder="Search employee by name, department, email, etc."
        />)
      } numSelected={selected.length} />
          <TableContainer>
            <Table
              className={classes.table}
              aria-labelledby="tableTitle"
              size={dense ? 'small' : 'medium'}
              aria-label="enhanced table"
            >
              <EnhancedTableHead
                classes={classes}
                numSelected={selected.length}
                order={order}
                orderBy={orderBy}
                onSelectAllClick={handleSelectAllClick}
                onRequestSort={handleRequestSort}
                rowCount={internalRows.length}
              />
              <TableBody>
                {stableSort(internalRows, getComparator(order, orderBy))
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row, index) => {
                    console.log(row);
                    const isItemSelected = isSelected(row.eid as string);
                    const labelId = `enhanced-table-checkbox-${index}`;
  
                    return (
                      <TableRow
                        hover
                        onClick={(event) => handleClick(event, row.eid as string)}
                        role="checkbox"
                        aria-checked={isItemSelected}
                        tabIndex={-1}
                        key={row.eid}
                        selected={isItemSelected}
                        style={{backgroundColor:'#222', color: 'white',}}
                      >
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={isItemSelected}
                            style={{color: 'white',}}
                            inputProps={{ 'aria-labelledby': labelId }}
                          />
                        </TableCell>
                        <TableCell component="th" id={labelId} scope="row" padding="none" style={{color: 'white',}}>
                          {row.eid}
                        </TableCell>
                        <TableCell align="left" style={{color: 'white',}}>{row.ename}</TableCell>
                        <TableCell align="left" style={{color: 'white',}}>{getDeptName(row.edept)}</TableCell>
                        <TableCell align="left" style={{color: 'white',}}>{getDivName(row.ediv)}</TableCell>
                        <TableCell align="left" style={{color: 'white',}}>{row.eemail}</TableCell>
                        <TableCell align="left" style={{color: 'white',}}>{row.ephone}</TableCell>
                        <TableCell align="left" style={{color: 'white',}}>{row.esalary}</TableCell>
                      </TableRow>
                    );
                  })}
                {emptyRows > 0 && (
                  <TableRow style={{ height: (dense ? 33 : 53) * emptyRows }}>
                    <TableCell colSpan={8} />
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={internalRows.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            style={{backgroundColor: '#222', color: 'white'}}
          />
        </Paper>
        <FormControlLabel
          style={{color: 'white'}}
          control={<Switch checked={dense} onChange={handleChangeDense} />}
          label="Dense padding"
        />
        <Dialog open={openIssueLetter} onClose={handleIssueLetterClose}>
        {openIssueLetterAlert && (
          <Alert severity="error" onClose={() => setOpenIssueLetterAlert(false)}>Issuance reason must be selected!</Alert>
        )}
        <DialogTitle>Issue Warning Letter</DialogTitle>
        <DialogContent dividers>
          <DialogContentText>
            You will be issuing a warning letter to the following employee:<br/><br/>

            Employee Name : <b>{selEmployee ? selEmployee.ename : "UNDEFINED"} (<i>EID: {selEmployee ? selEmployee.eid : "UNDEFINED"}</i>)</b><br/>
            Department&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: <b>{getDeptName(selEmployee ? selEmployee.edept : "")}</b><br/>
            Division&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: <b>{getDivName(selEmployee ? selEmployee.ediv : "")}</b><br/><br/>

            which currently has <b>{selEmpLettersFetched ? selEmpLettersCount : "loading.."}</b> active warning letters.<br/>
          </DialogContentText>
        </DialogContent>
        <DialogContent>
          <FormControl fullWidth>
                  <InputLabel id="demo-controlled-open-select-label">Warning Letter Reason</InputLabel>
                  <Select
                  labelId="demo-controlled-open-select-label"
                  id="demo-controlled-open-select"
                  open={openDiv}
                  onClose={handleCloseWarningReason}
                  onOpen={handleOpenWarningReason}
                  value={warningReason}
                  onChange={handleChangeReason}
                  fullWidth
                  >
                  <MenuItem value="UNDEFINEDREASON">
                    <em>Select an issuance reason</em>
                  </MenuItem>
                  {['Attendance', 'Behavior', 'Negligence', 'Desertion', 'Misconduct', 'Others'].map((reason) => (
                    <MenuItem value={reason} key={reason}>{reason}</MenuItem>
                  ))}
                  </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleIssueLetterClose}>Cancel</Button>
          {selEmpLettersFetched && (<Button color='primary' variant='contained' onClick={e => handleIssueLetterConfirm(selEmployee.eid, warningReason)}>Issue Letter</Button>)}
        </DialogActions>
        </Dialog>
        <Snackbar open={openSnackbar} autoHideDuration={4000} onClose={handleSnackbarClose}>
          <Alert onClose={handleSnackbarClose} severity="success">
            Warning letter has been successfully issued!
          </Alert>
        </Snackbar>
        <EmptyDialog title={(selEmployee ? selEmployee.ename : "loading..") + '\'s working time'} openDialog={openWorktimeDialog} setOpenDialog={setOpenWorktimeDialog} onDialogFinish={() => {}} content={
          <WorkingTimeAccordion eid={selEmployee ? selEmployee.eid : "000"} manage={true}/>
        }/>
        <EmployeeInfocard employee={fullSelEmployee ? fullSelEmployee : getAuthUser()} openDialog={openDetailsDialog} setOpenDialog={setOpenDetailsDialog} onDialogFinish={() => {}}/>
        <FormDialog 
          title="Create Salary Adjustment"
          success_msg="Successfully requested salary adjustments"
          positive_btn_label="Send Adjustment Request"
          negative_btn_label="Cancel"
          generic_err="Proposed salary for each selected employee must be more than 0"
          fields={salaryAdjustmentFields}
          openError={salaryAdjustmentError}
          setOpenError={setSalaryAdjustmentError}
          open={openSalaryDialog}
          handleClose={handleCloseSalaryAdjustment}
          handleSubmit={handleSalaryAdjustmentSubmit}
        />
      </div>
    );
  }
  
}