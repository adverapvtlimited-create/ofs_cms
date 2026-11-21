'use strict';

const fs = require('fs');
const path = require('path');
const { createChildLogger } = require('./logger');

const syncLogger = createChildLogger('JSONSync');
const DATA_DIR = path.resolve(__dirname, '../../../OFS/src/data');

/**
 * Resolves media object to url string or null
 */
function resolveMediaUrl(media) {
  if (!media) return null;
  if (Array.isArray(media)) {
    if (media.length === 0) return null;
    return resolveMediaUrl(media[0]);
  }
  if (typeof media === 'string') return media;
  return (
    media.url ||
    media.src?.url ||
    (typeof media.src === 'string' ? media.src : null) ||
    media.data?.attributes?.url ||
    media.data?.url ||
    media.formats?.large?.url ||
    media.formats?.medium?.url ||
    media.formats?.small?.url ||
    media.formats?.thumbnail?.url ||
    media.src?.formats?.large?.url ||
    media.src?.formats?.medium?.url ||
    media.src?.formats?.small?.url ||
    media.src?.formats?.thumbnail?.url ||
    null
  );
}

/**
 * Syncs Strapi api::offer.offer entries to OFS/src/data/offers.json
 */
async function syncOffers(strapi) {
  const startTime = Date.now();
  try {
    const documents = await strapi.documents('api::offer.offer').findMany({
      populate: {
        heroImage: true,
        blocks: {
          populate: {
            image: {
              populate: '*',
            },
            items: true,
          },
        },
      },
      limit: 100,
    });

    if (!documents || documents.length === 0) {
      syncLogger.debug('No offer documents found in Strapi to sync');
      return;
    }

    const offersFilePath = path.join(DATA_DIR, 'offers.json');
    let existingOffers = {};
    if (fs.existsSync(offersFilePath)) {
      try {
        existingOffers = JSON.parse(fs.readFileSync(offersFilePath, 'utf8'));
      } catch (parseErr) {
        syncLogger.warn({ err: parseErr, file: offersFilePath }, 'Failed to parse existing offers.json; will overwrite');
      }
    }

    const offersMap = { ...existingOffers };

    documents.forEach((item) => {
      const slug = item.slug;
      if (!slug) return;
      const prev = offersMap[slug] || {};

      offersMap[slug] = {
        id: slug,
        slug: slug,
        href: item.href || prev.href || `/${slug}`,
        title: item.title || prev.title || '',
        category: item.category || prev.category || 'services',
        categoryLabel: item.categoryLabel || prev.categoryLabel || 'Services',
        heroImage: resolveMediaUrl(item.heroImage) || item.heroImageUrl || prev.heroImage || null,
        tagline: item.tagline || prev.tagline || '',
        description: item.description || prev.description || '',
        overviewTitle: item.overviewTitle !== undefined ? item.overviewTitle : prev.overviewTitle,
        overviewParagraphs: item.overviewParagraphs !== undefined ? item.overviewParagraphs : prev.overviewParagraphs,
        features: item.features !== undefined ? item.features : prev.features,
        sections: item.sections !== undefined ? item.sections : prev.sections,
        gallery: item.gallery !== undefined ? item.gallery : prev.gallery,
        blocks: (item.blocks && item.blocks.length > 0)
          ? item.blocks.map((b, bIdx) => {
              const prevBlock =
                prev.blocks?.find(
                  (eb) =>
                    (b.title && eb.title && eb.title.trim().toLowerCase() === b.title.trim().toLowerCase()) ||
                    (b.type && eb.type && eb.type === b.type)
                ) || prev.blocks?.[bIdx] || {};

              const strapiImgUrl =
                resolveMediaUrl(b.image?.src) ||
                resolveMediaUrl(b.image) ||
                resolveMediaUrl(b.imageUrl) ||
                null;

              const existingImgUrl =
                typeof prevBlock.image === 'string'
                  ? prevBlock.image
                  : prevBlock.image?.src || null;

              const finalImgSrc = strapiImgUrl || existingImgUrl || null;
              const finalImgAlt = b.imageAlt || b.image?.alt || prevBlock.image?.alt || b.title || '';

              return {
                title: b.title || prevBlock.title || '',
                variant: b.variant || prevBlock.variant || 'light',
                imagePosition: b.imagePosition || prevBlock.imagePosition || 'right',
                image: finalImgSrc
                  ? {
                      src: finalImgSrc,
                      alt: finalImgAlt,
                    }
                  : null,
                intro: b.intro !== undefined ? b.intro : (prevBlock.intro || ''),
                items: (b.items && b.items.length > 0 ? b.items : (prevBlock.items || [])).map((i, iIdx) => {
                  const prevItem =
                    prevBlock.items?.find(
                      (pi) => pi.title && i.title && pi.title.trim().toLowerCase() === i.title.trim().toLowerCase()
                    ) || prevBlock.items?.[iIdx] || {};
                  return {
                    title: typeof i === 'string' ? i : i.title || prevItem.title || '',
                    description: typeof i === 'string' ? '' : i.description || prevItem.description || '',
                    ...(i.image || prevItem.image ? { image: resolveMediaUrl(i.image) || prevItem.image } : {}),
                    ...(i.icon || prevItem.icon ? { icon: resolveMediaUrl(i.icon) || prevItem.icon } : {}),
                  };
                }),
                paragraphs: Array.isArray(b.paragraphs) && b.paragraphs.length > 0 ? b.paragraphs : (prevBlock.paragraphs || []),
                ...(b.type || prevBlock.type ? { type: b.type || prevBlock.type } : {}),
                ...(b.eyebrow || prevBlock.eyebrow ? { eyebrow: b.eyebrow || prevBlock.eyebrow } : {}),
                ...(b.subtitle || prevBlock.subtitle ? { subtitle: b.subtitle || prevBlock.subtitle } : {}),
                ...(b.buttonText || prevBlock.buttonText ? { buttonText: b.buttonText || prevBlock.buttonText } : {}),
                ...(b.buttonHref || prevBlock.buttonHref ? { buttonHref: b.buttonHref || prevBlock.buttonHref } : {}),
                ...(b.noBullets !== undefined ? { noBullets: b.noBullets } : prevBlock.noBullets !== undefined ? { noBullets: prevBlock.noBullets } : {}),
                ...(b.hasSubscribeForm !== undefined ? { hasSubscribeForm: b.hasSubscribeForm } : prevBlock.hasSubscribeForm !== undefined ? { hasSubscribeForm: prevBlock.hasSubscribeForm } : {}),
                ...(b.stats || prevBlock.stats ? { stats: b.stats || prevBlock.stats } : {}),
              };
            })
          : prev.blocks || [],
      };
    });

    fs.writeFileSync(offersFilePath, JSON.stringify(offersMap, null, 2), 'utf8');
    const durationMs = Date.now() - startTime;
    syncLogger.info(
      { count: documents.length, durationMs, file: 'offers.json' },
      'Successfully synchronized %d offers to offers.json (%dms)',
      documents.length,
      durationMs
    );
  } catch (err) {
    syncLogger.error(
      { err, file: 'offers.json', durationMs: Date.now() - startTime },
      'Error syncing offers.json: %s',
      err.message
    );
  }
}

