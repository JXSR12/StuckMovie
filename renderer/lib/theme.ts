import { createTheme } from '@material-ui/core/styles';
import red from '@material-ui/core/colors/red';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#ffe657',
      contrastText: '#111'
    },
    secondary: {
      main: '#eee',
    },
    error: {
      main: red.A400,
    },
    background: {
      default: '#000',
    },
  },
});
