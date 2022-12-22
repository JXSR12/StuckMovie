import React from "react";
import { Theme, createStyles, makeStyles } from "@material-ui/core/styles";
import clsx from "clsx";
import Accordion from "@material-ui/core/Accordion";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionActions from "@material-ui/core/AccordionActions";
import Typography from "@material-ui/core/Typography";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import Chip from "@material-ui/core/Chip";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import Button from "@material-ui/core/Button";
import Divider from "@material-ui/core/Divider";
import FormHelperText from "@material-ui/core/FormHelperText";
import FormControl from "@material-ui/core/FormControl";
import { getWorkingTimes, updateWorkingTime, WorkingTime, WorkingTimeDetail } from "../utils/workingtime_manager";
import Grid from '@material-ui/core/Grid';
import _ from 'lodash'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: "100%"
    },
    heading: {
      fontSize: theme.typography.pxToRem(15)
    },
    secondaryHeading: {
      fontSize: theme.typography.pxToRem(15),
      color: theme.palette.text.secondary
    },
    icon: {
      verticalAlign: "bottom",
      height: 20,
      width: 20
    },
    details: {
      alignItems: "center"
    },
    column: {
      flexBasis: "33.33%"
    },
    helper: {
      borderLeft: `2px solid ${theme.palette.divider}`,
      padding: theme.spacing(1, 2)
    },
    link: {
      color: theme.palette.primary.main,
      textDecoration: "none",
      "&:hover": {
        textDecoration: "underline"
      }
    }
  })
);

export interface WorkingTimePoint{
    hour: number
    minute: number
}

