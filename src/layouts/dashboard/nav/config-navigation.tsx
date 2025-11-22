import { PATH_DASHBOARD } from '../../../routes/paths';
import { useAuthContext } from '../../../auth/useAuthContext';

// components
import SvgColor from '../../../components/svg-color';

// ----------------------------------------------------------------------

const icon = (name: string) => (
  <SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />
);

const ICONS = {
  blog: icon('ic_blog'),
  cart: icon('ic_cart'),
  chat: icon('ic_chat'),
  mail: icon('ic_mail'),
  user: icon('ic_user'),
  file: icon('ic_file'),
  lock: icon('ic_lock'),
  label: icon('ic_label'),
  blank: icon('ic_blank'),
  kanban: icon('ic_kanban'),
  folder: icon('ic_folder'),
  banking: icon('ic_banking'),
  booking: icon('ic_booking'),
  invoice: icon('ic_invoice'),
  calendar: icon('ic_calendar'),
  disabled: icon('ic_disabled'),
  external: icon('ic_external'),
  menuItem: icon('ic_menu_item'),
  ecommerce: icon('ic_ecommerce'),
  analytics: icon('ic_analytics'),
  dashboard: icon('ic_dashboard'),
};

// Single admin navigation config - all admins have the same access
const navConfigAdmin = [
  // GENERAL
  {
    subheader: 'general',
    items: [
      { title: 'dashboard', path: PATH_DASHBOARD.general.dachboard, icon: ICONS.analytics },
      // CUSTOMER SECTION - COMMENTED OUT
      // {
      //   title: 'Customer',
      //   path: PATH_DASHBOARD.customer.root,
      //   icon: ICONS.user,
      //   children: [
      //     { title: 'Add Customer', path: PATH_DASHBOARD.customer.new },
      //     { title: 'View Customers', path: PATH_DASHBOARD.customer.list },
      //   ],
      // },
      // HR-RELATED FEATURE - COMMENTED OUT
      // {
      //   title: 'Employee',
      //   path: PATH_DASHBOARD.employee.root,
      //   icon: ICONS.user,
      //   children: [
      //     { title: 'Add Employee', path: PATH_DASHBOARD.employee.new },

      //     { title: 'View Employees', path: PATH_DASHBOARD.employee.list },
      //   ],
      // },
      {
        title: 'Sales',
        path: PATH_DASHBOARD.payment.root,
        icon: ICONS.invoice,
        children: [
          { title: 'New Sale', path: PATH_DASHBOARD.payment.new  },
 
          { title: 'Sales History', path: PATH_DASHBOARD.payment.list },
          { title: 'Analytics', path: PATH_DASHBOARD.analytics.list },
           
        ],
      },

      // HR-RELATED FEATURE - COMMENTED OUT
      // {
      //   title: 'Appointment',
      //   path: PATH_DASHBOARD.appointment.root,
      //   icon: ICONS.calendar,
      //   children: [{ title: 'View Appointment', path: PATH_DASHBOARD.appointment.list }],
      // },

     

      // HR-RELATED FEATURE - COMMENTED OUT
      // {
      //   title: 'Employee Salary',
      //   path: PATH_DASHBOARD.salary.root,
      //   icon: ICONS.ecommerce,
      //   children: [
      //     // { title: 'Create Package', path: PATH_DASHBOARD.cusloyalty.new },

      //     { title: 'View EmployeeSalary', path: PATH_DASHBOARD.salary.list },
      //     { title: 'View Payrun', path: PATH_DASHBOARD.payrun.list },
      //   ],
      // },
     
    ],
    
  },

    {
    subheader: 'Management',
    items: [
     
      {
        title: 'Product',
        path: PATH_DASHBOARD.item.root,
        icon: ICONS.menuItem,
        children: [
          { title: 'Add Product', path: PATH_DASHBOARD.item.new },

          { title: 'View Products', path: PATH_DASHBOARD.item.list },
        ],
      },
      {
        title: 'Discounts',
        path: PATH_DASHBOARD.cusloyalty.root,
        icon: ICONS.ecommerce,
        children: [
          { title: 'Create Discount', path: PATH_DASHBOARD.cusloyalty.new },

          { title: 'View Discounts', path: PATH_DASHBOARD.cusloyalty.list },
        ],
      },

   
      // ROLE SECTION - COMMENTED OUT
      // {
      //   title: 'Role',
      //   path: PATH_DASHBOARD.role.root,
      //   icon: ICONS.label,
      //   children: [
      //     { title: 'Add Role', path: PATH_DASHBOARD.role.new },
      //     { title: 'View Roles', path: PATH_DASHBOARD.role.list },
      //   ],
      // },
    ],
    
  },
  // MANAGEMENT
];

// Export the config
export { navConfigAdmin };

export default function useNavConfig() {
  // All users are admins, so return the same config for everyone
  return navConfigAdmin;
}
