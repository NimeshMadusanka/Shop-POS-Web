// ----------------------------------------------------------------------

function path(root: string, sublink: string) {
  return `${root}${sublink}`;
}

const ROOTS_AUTH = '/auth';
export const ROOTS_DASHBOARD = '/dashboard';

// ----------------------------------------------------------------------

export const PATH_AUTH = {
  root: ROOTS_DASHBOARD,
  login: path(ROOTS_AUTH, '/login'),
  forgotpassword: path(ROOTS_AUTH, '/forgot-password'),
  changepassword: path(ROOTS_AUTH, '/changePassword'),
  companycreation: path(ROOTS_AUTH, '/company-creation'),
  // companylist: path(ROOTS_AUTH, '/company-list'),
  // companyedit: path(ROOTS_AUTH, '/company-edit'),
  register: path(ROOTS_AUTH, '/register'),
  signUp: path(ROOTS_AUTH, '/sign-up'),
  loginUnprotected: path(ROOTS_AUTH, '/login-unprotected'),
  registerUnprotected: path(ROOTS_AUTH, '/register-unprotected'),
  verify: path(ROOTS_AUTH, '/verify'),
  resetPassword: path(ROOTS_AUTH, '/reset-password'),
  newPassword: path(ROOTS_AUTH, '/new-password'),
  company: {
    root: path(ROOTS_AUTH, '/company'),
    new: path(ROOTS_AUTH, '/company/new'),
    list: path(ROOTS_AUTH, '/company/list'),
    edit: (name: string) => path(ROOTS_AUTH, `/company/${name}/edit`),
  },
};

export const PATH_PAGE = {
  comingSoon: '/coming-soon',
  maintenance: '/maintenance',
  pricing: '/pricing',
  payment: '/payment',
  about: '/about-us',
  contact: '/contact-us',
  faqs: '/faqs',
  page403: '/403',
  page404: '/404',
  page500: '/500',
  components: '/components',
};