/**
 * Syncs Strapi api::product.product entries to OFS/src/data/products.json
 */
async function syncProducts(strapi) {
  const startTime = Date.now();
  try {
  const documents = await strapi.documents('api::product.product').findMany({
  populate: {
    heroImage: true,
    catalogItems: {
      populate: {
        image: true,
        product: {
          populate: '*',
        },
      },
    },
    seo: true,
  },
  limit: 100,
});

    if (!documents || documents.length === 0) {
      syncLogger.debug('No product documents found in Strapi to sync');
      return;
    }

    const productsFilePath = path.join(DATA_DIR, 'products.json');
    let existingProducts = [];
    if (fs.existsSync(productsFilePath)) {
      try {
        existingProducts = JSON.parse(fs.readFileSync(productsFilePath, 'utf8'));
      } catch (parseErr) {
        syncLogger.warn({ err: parseErr, file: productsFilePath }, 'Failed to parse existing products.json; will overwrite');
      }
    }

    const productsArray = documents.map((item) => {
      const existingMatch =
        existingProducts.find(
          (p) => p.slug === item.slug || p.id === item.productId || p.id === item.slug
        ) || {};

      const strapiCatalogItems = Array.isArray(item.catalogItems) ? item.catalogItems : [];
      const existingCatalogItems = Array.isArray(existingMatch.catalogItems)
        ? existingMatch.catalogItems
        : [];

      return {
        id: item.productId || item.id || item.slug,
        slug: item.slug,
        name: item.name,
        shortName: item.shortName || item.name,
        category: item.category || existingMatch.category || '',
        icon: item.icon || existingMatch.icon || 'Settings',
        heroImage:
          resolveMediaUrl(item.heroImage) ||
          item.heroImage ||
          existingMatch.heroImage ||
          '/images/products/mud-pumps.webp',
        summary: item.summary || existingMatch.summary || '',
        keyPoints: item.keyPoints || existingMatch.keyPoints || [],
        description: item.description || existingMatch.description || '',
        catalogItems: (strapiCatalogItems.length > 0
          ? strapiCatalogItems
          : existingCatalogItems
        ).map((ci, idx) => {
          const existingCi =
            existingCatalogItems[idx] ||
            existingCatalogItems.find((c) => c.title === ci.title) ||
            {};
          const resolvedImg = resolveMediaUrl(ci.image) || resolveMediaUrl(ci.heroImage);
          const resolvedSubProduct = ci.products
            ? {
                ...ci.products,
                image: resolveMediaUrl(ci.products.image) || resolveMediaUrl(ci.products.heroImage) || ci.products.image || null,
                heroImage: resolveMediaUrl(ci.products.heroImage) || resolveMediaUrl(ci.products.image) || null,
              }
            : existingCi.products || null;

          return {
            ...existingCi,
            ...ci,
            title: ci.title || ci.name || existingCi.title || '',
            name: ci.name || ci.title || existingCi.name || '',
            image:
              resolvedImg ||
              (typeof ci.image === 'string' && ci.image.startsWith('/') && !ci.image.includes('draw-works.jpg') ? ci.image : null) ||
              existingCi.image ||
              existingMatch.heroImage ||
              '/images/products/mud-pumps.webp',
            description: ci.description || existingCi.description || '',
            products: resolvedSubProduct,
          };
        }),
        seo: item.seo
          ? {
              metaTitle: item.seo.metaTitle || item.name,
              metaDescription: item.seo.metaDescription || item.summary,
              keywords: item.seo.keywords || '',
              canonicalURL: item.seo.canonicalURL || null,
              metaRobots: item.seo.metaRobots || null,
            }
          : existingMatch.seo || null,
      };
    });

    fs.writeFileSync(productsFilePath, JSON.stringify(productsArray, null, 2), 'utf8');
    const durationMs = Date.now() - startTime;
    syncLogger.info(
      { count: documents.length, durationMs, file: 'products.json' },
      'Successfully synchronized %d products to products.json (%dms)',
      documents.length,
      durationMs
    );
  } catch (err) {
    syncLogger.error(
      { err, file: 'products.json', durationMs: Date.now() - startTime },
      'Error syncing products.json: %s',
      err.message
    );
  }
}

