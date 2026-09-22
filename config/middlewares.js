module.exports = [
  'strapi::logger',
  'strapi::errors',
  'strapi::security',

  {
    name: 'strapi::cors',
    config: {
      origin: [
        'https://ofsgroupindia.in',
        'https://www.ofsgroupindia.in',
        'https://ofs-git-feat-crm-adverapvtlimited-creates-projects.vercel.app'
      ],
      credentials: true,
    },
  },

  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];