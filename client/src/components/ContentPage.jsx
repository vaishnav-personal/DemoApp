import AdminCategories from "./AdminCategories";
import AdminCustomers from "./AdminCustomers";
import AdminProducts from "./AdminProducts";
import AdminReportActivities from "./AdminReportActivities";
import AdminRoles from "./AdminRoles";
import AdminUsers from "./AdminUsers";
import BackButton from "./BackButton";
export default function ContentPage(props) {
  let { selectedEntity } = props;
  let { user } = props;
  function handleBackButtonClick() {
    props.onBackButtonClick();
  }
  return (
    <>
      <div className="text-center">
        <BackButton onBackButtonClick={handleBackButtonClick} />
      </div>
      {selectedEntity.isReady == false && (
        <h5 className="text-center">Work in Progress !</h5>
      )}
      {selectedEntity.name == "Products" && (
        <AdminProducts selectedEntity={selectedEntity} />
      )}
      {selectedEntity.name == "Customers" && (
        <AdminCustomers selectedEntity={selectedEntity} />
      )}

      {selectedEntity.name == "Product Categories" && (
        <AdminCategories selectedEntity={selectedEntity} user={user} />
      )}
      {selectedEntity.name == "Users" && (
        <AdminUsers selectedEntity={selectedEntity} />
      )}
      {selectedEntity.name == "Roles" && (
        <AdminRoles selectedEntity={selectedEntity} />
      )}
      {selectedEntity.name == "Activity Report" && (
        <AdminReportActivities selectedEntity={selectedEntity} />
      )}
    </>
  );
}