/**
 * Syncs Strapi api::industry.industry entries to OFS/src/data/industries.json
 */
async function syncIndustries(strapi) {
  const startTime = Date.now();
  try {
    const documents = await strapi.documents('api::industry.industry').findMany({
      populate: {
        heroImage: true,
        subIndustries: {
          populate: '*',
        },
        seo: true,
        relatedService: true,
      },
      limit: 100,
    });

    if (!documents || documents.length === 0) {
      syncLogger.debug('No industry documents found in Strapi to sync');
      return;
    }

    const industriesFilePath = path.join(DATA_DIR, 'industries.json');
    let existingIndustries = [];
    if (fs.existsSync(industriesFilePath)) {
      try {
        existingIndustries = JSON.parse(fs.readFileSync(industriesFilePath, 'utf8'));
      } catch (parseErr) {
        syncLogger.warn({ err: parseErr, file: industriesFilePath }, 'Failed to parse existing industries.json; will overwrite');
      }
    }

    const industriesArray = documents.map((item) => {
      const existingMatch =
        existingIndustries.find(
          (i) => i.slug === item.slug || i.id === item.industryId || i.id === item.slug
        ) || {};

      const strapiSubIndustries = Array.isArray(item.subIndustries) ? item.subIndustries : null;
      const existingSubIndustries = Array.isArray(existingMatch.subIndustries)
        ? existingMatch.subIndustries
        : [];

      const targetSubIndustries = strapiSubIndustries !== null ? strapiSubIndustries : existingSubIndustries;

      return {
        id: item.industryId || item.id || item.slug,
        slug: item.slug,
        name: item.name,
        shortName: item.shortName || item.name,
        icon: item.icon || existingMatch.icon || 'Flame',
        heroImage:
          resolveMediaUrl(item.heroImage) ||
          (typeof item.heroImage === 'string' && item.heroImage.startsWith('/') ? item.heroImage : null) ||
          existingMatch.heroImage ||
          '/images/live/oil-gas-new.jpg',
        relatedService: item.relatedService !== undefined ? item.relatedService : (existingMatch.relatedService || null),
        tagline: item.tagline || existingMatch.tagline || '',
        summary: item.summary || existingMatch.summary || '',
        keySolutions: item.keySolutions !== undefined ? item.keySolutions : (existingMatch.keySolutions || []),
        subIndustries: targetSubIndustries.map((sub, idx) => {
          const existingSub =
            existingSubIndustries.find((s) => s.slug === sub.slug || s.id === sub.subId) ||
            existingSubIndustries[idx] ||
            {};
          return {
            id: sub.subId || sub.id || sub.slug || existingSub.id,
            slug: sub.slug || existingSub.slug,
            name: sub.name || existingSub.name,
            shortName: sub.shortName || sub.name || existingSub.shortName,
            icon: sub.icon || existingSub.icon || 'Flame',
            heroImage:
              resolveMediaUrl(sub.heroImage) ||
              (typeof sub.heroImage === 'string' && sub.heroImage.startsWith('/') ? sub.heroImage : null) ||
              existingSub.heroImage ||
              '/images/live/Excellence-tools-official.png',
            tagline: sub.tagline || existingSub.tagline || '',
            summary: sub.summary || existingSub.summary || '',
            keySolutions: sub.keySolutions || existingSub.keySolutions || [],
            fullContentText: sub.fullContentText || existingSub.fullContentText || '',
          };
        }),
        fullContentText: item.fullContentText !== undefined ? item.fullContentText : (existingMatch.fullContentText || ''),
        ...(item.customServices || existingMatch.customServices
          ? { customServices: item.customServices || existingMatch.customServices }
          : {}),
        seo: item.seo
          ? {
              metaTitle: item.seo.metaTitle || item.name,
              metaDescription: item.seo.metaDescription || item.summary,
              keywords: item.seo.keywords || '',
              canonicalURL: item.seo.canonicalURL || null,
              metaRobots: item.seo.metaRobots || null,
            }
          : existingMatch.seo || null,
      };
    });

    fs.writeFileSync(industriesFilePath, JSON.stringify(industriesArray, null, 2), 'utf8');
    const durationMs = Date.now() - startTime;
    syncLogger.info(
      { count: documents.length, durationMs, file: 'industries.json' },
      'Successfully synchronized %d industries to industries.json (%dms)',
      documents.length,
      durationMs
    );
  } catch (err) {
    syncLogger.error(
      { err, file: 'industries.json', durationMs: Date.now() - startTime },
      'Error syncing industries.json: %s',
      err.message
    );
  }
}

