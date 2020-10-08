import "./App.css";
import React, { Component } from "react";
import "react-responsive-modal/styles.css";
import { Modal } from "react-responsive-modal";
import downloadicn from "./download-cloud.svg"
import minus from "./minus.svg"
import dotsicn from "./more-vertical.svg"
import Swal from 'sweetalert2'
import * as Msal from "msal";
import { GraphFileBrowser } from "@microsoft/file-browser";
import GetFile from "./GetFile"
import { ListBoxComponent } from '@syncfusion/ej2-react-dropdowns';
import { DataManager } from '@syncfusion/ej2-data';
const msalConfig = {
  auth: {
    // clientId: "fa04c1ee-d61f-47cc-a236-c87460d11fed",
    clientId: "cc6a924f-a586-4fd8-b7b5-2f28e7c29d5b",
    authority:
      "https://login.microsoftonline.com/320d71c1-7b81-48ba-8117-cc2c3c1bb518",
    redirectUri: "http://localhost:3000/",
  },
  cache: {
    cacheLocation: "sessionStorage", // This configures where your cache will be stored
    storeAuthStateInCookie: false, // Set this to "true" if you are having issues on IE11 or Edge
  },
};

const loginRequest = {
  scopes: ["openid", "profile", "Files.ReadWrite.All", "User.Read"],
};
const myMSALObj = new Msal.UserAgentApplication(msalConfig);

class App extends Component {
  constructor(props) {
    super();
    this.state = {
      fetchedToken: "",
      open: false,
      showBtns: true,
      showOvedrive: true,
      Filekeys: "",
      // Initially, no file is selected
      selectedFile: [],
    };
    this.dataA = new DataManager();
    // this.selectedFile = [];
    this.fields = { text: 'name' };
    this.modifiedDataA = { addedRecords: [], deletedRecords: [], changedRecords: [] };
    this.getAuthenticationToken = this.getAuthenticationToken.bind(this);
    this.onSuccess = this.onSuccess.bind(this);
    this.onCancel = this.onCancel.bind(this);
    this.onFileChange = this.onFileChange.bind(this);
  }

  onDropGroupA(args) {
    args.items.forEach((item) => {
      if (!this.listObj1.getDataByValue(item[this.fields.text])) {

        this.modifiedDataA.deletedRecords.push(item);
        // console.log("Modified", this.modifiedDataA);
      }
    });
    //saveChanges()
  }

  seeToken() {
    myMSALObj
      .loginPopup(loginRequest)
      .then((loginResponse) => {
        console.log("id_token acquired at: " + new Date().toString());
        console.log("signed in", loginResponse);

        if (myMSALObj.getAccount()) {
          console.log("myMSALObj.getAccount", myMSALObj.getAccount());
          if (myMSALObj.getAccount()) {
            getTokenPopup(loginRequest)
              .then((response) => {
                console.log("Access Token-", response.accessToken);
                this.setState({ fetchedToken: response.accessToken });
                // mailButton.classList.remove("d-none");
                this.setState({ showBtns: !this.state.showBtns });
                // this.setState({ showOvedrive: true });
                this.setState({ open: true });
              })
              .catch((error) => {
                console.log(error);
              });
          }
        }
      })
      .catch((error) => {
        console.log(error);
      });

  }

  getAuthenticationToken() {
    return Promise.resolve(this.state.fetchedToken);
  }

  onSuccess = (keys) => {
    console.log("keys", keys);
    console.log("length", keys.length);

    keys.map((item, index) => (
      GetFile(this.state.fetchedToken, keys[index].driveItem_203[2])
        .then((d) => {
          console.log("Filedetails", d);
          console.log("FileName-", d.name);
          this.setState({ selectedFile: [...this.state.selectedFile, d] });
          this.setState({ showBtns: !this.state.showBtns });
          this.setState({ open: false });
        }
        )
    ));

  }


  onCancel(err) {
    console.log("onCancel", err.message);
    this.setState({ showBtns: !this.state.showBtns });
    // this.setState({ showOvedrive: !this.state.showOvedrive });
    this.setState({ open: false });
  }

  opensweetalert(index) {
    Swal.fire({
      text: "Are you sure you want to remove this file?",
      showCancelButton: true,
      confirmButtonText: 'Yes'
    }).then((result) => {
      if (result.value === true) {
        console.log("confirmed", index);
        this.onRemoveItem(index);
      }
    })
  }

  onOpenModal = () => {
    this.setState({ open: true });
    // this.setState({ Filekeys: "hello" });
  };

  onCloseModal = () => {
    this.setState({ open: false });
  };

  onRemoveItem = i => {
    this.setState(state => {
      const selectedFile = state.selectedFile.filter((item, j) => i !== j);

      return {
        selectedFile,
      };
    });
  };


  // On file select (from the pop up)
  onFileChange = (event) => {
    this.setState({ selectedFile: [...this.state.selectedFile, ...event.target.files] });
    console.log("length", event.target.files.length);
    console.log("on filechange", this.state.selectedFile)
  };

  fileData = (event) => {
    console.log("load fn ", this.state.selectedFile)
    let selectedloop = this.state.selectedFile;

    if (this.state.selectedFile) {

      return (
        <div>
          {selectedloop.map((item, index) => (
            <div className="fleft" >
              <div className="dispfile">{index + 1}</div>
              <div className="dispfile dispfilename">{item.name}
                <button className="fright btndeletefile" onClick={() => this.opensweetalert(index)}><img className="imgpadding" src={minus}></img></button>
              </div>
              <div className="dispfile"><img src={dotsicn}></img></div>
            </div>
          ))
          }
        </div >
      );
    }

  };

  render() {
    console.log("selectedFiles", this.state.selectedFile);
    const { open } = this.state;
    return (

      <div>
        <h5>Attachments:</h5>
        <div className="card1">
          Upload files:
          <button className="attachBtn" onClick={this.seeToken.bind(this)} >
            <img src={downloadicn}></img> Onedrive
          </button><span> or </span>
          <input
            className="btnFile modalbtnfile "
            type="file"
            multiple
            text="attach file"
            onChange={this.onFileChange}
          />
          <button onClick={saveChanges}>save</button>
          <Modal id="mdl" open={open} onClose={this.onCloseModal} center>

            <div id="filesection"> {this.state.fetchedToken !== "" ?
              <GraphFileBrowser
                getAuthenticationToken={this.getAuthenticationToken}
                onSuccess={this.onSuccess}
                onCancel={this.onCancel}
                selectionMode="multiple"
              />
              : null}</div>
          </Modal>
        </div>

        {/* {this.fileData()} */}
        <div id="FileNames">
          <ListBoxComponent ref={(scope) => { this.listObj1 = scope; }} dataSource={this.state.selectedFile} scope="combined-list" height="330px" allowDragAndDrop={true} fields={this.fields} drop={this.onDropGroupA.bind(this)} /></div>
      </div>
    );
  }
}

function saveChanges() {
  this.dataA.saveChanges(this.modifiedDataA, this.fields.text);
  this.modifiedDataA.addedRecords = [];
  console.log(this.state.selectedFile);

}



function getTokenPopup(request) {
  return myMSALObj.acquireTokenSilent(request).catch((error) => {
    console.log(error);
    console.log("silent token acquisition fails. acquiring token using popup");

    // fallback to interaction when silent call fails
    return myMSALObj
      .acquireTokenPopup(request)
      .then((tokenResponse) => {
        return tokenResponse;
      })
      .catch((error) => {
        console.log(error);
      });
  });
}

export default App;
