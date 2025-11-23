import { Suspense, lazy, ElementType } from 'react';
// components
import LoadingScreen from '../components/loading-screen';

// ----------------------------------------------------------------------

const Loadable = (Component: ElementType) => (props: any) =>
  (
    <Suspense fallback={<LoadingScreen />}>
      <Component {...props} />
    </Suspense>
  );

// ----------------------------------------------------------------------

// AUTH
export const LoginPage = Loadable(lazy(() => import('../pages/auth/LoginPage')));
export const ForgotPasswordForm = Loadable(
  lazy(() => import('../sections/auth/ForgotPasswordForm'))
);
export const ChangePassword = Loadable(lazy(() => import('../sections/auth/ChangePassword')));
export const SignUpPage = Loadable(lazy(() => import('../pages/auth/SignUpPage')));
export const VerifyCodePage = Loadable(lazy(() => import('../pages/auth/VerifyCodePage')));

// CompanyCreationForm

// DASHBOARD: GENERAL
export const GeneralAppPage = Loadable(lazy(() => import('../pages/dashboard/GeneralAppPage')));
export const GeneralEcommercePage = Loadable(
  lazy(() => import('../pages/dashboard/GeneralEcommercePage'))
);
export const GeneralAnalyticsPage = Loadable(
  lazy(() => import('../pages/dashboard/GeneralAnalyticsPage'))
);
export const BookingListPage = Loadable(lazy(() => import('../pages/dashboard/BookingListPage')));
export const GeneralBankingPage = Loadable(
  lazy(() => import('../pages/dashboard/GeneralBankingPage'))
);

export const GeneralFilePage = Loadable(lazy(() => import('../pages/dashboard/GeneralFilePage')));

// DASHBOARD: USER
export const UserProfilePage = Loadable(lazy(() => import('../pages/dashboard/UserProfilePage')));
export const UserCardsPage = Loadable(lazy(() => import('../pages/dashboard/UserCardsPage')));
export const UserListPage = Loadable(lazy(() => import('../pages/dashboard/UserListPage')));
export const UserAccountPage = Loadable(lazy(() => import('../pages/dashboard/UserAccountPage')));
export const UserCreatePage = Loadable(lazy(() => import('../pages/dashboard/UserCreatePage')));
export const UserEditPage = Loadable(lazy(() => import('../pages/dashboard/UserEditPage')));
export const UpdateProfilePage = Loadable(
  lazy(() => import('../pages/dashboard/UpdateProfilePage'))
);

export const UpdateSetting = Loadable(lazy(() => import('../pages/dashboard/UpdateSetting')));
export const UpdateUploadSettingPage = Loadable(
  lazy(() => import('../pages/dashboard/UpdateUploadSettingPage'))
);

// export const InvoiceDetailsPage = Loadable(
//   lazy(() => import('../pages/dashboard/InvoiceDetailsPage'))
// );
// export const InvoiceStovkInDetailsPage = Loadable(
//   lazy(() => import('../pages/dashboard/InvoiceStockInDetailsPage'))
// );
// export const InvoiceFinalDetailsPage = Loadable(
//   lazy(() => import('../pages/dashboard/InvoiceFinalDetailsPage'))
// );

// export const InvoiceFinalDetailsPagenew = Loadable(
//   lazy(() => import('../pages/dashboard/InvoiceFinalDetailsPagenew'))
// );
// DASHBOARD: FILE MANAGER
export const FileManagerPage = Loadable(lazy(() => import('../pages/dashboard/FileManagerPage')));

// DASHBOARD: APP
export const ChatPage = Loadable(lazy(() => import('../pages/dashboard/ChatPage')));
export const MailPage = Loadable(lazy(() => import('../pages/dashboard/MailPage')));
export const CalendarPage = Loadable(lazy(() => import('../pages/dashboard/CalendarPage')));
export const KanbanPage = Loadable(lazy(() => import('../pages/dashboard/KanbanPage')));

export const SalesRecords = Loadable(lazy(() => import('../pages/dashboard/SalesRecords')));

export const ItemCreatePage = Loadable(lazy(() => import('../pages/dashboard/CreateItemPage')));
export const ItemListPage = Loadable(lazy(() => import('../pages/dashboard/ItemListPage')));
export const ItemEditPage = Loadable(lazy(() => import('../pages/dashboard/ItemEditPage')));

export const RoleCreatePage = Loadable(lazy(() => import('../pages/dashboard/CreateRolePage')));
export const RoleListPage = Loadable(lazy(() => import('../pages/dashboard/RoleListPage')));
export const RoleEditPage = Loadable(lazy(() => import('../pages/dashboard/RoleEditPage')));

export const SalaryListPage = Loadable(lazy(() => import('../pages/dashboard/SalaryListPage')));

export const AppointmentListPage = Loadable(
  lazy(() => import('../pages/dashboard/AppointmentListPage'))
);