/**
 * Syncs Strapi api::case-study.case-study entries to OFS/src/data/case-studies.json
 */
async function syncCaseStudies(strapi) {
  const startTime = Date.now();
  try {
    const documents = await strapi.documents('api::case-study.case-study').findMany({
      populate: {
        heroImage: true,
        metrics: true,
        seo: true,
      },
      limit: 100,
    });

    if (!documents || documents.length === 0) {
      syncLogger.debug('No case study documents found in Strapi to sync');
      return;
    }

    const caseStudiesFilePath = path.join(DATA_DIR, 'case-studies.json');
    const caseStudiesArray = documents.map((item) => ({
      id: item.caseStudyId || item.id,
      title: item.title,
      clientIndustry: item.clientIndustry,
      location: item.location,
      badge: item.badge,
      duration: item.duration,
      heroImage: resolveMediaUrl(item.heroImage) || '/images/live/oil-gas-new.jpg',
      summary: item.summary,
      challenge: item.challenge,
      solution: item.solution,
      metrics: item.metrics || [],
      tags: item.tags || [],
      seo: item.seo || {},
    }));

    fs.writeFileSync(caseStudiesFilePath, JSON.stringify(caseStudiesArray, null, 2), 'utf8');
    const durationMs = Date.now() - startTime;
    syncLogger.info(
      { count: documents.length, durationMs, file: 'case-studies.json' },
      'Successfully synchronized %d case studies to case-studies.json (%dms)',
      documents.length,
      durationMs
    );
  } catch (err) {
    syncLogger.error(
      { err, file: 'case-studies.json', durationMs: Date.now() - startTime },
      'Error syncing case-studies.json: %s',
      err.message
    );
  }
}

