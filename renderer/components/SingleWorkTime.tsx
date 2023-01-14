import { Accordion, AccordionDetails, AccordionSummary, Chip, createStyles, Divider, FormControl, FormHelperText, makeStyles, Select, Theme, Typography } from "@material-ui/core";
import React from "react";
import { getAuthUser } from "../utils/auth_manager";
import { getWorkingTimes, WorkingTime, WorkingTimeDetail } from "../utils/workingtime_manager";

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

export default function SingleWorkTime(){
    const classes = useStyles();

    const weekday = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    const placeholderWD : WorkingTimeDetail = {starthour: 0, startminute: 0, endhour: 0, endminute: 0, weekday: 0}
    const [todayWorkTime, setTodayWorkTime] = React.useState<WorkingTimeDetail>(placeholderWD);
    const [todayName, setTodayName] = React.useState<string>("");

    React.useEffect(() => {
        getWorkingTimes(getAuthUser().eid).then((w) => {
            w.docs.map((wt) => {
                var workTimes = ({...wt.data()}) as WorkingTime;
                var workTimeDetails : WorkingTimeDetail[] = workTimes.details as WorkingTimeDetail[];
                let date = new Date();
                const day = date.getDay();
                setTodayWorkTime(workTimeDetails[day === 0 ? 6 : day-1]);
                setTodayName(weekday[day]);
            })
        })
    }, []);

    return(
        <Accordion expanded={false}>
            <AccordionSummary
              expandIcon={<br/>}
              aria-controls="panel1c-content"
              id="panel1c-header"
            >
              <div className={classes.column}>
                <Typography className={classes.heading}>Today's Working Time ({todayName})</Typography>
              </div>
              <div className={classes.column}>
                <Typography className={classes.secondaryHeading}>
                    {String(todayWorkTime.starthour).padStart(2, '0') + ':' + String(todayWorkTime.startminute).padStart(2, '0') + ':' + String(0).padStart(2, '0') + " - " + String(todayWorkTime.endhour).padStart(2, '0') + ':' + String(todayWorkTime.endminute).padStart(2, '0') + ':' + String(0).padStart(2, '0')}
                </Typography>
              </div>
            </AccordionSummary>
            <Divider />
        </Accordion>
    )
}