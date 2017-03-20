import React, {Component} from 'react'
import {Button} from 'react-bootstrap'
import Modal from 'react-modal'
import {withRouter} from 'react-router'

class Development extends Component {
  _handleDevelopmentClose = () => {
    this.props.router.history.push('/')
  }

  render () {
    const {development} = this.props
    return (
      <Modal
        contentLabel={development.name}
        style={{
          overlay: {
            zIndex: 4000
          },
          content: {
            padding: '0 10px'
          }
        }}
        isOpen
        onRequestClose={this._handleDevelopmentClose}
        >
        <h3>
          <span>{development.name}</span>
          <Button className='pull-right' onClick={this._handleDevelopmentClose}>
            close
          </Button>
        </h3>
        <p>Lorem ipsum dumpty dum</p>
      </Modal>
    )
  }
}

export default withRouter(Development)