/**
 * Syncs Strapi api::blog-post.blog-post entries to OFS/src/data/blog-posts.json
 */
async function syncBlogPosts(strapi) {
  const startTime = Date.now();
  try {
    const documents = await strapi.documents('api::blog-post.blog-post').findMany({
      populate: {
        image: true,
        author: {
          populate: '*',
        },
        seo: true,
      },
      limit: 100,
    });

    if (!documents || documents.length === 0) {
      syncLogger.debug('No blog post documents found in Strapi to sync');
      return;
    }

    const blogPostsFilePath = path.join(DATA_DIR, 'blog-posts.json');
    const blogPostsArray = documents.map((item) => ({
      id: item.postId || item.id || item.slug,
      slug: item.slug,
      title: item.title,
      excerpt: item.excerpt,
      content: item.content,
      category: item.category,
      author: {
        name: item.author?.name || 'OFS Engineering Team',
        role: item.author?.role || 'Technical Desk',
        avatar: resolveMediaUrl(item.author?.avatar) || '/images/author-default.png',
      },
      date: item.date,
      readTime: item.readTime,
      featured: Boolean(item.featured),
      image: resolveMediaUrl(item.image) || '/images/live/oil-gas-new.jpg',
      tags: item.tags || [],
      seo: item.seo || {},
    }));

    fs.writeFileSync(blogPostsFilePath, JSON.stringify(blogPostsArray, null, 2), 'utf8');
    const durationMs = Date.now() - startTime;
    syncLogger.info(
      { count: documents.length, durationMs, file: 'blog-posts.json' },
      'Successfully synchronized %d blog posts to blog-posts.json (%dms)',
      documents.length,
      durationMs
    );
  } catch (err) {
    syncLogger.error(
      { err, file: 'blog-posts.json', durationMs: Date.now() - startTime },
      'Error syncing blog-posts.json: %s',
      err.message
    );
  }
}

