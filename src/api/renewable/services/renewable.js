'use strict';

/**
 * renewable service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::renewable.renewable');