export const PATH_DASHBOARD = {
  root: ROOTS_DASHBOARD,
  kanban: path(ROOTS_DASHBOARD, '/kanban'),
  calendar: path(ROOTS_DASHBOARD, '/calendar'),
  fileManager: path(ROOTS_DASHBOARD, '/files-manager'),
  permissionDenied: path(ROOTS_DASHBOARD, '/permission-denied'),
  blank: path(ROOTS_DASHBOARD, '/blank'),
  general: {
    dachboard: path(ROOTS_DASHBOARD, '/analytics'),
    booking: path(ROOTS_DASHBOARD, '/booking'),
    // app: path(ROOTS_DASHBOARD, '/app'),
    // ecommerce: path(ROOTS_DASHBOARD, '/ecommerce'),
    // analytics: path(ROOTS_DASHBOARD, '/analytics'),
    // banking: path(ROOTS_DASHBOARD, '/banking'),
    // file: path(ROOTS_DASHBOARD, '/file'),
  },
  mail: {
    root: path(ROOTS_DASHBOARD, '/mail'),
    all: path(ROOTS_DASHBOARD, '/mail/all'),
  },
  sales: {
    root: path(ROOTS_DASHBOARD, '/sales'),
  },
  chat: {
    root: path(ROOTS_DASHBOARD, '/chat'),
    new: path(ROOTS_DASHBOARD, '/chat/new'),
    view: (name: string) => path(ROOTS_DASHBOARD, `/chat/${name}`),
  },
  user: {
    root: path(ROOTS_DASHBOARD, '/user'),
    new: path(ROOTS_DASHBOARD, '/user/new'),
    list: path(ROOTS_DASHBOARD, '/user/list'),
    create: path(ROOTS_DASHBOARD, '/user/create'),
    cards: path(ROOTS_DASHBOARD, '/user/cards'),
    profile: path(ROOTS_DASHBOARD, '/user/profile'),
    account: path(ROOTS_DASHBOARD, '/user/account'),
    edit: (name: string) => path(ROOTS_DASHBOARD, `/user/${name}/edit`),
    demoEdit: path(ROOTS_DASHBOARD, `/user/reece-chung/edit`),
  },
  // UPDATE
  item: {
    root: path(ROOTS_DASHBOARD, '/item'),
    new: path(ROOTS_DASHBOARD, '/item/new'),
    list: path(ROOTS_DASHBOARD, '/item/list'),
    edit: (name: string) => path(ROOTS_DASHBOARD, `/item/${name}/edit`),
  },

  customer: {
    root: path(ROOTS_DASHBOARD, '/customer'),
    new: path(ROOTS_DASHBOARD, '/customer/new'),
    list: path(ROOTS_DASHBOARD, '/customer/list'),
    edit: (name: string) => path(ROOTS_DASHBOARD, `/customer/${name}/edit`),
  },

  appointment: {
    root: path(ROOTS_DASHBOARD, '/appointment'),
    new: path(ROOTS_DASHBOARD, '/appointment/new'),
    list: path(ROOTS_DASHBOARD, '/appointment/list'),
    edit: (name: string) => path(ROOTS_DASHBOARD, `/appointment/${name}/edit`),
  },

  salary: {
    root: path(ROOTS_DASHBOARD, '/salary'),
    new: path(ROOTS_DASHBOARD, '/salary/new'),
    list: path(ROOTS_DASHBOARD, '/salary/list'),
    // edit: (name: string) => path(ROOTS_DASHBOARD, `/appointment/${name}/edit`),
  },

  employee: {
    root: path(ROOTS_DASHBOARD, '/employee'),
    new: path(ROOTS_DASHBOARD, '/employee/new'),
    list: path(ROOTS_DASHBOARD, '/employee/list'),
    edit: (name: string) => path(ROOTS_DASHBOARD, `/employee/${name}/edit`),
  },
 cusloyalty: {
    root: path(ROOTS_DASHBOARD, '/cusloyalty'),
    new: path(ROOTS_DASHBOARD, '/cusloyalty/new'),
    list: path(ROOTS_DASHBOARD, '/cusloyalty/list'),
    edit: (name: string) => path(ROOTS_DASHBOARD, `/cusloyalty/${name}/edit`),
  },

  role: {
    root: path(ROOTS_DASHBOARD, '/role'),
    new: path(ROOTS_DASHBOARD, '/role/new'),
    list: path(ROOTS_DASHBOARD, '/role/list'),
    edit: (name: string) => path(ROOTS_DASHBOARD, `/role/${name}/edit`),
  },

payrun: {
    root: path(ROOTS_DASHBOARD, '/payrun'),
    new: path(ROOTS_DASHBOARD, '/payrun/new'),
    list: path(ROOTS_DASHBOARD, '/payrun/list'),
    // edit: (name: string) => path(ROOTS_DASHBOARD, `/role/${name}/edit`),
  },


  payment: {
    root: path(ROOTS_DASHBOARD, '/payment'),
    new: path(ROOTS_DASHBOARD, '/payment/new'),
    list: path(ROOTS_DASHBOARD, '/payment/list'),
        listnew: path(ROOTS_DASHBOARD, '/payment/listnew'),
          wiretransfer: path(ROOTS_DASHBOARD, '/payment/wiretransfer'),
    edit: (name: string) => path(ROOTS_DASHBOARD, `/payment/${name}/edit`),
  },
  analytics: {
    root: path(ROOTS_DASHBOARD, '/analytics'),
    list: path(ROOTS_DASHBOARD, '/analytics/list'),
  },
  salesReport: {
    root: path(ROOTS_DASHBOARD, '/sales-report'),
    list: path(ROOTS_DASHBOARD, '/sales-report/list'),
  },

  category: {
    root: path(ROOTS_DASHBOARD, '/category'),
    new: path(ROOTS_DASHBOARD, '/category/new'),
    list: path(ROOTS_DASHBOARD, '/category/list'),
    edit: (name: string) => path(ROOTS_DASHBOARD, `/category/${name}/edit`),
  },
  invoice: {
    root: path(ROOTS_DASHBOARD, '/invoice'),
    new: path(ROOTS_DASHBOARD, '/invoice/new'),
    create: path(ROOTS_DASHBOARD, '/invoice/create'),
    list: path(ROOTS_DASHBOARD, '/invoice/list'),
    details: path(ROOTS_DASHBOARD, '/invoice/details'),
    stockin: path(ROOTS_DASHBOARD, '/invoice/stockin'),
    final: path(ROOTS_DASHBOARD, '/invoice/final'),
     finalnew: path(ROOTS_DASHBOARD, '/invoice/finalnew'),
    edit: (name: string) => path(ROOTS_DASHBOARD, `/invoice/${name}/edit`),
  },
 
 

 
 


  

 

  

  assesment: {
    list: path(ROOTS_DASHBOARD, '/assesment/list'),
  },

  profile: {
    new: path(ROOTS_DASHBOARD, '/profile/new'),
  },
  about: {
    new: path(ROOTS_DASHBOARD, '/about/new'),
  },
  welcomeText: {
    new: path(ROOTS_DASHBOARD, '/welcomeText/new'),
  },
  chooseUs: {
    new: path(ROOTS_DASHBOARD, '/chooseUs/new'),
  },
  exclusiveDeals: {
    new: path(ROOTS_DASHBOARD, '/exclusiveDeals/new'),
  },
  hotelInfo: {
    new: path(ROOTS_DASHBOARD, '/hotelInfo/new'),
  },
  hotelFeature: {
    new: path(ROOTS_DASHBOARD, '/hotelFeature/new'),
  },
  gallery: {
    new: path(ROOTS_DASHBOARD, '/gallery/new'),
  },
  youTube: {
    new: path(ROOTS_DASHBOARD, '/youTube/new'),
  },
  billing: {
    root: path(ROOTS_DASHBOARD, '/billing'),
    new: path(ROOTS_DASHBOARD, '/billing/new'),
    list: path(ROOTS_DASHBOARD, '/billing/list'),
    cards: path(ROOTS_DASHBOARD, '/user/cards'),
    profile: path(ROOTS_DASHBOARD, '/user/profile'),
    account: path(ROOTS_DASHBOARD, '/user/account'),
    edit: (name: string) => path(ROOTS_DASHBOARD, `/user/${name}/edit`),
    demoEdit: path(ROOTS_DASHBOARD, `/user/reece-chung/edit`),
  },
  // invoice: {
  //   root: path(ROOTS_DASHBOARD, '/invoice'),
  //   create: path(ROOTS_DASHBOARD, '/invoice/create'),
  //   list: path(ROOTS_DASHBOARD, '/invoice/list'),
  //   new: path(ROOTS_DASHBOARD, '/invoice/new'),
  //   view: (id: string) => path(ROOTS_DASHBOARD, `/invoice/${id}`),
  //   edit: (id: string) => path(ROOTS_DASHBOARD, `/invoice/${id}/edit`),
  //   demoEdit: path(ROOTS_DASHBOARD, '/invoice/e99f09a7-dd88-49d5-b1c8-1daf80c2d7b1/edit'),
  //   demoView: path(ROOTS_DASHBOARD, '/invoice/e99f09a7-dd88-49d5-b1c8-1daf80c2d7b5'),
  // },
  blog: {
    root: path(ROOTS_DASHBOARD, '/blog'),
    posts: path(ROOTS_DASHBOARD, '/blog/posts'),
    new: path(ROOTS_DASHBOARD, '/blog/new'),
    view: (title: string) => path(ROOTS_DASHBOARD, `/blog/post/${title}`),
    demoView: path(ROOTS_DASHBOARD, '/blog/post/apply-these-7-secret-techniques-to-improve-event'),
  },
  setting: {
    root: path(ROOTS_DASHBOARD, '/setting'),
    list: path(ROOTS_DASHBOARD, '/setting/list'),
    new: path(ROOTS_DASHBOARD, '/setting/new'),
    view: (name: string) => path(ROOTS_DASHBOARD, `/setting/${name}`),
    edit: (name: string) => path(ROOTS_DASHBOARD, `/setting/${name}/edit`),
    demoEdit: path(ROOTS_DASHBOARD, '/setting/nike-blazer-low-77-vintage/edit'),
    demoView: path(ROOTS_DASHBOARD, '/setting/nike-air-force-1-ndestrukt'),
  },
  uploadSetting: {
    new: path(ROOTS_DASHBOARD, '/uploadSetting/new'),
  },
};

export const PATH_DOCS = {
  root: 'https://docs.minimals.cc',
  changelog: 'https://docs.minimals.cc/changelog',
};

export const PATH_ZONE_ON_STORE = 'https://mui.com/store/items/zone-landing-page/';

export const PATH_MINIMAL_ON_STORE = 'https://mui.com/store/items/minimal-dashboard/';

export const PATH_FREE_VERSION = 'https://mui.com/store/items/minimal-dashboard-free/';

export const PATH_FIGMA_PREVIEW =
  'https://www.figma.com/file/rWMDOkMZYw2VpTdNuBBCvN/%5BPreview%5D-Minimal-Web.26.11.22?node-id=0%3A1&t=ya2mDFiuhTXXLLF1-1';