/**
 * Syncs Strapi api::faq.faq entries to OFS/src/data/faqs.json
 */
async function syncFaqs(strapi) {
  const startTime = Date.now();
  try {
    const documents = await strapi.documents('api::faq.faq').findMany({
      limit: 100,
    });

    if (!documents || documents.length === 0) {
      syncLogger.debug('No FAQ documents found in Strapi to sync');
      return;
    }

    const faqsFilePath = path.join(DATA_DIR, 'faqs.json');
    const faqsArray = documents.map((item) => ({
      question: item.question,
      answer: item.answer,
    }));

    fs.writeFileSync(faqsFilePath, JSON.stringify(faqsArray, null, 2), 'utf8');
    const durationMs = Date.now() - startTime;
    syncLogger.info(
      { count: documents.length, durationMs, file: 'faqs.json' },
      'Successfully synchronized %d FAQs to faqs.json (%dms)',
      documents.length,
      durationMs
    );
  } catch (err) {
    syncLogger.error(
      { err, file: 'faqs.json', durationMs: Date.now() - startTime },
      'Error syncing faqs.json: %s',
      err.message
    );
  }
}

/**
 * Syncs Strapi api::job.job entries to OFS/src/data/jobs.json
 */
async function syncJobs(strapi) {
  const startTime = Date.now();
  try {
    const documents = await strapi.documents('api::job.job').findMany({
      limit: 100,
    });

    if (!documents || documents.length === 0) {
      syncLogger.debug('No career job documents found in Strapi to sync');
      return;
    }

    const jobsFilePath = path.join(DATA_DIR, 'jobs.json');
    const jobsArray = documents.map((item) => ({
      id: item.jobId || item.slug || item.id,
      slug: item.slug,
      title: item.title,
      department: item.department,
      location: item.location,
      type: item.type,
      experience: item.experience,
      postedDate: item.postedDate,
      description: item.description,
      responsibilities: item.responsibilities || [],
      requirements: item.requirements || [],
      benefits: item.benefits || [],
    }));

    fs.writeFileSync(jobsFilePath, JSON.stringify(jobsArray, null, 2), 'utf8');
    const durationMs = Date.now() - startTime;
    syncLogger.info(
      { count: documents.length, durationMs, file: 'jobs.json' },
      'Successfully synchronized %d career jobs to jobs.json (%dms)',
      documents.length,
      durationMs
    );
  } catch (err) {
    syncLogger.error(
      { err, file: 'jobs.json', durationMs: Date.now() - startTime },
      'Error syncing jobs.json: %s',
      err.message
    );
  }
}

/**
 * Syncs Strapi api::renewable.renewable to OFS/src/data/renewables.json
 */
