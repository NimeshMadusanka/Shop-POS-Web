import { PATH_DASHBOARD } from '../../../routes/paths';
import { useAuthContext } from '../../../auth/useAuthContext';
import { useAdminUnlock } from '../../../contexts/AdminUnlockContext';

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
        path: PATH_DASHBOARD.analytics.root,
        icon: ICONS.analytics,
        children: [
          { title: 'Analytics', path: PATH_DASHBOARD.analytics.list },
          { title: 'Sales Report', path: PATH_DASHBOARD.salesReport.list },
          { title: 'Daily Reports', path: PATH_DASHBOARD.dailyReport.list },
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
        title: 'User',
        path: PATH_DASHBOARD.user.root,
        icon: ICONS.user,
        children: [
          { title: 'Add User', path: PATH_DASHBOARD.user.new },
          { title: 'View Users', path: PATH_DASHBOARD.user.list },
        ],
      },
      {
        title: 'Payment',
        path: PATH_DASHBOARD.payment.root,
        icon: ICONS.invoice,
        children: [
          { title: 'Sales History', path: PATH_DASHBOARD.payment.list },
        ],
      },
      {
        title: 'Category',
        path: PATH_DASHBOARD.category.root,
        icon: ICONS.label,
        children: [
          { title: 'Add Category', path: PATH_DASHBOARD.category.new },
          { title: 'View Categories', path: PATH_DASHBOARD.category.list },
        ],
      },
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
      {
        title: 'Brand',
        path: PATH_DASHBOARD.brand.root,
        icon: ICONS.label,
        children: [
          { title: 'Add Brand', path: PATH_DASHBOARD.brand.new },
          { title: 'View Brands', path: PATH_DASHBOARD.brand.list },
        ],
      },
      {
        title: 'Provider',
        path: PATH_DASHBOARD.provider.root,
        icon: ICONS.user,
        children: [
          { title: 'Add Provider', path: PATH_DASHBOARD.provider.new },
          { title: 'View Providers', path: PATH_DASHBOARD.provider.list },
        ],
      },
      {
        title: 'Shop',
        path: PATH_DASHBOARD.shop.root,
        icon: ICONS.ecommerce,
        children: [
          { title: 'Add Shop', path: PATH_DASHBOARD.shop.new },
          { title: 'View Shops', path: PATH_DASHBOARD.shop.list },
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

// Cashier navigation config - minimal, only cashier view
const navConfigCashier = [
  {
    subheader: 'Cashier',
    items: [
      {
        title: 'Cashier',
        path: PATH_DASHBOARD.cashier.root,
        icon: ICONS.invoice,
      },
    ],
  },
];

// Export the configs
export { navConfigAdmin, navConfigCashier };

export default function useNavConfig() {
  const { user } = useAuthContext();
  const { isAdminUnlocked } = useAdminUnlock();
  
  // Return admin config if user is admin OR if cashier has unlocked admin access
  if (user?.role === 'cashier' && !isAdminUnlocked) {
    return navConfigCashier;
  }
  return navConfigAdmin;
}