export default function WorkingTimeAccordion(props: {manage: boolean, eid: string}) {
  const { manage, eid } = props;
  const classes = useStyles();

  const workingDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const availableStartTimes : WorkingTimePoint[] = 
  [
    {hour: 8, minute: 0} as WorkingTimePoint,
    {hour: 8, minute: 15} as WorkingTimePoint,
    {hour: 8, minute: 30} as WorkingTimePoint,
    {hour: 8, minute: 45} as WorkingTimePoint,
    {hour: 9, minute: 0} as WorkingTimePoint,
    {hour: 9, minute: 15} as WorkingTimePoint,
    {hour: 9, minute: 30} as WorkingTimePoint,
    {hour: 9, minute: 45} as WorkingTimePoint,
    {hour: 10, minute: 0} as WorkingTimePoint,
    {hour: 10, minute: 15} as WorkingTimePoint,
    {hour: 10, minute: 30} as WorkingTimePoint,
    {hour: 10, minute: 45} as WorkingTimePoint,
    {hour: 11, minute: 0} as WorkingTimePoint,
    {hour: 11, minute: 15} as WorkingTimePoint,
    {hour: 11, minute: 30} as WorkingTimePoint,
    {hour: 11, minute: 45} as WorkingTimePoint,
    {hour: 12, minute: 0} as WorkingTimePoint,
    {hour: 12, minute: 15} as WorkingTimePoint,
    {hour: 12, minute: 30} as WorkingTimePoint,
    {hour: 12, minute: 45} as WorkingTimePoint,
    {hour: 13, minute: 0} as WorkingTimePoint,
    {hour: 13, minute: 15} as WorkingTimePoint,
    {hour: 13, minute: 30} as WorkingTimePoint,
    {hour: 13, minute: 45} as WorkingTimePoint,
    {hour: 14, minute: 0} as WorkingTimePoint,
    {hour: 14, minute: 15} as WorkingTimePoint,
    {hour: 14, minute: 30} as WorkingTimePoint,
    {hour: 14, minute: 45} as WorkingTimePoint,
    {hour: 15, minute: 0} as WorkingTimePoint,
    {hour: 15, minute: 15} as WorkingTimePoint,
    {hour: 15, minute: 30} as WorkingTimePoint,
    {hour: 15, minute: 45} as WorkingTimePoint,
  ];

  const availableEndTimes : WorkingTimePoint[] = 
  [
    {hour: 16, minute: 0} as WorkingTimePoint,
    {hour: 16, minute: 15} as WorkingTimePoint,
    {hour: 16, minute: 30} as WorkingTimePoint,
    {hour: 16, minute: 45} as WorkingTimePoint,
    {hour: 17, minute: 0} as WorkingTimePoint,
    {hour: 17, minute: 15} as WorkingTimePoint,
    {hour: 17, minute: 30} as WorkingTimePoint,
    {hour: 17, minute: 45} as WorkingTimePoint,
    {hour: 18, minute: 0} as WorkingTimePoint,
    {hour: 18, minute: 15} as WorkingTimePoint,
    {hour: 18, minute: 30} as WorkingTimePoint,
    {hour: 18, minute: 45} as WorkingTimePoint,
    {hour: 19, minute: 0} as WorkingTimePoint,
    {hour: 19, minute: 15} as WorkingTimePoint,
    {hour: 19, minute: 30} as WorkingTimePoint,
    {hour: 19, minute: 45} as WorkingTimePoint,
    {hour: 20, minute: 0} as WorkingTimePoint,
    {hour: 20, minute: 15} as WorkingTimePoint,
    {hour: 20, minute: 30} as WorkingTimePoint,
    {hour: 20, minute: 45} as WorkingTimePoint,
    {hour: 21, minute: 0} as WorkingTimePoint,
    {hour: 21, minute: 15} as WorkingTimePoint,
    {hour: 21, minute: 30} as WorkingTimePoint,
    {hour: 21, minute: 45} as WorkingTimePoint,
    {hour: 22, minute: 0} as WorkingTimePoint,
    {hour: 22, minute: 15} as WorkingTimePoint,
    {hour: 22, minute: 30} as WorkingTimePoint,
    {hour: 22, minute: 45} as WorkingTimePoint,
    {hour: 23, minute: 0} as WorkingTimePoint,
    {hour: 23, minute: 15} as WorkingTimePoint,
    {hour: 23, minute: 30} as WorkingTimePoint,
    {hour: 23, minute: 45} as WorkingTimePoint,
  ];

    const placeholderWD : WorkingTimeDetail = {starthour: 0, startminute: 0, endhour: 0, endminute: 0, weekday: 0}
    const [ curWorkTimes, setCurWorkTimes ] = React.useState<WorkingTimeDetail[]>([placeholderWD, placeholderWD, placeholderWD, placeholderWD, placeholderWD, placeholderWD]);

    const [ refreshWorkTimes, setRefreshWorkTimes ] = React.useState(false);

    const [ fetchedDetails, setFetchedDetails ] = React.useState<WorkingTimeDetail[]>([placeholderWD, placeholderWD, placeholderWD, placeholderWD, placeholderWD, placeholderWD]);
    const [ bc, setBc ] = React.useState<boolean[]>([false, false, false, false, false, false]);

    const [ workTimeId, setWorkTimeId ] = React.useState<string>();

    React.useEffect(() => {
        getWorkingTimes(eid).then((w) => {
            w.docs.map((wt) => {
                setWorkTimeId(wt.id);
                var workTimes = ({...wt.data()}) as WorkingTime;
                var workTimeDetails : WorkingTimeDetail[] = workTimes.details as WorkingTimeDetail[];
                setCurWorkTimes(JSON.parse(JSON.stringify(workTimeDetails)));
                setFetchedDetails(JSON.parse(JSON.stringify(workTimeDetails)));

                const updatedBc = [...bc];
                for(let i = 0; i < 6; i++){
                  updatedBc[i] = !_.isEqual(curWorkTimes[i],fetchedDetails[i]);
                }
                console.log(bc);
                setBc(updatedBc);
            })
        })
    }, [refreshWorkTimes]);

    const handleStartTimeChange = (event: React.ChangeEvent<{ value: unknown }>, dayIndex: number) => {
        console.log("Change on day index " + dayIndex)
        var value = event.target.value as string;
        var cwt = curWorkTimes;

        cwt[dayIndex].starthour = Number.parseInt(value.split(':')[0]);
        cwt[dayIndex].startminute = Number.parseInt(value.split(':')[1]);

        var endTime = getEndTime({hour: cwt[dayIndex].starthour, minute: cwt[dayIndex].startminute} as WorkingTimePoint);

        cwt[dayIndex].endhour = endTime.hour;
        cwt[dayIndex].endminute = endTime.minute;

        const updatedBc = [...bc];
        updatedBc[dayIndex] = !_.isEqual(cwt[dayIndex],fetchedDetails[dayIndex]);
        setBc(updatedBc);

        setCurWorkTimes([cwt[0], cwt[1], cwt[2], cwt[3], cwt[4], cwt[5]]);

        // console.log(changes);
        console.log(bc);
      };

    function getEndTime(startTime: WorkingTimePoint) : WorkingTimePoint{
        return {hour: startTime.hour + 8, minute: startTime.minute} as WorkingTimePoint;
    }

    const handleWorkTimeSave = () => {
      updateWorkingTime(workTimeId, curWorkTimes).then(() => {
        setRefreshWorkTimes(!refreshWorkTimes);
      })
    }

  return (
    <div className={classes.root}>
        {workingDays.map((d, dayIndex) => (
            <Accordion key={dayIndex}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1c-content"
              id="panel1c-header"
              key={dayIndex}
            >
              <div className={classes.column}>
                <Typography className={classes.heading}>{d}</Typography>
              </div>
              <div className={classes.column}>
                <Typography className={classes.secondaryHeading}  key={dayIndex}>
                    {String(curWorkTimes[dayIndex].starthour).padStart(2, '0') + ':' + String(curWorkTimes[dayIndex].startminute).padStart(2, '0') + " - " + String(curWorkTimes[dayIndex].endhour).padStart(2, '0') + ':' + String(curWorkTimes[dayIndex].endminute).padStart(2, '0')}
                </Typography>
              </div>
              <div className={classes.column}>
                {!bc[dayIndex] ? <Chip color="primary" label={"Active"} /> : <Chip color="default" label={"Pending Changes"} />}
              </div>
            </AccordionSummary>
            <AccordionDetails className={classes.details}>
              <div className={classes.column} />
              <div className={classes.column}>
                <FormControl key={dayIndex}>
                    <Select key={dayIndex} label="Select" inputProps={{ readOnly: !manage }} id="demo-controlled-open-select" onChange={e => handleStartTimeChange(e, dayIndex)} value={String(curWorkTimes[dayIndex].starthour).padStart(2, '0') + ':' + String(curWorkTimes[dayIndex].startminute).padStart(2, '0')}>
                    {availableStartTimes.map((a, idx) => (
                        <MenuItem key={idx} value={String(a.hour).padStart(2, '0') + ':' + String(a.minute).padStart(2, '0')}>{String(a.hour).padStart(2, '0') + ':' + String(a.minute).padStart(2, '0')}</MenuItem>
                    ))}
                    </Select>
                    <FormHelperText>Start Time</FormHelperText>
                </FormControl>
                </div>
                <div className={classes.column}>
                <FormControl key={dayIndex}>
                    <Select key={dayIndex} label="Select" inputProps={{ readOnly: true }} id="demo-controlled-open-select" value={String(curWorkTimes[dayIndex].endhour).padStart(2, '0') + ':' + String(curWorkTimes[dayIndex].endminute).padStart(2, '0')}>
                        {availableEndTimes.map((a, idx) => (
                            <MenuItem key={idx} value={String(a.hour).padStart(2, '0') + ':' + String(a.minute).padStart(2, '0')}>{String(a.hour).padStart(2, '0') + ':' + String(a.minute).padStart(2, '0')}</MenuItem>
                        ))}
                    </Select>
                    <FormHelperText>End Time</FormHelperText>
                </FormControl>
              </div>
              <div className={clsx(classes.column, classes.helper)}>
                {!manage ? 
                    <Typography variant="caption">This is the currently active working time<br/>You can request for changes to <b>Human Resources Deparment</b></Typography>
                : 
                    <Typography variant="caption">Change employee working time</Typography>
                }
                
              </div>
            </AccordionDetails>
            <Divider />
            {manage && bc[dayIndex] && (
              <AccordionActions>
                <Button size="small" color="primary" variant="contained" onClick={handleWorkTimeSave}>
                  Save
                </Button>
              </AccordionActions>
            )
            }
          </Accordion>
        ))}
      
    </div>
  );
}
