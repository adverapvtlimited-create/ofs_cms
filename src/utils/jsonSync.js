'use strict';

const fs = require('fs');
const path = require('path');

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
    media.data?.attributes?.url ||
    media.data?.url ||
    media.formats?.large?.url ||
    media.formats?.medium?.url ||
    media.formats?.small?.url ||
    media.formats?.thumbnail?.url ||
    null
  );
}

/**
 * Syncs Strapi api::offer.offer entries to OFS/src/data/offers.json
 */
async function syncOffers(strapi) {
  try {
    const documents = await strapi.documents('api::offer.offer').findMany({
      populate: {
        heroImage: true,
        blocks: {
          populate: '*',
        },
      },
      limit: 100,
    });

    if (!documents || documents.length === 0) return;

    const offersFilePath = path.join(DATA_DIR, 'offers.json');
    let existingOffers = {};
    if (fs.existsSync(offersFilePath)) {
      try {
        existingOffers = JSON.parse(fs.readFileSync(offersFilePath, 'utf8'));
      } catch {}
    }

    const offersMap = { ...existingOffers };

    documents.forEach((item) => {
      const slug = item.slug;
      if (!slug) return;
      const prev = offersMap[slug] || {};

      offersMap[slug] = {
        id: slug,
        slug: slug,
        href: item.href || `/${slug}`,
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
              const prevBlock = prev.blocks?.[bIdx] || {};
              const resolvedImg = b.imageUrl || resolveMediaUrl(b.image) || (b.image && (b.image.src || b.image.url)) || prevBlock.image?.src || null;

              return {
                title: b.title || '',
                variant: b.variant || prevBlock.variant || 'light',
                imagePosition: b.imagePosition || prevBlock.imagePosition || 'right',
                image: resolvedImg
                  ? {
                      src: resolvedImg,
                      alt: b.imageAlt || b.image?.alt || b.title || '',
                    }
                  : null,
                intro: b.intro || '',
                items: (b.items || []).map((i, iIdx) => {
                  const prevItem = prevBlock.items?.[iIdx] || {};
                  return {
                    title: typeof i === 'string' ? i : i.title || '',
                    description: typeof i === 'string' ? '' : i.description || '',
                    ...(i.image || prevItem.image ? { image: i.image || prevItem.image } : {}),
                    ...(i.icon || prevItem.icon ? { icon: i.icon || prevItem.icon } : {}),
                  };
                }),
                paragraphs: b.paragraphs || prevBlock.paragraphs || [],
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
    console.log(`[JSON Sync] ✅ Successfully synchronized ${documents.length} offers to offers.json`);
  } catch (err) {
    console.error('[JSON Sync] ❌ Error syncing offers.json:', err.message);
  }
}

/**
 * Syncs Strapi api::product.product entries to OFS/src/data/products.json
 */
async function syncProducts(strapi) {
  try {
    const documents = await strapi.documents('api::product.product').findMany({
      populate: {
        heroImage: true,
        catalogItems: {
          populate: '*',
        },
        seo: true,
      },
      limit: 100,
    });

    if (!documents || documents.length === 0) return;

    const productsFilePath = path.join(DATA_DIR, 'products.json');
    let existingProducts = [];
    if (fs.existsSync(productsFilePath)) {
      try {
        existingProducts = JSON.parse(fs.readFileSync(productsFilePath, 'utf8'));
      } catch {}
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
          const resolvedImg = resolveMediaUrl(ci.image);
          return {
            title: ci.title || existingCi.title || '',
            image:
              resolvedImg ||
              (typeof ci.image === 'string' && ci.image.startsWith('/') && !ci.image.includes('draw-works.jpg') ? ci.image : null) ||
              existingCi.image ||
              existingMatch.heroImage ||
              '/images/products/mud-pumps.webp',
            description: ci.description || existingCi.description || '',
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
    console.log(`[JSON Sync] ✅ Successfully synchronized ${documents.length} products to products.json`);
  } catch (err) {
    console.error('[JSON Sync] ❌ Error syncing products.json:', err.message);
  }
}

/**
 * Syncs Strapi api::industry.industry entries to OFS/src/data/industries.json
 */
async function syncIndustries(strapi) {
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

    if (!documents || documents.length === 0) return;

    const industriesFilePath = path.join(DATA_DIR, 'industries.json');
    let existingIndustries = [];
    if (fs.existsSync(industriesFilePath)) {
      try {
        existingIndustries = JSON.parse(fs.readFileSync(industriesFilePath, 'utf8'));
      } catch {}
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
    console.log(`[JSON Sync] ✅ Successfully synchronized ${documents.length} industries to industries.json`);
  } catch (err) {
    console.error('[JSON Sync] ❌ Error syncing industries.json:', err.message);
  }
}

/**
 * Syncs Strapi api::case-study.case-study entries to OFS/src/data/case-studies.json
 */
async function syncCaseStudies(strapi) {
  try {
    const documents = await strapi.documents('api::case-study.case-study').findMany({
      populate: {
        heroImage: true,
        metrics: true,
        seo: true,
      },
      limit: 100,
    });

    if (!documents || documents.length === 0) return;

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
    console.log(`[JSON Sync] ✅ Successfully synchronized ${documents.length} case studies to case-studies.json`);
  } catch (err) {
    console.error('[JSON Sync] ❌ Error syncing case-studies.json:', err.message);
  }
}

/**
 * Syncs Strapi api::blog-post.blog-post entries to OFS/src/data/blog-posts.json
 */
async function syncBlogPosts(strapi) {
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

    if (!documents || documents.length === 0) return;

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
    console.log(`[JSON Sync] ✅ Successfully synchronized ${documents.length} blog posts to blog-posts.json`);
  } catch (err) {
    console.error('[JSON Sync] ❌ Error syncing blog-posts.json:', err.message);
  }
}

/**
 * Syncs Strapi api::faq.faq entries to OFS/src/data/faqs.json
 */
async function syncFaqs(strapi) {
  try {
    const documents = await strapi.documents('api::faq.faq').findMany({
      limit: 100,
    });

    if (!documents || documents.length === 0) return;

    const faqsFilePath = path.join(DATA_DIR, 'faqs.json');
    const faqsArray = documents.map((item) => ({
      question: item.question,
      answer: item.answer,
    }));

    fs.writeFileSync(faqsFilePath, JSON.stringify(faqsArray, null, 2), 'utf8');
    console.log(`[JSON Sync] ✅ Successfully synchronized ${documents.length} FAQs to faqs.json`);
  } catch (err) {
    console.error('[JSON Sync] ❌ Error syncing faqs.json:', err.message);
  }
}

/**
 * Syncs Strapi api::job.job entries to OFS/src/data/jobs.json
 */
async function syncJobs(strapi) {
  try {
    const documents = await strapi.documents('api::job.job').findMany({
      limit: 100,
    });

    if (!documents || documents.length === 0) return;

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
    console.log(`[JSON Sync] ✅ Successfully synchronized ${documents.length} career jobs to jobs.json`);
  } catch (err) {
    console.error('[JSON Sync] ❌ Error syncing jobs.json:', err.message);
  }
}

/**
 * Syncs Strapi api::renewable.renewable to OFS/src/data/renewables.json
 */
async function syncRenewables(strapi) {
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

    if (!doc) return;

    const renewablesFilePath = path.join(DATA_DIR, 'renewables.json');
    let prev = {};
    if (fs.existsSync(renewablesFilePath)) {
      try {
        prev = JSON.parse(fs.readFileSync(renewablesFilePath, 'utf8'));
      } catch {}
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
    console.log('[JSON Sync] ✅ Successfully synchronized renewables.json');
  } catch (err) {
    console.error('[JSON Sync] ❌ Error syncing renewables.json:', err.message);
  }
}

/**
 * Syncs Strapi api::site-config.site-config to OFS/src/data/site-config.json
 */
async function syncSiteConfig(strapi) {
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

    if (!doc) return;

    const siteConfigFilePath = path.join(DATA_DIR, 'site-config.json');
    let prev = {};
    if (fs.existsSync(siteConfigFilePath)) {
      try {
        prev = JSON.parse(fs.readFileSync(siteConfigFilePath, 'utf8'));
      } catch {}
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
    console.log('[JSON Sync] ✅ Successfully synchronized site-config.json');
  } catch (err) {
    console.error('[JSON Sync] ❌ Error syncing site-config.json:', err.message);
  }
}

/**
 * Master sync function for all content types
 */
async function syncAllToJson(strapi) {
  console.log('[JSON Sync] 🔄 Starting full Strapi -> JSON synchronization...');
  await Promise.allSettled([
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
  console.log('[JSON Sync] 🎉 All JSON files updated from Strapi.');
}

/**
 * Handle individual document change
 */
async function handleDocumentChange(strapi, uid) {
  if (!uid) return;
  const normalizedUid = String(uid).toLowerCase();

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