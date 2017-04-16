
require('isomorphic-fetch')
import moment from 'moment'
import React, {Component} from 'react'
import Modal from 'react-modal'
import {withRouter} from 'react-router'

const jurisdictionLookup = [
  'City of Scotts Valley',
  'City of Santa Cruz',
  'Santa Cruz County'
]

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

  _onAddStatusRow = () => {
    const {development} = this.state
    development.data.statuses.splice(0, 0, {
      date: moment().format('YYYY-MM-DD'),
      type: '?'
    })
    this.setState({development})
  }

  _onDeleteStatusRow (idx) {
    const {development} = this.state
    development.data.statuses.splice(idx, 1)
    this.setState({development})
  }

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

  _onJurisdictionChange = (e) => {
    const {development} = this.state
    development.data.jurisdiction = e.target.value
    this.setState({development})
  }

  _onNameChange = (e) => {
    const {development} = this.state
    development.data.name = e.target.value
    this.setState({development})
  }

  _onStatusChange (key, idx, e) {
    const {development} = this.state
    development.data.statuses[idx][key] = e.target.value
    this.setState({development})
  }

  _onWebsiteChange = (e) => {
    const {development} = this.state
    development.data.website = e.target.value
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
            <div className='col-xs-12'>
              <div className={`development-image-container ${data.picture ? '' : 'no-picture-yet'}`}>
                {data.picture
                  ? (<img src={data.picture} />)
                  : (<img src={'https://s3-us-west-1.amazonaws.com/santacruzcountydevelopments/picture-coming-soon.png'} />)
                }
              </div>
            </div>
            <div>
              <div className='col-xs-12 col-sm-4'>
                <h4>Jurisdiction</h4>
                <p>{jurisdictionLookup[data.jurisdiction]}</p>
                <h4>Status</h4>
                <table className='table table-striped'>
                  <tbody>
                    {data.statuses.map((status, idx) => (
                      <tr className={idx === 0 ? 'first-status' : undefined}>
                        <td>{moment(status.date).format('MMM D, YYYY')}</td>
                        <td>{status.type}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className='col-xs-12 col-sm-8'>
                <h4>Description</h4>
                <p>{data.description ? data.description : 'No description of this project'}</p>
                {data.website &&
                  <p>
                    <a href={data.website} target='_blank'>View project website</a>
                  </p>
                }
              </div>
              {isAdmin &&
                <div className='col-xs-12'>
                  <button
                    className='btn btn-danger pull-right'
                    onClick={this._onDeleteClick}
                    type='button'
                    >
                    Delete
                  </button>
                </div>
              }
            </div>
          </div>
        }
        {editing &&
          <div className='development-content'>
            <h3>id: {development.id}</h3>
            <div>
              <div className='col-xs-12'>
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
              </div>
              <div className='col-xs-12 col-sm-6'>
                <h4>Jurisdiction</h4>
                <select
                  onChange={this._onJurisdictionChange}
                  value={data.jurisdiction}
                  >
                  {jurisdictionLookup.map((jurisdiction, idx) => (
                    <option value={idx}>{jurisdiction}</option>
                  ))}
                </select>
                <h4>Status</h4>
                <button
                  className='btn'
                  onClick={this._onAddStatusRow}
                  >
                  Add Status
                </button>
                <table className='table table-striped'>
                  <tbody>
                    {data.statuses.map((status, idx) => (
                      <tr key={`dev-${development.id}-status-${idx}`}>
                        <td>
                          <input
                            onChange={(e) => this._onStatusChange('date', idx, e)}
                            value={status.date}
                            />
                        </td>
                        <td>
                          <select
                            onChange={(e) => this._onStatusChange('type', idx, e)}
                            value={status.type}
                            >
                            <option value='?'>?</option>
                            <option value='Application Submitted'>Application Submitted</option>
                            <option value='Permits Issued'>Permits Issued</option>
                            <option value='Under Construction'>Under Construction</option>
                            <option value='Completed'>Completed</option>
                          </select>
                        </td>
                        <td>
                          <button
                            className='btn btn-danger'
                            type='button'
                            onClick={() => this._onDeleteStatusRow(idx)}
                            >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className='col-xs-12 col-sm-6'>
                <label>Description</label>
                <div className='form-group'>
                  <textarea
                    className='form-control'
                    onChange={this._onDescriptionChange}
                    value={data.description}
                    />
                </div>
                <label>Website</label>
                <div className='form-group'>
                  <input
                    className='form-control'
                    onChange={this._onWebsiteChange}
                    value={data.website}
                    />
                </div>
              </div>
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