async function syncRenewables(strapi) {
  const startTime = Date.now();
  try {
    const doc = await strapi.documents('api::renewable.renewable').findFirst({
      populate: {
        heroBgImage: true,
        whyImage: true,
        partnerBgImage: true,
        whyPills: true,
        approachSteps: true,
        partnerCards: true,
        solutions: {
          populate: '*',
        },
      },
    });

    if (!doc) {
      syncLogger.debug('No renewable singleton document found in Strapi to sync');
      return;
    }

    const renewablesFilePath = path.join(DATA_DIR, 'renewables.json');
    let prev = {};
    if (fs.existsSync(renewablesFilePath)) {
      try {
        prev = JSON.parse(fs.readFileSync(renewablesFilePath, 'utf8'));
      } catch (parseErr) {
        syncLogger.warn({ err: parseErr, file: renewablesFilePath }, 'Failed to parse existing renewables.json; will overwrite');
      }
    }

    const output = {
      title: doc.title || prev.title,
      tagline: doc.tagline || prev.tagline,
      heroDescription: doc.heroDescription || prev.heroDescription,
      heroBacking: doc.heroBacking || prev.heroBacking,
      heroBgImage: resolveMediaUrl(doc.heroBgImage) || prev.heroBgImage || '/images/live/renewables-hero-panorama.jpg',
      solutionsTag: doc.solutionsTag || prev.solutionsTag,
      solutionsTitle: doc.solutionsTitle || prev.solutionsTitle,
      solutionsDesc: doc.solutionsDesc || prev.solutionsDesc,
      solutions: (doc.solutions || []).map((s) => ({
        id: s.solutionId || s.id,
        title: s.title,
        icon: s.icon,
        image: resolveMediaUrl(s.image) || null,
        bullets: s.bullets || [],
      })),
      whyTag: doc.whyTag || prev.whyTag,
      whyTitle: doc.whyTitle || prev.whyTitle,
      whyDesc: doc.whyDesc || prev.whyDesc,
      whyImage: resolveMediaUrl(doc.whyImage) || prev.whyImage || '/images/live/why-renewables-landscape.jpg',
      whyPills: doc.whyPills || prev.whyPills || [],
      approachTag: doc.approachTag || prev.approachTag,
      approachTitle: doc.approachTitle || prev.approachTitle,
      approachSubtitle: doc.approachSubtitle || prev.approachSubtitle,
      approachSteps: doc.approachSteps || prev.approachSteps || [],
      partnerTag: doc.partnerTag || prev.partnerTag,
      partnerTitle: doc.partnerTitle || prev.partnerTitle,
      partnerDesc: doc.partnerDesc || prev.partnerDesc,
      partnerBgImage: resolveMediaUrl(doc.partnerBgImage) || prev.partnerBgImage || null,
      partnerCards: doc.partnerCards || prev.partnerCards || [],
      ctaTag: doc.ctaTag || prev.ctaTag,
      ctaTitle: doc.ctaTitle || prev.ctaTitle,
      ctaDesc: doc.ctaDesc || prev.ctaDesc,
      contactEmail: doc.contactEmail || prev.contactEmail || 'renewables@ofsgroupindia.com',
    };

    fs.writeFileSync(renewablesFilePath, JSON.stringify(output, null, 2), 'utf8');
    const durationMs = Date.now() - startTime;
    syncLogger.info(
      { durationMs, file: 'renewables.json' },
      'Successfully synchronized renewables.json (%dms)',
      durationMs
    );
  } catch (err) {
    syncLogger.error(
      { err, file: 'renewables.json', durationMs: Date.now() - startTime },
      'Error syncing renewables.json: %s',
      err.message
    );
  }
}

/**
 * Syncs Strapi api::site-config.site-config to OFS/src/data/site-config.json
 */
async function syncSiteConfig(strapi) {
  const startTime = Date.now();
  try {
    const doc = await strapi.documents('api::site-config.site-config').findFirst({
      populate: {
        logo: true,
        logoDark: true,
        heroImage: true,
        contact: {
          populate: {
            addressIndia: true,
            addressUSA: true,
          },
        },
        stats: true,
        socials: true,
      },
    });

    if (!doc) {
      syncLogger.debug('No site-config singleton document found in Strapi to sync');
      return;
    }

    const siteConfigFilePath = path.join(DATA_DIR, 'site-config.json');
    let prev = {};
    if (fs.existsSync(siteConfigFilePath)) {
      try {
        prev = JSON.parse(fs.readFileSync(siteConfigFilePath, 'utf8'));
      } catch (parseErr) {
        syncLogger.warn({ err: parseErr, file: siteConfigFilePath }, 'Failed to parse existing site-config.json; will overwrite');
      }
    }

    const output = {
      ...prev,
      name: doc.name || prev.name,
      shortName: doc.shortName || prev.shortName,
      legalName: doc.legalName || prev.legalName,
      usEntityName: doc.usEntityName || prev.usEntityName,
      tagline: doc.tagline || prev.tagline,
      headline: doc.headline || prev.headline,
      description: doc.description || prev.description,
      shortDesc: doc.shortDesc || prev.shortDesc,
      longDesc: doc.longDesc || prev.longDesc,
      logo: resolveMediaUrl(doc.logo) || prev.logo || '/images/ofs-logo.png',
      logoDark: resolveMediaUrl(doc.logoDark) || prev.logoDark || null,
      heroImage: resolveMediaUrl(doc.heroImage) || prev.heroImage || '/images/live/Banner3.jpg',
      contact: doc.contact || prev.contact,
      stats: (doc.stats && doc.stats.length > 0) ? doc.stats : prev.stats,
      socials: doc.socials || prev.socials,
      certifications: doc.certifications || prev.certifications,
    };

    fs.writeFileSync(siteConfigFilePath, JSON.stringify(output, null, 2), 'utf8');
    const durationMs = Date.now() - startTime;
    syncLogger.info(
      { durationMs, file: 'site-config.json' },
      'Successfully synchronized site-config.json (%dms)',
      durationMs
    );
  } catch (err) {
    syncLogger.error(
      { err, file: 'site-config.json', durationMs: Date.now() - startTime },
      'Error syncing site-config.json: %s',
      err.message
    );
  }
}

