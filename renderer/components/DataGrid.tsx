import * as React from 'react';
import { DataGrid, GridColDef, GridDensity, GridSelectionModel, GridToolbarContainer, GridToolbarExport, GridValueGetterParams } from '@mui/x-data-grid';
import { Paper } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    paper: {
      backgroundColor: "#eee"
    }
  })
);

function CustomToolbar() {
  return (
    <GridToolbarContainer>
      <GridToolbarExport />
    </GridToolbarContainer>
  );
}
//

export default function ModularDataGrid(props: {columns: GridColDef[], rows: any[], setSelModel:any, selModel: GridSelectionModel, pageSize: number, checkbox: boolean, density: string}) {
  const { columns, rows, setSelModel, selModel, pageSize, checkbox, density } =  props;

  const classes = useStyles();

  return (
    <Paper className={classes.paper} elevation={3}>
    <div style={{ height: 400, width: '100%' }}>
        <DataGrid
            rows={rows}
            columns={columns}
            pageSize={pageSize}
            checkboxSelection={checkbox}
            onSelectionModelChange={(newSelectionModel) => {
              setSelModel(newSelectionModel);
            }}
            selectionModel={selModel}
            disableSelectionOnClick={checkbox}
            density={density as GridDensity}
            components={{
              Toolbar: CustomToolbar
            }}
        />
    </div>
    </Paper>
  );
}