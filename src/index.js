'use strict';

const { handleDocumentChange } = require('./utils/jsonSync');

module.exports = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   */
  register({ strapi }) {
    // Strapi v5 Document Service Middleware
    strapi.documents.use(async (context, next) => {
      const result = await next();

      const mutatingActions = [
        'create',
        'update',
        'delete',
        'publish',
        'unpublish',
        'discardDraft',
      ];

      if (mutatingActions.includes(context.action)) {
        setImmediate(async () => {
          try {
            await handleDocumentChange(strapi, context.uid);
          } catch (err) {
            console.error('[Document Middleware Sync Error]:', err.message);
          }
        });
      }

      return result;
    });
  },

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   */
  bootstrap({ strapi }) {
    const events = [
      'entry.create',
      'entry.update',
      'entry.delete',
      'entry.publish',
      'entry.unpublish',
    ];

    events.forEach((eventName) => {
      strapi.eventHub.on(eventName, async (event) => {
        if (
          event?.model &&
          (event.model.includes('service') ||
            event.model.includes('offer') ||
            event.model.includes('product') ||
            event.model.includes('industry') ||
            event.model.includes('case-study') ||
            event.model.includes('blog-post') ||
            event.model.includes('job') ||
            event.model.includes('renewable') ||
            event.model.includes('site-config') ||
            event.model.includes('faq'))
        ) {
          setImmediate(async () => {
            try {
              const uid = event.model.startsWith('api::')
                ? event.model
                : `api::${event.model}.${event.model}`;
              await handleDocumentChange(strapi, uid);
            } catch (err) {
              console.error('[EventHub Sync Error]:', err.message);
            }
          });
        }
      });
    });
  },
};