export const PaymentCreatePage = Loadable(
  lazy(() => import('../pages/dashboard/CreatePaymentPage'))
);
export const PaymentListPage = Loadable(lazy(() => import('../pages/dashboard/PaymentListPage')));
export const PaymentEditPage = Loadable(lazy(() => import('../pages/dashboard/PaymentEditPage')));
export const AnalyticsPage = Loadable(lazy(() => import('../pages/dashboard/AnalyticsPage')));
export const SalesReportPage = Loadable(lazy(() => import('../pages/dashboard/SalesReportPage')));
export const CardViewPage = Loadable(lazy(() => import('../pages/dashboard/CardViewPage')));
export const WiretransferCreatePage = Loadable(lazy(() => import('../pages/dashboard/WireTranserCreatePage')));
export const PayRunListPage = Loadable(lazy(() => import('../pages/dashboard/PayrunListPage')));

export const CategoryCreatePage = Loadable(
  lazy(() => import('../pages/dashboard/CreateCategoryPage'))
);
export const CategoryListPage = Loadable(lazy(() => import('../pages/dashboard/CategoryListPage')));
export const CategoryEditPage = Loadable(lazy(() => import('../pages/dashboard/CategoryEditPage')));

export const CustomerCreatePage = Loadable(
  lazy(() => import('../pages/dashboard/CreateCustomerPage'))
);
export const CustomerListPage = Loadable(lazy(() => import('../pages/dashboard/CustomerListPage')));
export const CustomerEditPage = Loadable(lazy(() => import('../pages/dashboard/CustomerEditPage')));

export const EmployeeCreatePage = Loadable(
  lazy(() => import('../pages/dashboard/CreateEmployeePage'))
);
export const EmployeeListPage = Loadable(lazy(() => import('../pages/dashboard/EmployeeListPage')));
export const EmployeeEditPage = Loadable(lazy(() => import('../pages/dashboard/EmployeeEditPage')));

export const CusloyaltyCreatePage = Loadable(
  lazy(() => import('../pages/dashboard/CreateCusloyaltyPage'))
);
export const CusloyaltyListPage = Loadable(
  lazy(() => import('../pages/dashboard/CusloyaltyListPage'))
);
export const CusloyaltyEditPage = Loadable(
  lazy(() => import('../pages/dashboard/CusloyaltyEditPage'))
);
// TEST RENDER PAGE BY ROLE
export const PermissionDeniedPage = Loadable(
  lazy(() => import('../pages/dashboard/PermissionDeniedPage'))
);

// BLANK PAGE
export const BlankPage = Loadable(lazy(() => import('../pages/dashboard/BlankPage')));

// MAIN
export const Page500 = Loadable(lazy(() => import('../pages/Page500')));
export const Page403 = Loadable(lazy(() => import('../pages/Page403')));
export const Page404 = Loadable(lazy(() => import('../pages/Page404')));
export const HomePage = Loadable(lazy(() => import('../pages/HomePage')));
export const FaqsPage = Loadable(lazy(() => import('../pages/FaqsPage')));
export const AboutPage = Loadable(lazy(() => import('../pages/AboutPage')));
export const Contact = Loadable(lazy(() => import('../pages/ContactPage')));
export const PricingPage = Loadable(lazy(() => import('../pages/PricingPage')));
export const ComingSoonPage = Loadable(lazy(() => import('../pages/ComingSoonPage')));
export const MaintenancePage = Loadable(lazy(() => import('../pages/MaintenancePage')));

// DEMO COMPONENTS
// ----------------------------------------------------------------------

export const ComponentsOverviewPage = Loadable(
  lazy(() => import('../pages/components/ComponentsOverviewPage'))
);

// FOUNDATION
export const FoundationColorsPage = Loadable(
  lazy(() => import('../pages/components/foundation/FoundationColorsPage'))
);
export const FoundationTypographyPage = Loadable(
  lazy(() => import('../pages/components/foundation/FoundationTypographyPage'))
);
export const FoundationShadowsPage = Loadable(
  lazy(() => import('../pages/components/foundation/FoundationShadowsPage'))
);
export const FoundationGridPage = Loadable(
  lazy(() => import('../pages/components/foundation/FoundationGridPage'))
);
export const FoundationIconsPage = Loadable(
  lazy(() => import('../pages/components/foundation/FoundationIconsPage'))
);

