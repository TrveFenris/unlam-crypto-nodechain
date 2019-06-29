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
    this._handleTransaction = props.onSubmitTransaction.bind(this); //sacar si no sirve
  }

  /*
  * Transforms the uploaded file to base64
  * and submit it to newTransaction as data
  */
  _handleSubmit(e) {
    e.preventDefault();
    let imgBase64 = '';
    this.getBase64(this.state.file, (result) => {
      imgBase64 = result;
      console.log('Base64Img: ', imgBase64);      // hasta aca funciona bien.
      this.props.onSubmitTransaction(imgBase64);  // TODO se deberia poder llamar asi
      //this._handleTransaction(imgBase64);       //tampoco funciono
    });

  }

  getBase64(file, cb) {
    let reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function () {
      cb(reader.result)
    };
    reader.onerror = function (error) {
      console.log('Error: ', error);
    };
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
