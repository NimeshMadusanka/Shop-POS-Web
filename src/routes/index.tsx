import { Navigate, useRoutes } from 'react-router-dom';
// auth
import AuthGuard from '../auth/AuthGuard';
import GuestGuard from '../auth/GuestGuard';
// layouts
// import MainLayout from '../layouts/main';
import SimpleLayout from '../layouts/simple';
import CompactLayout from '../layouts/compact';
import DashboardLayout from '../layouts/dashboard';
// config
import { PATH_AFTER_LOGIN } from '../config-global';
import { PATH_AFTER_SIGNUP } from '../config-global';
//
import {
  // Auth
  LoginPage,
  ForgotPasswordForm,
  ChangePassword,
  // Dashboard: General
  GeneralAppPage,
  GeneralFilePage,
  GeneralBankingPage,
  GeneralEcommercePage,
  GeneralAnalyticsPage,
  BookingListPage,
  // Dashboard: User
  UserListPage,
  UserEditPage,
  UserCardsPage,
  UserCreatePage,
  UserProfilePage,
  UserAccountPage,
  // Dashboard: Profile
  UpdateProfilePage,
  UpdateSetting,
  UpdateUploadSettingPage,
  // Dashboard: FileManager
  FileManagerPage,
  // Dashboard: App
  ChatPage,
  MailPage,
  CalendarPage,
  KanbanPage,
  //
  BlankPage,
  PermissionDeniedPage,
  //
  Page500,
  Page403,
  Page404,
  // HomePage,
  FaqsPage,
  AboutPage,
  Contact,
  PricingPage,
  ComingSoonPage,
  MaintenancePage,
  //
  ComponentsOverviewPage,
  FoundationColorsPage,
  FoundationTypographyPage,
  FoundationShadowsPage,
  FoundationGridPage,
  FoundationIconsPage,
  //
  MUIAccordionPage,
  MUIAlertPage,
  MUIAutocompletePage,
  MUIAvatarPage,
  MUIBadgePage,
  MUIBreadcrumbsPage,
  MUIButtonsPage,
  MUICheckboxPage,
  MUIChipPage,
  MUIDataGridPage,
  MUIDialogPage,
  MUIListPage,
  MUIMenuPage,
  MUIPaginationPage,
  MUIPickersPage,
  MUIPopoverPage,
  MUIProgressPage,
  MUIRadioButtonsPage,
  MUIRatingPage,
  MUISliderPage,
  MUIStepperPage,
  MUISwitchPage,
  MUITablePage,
  MUITabsPage,
  MUITextFieldPage,
  MUITimelinePage,
  MUITooltipPage,
  MUITransferListPage,
  // MUITreesViewPage,
  //
  DemoAnimatePage,
  DemoCarouselsPage,
  DemoChartsPage,
  DemoCopyToClipboardPage,
  DemoEditorPage,
  DemoFormValidationPage,
  DemoImagePage,
  DemoLabelPage,
  DemoLightboxPage,
  DemoMapPage,
  DemoMegaMenuPage,
  DemoMultiLanguagePage,
  DemoNavigationBarPage,
  DemoOrganizationalChartPage,
  DemoScrollbarPage,
  DemoSnackbarPage,
  DemoTextMaxLinePage,
  DemoUploadPage,
  DemoMarkdownPage,
  ItemCreatePage,
  ItemListPage,
  ItemEditPage,
  // CUSTOMER SECTION - COMMENTED OUT
  // CustomerCreatePage,
  // CustomerListPage,
  // CustomerEditPage,
  // HR-RELATED FEATURE - COMMENTED OUT
  // EmployeeCreatePage,
  // EmployeeListPage,
  // EmployeeEditPage,
  CategoryCreatePage,
  CategoryListPage,
  CategoryEditPage,
  // ROLE SECTION - COMMENTED OUT
  // RoleCreatePage,
  // RoleListPage,
  // RoleEditPage,
  PaymentCreatePage,
  PaymentListPage,
  PaymentEditPage,
  AnalyticsPage,
  CardViewPage,
  WiretransferCreatePage,
  CusloyaltyCreatePage,
  CusloyaltyListPage,
  CusloyaltyEditPage,
  // HR-RELATED FEATURE - COMMENTED OUT
  // AppointmentListPage,
  // PayRunListPage,
  // SalaryListPage,
  SignUpPage,
} from './elements';

