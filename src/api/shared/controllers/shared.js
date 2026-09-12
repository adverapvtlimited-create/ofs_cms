'use strict';

/**
 * shared controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::shared.shared');