// MUI COMPONENTS
export const MUIAccordionPage = Loadable(
  lazy(() => import('../pages/components/mui/MUIAccordionPage'))
);
export const MUIAlertPage = Loadable(lazy(() => import('../pages/components/mui/MUIAlertPage')));
export const MUIAutocompletePage = Loadable(
  lazy(() => import('../pages/components/mui/MUIAutocompletePage'))
);
export const MUIAvatarPage = Loadable(lazy(() => import('../pages/components/mui/MUIAvatarPage')));
export const MUIBadgePage = Loadable(lazy(() => import('../pages/components/mui/MUIBadgePage')));
export const MUIBreadcrumbsPage = Loadable(
  lazy(() => import('../pages/components/mui/MUIBreadcrumbsPage'))
);
export const MUIButtonsPage = Loadable(
  lazy(() => import('../pages/components/mui/MUIButtonsPage'))
);
export const MUICheckboxPage = Loadable(
  lazy(() => import('../pages/components/mui/MUICheckboxPage'))
);
export const MUIChipPage = Loadable(lazy(() => import('../pages/components/mui/MUIChipPage')));
export const MUIDataGridPage = Loadable(
  lazy(() => import('../pages/components/mui/MUIDataGridPage'))
);
export const MUIDialogPage = Loadable(lazy(() => import('../pages/components/mui/MUIDialogPage')));
export const MUIListPage = Loadable(lazy(() => import('../pages/components/mui/MUIListPage')));
export const MUIMenuPage = Loadable(lazy(() => import('../pages/components/mui/MUIMenuPage')));
export const MUIPaginationPage = Loadable(
  lazy(() => import('../pages/components/mui/MUIPaginationPage'))
);
export const MUIPickersPage = Loadable(
  lazy(() => import('../pages/components/mui/MUIPickersPage'))
);
export const MUIPopoverPage = Loadable(
  lazy(() => import('../pages/components/mui/MUIPopoverPage'))
);
export const MUIProgressPage = Loadable(
  lazy(() => import('../pages/components/mui/MUIProgressPage'))
);
export const MUIRadioButtonsPage = Loadable(
  lazy(() => import('../pages/components/mui/MUIRadioButtonsPage'))
);
export const MUIRatingPage = Loadable(lazy(() => import('../pages/components/mui/MUIRatingPage')));
export const MUISliderPage = Loadable(lazy(() => import('../pages/components/mui/MUISliderPage')));
export const MUIStepperPage = Loadable(
  lazy(() => import('../pages/components/mui/MUIStepperPage'))
);
export const MUISwitchPage = Loadable(lazy(() => import('../pages/components/mui/MUISwitchPage')));
export const MUITablePage = Loadable(lazy(() => import('../pages/components/mui/MUITablePage')));
export const MUITabsPage = Loadable(lazy(() => import('../pages/components/mui/MUITabsPage')));
export const MUITextFieldPage = Loadable(
  lazy(() => import('../pages/components/mui/MUITextFieldPage'))
);
export const MUITimelinePage = Loadable(
  lazy(() => import('../pages/components/mui/MUITimelinePage'))
);
export const MUITooltipPage = Loadable(
  lazy(() => import('../pages/components/mui/MUITooltipPage'))
);
export const MUITransferListPage = Loadable(
  lazy(() => import('../pages/components/mui/MUITransferListPage'))
);
// export const MUITreesViewPage = Loadable(
//   lazy(() => import('../pages/components/mui/MUITreesViewPage'))
// );

// EXTRA
export const DemoAnimatePage = Loadable(
  lazy(() => import('../pages/components/extra/DemoAnimatePage'))
);
export const DemoCarouselsPage = Loadable(
  lazy(() => import('../pages/components/extra/DemoCarouselsPage'))
);
export const DemoChartsPage = Loadable(
  lazy(() => import('../pages/components/extra/DemoChartsPage'))
);
export const DemoCopyToClipboardPage = Loadable(
  lazy(() => import('../pages/components/extra/DemoCopyToClipboardPage'))
);
export const DemoEditorPage = Loadable(
  lazy(() => import('../pages/components/extra/DemoEditorPage'))
);
export const DemoFormValidationPage = Loadable(
  lazy(() => import('../pages/components/extra/DemoFormValidationPage'))
);
export const DemoImagePage = Loadable(
  lazy(() => import('../pages/components/extra/DemoImagePage'))
);
export const DemoLabelPage = Loadable(
  lazy(() => import('../pages/components/extra/DemoLabelPage'))
);
export const DemoLightboxPage = Loadable(
  lazy(() => import('../pages/components/extra/DemoLightboxPage'))
);
export const DemoMapPage = Loadable(lazy(() => import('../pages/components/extra/DemoMapPage')));
export const DemoMegaMenuPage = Loadable(
  lazy(() => import('../pages/components/extra/DemoMegaMenuPage'))
);
export const DemoMultiLanguagePage = Loadable(
  lazy(() => import('../pages/components/extra/DemoMultiLanguagePage'))
);
export const DemoNavigationBarPage = Loadable(
  lazy(() => import('../pages/components/extra/DemoNavigationBarPage'))
);
export const DemoOrganizationalChartPage = Loadable(
  lazy(() => import('../pages/components/extra/DemoOrganizationalChartPage'))
);
export const DemoScrollbarPage = Loadable(
  lazy(() => import('../pages/components/extra/DemoScrollbarPage'))
);
export const DemoSnackbarPage = Loadable(
  lazy(() => import('../pages/components/extra/DemoSnackbarPage'))
);
export const DemoTextMaxLinePage = Loadable(
  lazy(() => import('../pages/components/extra/DemoTextMaxLinePage'))
);
export const DemoUploadPage = Loadable(
  lazy(() => import('../pages/components/extra/DemoUploadPage'))
);
export const DemoMarkdownPage = Loadable(
  lazy(() => import('../pages/components/extra/DemoMarkdownPage'))
);
