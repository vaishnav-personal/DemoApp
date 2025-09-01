import { useEffect, useState } from "react";
import { fieldValidate } from "../external/vite-sdk";
import "../formstyles.css";
import { SingleFileUpload } from "../external/vite-sdk";
import formLayout from "./FormLayout";
export default function AdminCustomerForm(props) {
  let fl = formLayout();
  let cardStyle = fl.cardStyle;
  let cols = fl.cols;
  let [customer, setCustomer] = useState("");
  let [errorCustomer, setErrorCustomer] = useState(props.customerValidations);
  let [flagFormInvalid, setFlagFormInvalid] = useState(false);
  let { emptyCustomer } = props;
  let { customerToBeEdited } = props;
  let { action } = props;
  let { selectedEntity } = props;
  let { customerSchema } = props;
  let { categoryList } = props;
  let [singleFileList, setSingleFileList] = useState(
    getSingleFileListFromCustomerSchema()
  );
  function getSingleFileListFromCustomerSchema() {
    let list = [];
    customerSchema.forEach((e, index) => {
      let obj = {};
      if (e.type == "singleFile") {
        obj["fileAttributeName"] = e.attribute;
        obj["allowedFileType"] = e.allowedFileType;
        obj["allowedSize"] = e.allowedSize;
        list.push(obj);
      }
    });
    return list;
  }
  useEffect(() => {
    window.scroll(0, 0);
    init();
  }, []);
  function init() {
    let { action } = props;
    if (action === "add") {
      // emptyCustomer.category = props.categoryToRetain;
      // emptyCustomer.categoryId = props.categoryIdToRetain;
      setCustomer(props.emptyCustomer);
    } else if (action === "update") {
      // in edit mode, keep the update button enabled at the beginning
      setFlagFormInvalid(false);
      // find missing keys
      const missing = Object.keys(emptyCustomer).filter(
        (key) => !Object.keys(customerToBeEdited).includes(key)
      );
      // add them to objB with empty string
      missing.forEach((key) => {
        customerToBeEdited[key] = "";
      });
      setCustomer(props.customerToBeEdited);
    }
  }
  function handleTextFieldChange(event) {
    let name = event.target.name;
    setCustomer({ ...customer, [name]: event.target.value });
    let message = fieldValidate(event, errorCustomer);
    let errCustomer = { ...errorCustomer };
    errorCustomer[`${name}`].message = message;
    setErrorCustomer(errCustomer);
  }
  function handleBlur(event) {
    let name = event.target.name;
    let message = fieldValidate(event, errorCustomer);
    let errCustomer = { ...errorCustomer };
    errorCustomer[`${name}`].message = message;
    setErrorCustomer(errCustomer);
  }
  function handleFocus(event) {
    setFlagFormInvalid(false);
  }
  function handleRadioFieldChange(event) {
    let name = event.target.name;
    setCustomer({ ...customer, [name]: event.target.value });
  }
  function handleCheckBoxChange(event) {
    const { name, value, checked } = event.target;
    if (checked) {
      // Add value to array for that name
      setCustomer({ ...customer, [name]: [...customer[`${name}`], value] });
    } else {
      // Remove value from array for that name
      setCustomer({
        ...customer,
        [name]: customer[`${name}`].filter((e) => e !== value),
      });
    }
  }
  function checkAllErrors() {
    for (let field in errorCustomer) {
      if (errorCustomer[field].message !== "") {
        return true;
      } //if
    } //for
    let errCustomer = { ...errorCustomer };
    let flag = false;
    for (let field in customer) {
      if (errorCustomer[field] && customer[field] == "") {
        flag = true;
        errCustomer[field].message = "Required...";
      } //if
    } //for
    if (flag) {
      setErrorCustomer(errCustomer);
      return true;
    }
    return false;
  }
  const handleFormSubmit = (e) => {
    e.preventDefault();
    // for dropdown, data is to be modified
    // first check whether all entries are valid or not
    if (checkAllErrors()) {
      setFlagFormInvalid(true);
      return;
    }
    setFlagFormInvalid(false);
    if (action == "update") {
      // There might be files in this form, add those also
      let pr = { ...customer };
      for (let i = 0; i < singleFileList.length; i++) {
        let fAName = singleFileList[i].fileAttributeName;
        if (pr[fAName + "New"]) {
          // image is modified
          // if field-name is image, temporarily in "imageNew" field, new file-name is saved.
          pr[fAName] = pr[fAName + "New"];
          delete pr[fAName + "New"];
        }
      } //for
      setCustomer(pr);
      props.onFormSubmit(pr);
    } else if (action == "add") {
      props.onFormSubmit(customer);
    }
  };
  function handleFileChange(selectedFile, fileIndex, message) {
    setFlagFormInvalid(false);
    if (action == "add") {
      // add datesuffix to file-name
      const timestamp = Date.now();
      const ext = selectedFile.name.split(".").pop();
      const base = selectedFile.name.replace(/\.[^/.]+$/, "");
      const newName = `${base}-${timestamp}.${ext}`;
      // Create a new File object with the new name
      const renamedFile = new File([selectedFile], newName, {
        type: selectedFile.type,
        lastModified: selectedFile.lastModified,
      });
      setCustomer({
        ...customer,
        ["file" + fileIndex]: renamedFile,
        [singleFileList[fileIndex].fileAttributeName]: newName,
      });
      let errCustomer = { ...errorCustomer };
      errCustomer[singleFileList[fileIndex].fileAttributeName].message = message;
      setErrorCustomer(errCustomer);
      // setErrorCustomer({ ...errorCustomer, message: message });
    }
  }
  function handleFileRemove(selectedFile, fileIndex, message) {
    if (action == "add") {
      setFlagFormInvalid(false);
      setCustomer({
        ...customer,
        [singleFileList[fileIndex].fileAttributeName]: "",
      });
      let errCustomer = { ...errorCustomer };
      errCustomer[singleFileList[fileIndex].fileAttributeName].message = message;
      setErrorCustomer(errCustomer);
    } else if (action == "update") {
      let newFileName = "";
      if (selectedFile) {
        newFileName = selectedFile.name;
      } else {
        // user selected a new file but then deselected
        newFileName = "";
      }
      setCustomer({
        ...customer,
        ["file" + fileIndex]: selectedFile,
        [singleFileList[fileIndex].fileAttributeName + "New"]: newFileName,
      });
      let errCustomer = { ...errorCustomer };
      errCustomer[singleFileList[fileIndex].fileAttributeName].message = message;
      setErrorCustomer(errCustomer);
    }
  }
  function handleFileChangeUpdateMode(selectedFile, fileIndex, message) {
    let newFileName = "";
    if (selectedFile) {
      newFileName = selectedFile.name;
    } else {
      // user selected a new file but then deselected
      newFileName = "";
    }
    setCustomer({
      ...customer,
      // file: file,
      ["file" + fileIndex]: selectedFile,
      [singleFileList[fileIndex].fileAttributeName + "New"]: newFileName,
      // [singleFileList[fileIndex].fileAttributeName]: selectedFile.name,
    });
    let errCustomer = { ...errorCustomer };
    errCustomer[singleFileList[fileIndex].fileAttributeName].message = message;
    setErrorCustomer(errCustomer);
  }
  function handleCancelChangeImageClick() {
    if (action == "update") {
      let fl = [...singleFileList];
      fl[fileIndex]["newFileName"] = "";
      fl[fileIndex]["newFile"] = "";
      setSingleFileList(fl);
    }
  }
  function handleSelectCategoryChange(event) {
    let category = event.target.value.trim();
    let categoryId = event.target.selectedOptions[0].id;
    setCustomer({ ...customer, category: category, categoryId: categoryId });
  }
  return (
    <div>
      <form className="text-thick p-4" onSubmit={handleFormSubmit}>
        {/* row starts */}
        <div className={`${cardStyle}`}>
          
      <div className={cols +" my-2"}>
      <div className="text-bold my-1">
      <label className="form-label fw-semibold">Name</label>
      </div>
      <div className=" px-0">
      <input
      type="text"
      className="form-control"
      name="name"
      value={customer.name}
      onChange={handleTextFieldChange}
      onBlur={handleBlur}
      onFocus={handleFocus}
      placeholder="Enter name"
      />
      </div>
      <div className="">
      {errorCustomer.name.message ? (
                <span className="text-danger">{errorCustomer.name.message}</span>
                ) : null}
                </div>
                </div>
          <div className={cols + " my-2"}>
        <div className="text-bold my-1">
        <label className="form-label fw-semibold">Gender</label>
        </div>
        <div className="px-0"><input
        type="radio"
        name="gender"
        value="male"
        onChange={handleRadioFieldChange}
        onBlur={handleBlur}
        onFocus={handleFocus}      
        checked={customer.gender == "male"}
        />&nbsp;male&nbsp;<input
        type="radio"
        name="gender"
        value="female"
        onChange={handleRadioFieldChange}
        onBlur={handleBlur}
        onFocus={handleFocus}      
        checked={customer.gender == "female"}
        />&nbsp;female&nbsp;</div>
          </div>
          
        <div className={cols + " my-2"}>
        <div className="text-bold my-1">
        <label className="form-label fw-semibold">Languages</label>
        </div>
        <div className="px-0"><input
        type="checkbox"
        name="languages"
        value="english"
        onChange={handleCheckBoxChange}
        onBlur={handleBlur}
        onFocus={handleFocus}  
        checked={customer.languages?.includes("english")}    
        />&nbsp;english&nbsp;<input
        type="checkbox"
        name="languages"
        value="hindi"
        onChange={handleCheckBoxChange}
        onBlur={handleBlur}
        onFocus={handleFocus}  
        checked={customer.languages?.includes("hindi")}    
        />&nbsp;hindi&nbsp;<input
        type="checkbox"
        name="languages"
        value="marathi"
        onChange={handleCheckBoxChange}
        onBlur={handleBlur}
        onFocus={handleFocus}  
        checked={customer.languages?.includes("marathi")}    
        />&nbsp;marathi&nbsp;</div>
          </div>
          
        <div className={cols + " my-2"}>
        <div className="text-bold my-1">
        <label className="form-label fw-semibold">State</label>
        </div>
        <div className="px-0">
        <select
        className="form-control"
        name="state"
        value={customer.state}
        onChange={(e) =>
                  setCustomer({ ...customer, state: e.target.value })
                }
        onBlur={handleBlur}
        onFocus={handleFocus}
        >
        <option value="">-- Select state --</option>
        
        <option value="maharastra" id="0">
        maharastra
        </option>
        
        <option value="karnatka" id="1">
        karnatka
        </option>
        
        <option value="gujrat" id="2">
        gujrat
        </option>
        </select></div>
          </div>
          
          <div className="col-12">
            <button
              className="btn btn-primary"
              type="submit"
              // disabled={flagFormInvalid}
            >
              {(action + " " + selectedEntity.singularName).toUpperCase()}
            </button>{" "}
            &nbsp;{" "}
            <span className="text-danger">
              {" "}
              {flagFormInvalid ? "Missing data.." : ""}
            </span>
          </div>
        </div>
      </form>
    </div>
  );
}
