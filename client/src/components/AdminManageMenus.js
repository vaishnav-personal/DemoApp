let AdminManageMenus = {
  name: "Manage",
  accessLevel: "D",
  entities: [
    {
      name: "Products",
      singularName: "Product",
      addFacility: true,
      deleteFacility: true,
      editFacility: true,
      isReady: true,
      accessLevel: "D",
    },
    {
      name: "Product Categories",
      singularName: "Category",
      addFacility: true,
      deleteFacility: false,
      editFacility: false,
      isReady: true,
      accessLevel: "A",
    },
    {
      name: "Customers",
      singularName: "Customer",
      addFacility: true,
      deleteFacility: true,
      editFacility: true,
      isReady: true,
      accessLevel: "A",
    },
  ],
};
export default AdminManageMenus;
