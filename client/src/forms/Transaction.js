import React, { Component } from 'react'
import { Grid, Button } from '@material-ui/core'

const TransactionForm = ({ onSubmit }) => (
  <ImageUpload onSubmitTransaction={onSubmit} />
)

class ImageUpload extends Component {
  constructor(props) {
    super(props);
    this.state = {
      file: '',
      imagePreviewUrl: ''
    };
    this._handleImageChange = this._handleImageChange.bind(this);
    this._handleSubmit = this._handleSubmit.bind(this);
  }

  _handleSubmit(e) {
    e.preventDefault();
    // TODO: do something with -> this.state.file
    // like convert to base64
    // build the transaction data and send it
    this.props.onSubmitTransaction()
  }

  _handleImageChange(e) {
    e.preventDefault();

    let reader = new FileReader();
    let file = e.target.files[0];

    reader.onloadend = () => {
      this.setState({
        file: file,
        imagePreviewUrl: reader.result
      });
    }
    reader.readAsDataURL(file)
  }

  render() {
    let { imagePreviewUrl } = this.state;
    let $imagePreview = null;
    if (imagePreviewUrl) {
      $imagePreview = (<img src={imagePreviewUrl} alt="preview" />);
    }

    return (
      <Grid container spacing={1}>
        <Grid>
          <input type="file" accept="image/*" onChange={this._handleImageChange} id="fileInput" style={{ display: 'none' }} />
        </Grid>
        <Grid>
          <label htmlFor="fileInput">
            <Button component="span">Select Image</Button>
          </label>
        </Grid>
        <Grid>
          <Button type="submit" onClick={this._handleSubmit}>Upload Transaction</Button>
        </Grid>
        <Grid>
          {$imagePreview}
        </Grid>
      </Grid>
    )
  }
}

export default TransactionForm
