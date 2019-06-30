import React, { Component } from 'react'
import {
  Grid,
  Button,
  Card,
  CardActions,
  CardMedia,
  CardContent,
  Typography,
} from '@material-ui/core'

const TransactionForm = ({ onSubmit }) => (
  <ImageUpload onSubmitTransaction={onSubmit} />
)

class ImageUpload extends Component {
  constructor(props) {
    super(props)
    this.state = {
      file: '',
      //imagePreviewUrl: '',
    }
  }

  /*
   * Transforms the uploaded file to base64
   * and submit it to newTransaction as data
   */
  handleSubmit = e => {
    e.preventDefault()
    const { onSubmit } = this.props
    const { file } = this.state
    console.log('Base64Img: ', file)
    console.log({onSubmit})
    this.props.onSubmit(file)
  }

  handleImageChange = e => {
    e.preventDefault()
    let reader = new FileReader()
    let file = e.target.files[0]
    reader.onloadend = () => {
      this.setState({
        file: reader.result,
      })
    }
    reader.readAsDataURL(file)
  }

  renderImagePreview = () => (
    <Card style={{ width: '100%' }}>
      {this.state.file && (
        <CardMedia
          style={{ height: 600 }}
          image={this.state.file}
          title="Preview"
        />
      )}
      <CardContent>
        <Typography gutterBottom variant="h5" component="h2">
          Upload Image
        </Typography>
      </CardContent>
      <CardActions>
        <Grid>
          <input
            type="file"
            accept="image/*"
            onChange={this.handleImageChange}
            id="fileInput"
            style={{ display: 'none' }}
          />
        </Grid>
        <Grid>
          <label htmlFor="fileInput">
            <Button component="span" size="small" color="primary">
              Select Image
            </Button>
          </label>
        </Grid>
        <Button size="small" color="primary" onClick={this.handleSubmit}>
          Upload Transaction
        </Button>
      </CardActions>
    </Card>
  )

  render() {
    return (
      <Grid container spacing={1}>
        {this.renderImagePreview()}
      </Grid>
    )
  }
}

export default ImageUpload
