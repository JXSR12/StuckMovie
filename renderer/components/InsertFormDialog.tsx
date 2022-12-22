import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, FormControl, InputAdornment, InputLabel, MenuItem, OutlinedInput, Select, Snackbar, Typography, TypographyVariant } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import React from "react";
import DateFnsUtils from '@date-io/date-fns'
import {DateTimePicker, MuiPickersUtilsProvider} from '@material-ui/pickers'
import { Box } from '@material-ui/core';


export function FormItemNumber(props: {fieldname: string, unit: string, min: number, max: number, handleChange: any, value: number}){
    const { fieldname, unit, min, max, handleChange, value } = props;

    return (
        <FormControl fullWidth variant="outlined">
          <InputLabel htmlFor="outlined-adornment-amount">{fieldname}</InputLabel>
          <OutlinedInput
            id="outlined-adornment-amount"
            value={value}
            onChange={handleChange}
            inputProps={{
                min: min,
                max: max
            }}
            type="number"
            endAdornment={<InputAdornment position="end">{unit}</InputAdornment>}
            label={fieldname}
          />
        </FormControl>
    )
}

export function FormItemDateTime(props: {fieldname: string, min: Date, max: Date, value: Date, handleChange: any}){
    const { fieldname, min, max, handleChange, value } = props;

    return (
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
            {fieldname}
            <DateTimePicker format="MMMM do, yyyy HH:mm" fullWidth emptyLabel={fieldname} value={value} minDate={min} maxDate={max} onChange={handleChange} />
        </MuiPickersUtilsProvider>
        
    )
}

export function FormItemLabel(props: {labeltext: string, variant: TypographyVariant}){
    const { labeltext, variant } = props;

    return (
        <Typography variant={variant}>{labeltext}</Typography>
    )
}

export function FormItemLongText(props: {fieldname: string, value: string, placeholder: string, minLength: number, maxLength: number, handleChange: any}){
    const { fieldname, value, placeholder, minLength, maxLength, handleChange } = props;

    return(
        <FormControl fullWidth variant="outlined">
          <InputLabel htmlFor="outlined-adornment-amount">{fieldname}</InputLabel>
          <OutlinedInput
            id="outlined-adornment-amount"
            value={value}
            onChange={handleChange}
            placeholder={placeholder}
            label={fieldname}
            multiline
            rows={3}
          />
        </FormControl>
    )
}

export interface FormItem{
    id: string
    component: any
}

export default function FormDialog(props: {title: string, success_msg: string, positive_btn_label: string, negative_btn_label: string, generic_err: string, fields: FormItem[], handleSubmit: any, handleClose: any, open: boolean, openError: boolean, setOpenError: any}){
    const { title, success_msg, positive_btn_label, negative_btn_label, generic_err, fields, handleSubmit, handleClose, open, openError, setOpenError } = props;

    const [openSnackbar, setOpenSnackbar] = React.useState(false);

    const handleSnackbarClose = () => {
        setOpenSnackbar(false);
      }

    const handleLocalSubmit = () => {
        setOpenSnackbar(true);
        handleSubmit();
    }

    return(
        <React.Fragment>
            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
                {openError && (
                    <Alert severity="error" onClose={() => {
                        setOpenSnackbar(false)
                        setOpenError(false)}
                    }>{generic_err}</Alert>
                )}
                <DialogTitle>{title}</DialogTitle>
                <DialogContent dividers>
                    {fields.map((field) => (
                        <Box m={'1rem'}>
                            {field.component}
                        </Box>
                    ))}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>{negative_btn_label}</Button>
                    <Button color='primary' variant='contained' onClick={handleLocalSubmit}>{positive_btn_label}</Button>
                </DialogActions>
            </Dialog>
            <Snackbar open={openSnackbar && !openError} autoHideDuration={3000} onClose={handleSnackbarClose}>
                <Alert onClose={handleSnackbarClose} severity="success">
                    {success_msg}
                </Alert>
            </Snackbar>
        </React.Fragment>
    )
}