
require('isomorphic-fetch')
import React, {Component} from 'react'
import Modal from 'react-modal'
import {withRouter} from 'react-router'

class Development extends Component {

  constructor (props) {
    super(props)
    this.state = {
      development: props.development,
      editing: props.development.data.name === 'New Development'
    }
  }

  // ----------------------------------------------------------------
  // button handlers
  // ----------------------------------------------------------------

  _handleClose = () => {
    this.props.router.history.push('/')
  }

  _handleEdit = () => {
    this.setState({ editing: true })
  }

  _onDeleteClick = () => {
    if (window.confirm('Are you sure you want to delete this development?')) {
      this.props.delete(this.state.development.id)
    }
  }

  _onSaveClick = () => {
    const {development, newImageFile, signingData} = this.state
    if (signingData) {
      // upload image to s3
      fetch(signingData.signedRequest, {
        method: 'PUT',
        body: newImageFile
      })
        .then((response) => {
          if (response.status !== 200) {
            throw response
          }
          development.data.picture = signingData.url
          this._saveDevelopment(development)
        })
        .catch((err) => {
          console.error('error', err)
          alert('Could not upload to s3')
        })
    } else {
      this._saveDevelopment(development)
    }
  }

  _saveDevelopment = (development) => {
    this.props.update(development)
      .then((updatedDevelopment) => {
        this.setState({
          development: updatedDevelopment,
          editing: false,
          imagePreview: undefined,
          newImageFile: undefined,
          signingData: undefined
        })
      })
  }

  // ----------------------------------------------------------------
  // form handlers
  // ----------------------------------------------------------------

  _onDescriptionChange = (e) => {
    const {development} = this.state
    development.data.description = e.target.value
    this.setState({development})
  }

  _onImageFileChange = (e) => {
    const {auth} = this.props
    const imageFile = e.target.files[0]
    if (imageFile) {
      const reader = new FileReader()

      reader.onload = (e) => {
        this.setState({
          imagePreview: e.target.result,
          newImageFile: imageFile
        })
      }

      reader.readAsDataURL(imageFile)

      fetch(`/sign-s3?file-name=${imageFile.name}&file-type=${imageFile.type}`, {
        headers: auth.isAdmin()
          ? {Authorization: `bearer ${auth.getToken()}`}
          : {}
      })
        .then((result) => {
          if (result.status === 500) {
            throw result
          }
          return result.json()
        })
        .then((data) => {
          this.setState({ signingData: data })
        })
        .catch((err) => {
          console.error('error', err)
          alert('failed to get signed url')
        })
    }
  }

  _onNameChange = (e) => {
    const {development} = this.state
    development.data.name = e.target.value
    this.setState({development})
  }

  render () {
    const {auth} = this.props
    const {development, imagePreview} = this.state
    const {data} = development

    const isAdmin = auth.isAdmin()
    const editing = isAdmin && this.state.editing

    return (
      <Modal
        contentLabel={data.name}
        style={{
          overlay: {
            zIndex: 4000
          },
          content: {
            padding: '0 10px 10px 10px'
          }
        }}
        isOpen
        onRequestClose={this._handleClose}
        >
        <h3>
          {editing
            ? <input value={data.name} onChange={this._onNameChange} />
            : <span>{data.name}</span>}
          <div className='btn-group pull-right'>
            {!editing && isAdmin &&
              <button className='btn btn-default' onClick={this._handleEdit}>
                <i className='fa fa-pencil fa-fw' />
              </button>
            }
            <button className='btn btn-default' onClick={this._handleClose}>
              <i className='fa fa-close fa-fw' />
            </button>
          </div>
        </h3>
        {!editing &&
          <div className='development-content'>
            <div className={`development-image-container ${data.picture ? '' : 'no-picture-yet'}`}>
              {data.picture
                ? (<img src={data.picture} />)
                : (<img src={'https://s3-us-west-1.amazonaws.com/santacruzcountydevelopments/picture-coming-soon.png'} />)
              }
            </div>
            <h4>Description</h4>
            <p>{data.description ? data.description : 'No description of this project'}</p>
            {isAdmin &&
              <button
                className='btn btn-danger pull-right'
                onClick={this._onDeleteClick}
                type='button'
                >
                Delete
              </button>
            }
          </div>
        }
        {editing &&
          <div className='development-content'>
            <h3>id: {development.id}</h3>
            <div className={`development-image-container ${data.picture ? '' : 'no-picture-yet'}`}>
              {data.picture
                ? (<img src={data.picture} />)
                : (<p>No picture uploaded yet!</p>)}
            </div>
            {imagePreview &&
              <div className='development-image-container'>
                <p>Preview of new image:</p>
                <img src={imagePreview} />
              </div>
            }
            <input type="file" onChange={this._onImageFileChange} />
            <label>Description</label>
            <div className='form-group'>
              <textarea
                className='form-control'
                onChange={this._onDescriptionChange}
                value={data.description}
                />
            </div>
            <div className='btn-group pull-right'>
              <button className='btn btn-warning' type='button' onClick={this._onSaveClick}>Save</button>
              <button className='btn btn-danger' type='button' onClick={this._onDeleteClick}>Delete</button>
            </div>
          </div>
        }
      </Modal>
    )
  }
}

export default withRouter(Development)
