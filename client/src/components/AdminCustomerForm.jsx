import { useEffect, useState } from "react";
import { fieldValidate } from "../external/vite-sdk";
import "../formstyles.css";
import { SingleFileUpload } from "../external/vite-sdk";
export default function AdminCustomerForm(props) {
  let [customer, setCustomer] = useState("");
  let [errorCustomer, setErrorCustomer] = useState(props.customerValidations);
  let [flagFormInvalid, setFlagFormInvalid] = useState(false);
  let { emptyCustomer } = props;
  let { customerToBeEdited } = props;
  let { action } = props;
  let { selectedEntity } = props;
  let { categoryList } = props;
  let { customerSchema } = props;
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
    <div className="p-2">
      <form className="text-thick p-4" onSubmit={handleFormSubmit}>
        {/* row starts */}
        <div className="form-group row align-items-center">
          
      <div className="col-6 my-2">
      <div className="text-bold my-1">
      <label>Name</label>
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
      <div className="col-6 my-2">
      <div className="text-bold my-1">
      <label>Email Id</label>
      </div>
      <div className=" px-0">
      <input
      type="email"
      className="form-control"
      name="emailId"
      value={customer.emailId}
      onChange={handleTextFieldChange}
      onBlur={handleBlur}
      onFocus={handleFocus}
      placeholder="Enter emailId"
      />
      </div>
      <div className="">
      {errorCustomer.emailId.message ? (
                <span className="text-danger">{errorCustomer.emailId.message}</span>
                ) : null}
                </div>
                </div>
        <div className="col-6 my-2">
        <div className="text-bold my-1">
        <label>Gender</label>
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
          
        <div className="col-6 my-2">
        <div className="text-bold my-1">
        <label>Languages</label>
        </div>
        <div className="px-0"><input
        type="checkbox"
        name="languages"
        value="ENglish"
        onChange={handleCheckBoxChange}
        onBlur={handleBlur}
        onFocus={handleFocus}  
        checked={customer.languages?.includes("ENglish")}    
        />&nbsp;ENglish&nbsp;<input
        type="checkbox"
        name="languages"
        value="Hindi"
        onChange={handleCheckBoxChange}
        onBlur={handleBlur}
        onFocus={handleFocus}  
        checked={customer.languages?.includes("Hindi")}    
        />&nbsp;Hindi&nbsp;<input
        type="checkbox"
        name="languages"
        value="Marathi"
        onChange={handleCheckBoxChange}
        onBlur={handleBlur}
        onFocus={handleFocus}  
        checked={customer.languages?.includes("Marathi")}    
        />&nbsp;Marathi&nbsp;</div>
          </div>
          
        <div className="col-6 my-2">
        <div className="text-bold my-1">
        <label>Programming</label>
        </div>
        <div className="px-0"><input
        type="checkbox"
        name="programming"
        value="C"
        onChange={handleCheckBoxChange}
        onBlur={handleBlur}
        onFocus={handleFocus}  
        checked={customer.programming?.includes("C")}    
        />&nbsp;C&nbsp;<input
        type="checkbox"
        name="programming"
        value="C++"
        onChange={handleCheckBoxChange}
        onBlur={handleBlur}
        onFocus={handleFocus}  
        checked={customer.programming?.includes("C++")}    
        />&nbsp;C++&nbsp;<input
        type="checkbox"
        name="programming"
        value="Java"
        onChange={handleCheckBoxChange}
        onBlur={handleBlur}
        onFocus={handleFocus}  
        checked={customer.programming?.includes("Java")}    
        />&nbsp;Java&nbsp;<input
        type="checkbox"
        name="programming"
        value="Python"
        onChange={handleCheckBoxChange}
        onBlur={handleBlur}
        onFocus={handleFocus}  
        checked={customer.programming?.includes("Python")}    
        />&nbsp;Python&nbsp;</div>
          </div>
          
        <div className="col-6 my-2">
        <div className="text-bold my-1">
        <label>State</label>
        </div>
        <div className="px-0"><input
        type="checkbox"
        name="state"
        value="Maharashtra"
        onChange={handleCheckBoxChange}
        onBlur={handleBlur}
        onFocus={handleFocus}  
        checked={customer.state?.includes("Maharashtra")}    
        />&nbsp;Maharashtra&nbsp;<input
        type="checkbox"
        name="state"
        value="Gujrat"
        onChange={handleCheckBoxChange}
        onBlur={handleBlur}
        onFocus={handleFocus}  
        checked={customer.state?.includes("Gujrat")}    
        />&nbsp;Gujrat&nbsp;<input
        type="checkbox"
        name="state"
        value="Karnataka"
        onChange={handleCheckBoxChange}
        onBlur={handleBlur}
        onFocus={handleFocus}  
        checked={customer.state?.includes("Karnataka")}    
        />&nbsp;Karnataka&nbsp;</div>
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
