import React from 'react'
import { Grid, Button } from '@material-ui/core'

const TransactionForm = ({ onSubmit }) => (
  <Grid container spacing={2}>
    <Grid item xs={12}>
      <input
        accept="image/*"
        style={{ display: 'none' }}
        id="raised-button-file"
        type="file"
      />
      <label htmlFor="raised-button-file">
        <Button component="span">Upload Image</Button>
      </label>
    </Grid>
    <Grid item xs={12}>
      <Button onClick={onSubmit}>Submit</Button>
    </Grid>
  </Grid>
)

export default TransactionForm
