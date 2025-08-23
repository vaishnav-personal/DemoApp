import { useEffect, useState } from "react";
import {
  CommonUtilityBar,
  CheckBoxHeaders,
  ListHeaders,
  Entity,
} from "../external/vite-sdk";
import AdminCustomerForm from "./AdminCustomerForm";
import { BeatLoader } from "react-spinners";
import axios from "axios";
import * as XLSX from "xlsx";
import ModalImport from "./ModalImport";
import {
  recordsAddBulk,
  recordsUpdateBulk,
  analyseImportExcelSheet,
} from "../external/vite-sdk";
import { getEmptyObject, getShowInList } from "../external/vite-sdk";

export default function AdminCustomers(props) {
  let [customerList, setCustomerList] = useState([]);
  let [filteredCustomerList, setFilteredCustomerList] = useState([]);
  
  let [action, setAction] = useState("list");
  let [customerToBeEdited, setCustomerToBeEdited] = useState("");
  let [flagLoad, setFlagLoad] = useState(false);
  let [flagImport, setFlagImport] = useState(false);
  let [message, setMessage] = useState("");
  let [searchText, setSearchText] = useState("");
  let [sortedField, setSortedField] = useState("");
  let [direction, setDirection] = useState("");
  let [sheetData, setSheetData] = useState(null);
  let [selectedFile, setSelectedFile] = useState("");
  let [recordsToBeAdded, setRecordsToBeAdded] = useState([]);
  let [recordsToBeUpdated, setRecordsToBeUpdated] = useState([]);
  let [cntUpdate, setCntUpdate] = useState(0);
  let [cntAdd, setCntAdd] = useState(0);
  let [cntShow, setCntShow] = useState(window.maxCnt); // Initially 5 attributes are shown
  let { selectedEntity } = props;
  let { flagFormInvalid } = props;
  let customerSchema=[
{attribute:"name",type:"normal",},
{attribute:"emailId",type:"normal",},
{attribute:"gender",type:"normal",},
{attribute:"languages",type:"normal",},
{attribute:"programming",type:"normal",},
{attribute:"state",type:"normal",},
]
  let customerValidations={
name:{
    message:"",
    mxLen:40,
    mnLen:2,
    onlyDigits:false
  },emailId:{
    message:"",
    mxLen:100,
    mnLen:6,
    onlyDigits:false
  },gender:{
    message:"",
    mxLen:10,
    mnLen:4,
    onlyDigits:false
  },languages:{
    message:"",
    mxLen:10,
    mnLen:4,
    onlyDigits:false
  },programming:{
    message:"",
    mxLen:10,
    mnLen:4,
    onlyDigits:false
  },state:{
    message:"",
    mxLen:10,
    mnLen:4,
    onlyDigits:false
  },}
  let [showInList, setShowInList] = useState(getShowInList(customerSchema,cntShow));
  let [emptyCustomer, setEmptyCustomer] = useState(getEmptyObject(customerSchema));
  useEffect(() => {
    getData();
  }, []);
  
  async function getData() {
      setFlagLoad(true);
      try {
        let response = await axios(import.meta.env.VITE_API_URL + "/customers");
        let pList = await response.data;
    // Arrange products is sorted order as per updateDate
      pList = pList.sort(
        (a, b) => new Date(b.updateDate) - new Date(a.updateDate)
      );
    // update pList with relational-data
      pList.forEach((customer) => {
})//forEach
setCustomerList(pList);
      setFilteredCustomerList(pList);} catch (error) {
        showMessage("Oops! An error occurred. Refresh the page");
      }
      setFlagLoad(false);
    }
  
  async function handleFormSubmit(customer) {
    let message;
    // now remove relational data
    let customerForBackEnd = { ...customer };
    for (let key in customerForBackEnd) {
      customerSchema.forEach((e, index) => {
        if (key == e.attribute && e.relationalData) {
          delete customerForBackEnd[key];
        }
      });
    }
    if (action == "add") {
      // customer = await addCustomerToBackend(customer);
      setFlagLoad(true);
      try {
        let response = await axios.post(
          import.meta.env.VITE_API_URL + "/customers",
          customerForBackEnd,
          { headers: { "Content-type": "multipart/form-data" } }
        );
        let addedCustomer = await response.data; //returned  with id
        // This addedCustomer has id, addDate, updateDate, but the relational data is lost
        // The original customer has got relational data.
        for (let key in customer) {
          customerSchema.forEach((e, index) => {
            if (key == e.attribute && e.relationalData) {
              addedCustomer[key] = customer[key];
            }
          });
        }
        message = "Customer added successfully";
        // update the customer list now.
        let prList = [...customerList];
        prList.push(addedCustomer);
        prList = prList.sort(
          (a, b) => new Date(b.updateDate) - new Date(a.updateDate)
        );
        setCustomerList(prList);
        let fprList = [...filteredCustomerList];
        fprList.push(addedCustomer);
        fprList = fprList.sort(
          (a, b) => new Date(b.updateDate) - new Date(a.updateDate)
        );
        setFilteredCustomerList(fprList);
        // update the list in sorted order of updateDate
        showMessage(message);
        setAction("list");
      } catch (error) {
        console.log(error);
        showMessage("Somecustomer went wrong, refresh the page");
      }
      setFlagLoad(false);
    } //...add
    else if (action == "update") {
      customerForBackEnd._id = customerToBeEdited._id; // The form does not have id field
      setFlagLoad(true);
      try {
        let response = await axios.put(
          import.meta.env.VITE_API_URL + "/customers",
          customerForBackEnd,
          { headers: { "Content-type": "multipart/form-data" } }
        );
        // update the customer list now, relational data is not deleted
        message = "Customer Updated successfully";
        // update the customer list now.
        let prList = customerList.map((e, index) => {
          if (e._id == customer._id) return customer;
          return e;
        });
        prList = prList.sort(
          (a, b) => new Date(b.updateDate) - new Date(a.updateDate)
        );
        let fprList = filteredCustomerList.map((e, index) => {
          if (e._id == customer._id) return customer;
          return e;
        });
        fprList = fprList.sort(
          (a, b) => new Date(b.updateDate) - new Date(a.updateDate)
        );
        setCustomerList(prList);
        setFilteredCustomerList(fprList);
        showMessage(message);
        setAction("list");
      } catch (error) {
        showMessage("Somecustomer went wrong, refresh the page");
      }
    } //else ...(update)
    setFlagLoad(false);
  }
  function handleFormCloseClick() {
    props.onFormCloseClick();
  }
  function handleListClick() {
    setAction("list");
  }
  function handleAddEntityClick() {
    setAction("add");
  }
  function handleEditButtonClick(customer) {
    setAction("update");
    setCustomerToBeEdited(customer);
  }
  function showMessage(message) {
    setMessage(message);
    window.setTimeout(() => {
      setMessage("");
    }, 3000);
  }
  function handleDeleteButtonClick(ans, customer) {
    if (ans == "No") {
      // delete operation cancelled
      showMessage("Delete operation cancelled");
      return;
    }
    if (ans == "Yes") {
      // delete operation allowed
      performDeleteOperation(customer);
    }
  }
  async function performDeleteOperation(customer) {
    setFlagLoad(true);
    try {
      let response = await axios.delete(
        import.meta.env.VITE_API_URL + "/customers/" + customer._id
      );
      let r = await response.data;
      message = `Customer - ${customer.name} deleted successfully.`;
      //update the customer list now.
      let prList = customerList.filter((e, index) => e._id != customer._id);
      setCustomerList(prList);

      let fprList = customerList.filter((e, index) => e._id != customer._id);
      setFilteredCustomerList(fprList);
      showMessage(message);
    } catch (error) {
      console.log(error);
      showMessage("Somecustomer went wrong, refresh the page");
    }
    setFlagLoad(false);
  }
  function handleListCheckBoxClick(checked, selectedIndex) {
    // Minimum 1 field should be shown
    let cnt = 0;
    showInList.forEach((e, index) => {
      if (e.show) {
        cnt++;
      }
    });
    if (cnt == 1 && !checked) {
      showMessage("Minimum 1 field should be selected.");
      return;
    }
    if (cnt == window.maxCnt && checked) {
      showMessage("Maximum " + window.maxCnt + " fields can be selected.");
      return;
    }
    let att = [...showInList];
    let a = att.map((e, index) => {
      let p = { ...e };
      if (index == selectedIndex && checked) {
        p.show = true;
        setCntShow(cnt + 1);
      } else if (index == selectedIndex && !checked) {
        p.show = false;
        setCntShow(cnt - 1);
      }
      return p;
    });
    setShowInList(a);
  }
  function handleHeaderClick(index) {
    let field = showInList[index].attribute;
    let d = false;
    if (field === sortedField) {
      // same button clicked twice
      d = !direction;
    } else {
      // different field
      d = false;
    }
    let list = [...filteredCustomerList];
    setDirection(d);
    if (d == false) {
      //in ascending order
      list.sort((a, b) => {
        if (a[field] > b[field]) {
          return 1;
        }
        if (a[field] < b[field]) {
          return -1;
        }
        return 0;
      });
    } else {
      //in descending order
      list.sort((a, b) => {
        if (a[field] < b[field]) {
          return 1;
        }
        if (a[field] > b[field]) {
          return -1;
        }
        return 0;
      });
    }
    setFilteredCustomerList(list);
    setSortedField(field);
  }
  function handleSrNoClick() {
    // let field = selectedEntity.attributes[index].id;
    let d = false;
    if (sortedField === "updateDate") {
      d = !direction;
    } else {
      d = false;
    }
    let list = [...filteredCustomerList];
    setDirection(!direction);
    if (d == false) {
      //in ascending order
      list.sort((a, b) => {
        if (new Date(a["updateDate"]) > new Date(b["updateDate"])) {
          return 1;
        }
        if (new Date(a["updateDate"]) < new Date(b["updateDate"])) {
          return -1;
        }
        return 0;
      });
    } else {
      //in descending order
      list.sort((a, b) => {
        if (new Date(a["updateDate"]) < new Date(b["updateDate"])) {
          return 1;
        }
        if (new Date(a["updateDate"]) > new Date(b["updateDate"])) {
          return -1;
        }
        return 0;
      });
    }
    // setSelectedList(list);
    setFilteredCustomerList(list);
    setSortedField("updateDate");
  }
  function handleFormTextChangeValidations(message, index) {
    props.onFormTextChangeValidations(message, index);
  }
  function handleSearchKeyUp(event) {
    let searchText = event.target.value;
    setSearchText(searchText);
    performSearchOperation(searchText);
  }
  function performSearchOperation(searchText) {
    let query = searchText.trim();
    if (query.length == 0) {
      setFilteredCustomerList(customerList);
      return;
    }
    let searchedCustomers = [];
    searchedCustomers = filterByShowInListAttributes(query);
    setFilteredCustomerList(searchedCustomers);
  }
  function filterByName(query) {
    let fList = [];
    for (let i = 0; i < selectedList.length; i++) {
      if (selectedList[i].name.toLowerCase().includes(query.toLowerCase())) {
        fList.push(selectedList[i]);
      }
    } //for
    return fList;
  }
  function filterByShowInListAttributes(query) {
    let fList = [];
    for (let i = 0; i < customerList.length; i++) {
      for (let j = 0; j < showInList.length; j++) {
        if (showInList[j].show) {
          let parameterName = showInList[j].attribute;
          if (
            customerList[i][parameterName] &&
            customerList[i][parameterName]
              .toLowerCase()
              .includes(query.toLowerCase())
          ) {
            fList.push(customerList[i]);
            break;
          }
        }
      } //inner for
    } //outer for
    return fList;
  }
  function handleToggleText(index) {
    let sil = [...showInList];
    sil[index].flagReadMore = !sil[index].flagReadMore;
    setShowInList(sil);
  }
  function handleExcelFileUploadClick(file, msg) {
    if (msg) {
      showMessage(message);
      return;
    }
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      const arrayBuffer = event.target.result;
      // Read the workbook from the array buffer
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      // Assume reading the first sheet
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      // Convert to JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      // const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
      setSheetData(jsonData);
      let result = analyseImportExcelSheet(jsonData, customerList);
      if (result.message) {
        showMessage(result.message);
      } else {
        showImportAnalysis(result);
      }
      // analyseSheetData(jsonData, customerList);
    };
    // reader.readAsBinaryString(file);
    reader.readAsArrayBuffer(file);
  }
  function showImportAnalysis(result) {
    setCntAdd(result.cntA);
    setCntUpdate(result.cntU);
    setRecordsToBeAdded(result.recordsToBeAdded);
    setRecordsToBeUpdated(result.recordsToBeUpdated);
    //open modal
    setFlagImport(true);
  }
  function handleModalCloseClick() {
    setFlagImport(false);
  }
  async function handleImportButtonClick() {
    setFlagImport(false); // close the modal
    setFlagLoad(true);
    let result;
    try {
      if (recordsToBeAdded.length > 0) {
        result = await recordsAddBulk(
          recordsToBeAdded,
          "customers",
          customerList,
          import.meta.env.VITE_API_URL
        );
        if (result.success) {
          setCustomerList(result.updatedList);
          setFilteredCustomerList(result.updatedList);
        }
        showMessage(result.message);
      }
      if (recordsToBeUpdated.length > 0) {
        result = await recordsUpdateBulk(
          recordsToBeUpdated,
          "customers",
          customerList,
          import.meta.env.VITE_API_URL
        );
        if (result.success) {
          setCustomerList(result.updatedList);
          setFilteredCustomerList(result.updatedList);
        }
        showMessage(result.message);
      } //if
    } catch (error) {
      console.log(error);
      showMessage("Somecustomer went wrong, refresh the page");
    }
    setFlagLoad(false);
  }
  function handleClearSelectedFile() {
    setSelectedFile(null);
  }
  if (flagLoad) {
    return (
      <div className="my-5 text-center">
        <BeatLoader size={24} color={"blue"} />
      </div>
    );
  }
  return (
    <div className="container">
      <CommonUtilityBar
        action={action}
        message={message}
        selectedEntity={selectedEntity}
        filteredList={filteredCustomerList}
        mainList={customerList}
        showInList={showInList}
        onListClick={handleListClick}
        onAddEntityClick={handleAddEntityClick}
        onSearchKeyUp={handleSearchKeyUp}
        onExcelFileUploadClick={handleExcelFileUploadClick}
        onClearSelectedFile={handleClearSelectedFile}
      />
      {filteredCustomerList.length == 0 && customerList.length != 0 && (
        <div className="text-center">Nocustomer to show</div>
      )}
      {customerList.length == 0 && (
        <div className="text-center">List is empty</div>
      )}
      {action == "list" && filteredCustomerList.length != 0 && (
        <CheckBoxHeaders
          showInList={showInList}
          cntShow={cntShow}
          onListCheckBoxClick={handleListCheckBoxClick}
        />
      )}
      {action == "list" && filteredCustomerList.length != 0 && (
        <div className="row   my-2 mx-auto  p-1">
          <div className="col-1">
            <a
              href="#"
              onClick={() => {
                handleSrNoClick();
              }}
            >
              SN.{" "}
              {sortedField == "updateDate" && direction && (
                <i className="bi bi-arrow-up"></i>
              )}
              {sortedField == "updateDate" && !direction && (
                <i className="bi bi-arrow-down"></i>
              )}
            </a>
          </div>
          <ListHeaders
            showInList={showInList}
            sortedField={sortedField}
            direction={direction}
            cntShow={cntShow}
            onHeaderClick={handleHeaderClick}
          />
          <div className="col-1">&nbsp;</div>
        </div>
      )}
      {(action == "add" || action == "update") && (
        <div className="row">
          <AdminCustomerForm
            customerSchema={customerSchema}
            customerValidations={customerValidations}
            emptyCustomer={emptyCustomer}
            
            selectedEntity={selectedEntity}
            customerToBeEdited={customerToBeEdited}
            action={action}
            flagFormInvalid={flagFormInvalid}
            onFormSubmit={handleFormSubmit}
            onFormCloseClick={handleFormCloseClick}
            onFormTextChangeValidations={handleFormTextChangeValidations}
          />
        </div>
      )}
      {action == "list" &&
        filteredCustomerList.length != 0 &&
        filteredCustomerList.map((e, index) => (
          <Entity
            entity={e}
            key={index + 1}
            index={index}
            sortedField={sortedField}
            direction={direction}
            listSize={filteredCustomerList.length}
            selectedEntity={selectedEntity}
            showInList={showInList}
            cntShow={cntShow}
            VITE_API_URL={import.meta.env.VITE_API_URL}
            onEditButtonClick={handleEditButtonClick}
            onDeleteButtonClick={handleDeleteButtonClick}
            onToggleText={handleToggleText}
          />
        ))}
      {flagImport && (
        <ModalImport
          modalText={"Summary of Bulk Import"}
          additions={recordsToBeAdded}
          updations={recordsToBeUpdated}
          btnGroup={["Yes", "No"]}
          onModalCloseClick={handleModalCloseClick}
          onModalButtonCancelClick={handleModalCloseClick}
          onImportButtonClick={handleImportButtonClick}
        />
      )}
    </div>
  );
}
