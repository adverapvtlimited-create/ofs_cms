const { Client } = require('pg');

const targetLayouts = {
  // 1. PRODUCT
  'plugin_content_manager_configuration_content_types::api::product.product': {
    edit: [
      [{ name: 'productId', size: 6 }, { name: 'slug', size: 6 }],
      [{ name: 'name', size: 6 }, { name: 'shortName', size: 6 }],
      [{ name: 'category', size: 6 }, { name: 'icon', size: 6 }],
      [{ name: 'heroImage', size: 12 }],
      [{ name: 'summary', size: 12 }],
      [{ name: 'description', size: 12 }],
      [{ name: 'keyPoints', size: 12 }],
      [{ name: 'catalogItems', size: 12 }],
      [{ name: 'seo', size: 12 }],
    ],
    list: ['id', 'productId', 'shortName', 'category', 'slug'],
  },

  // 2. INDUSTRY
  'plugin_content_manager_configuration_content_types::api::industry.industry': {
    edit: [
      [{ name: 'industryId', size: 6 }, { name: 'slug', size: 6 }],
      [{ name: 'name', size: 6 }, { name: 'shortName', size: 6 }],
      [{ name: 'icon', size: 6 }, { name: 'heroImage', size: 6 }],
      [{ name: 'tagline', size: 12 }],
      [{ name: 'summary', size: 12 }],
      [{ name: 'keySolutions', size: 12 }],
      [{ name: 'fullContentText', size: 12 }],
      [{ name: 'relatedService', size: 12 }],
      [{ name: 'subIndustries', size: 12 }],
      [{ name: 'seo', size: 12 }],
    ],
    list: ['id', 'industryId', 'name', 'shortName', 'slug'],
  },


  // 4. CASE STUDY
  'plugin_content_manager_configuration_content_types::api::case-study.case-study': {
    edit: [
      [{ name: 'caseStudyId', size: 6 }, { name: 'badge', size: 6 }],
      [{ name: 'title', size: 12 }],
      [{ name: 'clientIndustry', size: 6 }, { name: 'location', size: 6 }],
      [{ name: 'duration', size: 6 }, { name: 'heroImage', size: 6 }],
      [{ name: 'summary', size: 12 }],
      [{ name: 'challenge', size: 12 }],
      [{ name: 'solution', size: 12 }],
      [{ name: 'tags', size: 12 }],
      [{ name: 'metrics', size: 12 }],
      [{ name: 'seo', size: 12 }],
    ],
    list: ['id', 'caseStudyId', 'title', 'clientIndustry', 'badge'],
  },

  // 5. BLOG POST
  'plugin_content_manager_configuration_content_types::api::blog-post.blog-post': {
    edit: [
      [{ name: 'postId', size: 6 }, { name: 'slug', size: 6 }],
      [{ name: 'title', size: 12 }],
      [{ name: 'category', size: 4 }, { name: 'date', size: 4 }, { name: 'readTime', size: 4 }],
      [{ name: 'featured', size: 4 }, { name: 'image', size: 8 }],
      [{ name: 'excerpt', size: 12 }],
      [{ name: 'content', size: 12 }],
      [{ name: 'tags', size: 12 }],
      [{ name: 'author', size: 12 }],
      [{ name: 'seo', size: 12 }],
    ],
    list: ['id', 'postId', 'title', 'category', 'date', 'featured'],
  },

  // 6. JOB
  'plugin_content_manager_configuration_content_types::api::job.job': {
    edit: [
      [{ name: 'jobId', size: 6 }, { name: 'slug', size: 6 }],
      [{ name: 'title', size: 6 }, { name: 'department', size: 6 }],
      [{ name: 'location', size: 6 }, { name: 'type', size: 6 }],
      [{ name: 'experience', size: 6 }, { name: 'postedDate', size: 6 }],
      [{ name: 'description', size: 12 }],
      [{ name: 'responsibilities', size: 12 }],
      [{ name: 'requirements', size: 12 }],
      [{ name: 'benefits', size: 12 }],
    ],
    list: ['id', 'jobId', 'title', 'department', 'location', 'type'],
  },

  // 7. RENEWABLE
  'plugin_content_manager_configuration_content_types::api::renewable.renewable': {
    edit: [
      [{ name: 'title', size: 6 }, { name: 'tagline', size: 6 }],
      [{ name: 'heroDescription', size: 12 }],
      [{ name: 'heroBacking', size: 6 }, { name: 'heroBgImage', size: 6 }],
      [{ name: 'whyTag', size: 6 }, { name: 'whyTitle', size: 6 }],
      [{ name: 'whyDesc', size: 6 }, { name: 'whyImage', size: 6 }],
      [{ name: 'whyPills', size: 12 }],
      [{ name: 'approachTag', size: 6 }, { name: 'approachTitle', size: 6 }],
      [{ name: 'approachSubtitle', size: 12 }],
      [{ name: 'approachSteps', size: 12 }],
      [{ name: 'partnerTag', size: 6 }, { name: 'partnerTitle', size: 6 }],
      [{ name: 'partnerDesc', size: 6 }, { name: 'partnerBgImage', size: 6 }],
      [{ name: 'partnerCards', size: 12 }],
      [{ name: 'ctaTag', size: 6 }, { name: 'ctaTitle', size: 6 }],
      [{ name: 'ctaDesc', size: 6 }, { name: 'contactEmail', size: 6 }],
      [{ name: 'solutionsTag', size: 6 }, { name: 'solutionsTitle', size: 6 }],
      [{ name: 'solutionsDesc', size: 12 }],
      [{ name: 'solutions', size: 12 }],
    ],
  },

  // 8. FAQ
  'plugin_content_manager_configuration_content_types::api::faq.faq': {
    edit: [
      [{ name: 'question', size: 12 }],
      [{ name: 'answer', size: 12 }],
    ],
    list: ['id', 'question'],
  },

  // 9. OFFER
  'plugin_content_manager_configuration_content_types::api::offer.offer': {
    edit: [
      [{ name: 'slug', size: 6 }, { name: 'href', size: 6 }],
      [{ name: 'title', size: 6 }, { name: 'category', size: 6 }],
      [{ name: 'categoryLabel', size: 6 }, { name: 'heroImageUrl', size: 6 }],
      [{ name: 'heroImage', size: 12 }],
      [{ name: 'tagline', size: 12 }],
      [{ name: 'overviewTitle', size: 12 }],
      [{ name: 'description', size: 12 }],
      [{ name: 'overviewParagraphs', size: 12 }],
      [{ name: 'features', size: 12 }],
      [{ name: 'sections', size: 12 }],
      [{ name: 'gallery', size: 12 }],
      [{ name: 'blocks', size: 12 }],
    ],
    list: ['id', 'slug', 'title', 'category'],
  },

  // 10. SITE CONFIG
  'plugin_content_manager_configuration_content_types::api::site-config.site-config': {
    edit: [
      [{ name: 'name', size: 6 }, { name: 'shortName', size: 6 }],
      [{ name: 'legalName', size: 6 }, { name: 'usEntityName', size: 6 }],
      [{ name: 'tagline', size: 6 }, { name: 'headline', size: 6 }],
      [{ name: 'logo', size: 6 }, { name: 'logoDark', size: 6 }],
      [{ name: 'heroImage', size: 12 }],
      [{ name: 'shortDesc', size: 12 }],
      [{ name: 'description', size: 12 }],
      [{ name: 'longDesc', size: 12 }],
      [{ name: 'contact', size: 12 }],
      [{ name: 'stats', size: 12 }],
      [{ name: 'socials', size: 12 }],
      [{ name: 'certifications', size: 12 }],
    ],
  },

  // 11. ENQUIRY
  'plugin_content_manager_configuration_content_types::api::enquiry.enquiry': {
    edit: [
      [{ name: 'formType', size: 6 }, { name: 'requestStatus', size: 6 }],
      [{ name: 'name', size: 6 }, { name: 'email', size: 6 }],
      [{ name: 'phone', size: 6 }, { name: 'company', size: 6 }],
      [{ name: 'subjectOrRole', size: 6 }, { name: 'attachedFile', size: 6 }],
      [{ name: 'sourceUrl', size: 12 }],
      [{ name: 'message', size: 12 }],
    ],
    list: ['id', 'formType', 'name', 'email', 'requestStatus', 'createdAt'],
  },

  // ==========================================
  // COMPONENTS
  // ==========================================

  // products.catalog-item
  'plugin_content_manager_configuration_components::products.catalog-item': {
    edit: [
      [{ name: 'title', size: 6 }, { name: 'image', size: 6 }],
      [{ name: 'description', size: 12 }],
    ],
  },

  // industries.sub-industry
  'plugin_content_manager_configuration_components::industries.sub-industry': {
    edit: [
      [{ name: 'subId', size: 6 }, { name: 'slug', size: 6 }],
      [{ name: 'name', size: 6 }, { name: 'shortName', size: 6 }],
      [{ name: 'icon', size: 6 }, { name: 'heroImage', size: 6 }],
      [{ name: 'tagline', size: 12 }],
      [{ name: 'summary', size: 12 }],
      [{ name: 'keySolutions', size: 12 }],
      [{ name: 'fullContentText', size: 12 }],
    ],
  },

  // blog.author
  'plugin_content_manager_configuration_components::blog.author': {
    edit: [
      [{ name: 'name', size: 6 }, { name: 'role', size: 6 }],
      [{ name: 'avatar', size: 12 }],
    ],
  },

  // renewables.solution
  'plugin_content_manager_configuration_components::renewables.solution': {
    edit: [
      [{ name: 'solutionId', size: 6 }, { name: 'title', size: 6 }],
      [{ name: 'icon', size: 6 }, { name: 'image', size: 6 }],
      [{ name: 'bullets', size: 12 }],
    ],
  },

  // services.capability
  'plugin_content_manager_configuration_components::services.capability': {
    edit: [
      [{ name: 'title', size: 12 }],
      [{ name: 'description', size: 12 }],
    ],
  },

  // services.process-step
  'plugin_content_manager_configuration_components::services.process-step': {
    edit: [
      [{ name: 'step', size: 4 }, { name: 'title', size: 8 }],
      [{ name: 'desc', size: 12 }],
    ],
  },

  // shared.stat-metric
  'plugin_content_manager_configuration_components::shared.stat-metric': {
    edit: [
      [{ name: 'value', size: 6 }, { name: 'label', size: 6 }],
    ],
  },

  // shared.faq-item
  'plugin_content_manager_configuration_components::shared.faq-item': {
    edit: [
      [{ name: 'question', size: 12 }],
      [{ name: 'answer', size: 12 }],
    ],
  },

  // offers.content-block
  'plugin_content_manager_configuration_components::offers.content-block': {
    edit: [
      [{ name: 'title', size: 6 }, { name: 'variant', size: 6 }],
      [{ name: 'imagePosition', size: 6 }, { name: 'image', size: 6 }],
      [{ name: 'intro', size: 12 }],
      [{ name: 'paragraphs', size: 12 }],
      [{ name: 'items', size: 12 }],
    ],
  },
};

async function main() {
  const client = new Client({
    host: '127.0.0.1',
    port: 5432,
    user: 'advera',
    password: 'advera@123',
    database: 'OFS_cms',
  });

  await client.connect();
  console.log('Connected to PostgreSQL OFS_cms database.');

  for (const [key, layout] of Object.entries(targetLayouts)) {
    const res = await client.query(
      'SELECT value FROM strapi_core_store_settings WHERE key = $1',
      [key]
    );

    if (res.rows.length > 0) {
      const config = JSON.parse(res.rows[0].value);
      config.layouts = config.layouts || {};
      config.layouts.edit = layout.edit;
      if (layout.list) {
        config.layouts.list = layout.list;
      }

      await client.query(
        'UPDATE strapi_core_store_settings SET value = $1 WHERE key = $2',
        [JSON.stringify(config), key]
      );
      console.log(`✅ Updated layout for: ${key}`);
    } else {
      console.log(`ℹ️ Key not found in DB (will be created by Strapi if accessed): ${key}`);
    }
  }

  await client.end();
  console.log('\n🎉 ALL CONTENT MANAGER LAYOUTS RECONFIGURED ACCORDING TO DATA STRUCTURE!');
}

main().catch(console.error);