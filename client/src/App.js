import React, { Component } from 'react'
import './App.css'
import styles from './styles'
import axios from 'axios'
import {
  Select,
  MenuItem,
  Drawer,
  CssBaseline,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  ListItem,
  ListItemText,
} from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles'
import requests from './config/requests'
import ports from './config/ports'

const instance = axios.create({
  timeout: 1000,
  headers: {
    'Content-Type': 'application/json',
  },
})
const initState = {
  message: 'Welcome to Nodechain client!',
  availablePorts: [],
  selectedPort: '',
}

class App extends Component {
  constructor(props) {
    super(props)
    document.body.style.backgroundColor = getComputedStyle(
      document.documentElement
    ).getPropertyValue('--main-bg-color')
    this.state = initState
  }

  makeRequest = (requestName, thenFn) => () => {
    const { selectedPort } = this.state
    if (selectedPort) {
      const requestConfig = requests.get(requestName)
      requestConfig['baseURL'] = `http://localhost:${selectedPort}`
      instance
        .request(requestConfig)
        .then(thenFn)
        .catch(() => {
          this.setState({
            message: 'Unable to get a response from the server.',
          })
        })
    }
  }

  handlePortChange = e => {
    this.setState({ selectedPort: e.target.value })
  }

  render() {
    const { classes } = this.props
    const { selectedPort } = this.state
    return (
      <div className={classes.root}>
        <CssBaseline />
        <AppBar position="fixed" className={classes.appBar}>
          <Toolbar>
            <Typography variant="h6" noWrap>
              Nodechain Client
            </Typography>
          </Toolbar>
        </AppBar>
        <Drawer
          className={classes.drawer}
          variant="permanent"
          classes={{
            paper: classes.drawerPaper,
          }}
          anchor="left"
        >
          <div className={classes.toolbar} />
          <Divider />
          <List>
            <ListItem>
              <Typography>Port</Typography>
              <Select
                value={selectedPort}
                onChange={this.handlePortChange}
                variant="filled"
                style={{ width: 200 }}
              >
                {ports.map((port, i) => (
                  <MenuItem key={`option-${i}`} value={port}>
                    {port}
                  </MenuItem>
                ))}
              </Select>
            </ListItem>
          </List>
          <Divider />
          <List>
            <ListItem
              button
              onClick={this.makeRequest('getchain', response => {
                this.setState({
                  message: JSON.stringify(response.data, null, 2),
                })
              })}
            >
              <ListItemText primary={'Get Chain'} />
            </ListItem>
            <ListItem
              button
              onClick={this.makeRequest('newblock', response => {
                this.setState({
                  message: JSON.stringify(response.data, null, 2),
                })
              })}
            >
              <ListItemText primary={'New Block'} />
            </ListItem>
            <ListItem
              button
              onClick={this.makeRequest('newtransaction', response => {
                this.setState({ message: response.data })
              })}
            >
              <ListItemText primary={'New Transaction'} />
            </ListItem>
            <ListItem
              button
              onClick={this.makeRequest('', response => {
                this.setState({
                  message: JSON.stringify(response.data, null, 2),
                })
              })}
            >
              <ListItemText primary={''} />
            </ListItem>
            <ListItem
              button
              onClick={this.makeRequest('', response => {
                this.setState({
                  message: JSON.stringify(response.data, null, 2),
                })
              })}
            >
              <ListItemText primary={''} />
            </ListItem>
            <ListItem
              button
              onClick={this.makeRequest('', response => {
                this.setState({
                  message: JSON.stringify(response.data, null, 2),
                })
              })}
            >
              <ListItemText primary={''} />
            </ListItem>
          </List>
        </Drawer>
        <main className={classes.content}>
          <div className={classes.toolbar} />
          <pre>
            <Typography>{this.state.message}</Typography>
          </pre>
        </main>
      </div>
    )
  }
}

export default withStyles(styles)(App)
