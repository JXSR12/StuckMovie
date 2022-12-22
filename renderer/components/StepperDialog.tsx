import React from 'react';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import StepContent from '@material-ui/core/StepContent';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
    },
    button: {
      marginTop: theme.spacing(1),
      marginRight: theme.spacing(1),
    },
    actionsContainer: {
      marginBottom: theme.spacing(2),
    },
    resetContainer: {
      padding: theme.spacing(3),
    },
  }),
);

export interface StepperStepItem{
    title: string;
    content: any;
}

export default function StepperDialog(props: {openDialog: any, setOpenDialog: any, onDialogFinish: any, items: StepperStepItem[]}) {
  const classes = useStyles();
  const [activeStep, setActiveStep] = React.useState(0);
  const {openDialog, setOpenDialog, onDialogFinish, items} = props;
  const steps = items;

  const handleDialogClose = () => {
    setOpenDialog(false);
    onDialogFinish();
    handleReset();
  }

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  return (
      <Dialog open={openDialog} onClose={handleDialogClose} fullWidth
      maxWidth="sm">
        <DialogContent>
            <div className={classes.root}>
                <Stepper activeStep={activeStep} orientation="vertical">
                    {steps.map((step, index) => (
                    <Step key={step.title}>
                        <StepLabel>{step.title}</StepLabel>
                        <StepContent>
                        <Typography>{step.content}</Typography>
                            <div className={classes.actionsContainer}>
                                <div>
                                <Button
                                    disabled={activeStep === 0}
                                    onClick={handleBack}
                                    className={classes.button}
                                >
                                    Back
                                </Button>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={handleNext}
                                    className={classes.button}
                                >
                                    {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
                                </Button>
                                </div>
                            </div>
                        </StepContent>
                    </Step>
                    ))}
                </Stepper>
                {activeStep === steps.length && steps.length > 1 && (
                    <Paper square elevation={0} className={classes.resetContainer}>
                    <Typography>It's almost done - close this dialog to finish or click on the button below to reset</Typography>
                    <Button onClick={handleReset} className={classes.button}>
                        Reset
                    </Button>
                    </Paper>
                )}
            </div>
        </DialogContent>
        {activeStep === steps.length && 
            <DialogActions>
                <Button onClick={handleDialogClose}>Finish and Close</Button>
            </DialogActions>
        }
    </Dialog>  
  );
}