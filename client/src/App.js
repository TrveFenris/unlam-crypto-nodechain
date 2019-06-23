import React, { Component } from 'react'
import logo from './rust-logo.png'
import './App.css'
import axios from 'axios'
import { Grid, Button } from '@material-ui/core'
import requests from './config/requests'
import ports from './config/ports'

const serverAddress = 'http://localhost:1337'

const instance = axios.create({
  baseURL: serverAddress,
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
    document.body.style.backgroundColor = '#282c34'
    this.state = initState
  }

  makeRequest = (requestName, thenFn) => () => {
    instance
      .request(requests.get(requestName))
      .then(thenFn)
      .catch(() => {
        this.setState({
          message: 'Unable to get a response from the server.',
        })
      })
  }

  render() {
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
            <pre style={{ margin: 0 }}>
              <p>{this.state.message}</p>
            </pre>
          </Grid>
          <Grid container spacing={3} justify="center" direction="row">
            <select>
              {ports.map(port => (
                <option value={port}>{port}</option>
              ))}
            </select>
          </Grid>
        </div>
        <div className="App-body">
          <Grid container spacing={3} justify="center" direction="row">
            <Grid item>
              <Button
                variant="contained"
                onClick={this.makeRequest('blocks', response => {
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