/**
 * Master sync function for all content types
 */
async function syncAllToJson(strapi) {
  const masterStart = Date.now();
  syncLogger.info('Starting full Strapi -> JSON synchronization...');

  const results = await Promise.allSettled([
    syncOffers(strapi),
    syncProducts(strapi),
    syncIndustries(strapi),
    syncCaseStudies(strapi),
    syncBlogPosts(strapi),
    syncFaqs(strapi),
    syncJobs(strapi),
    syncRenewables(strapi),
    syncSiteConfig(strapi),
  ]);

  const rejected = results.filter((r) => r.status === 'rejected');
  if (rejected.length > 0) {
    syncLogger.error(
      { rejectedCount: rejected.length, reasons: rejected.map((r) => r.reason?.message || r.reason) },
      '%d sync operations encountered errors during full synchronization',
      rejected.length
    );
  } else {
    const totalDurationMs = Date.now() - masterStart;
    syncLogger.info(
      { durationMs: totalDurationMs },
      'All JSON files updated from Strapi successfully (%dms)',
      totalDurationMs
    );
  }
}

/**
 * Handle individual document change
 */
async function handleDocumentChange(strapi, uid) {
  if (!uid) return;
  const normalizedUid = String(uid).toLowerCase();
  syncLogger.debug({ uid: normalizedUid }, 'Processing document change event');

  if (normalizedUid.includes('offer')) {
    await syncOffers(strapi);
  } else if (normalizedUid.includes('product')) {
    await syncProducts(strapi);
  } else if (normalizedUid.includes('industry')) {
    await syncIndustries(strapi);
  } else if (normalizedUid.includes('case-study') || normalizedUid.includes('casestudy')) {
    await syncCaseStudies(strapi);
  } else if (normalizedUid.includes('blog-post') || normalizedUid.includes('blogpost')) {
    await syncBlogPosts(strapi);
  } else if (normalizedUid.includes('faq')) {
    await syncFaqs(strapi);
  } else if (normalizedUid.includes('job')) {
    await syncJobs(strapi);
  } else if (normalizedUid.includes('renewable')) {
    await syncRenewables(strapi);
  } else if (normalizedUid.includes('site-config') || normalizedUid.includes('siteconfig')) {
    await syncSiteConfig(strapi);
  } else {
    syncLogger.debug({ uid: normalizedUid }, 'Document UID does not match any registered JSON sync handlers');
  }
}

module.exports = {
  syncOffers,
  syncProducts,
  syncIndustries,
  syncCaseStudies,
  syncBlogPosts,
  syncFaqs,
  syncJobs,
  syncRenewables,
  syncSiteConfig,
  syncAllToJson,
  handleDocumentChange,
};
