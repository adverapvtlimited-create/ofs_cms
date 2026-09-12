'use strict';

/**
 * shared service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::shared.shared');
