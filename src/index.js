'use strict';

const logger = require('./utils/logger');
const { createChildLogger, initProcessHandlers } = require('./utils/logger');
const { handleDocumentChange } = require('./utils/jsonSync');

// Initialize global process error handlers for uncaught exceptions & rejections
initProcessHandlers(logger);

const appLogger = createChildLogger('Strapi');
const docLogger = createChildLogger('DocumentMiddleware');
const eventLogger = createChildLogger('EventHub');

module.exports = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   */
  register({ strapi }) {
    appLogger.info('Registering Strapi v5 document middlewares and services...');

    // Expose Pino logger directly on strapi instance
    strapi.pino = logger;
    strapi.logger = logger;

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
        docLogger.debug(
          { action: context.action, uid: context.uid },
          'Document mutation detected; queueing JSON sync'
        );

        setImmediate(async () => {
          try {
            await handleDocumentChange(strapi, context.uid);
          } catch (err) {
            docLogger.error(
              {
                err,
                action: context.action,
                uid: context.uid,
              },
              `Document Middleware Sync Error: ${err.message}`
            );
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
    appLogger.info('Bootstrapping Strapi event listeners...');

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
          eventLogger.debug(
            { event: eventName, model: event.model },
            'Content entry event intercepted; queueing JSON sync'
          );

          setImmediate(async () => {
            try {
              const uid = event.model.startsWith('api::')
                ? event.model
                : `api::${event.model}.${event.model}`;
              await handleDocumentChange(strapi, uid);
            } catch (err) {
              eventLogger.error(
                {
                  err,
                  event: eventName,
                  model: event?.model,
                },
                `EventHub Sync Error: ${err.message}`
              );
            }
          });
        }
      });
    });

    appLogger.info('Strapi bootstrap completed successfully.');
  },

  /**
   * An asynchronous destroy function that runs before
   * your application gets terminated.
   */
  destroy({ strapi }) {
    appLogger.info('Strapi application shutting down gracefully.');
  },
};
