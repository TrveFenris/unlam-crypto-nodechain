import React, { Component } from 'react'
import logo from './rust-logo.png'
import './App.css'
import axios from 'axios'
import { Grid, Button, Select, MenuItem } from '@material-ui/core'
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
    const { selectedPort } = this.state
    return (
      <div className="App">
        <div className="App-header">
          <div className="App-logo-container">
            <img src={logo} className="App-logo" alt="logo" />
            <img src={logo} className="App-logo-2" alt="logo" />
          </div>
        </div>
        <div className="App-body">
          <Grid container spacing={3} justify="center" direction="row">
            <Grid item xs={12} style={{ textAlign: 'center' }}>
              <pre style={{ margin: 0 }}>
                <p>{this.state.message}</p>
              </pre>
            </Grid>
            <Grid item xs={12} style={{ textAlign: 'center' }}>
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
            </Grid>
          </Grid>
        </div>
        <div className="App-body">
          <Grid container spacing={3} justify="center" direction="row">
            <Grid item>
              <Button
                variant="contained"
                onClick={this.makeRequest('getchain', response => {
                  this.setState({
                    message: JSON.stringify(response.data, null, 2),
                  })
                })}
              >
                Get Blocks
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                onClick={this.makeRequest('newblock', response => {
                  this.setState({
                    message: JSON.stringify(response.data, null, 2),
                  })
                })}
              >
                New Block
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                onClick={this.makeRequest('newtransaction', response => {
                  this.setState({ message: response.data })
                })}
              >
                New Transaction
              </Button>
            </Grid>
          </Grid>
        </div>
      </div>
    )
  }
}

export default App
