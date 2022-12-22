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
import { DialogTitle } from '@material-ui/core';

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

export default function EmptyDialog(props: {title: string, openDialog: any, setOpenDialog: any, onDialogFinish: any, content: any}) {
  const classes = useStyles();
  const {title, openDialog, setOpenDialog, onDialogFinish, content} = props;

  const handleDialogClose = () => {
    setOpenDialog(false);
    onDialogFinish();
  }

  return (
      <Dialog open={openDialog} onClose={handleDialogClose} fullWidth
      maxWidth="md">
        <DialogTitle>
            {title}
        </DialogTitle>
        <DialogContent dividers>
            <div className={classes.root}>
                {content}
            </div>
        </DialogContent>
        <DialogActions>
            <Button onClick={handleDialogClose}>Close</Button>
        </DialogActions>
    </Dialog>  
  );
}