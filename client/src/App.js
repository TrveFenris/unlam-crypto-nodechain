import React, { Component } from 'react'
import './App.css'
import styles from './styles'
import axios from 'axios'
import {
  Grid,
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
  ExpansionPanel,
  ExpansionPanelSummary,
  ExpansionPanelDetails,
  Card,
  CardMedia,
} from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import requests from './config/requests'
import ports from './config/ports'
import TransactionForm from './forms/Transaction'

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
  isTransactionFormOpen: false,
}

class App extends Component {
  constructor(props) {
    super(props)
    document.body.style.backgroundColor = getComputedStyle(
      document.documentElement
    ).getPropertyValue('--main-bg-color')
    this.state = initState
  }

  makeRequest = (requestName, thenFn, data) => () => {
    const { selectedPort } = this.state
    if (selectedPort) {
      const requestConfig = requests.get(requestName)
      requestConfig['baseURL'] = `http://localhost:${selectedPort}`
      if (data) {
        requestConfig['data'] = data
      }
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

  makeRequestAsFn(requestName, thenFn, data) {
    const { selectedPort } = this.state
    if (selectedPort) {
      const requestConfig = requests.get(requestName)
      requestConfig['baseURL'] = `http://localhost:${selectedPort}`
      if (data) {
        requestConfig['data'] = data
      }
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

  handleTransactionSubmit = requestBody => {
    const data = {
      sender: 'User', //TODO replace with real values
      recipient: 'X',
      image: requestBody,
    }
    this.makeRequestAsFn(
      'newtransaction',
      response => {
        console.log('handleTransaction: response ', response.data)
        this.setState({ message: response.data.message })
      },
      data
    )
    this.handleTransactionClose()
  }

  handleTransactionClose = () => {
    this.setState({ isTransactionFormOpen: false })
  }

  handleNodeRegistration = () => {
    ports.forEach(port => {
      const portsArray = ports.slice()
      const index = portsArray.indexOf(port)
      index > -1 && portsArray.splice(index, 1)
      const data = portsArray.map(p => `localhost:${p}`)
      const requestConfig = {
        baseURL: `http://localhost:${port}`,
        url: 'api/v1/nodes/register',
        method: 'post',
        data: data,
      }
      instance
        .request(requestConfig)
        .then(response => {
          this.setState({
            message: JSON.stringify(response.data.message, null, 2),
          })
        })
        .catch(() => {
          this.setState({
            message: 'Unable to get a response from the server.',
          })
        })
    })
  }

  render() {
    const { classes } = this.props
    const { selectedPort, isTransactionFormOpen } = this.state
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
            <ListItem button onClick={this.handleNodeRegistration}>
              <ListItemText primary={'Register Nodes'} />
            </ListItem>
            <ListItem>
              <Typography>Selected Port:</Typography>
            </ListItem>
            <ListItem>
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
                  message: (
                    <Grid container spacing={1}>
                      {response.data.chain.map((block, i) => (
                        <Grid item xs={12}>
                          <ExpansionPanel key={`panel-${i}-header`}>
                            <ExpansionPanelSummary
                              expandIcon={<ExpandMoreIcon />}
                            >
                              <Grid content direction="column">
                                <Grid item xs>
                                  <Typography>
                                    Block {block.header.index}
                                  </Typography>
                                </Grid>
                                <Grid item xs>
                                  <Typography>
                                    Previous Hash: {block.header.prevBlockHash}
                                  </Typography>
                                </Grid>
                              </Grid>
                            </ExpansionPanelSummary>
                            <ExpansionPanelDetails>
                              {block.transactions.map((tx, j) => (
                                <Card
                                  key={`transaction-${j}`}
                                  style={{ width: '100%' }}
                                >
                                  <CardMedia
                                    style={{ height: 300 }}
                                    image={tx.image}
                                  />
                                </Card>
                              ))}
                            </ExpansionPanelDetails>
                          </ExpansionPanel>
                        </Grid>
                      ))}
                    </Grid>
                  ),
                })
              })}
            >
              <ListItemText primary={'Get Chain'} />
            </ListItem>
            <ListItem
              button
              onClick={this.makeRequest('newblock', response => {
                this.setState({
                  message: JSON.stringify(response.data.message, null, 2),
                })
              })}
            >
              <ListItemText primary={'New Block'} />
            </ListItem>
            <ListItem
              button
              onClick={() => {
                this.setState({ isTransactionFormOpen: true })
              }}
            >
              <ListItemText primary={'New Transaction'} />
            </ListItem>
            <ListItem
              button
              onClick={this.makeRequest('consensus', response => {
                this.setState({
                  message: JSON.stringify(response.data.message, null, 2),
                })
              })}
            >
              <ListItemText primary={'Resolve Consensus'} />
            </ListItem>
            <ListItem
              button
              onClick={this.makeRequest('hack', response => {
                this.setState({
                  message: JSON.stringify(response.data, null, 2),
                })
              })}
            >
              <ListItemText primary={'Hack the Chain!'} />
            </ListItem>
          </List>
        </Drawer>
        <main className={classes.content}>
          <div className={classes.toolbar} />
          {(isTransactionFormOpen && (
            <TransactionForm onSubmit={this.handleTransactionSubmit} />
          )) ||
            this.state.message}
        </main>
      </div>
    )
  }
}

export default withStyles(styles)(App)
