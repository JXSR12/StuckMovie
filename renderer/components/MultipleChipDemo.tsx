import React from 'react';
import clsx from 'clsx';
import { createStyles, makeStyles, useTheme, Theme } from '@material-ui/core/styles';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import ListItemText from '@material-ui/core/ListItemText';
import Select from '@material-ui/core/Select';
import Checkbox from '@material-ui/core/Checkbox';
import Chip from '@material-ui/core/Chip';
import { MFOption } from './InsertFormDialog';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    formControl: {
      margin: theme.spacing(1),
      minWidth: 120,
      maxWidth: 300,
    },
    chips: {
      display: 'flex',
      flexWrap: 'wrap',
    },
    chip: {
      margin: 2,
    },
    noLabel: {
      marginTop: theme.spacing(3),
    },
  }),
);

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const mfoptions : MFOption[] = [
  {id: 1, label: 'Drama', content: {id: '112', name: 'Drama'}} as MFOption,
  {id: 2, label: 'Fiction', content: {id: '113', name: 'Fiction'}} as MFOption,
  {id: 3, label: 'Thriller', content: {id: '114', name: 'Thriller'}} as MFOption,
];

function getStyles(opt: MFOption, options: MFOption[], theme: Theme) {
  return {
    fontWeight:
      options.indexOf(opt) === -1
        ? theme.typography.fontWeightRegular
        : theme.typography.fontWeightMedium,
  };
}

export default function MultipleSelect() {
  const classes = useStyles();
  const theme = useTheme();
  const [option, setOption] = React.useState<MFOption[]>([]);

  const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setOption(event.target.value as MFOption[]);
  };

  return (
    <div>
      <FormControl className={classes.formControl}>
        <InputLabel id="demo-mutiple-chip-label">Chip</InputLabel>
        <Select
          labelId="demo-mutiple-chip-label"
          id="demo-mutiple-chip"
          multiple
          value={option}
          onChange={handleChange}
          input={<Input id="select-multiple-chip" />}
          renderValue={(selected) => (
            <div className={classes.chips}>
              {(selected as MFOption[]).map((value) => (
                <Chip key={value.id} label={value.label} className={classes.chip} />
              ))}
            </div>
          )}
          MenuProps={MenuProps}
        >
          {mfoptions.map((opt) => (
            <MenuItem key={opt.id} value={opt.id} style={getStyles(opt, option, theme)}>
              {opt.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
}