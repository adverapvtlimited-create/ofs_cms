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
        'https://ofs-git-feat-crm-adverapvtlimited-creates-projects.vercel.app',
<<<<<<< HEAD
	'https://www.ofsworld.com',
	'https://ofsworls.com',
	'https://ofs-nine.vercel.app'
      ],
=======
        'https://www.ofsworld.com',
        'https://ofsworls.com',
        'https://ofs-nine.vercel.app'
      ],,
>>>>>>> 6267215a7e875bd0df19b30c7e1b57c221875f8a
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