// ----------------------------------------------------------------------

export default function Router() {
  return useRoutes([
    // Auth
    {
      path: 'auth',
      children: [
        {
          path: 'login',
          element: (
            <GuestGuard>
              <LoginPage />
            </GuestGuard>
          ),
          children: [{ element: <Navigate to={PATH_AFTER_SIGNUP} replace />, index: true }],
        },
        {
          path: 'sign-up',
          element: (
            <GuestGuard>
              <SignUpPage />
            </GuestGuard>
          ),
        },
        { path: 'login-unprotected', element: <LoginPage /> },
        { path: 'forgot-password', element: <ForgotPasswordForm /> },
        { path: 'changePassword', element: <ChangePassword /> },
      ],
    },

    // Dashboard
    {
      path: 'dashboard',
      element: (
        <AuthGuard>
          <DashboardLayout />
        </AuthGuard>
      ),
      children: [
        { element: <Navigate to={PATH_AFTER_LOGIN} replace />, index: true },
        { path: 'app', element: <GeneralAppPage /> },
        { path: 'ecommerce', element: <GeneralEcommercePage /> },
        { path: 'analytics', element: <GeneralAnalyticsPage /> },
        { path: 'booking', element: <BookingListPage /> },
        { path: 'banking', element: <GeneralBankingPage /> },
        { path: 'file', element: <GeneralFilePage /> },
        {
          path: 'user',
          children: [
            { element: <Navigate to="/dashboard/user/list" replace />, index: true },
            { path: 'profile', element: <UserProfilePage /> },
            { path: 'cards', element: <UserCardsPage /> },
            { path: 'list', element: <UserListPage /> },
            { path: 'new', element: <UserCreatePage /> },
            { path: ':name/edit', element: <UserEditPage /> },
            { path: 'account', element: <UserAccountPage /> },
          ],
        },
        // UPDATE
        // Profile
        {
          path: 'profile',
          children: [{ path: 'new', element: <UpdateProfilePage /> }],
        },
        // setting
        {
          path: 'setting',
          children: [{ path: 'new', element: <UpdateSetting /> }],
        },
        {
          path: 'uploadSetting',
          children: [{ path: 'new', element: <UpdateUploadSettingPage /> }],
        },
        // cruds
        // {
        //   path: 'sales',
        //   element: <SalesRecords />,
        // },
        {
          path: 'item',
          children: [
            { path: 'new', element: <ItemCreatePage /> },
            { path: 'list', element: <ItemListPage /> },
            { path: ':name/edit', element: <ItemEditPage /> },
          ],
        },

        // CUSTOMER SECTION - COMMENTED OUT
        // {
        //   path: 'customer',
        //   children: [
        //     { path: 'new', element: <CustomerCreatePage /> },
        //     { path: 'list', element: <CustomerListPage /> },
        //     { path: ':name/edit', element: <CustomerEditPage /> },
        //   ],
        // },
        // HR-RELATED FEATURE - COMMENTED OUT
        // {
        //   path: 'appointment',
        //   children: [{ path: 'list', element: <AppointmentListPage /> }],
        // },

        // HR-RELATED FEATURE - COMMENTED OUT
        // {
        //   path: 'payrun',
        //   children: [{ path: 'list', element: <PayRunListPage /> }],
        // },

        // {
        //   path: 'employee',
        //   children: [
        //     { path: 'new', element: <EmployeeCreatePage /> },
        //     { path: 'list', element: <EmployeeListPage /> },
        //     { path: ':name/edit', element: <EmployeeEditPage /> },
        //   ],
        // },
        {
          path: 'cusloyalty',
          children: [
            { path: 'new', element: <CusloyaltyCreatePage /> },
            { path: 'list', element: <CusloyaltyListPage /> },
            { path: ':name/edit', element: <CusloyaltyEditPage /> },
          ],
        },

        {
          path: 'category',
          children: [
            { path: 'new', element: <CategoryCreatePage /> },
            { path: 'list', element: <CategoryListPage /> },
            { path: ':name/edit', element: <CategoryEditPage /> },
          ],
        },
        // ROLE SECTION - COMMENTED OUT
        // {
        //   path: 'role',
        //   children: [
        //     { path: 'new', element: <RoleCreatePage /> },
        //     { path: 'list', element: <RoleListPage /> },
        //     { path: ':name/edit', element: <RoleEditPage /> },
        //   ],
        // },

        {
          path: 'payment',
          children: [
            { path: 'new', element: <PaymentCreatePage /> },
            { path: 'list', element: <PaymentListPage /> },
             { path: 'listnew', element: <CardViewPage /> },
               { path: 'wiretransfer', element: <WiretransferCreatePage /> },
            { path: ':name/edit', element: <PaymentEditPage /> },
          ],
        },
        {
          path: 'analytics',
          children: [
            { path: 'list', element: <AnalyticsPage /> },
          ],
        },

        // HR-RELATED FEATURE - COMMENTED OUT
        // {
        //   path: 'salary',
        //   children: [{ path: 'list', element: <SalaryListPage /> }],
        // },

        {
          path: 'billing',
          children: [
            { element: <Navigate to="/dashboard/billing/list" replace />, index: true },
            { path: 'profile', element: <UserProfilePage /> },
            { path: 'cards', element: <UserCardsPage /> },
            // { path: 'list', element: <TopupListPage /> },
            // { path: 'new', element: <TopupCreatePage /> },
            { path: ':name/edit', element: <UserEditPage /> },
            { path: 'account', element: <UserAccountPage /> },
          ],
        },

        {
          path: 'blog',
          children: [{ element: <Navigate to="/dashboard/blog/posts" replace />, index: true }],
        },
        { path: 'files-manager', element: <FileManagerPage /> },
        {
          path: 'mail',
          children: [
            { element: <Navigate to="/dashboard/mail/all" replace />, index: true },
            { path: 'label/:customLabel', element: <MailPage /> },
            { path: 'label/:customLabel/:mailId', element: <MailPage /> },
            { path: ':systemLabel', element: <MailPage /> },
            { path: ':systemLabel/:mailId', element: <MailPage /> },
          ],
        },
        {
          path: 'chat',
          children: [
            { element: <ChatPage />, index: true },
            { path: 'new', element: <ChatPage /> },
            { path: ':conversationKey', element: <ChatPage /> },
          ],
        },
        { path: 'calendar', element: <CalendarPage /> },
        { path: 'kanban', element: <KanbanPage /> },
        { path: 'permission-denied', element: <PermissionDeniedPage /> },
        { path: 'blank', element: <BlankPage /> },
      ],
    },

    // Main Routes
    {
      element: (
        <AuthGuard>
          <DashboardLayout />
        </AuthGuard>
      ),
      children: [
        { element: <Navigate to={PATH_AFTER_LOGIN} replace />, index: true },
        { path: 'about-us', element: <AboutPage /> },
        { path: 'contact-us', element: <Contact /> },
        { path: 'faqs', element: <FaqsPage /> },
        // Demo Components
        {
          path: 'components',
          children: [
            { element: <ComponentsOverviewPage />, index: true },
            {
              path: 'foundation',
              children: [
                { element: <Navigate to="/components/foundation/colors" replace />, index: true },
                { path: 'colors', element: <FoundationColorsPage /> },
                { path: 'typography', element: <FoundationTypographyPage /> },
                { path: 'shadows', element: <FoundationShadowsPage /> },
                { path: 'grid', element: <FoundationGridPage /> },
                { path: 'icons', element: <FoundationIconsPage /> },
              ],
            },
            {
              path: 'mui',
              children: [
                { element: <Navigate to="/components/mui/accordion" replace />, index: true },
                { path: 'accordion', element: <MUIAccordionPage /> },
                { path: 'alert', element: <MUIAlertPage /> },
                { path: 'autocomplete', element: <MUIAutocompletePage /> },
                { path: 'avatar', element: <MUIAvatarPage /> },
                { path: 'badge', element: <MUIBadgePage /> },
                { path: 'breadcrumbs', element: <MUIBreadcrumbsPage /> },
                { path: 'buttons', element: <MUIButtonsPage /> },
                { path: 'checkbox', element: <MUICheckboxPage /> },
                { path: 'chip', element: <MUIChipPage /> },
                { path: 'data-grid', element: <MUIDataGridPage /> },
                { path: 'dialog', element: <MUIDialogPage /> },
                { path: 'list', element: <MUIListPage /> },
                { path: 'menu', element: <MUIMenuPage /> },
                { path: 'pagination', element: <MUIPaginationPage /> },
                { path: 'pickers', element: <MUIPickersPage /> },
                { path: 'popover', element: <MUIPopoverPage /> },
                { path: 'progress', element: <MUIProgressPage /> },
                { path: 'radio-button', element: <MUIRadioButtonsPage /> },
                { path: 'rating', element: <MUIRatingPage /> },
                { path: 'slider', element: <MUISliderPage /> },
                { path: 'stepper', element: <MUIStepperPage /> },
                { path: 'switch', element: <MUISwitchPage /> },
                { path: 'table', element: <MUITablePage /> },
                { path: 'tabs', element: <MUITabsPage /> },
                { path: 'textfield', element: <MUITextFieldPage /> },
                { path: 'timeline', element: <MUITimelinePage /> },
                { path: 'tooltip', element: <MUITooltipPage /> },
                { path: 'transfer-list', element: <MUITransferListPage /> },
                // { path: 'tree-view', element: <MUITreesViewPage /> },
              ],
            },
            {
              path: 'extra',
              children: [
                { element: <Navigate to="/components/extra/animate" replace />, index: true },
                { path: 'animate', element: <DemoAnimatePage /> },
                { path: 'carousel', element: <DemoCarouselsPage /> },
                { path: 'chart', element: <DemoChartsPage /> },
                { path: 'copy-to-clipboard', element: <DemoCopyToClipboardPage /> },
                { path: 'editor', element: <DemoEditorPage /> },
                { path: 'form-validation', element: <DemoFormValidationPage /> },
                { path: 'image', element: <DemoImagePage /> },
                { path: 'label', element: <DemoLabelPage /> },
                { path: 'lightbox', element: <DemoLightboxPage /> },
                { path: 'map', element: <DemoMapPage /> },
                { path: 'mega-menu', element: <DemoMegaMenuPage /> },
                { path: 'multi-language', element: <DemoMultiLanguagePage /> },
                { path: 'navigation-bar', element: <DemoNavigationBarPage /> },
                { path: 'organization-chart', element: <DemoOrganizationalChartPage /> },
                { path: 'scroll', element: <DemoScrollbarPage /> },
                { path: 'snackbar', element: <DemoSnackbarPage /> },
                { path: 'text-max-line', element: <DemoTextMaxLinePage /> },
                { path: 'upload', element: <DemoUploadPage /> },
                { path: 'markdown', element: <DemoMarkdownPage /> },
              ],
            },
          ],
        },
      ],
    },
    {
      element: <SimpleLayout />,
      children: [{ path: 'pricing', element: <PricingPage /> }],
    },
    {
      element: <CompactLayout />,
      children: [
        { path: 'coming-soon', element: <ComingSoonPage /> },
        { path: 'maintenance', element: <MaintenancePage /> },
        { path: '500', element: <Page500 /> },
        { path: '404', element: <Page404 /> },
        { path: '403', element: <Page403 /> },
      ],
    },
    { path: '*', element: <Navigate to="/404" replace /> },
  ]);
}
