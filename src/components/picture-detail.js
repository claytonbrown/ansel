import {spawn} from 'child_process';

import React from 'react';

import VersionStore from './../stores/version-store';
import VersionActions from './../actions/version-actions';

import remote from 'remote';
import shell from 'shell';

var Menu = remote.require('menu');
var MenuItem = remote.require('menu-item');

var rotation = {};
rotation[1] = '';
rotation[8] = 'minus-ninety';

class PictureDetail extends React.Component {
  constructor(props) {
    super(props);
  }

  updateVersion(store) {
    if (store.version) this.setState(store);
  }

  keyboardListener(e) {
    if (e.keyCode == 27) // escape
      this.props.setCurrent(null);

    else if (e.keyCode == 37) // Left
      this.props.setLeft();

    else if (e.keyCode == 39) // Left
      this.props.setRight();
  }

  contextMenu(e) {
    console.log('context menu', e);
    e.preventDefault()
    this.menu.popup(remote.getCurrentWindow());
  }

  shutterSpeed(exposureTime) {
    var zeros = -Math.floor( Math.log(exposureTime) / Math.log(10));
    return '1/' + Math.pow(10, zeros);
  }

  openWithRawtherapee(e) {
    VersionActions.createVersionAndOpenWith(this.props.photo, 'RAW', 'rawtherapee');
  }

  openWithGimp(e) {
    VersionActions.createVersionAndOpenWith(this.props.photo, 'JPG', 'gimp');
  }

  addRawtherapeeMenu(data) {
    console.log('stdout: ' + data);

    this.menu.append(new MenuItem({ 
      label: 'Open with Rawtherapee', 
      click: this.openWithRawtherapee.bind(this)
    }));
  }

  addGimpMenu(data) {
   this.menu.append(new MenuItem({ 
      label: 'Open with Gimp', 
      click: this.openWithGimp.bind(this)
    }));
  }

  componentDidMount() {
    VersionStore.listen(this.updateVersion.bind(this));

    this.menu = new Menu();
    var self = this;
    let rawtherapeeCmd = spawn('which', ['rawtherapee']);
    let gimpCmd = spawn('which', ['gimp']);

    rawtherapeeCmd.stdout.on('data', this.addRawtherapeeMenu.bind(this));
    gimpCmd.stdout.on('data', this.addGimpMenu.bind(this));

    document.addEventListener('keyup', this.keyboardListener.bind(this));
    document.addEventListener('contextmenu', this.contextMenu.bind(this));
  }

  componentWillUnmount() {
    document.removeEventListener('keyup', this.keyboardListener.bind(this));
    delete this.menu;
  }

  render() {
    console.log('photo', this.props.photo);
    return (
      <div className="picture-detail">
        <img
          src={this.props.photo.thumb} 
          width="90%"
          className={rotation[this.props.photo.orientation]} />

        <h3>{this.props.photo.title}</h3>

        <p>
          ISO: {this.props.photo.iso} - 
          f/{this.props.photo.aperture} @ {this.shutterSpeed(this.props.photo.exposure_time)}
        </p>
      </div>
    );
  }
}

export default PictureDetail;