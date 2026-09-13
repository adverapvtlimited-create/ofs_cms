'use strict';

const fs = require('fs');
const path = require('path');
const { createStrapi } = require('@strapi/strapi');

async function seed() {
  console.log('🌱 Starting Strapi Data Seeding from OFS/src/data...');

  const dataDir = path.resolve(__dirname, '../../OFS/src/data');
  if (!fs.existsSync(dataDir)) {
    console.error(`❌ Data directory not found at: ${dataDir}`);
    process.exit(1);
  }

  const app = await createStrapi().load();

  try {
    // 1. Site Config (Single Type)
    console.log('📌 Seeding Site Config...');
    const siteConfigPath = path.join(dataDir, 'site-config.json');
    if (fs.existsSync(siteConfigPath)) {
      const siteConfigData = JSON.parse(fs.readFileSync(siteConfigPath, 'utf8'));
      const existing = await app.documents('api::site-config.site-config').findFirst();
      if (!existing) {
        await app.documents('api::site-config.site-config').create({
          data: siteConfigData,
          status: 'published'
        });
        console.log('✅ Site Config created');
      } else {
        await app.documents('api::site-config.site-config').update({
          documentId: existing.documentId,
          data: siteConfigData,
          status: 'published'
        });
        console.log('🔄 Site Config updated');
      }
    }

    // 2. Services (Collection Type)
    console.log('📌 Seeding Services...');
    const servicesPath = path.join(dataDir, 'services.json');
    if (fs.existsSync(servicesPath)) {
      const services = JSON.parse(fs.readFileSync(servicesPath, 'utf8'));
      for (const item of services) {
        const payload = {
          serviceId: item.id,
          slug: item.slug,
          title: item.title,
          shortTitle: item.shortTitle || item.title,
          badge: item.badge,
          icon: item.icon,
          heroImage: item.heroImage,
          tagline: item.tagline,
          description: item.description,
          features: item.features || [],
          capabilities: item.capabilities || [],
          process: item.process || [],
          faqs: item.faqs || [],
          fullContentText: item.fullContentText || '',
          scrapedImages: item.scrapedImages || [],
          seo: item.seo || {}
        };
        const existing = await app.documents('api::service.service').findFirst({
          filters: { serviceId: item.id }
        });
        if (!existing) {
          await app.documents('api::service.service').create({
            data: payload,
            status: 'published'
          });
          console.log(`  ➕ Service: ${item.title}`);
        } else {
          await app.documents('api::service.service').update({
            documentId: existing.documentId,
            data: payload,
            status: 'published'
          });
          console.log(`  🔄 Service: ${item.title}`);
        }
      }
    }

    // 3. Products (Collection Type)
    console.log('📌 Seeding Products...');
    const productsPath = path.join(dataDir, 'products.json');
    if (fs.existsSync(productsPath)) {
      const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
      for (const item of products) {
        const payload = {
          productId: item.id,
          slug: item.slug,
          name: item.name,
          shortName: item.shortName,
          category: item.category,
          icon: item.icon,
          heroImage: item.heroImage,
          summary: item.summary,
          keyPoints: item.keyPoints || [],
          description: item.description,
          catalogItems: item.catalogItems || [],
          seo: item.seo || {}
        };
        const existing = await app.documents('api::product.product').findFirst({
          filters: { productId: item.id }
        });
        if (!existing) {
          await app.documents('api::product.product').create({
            data: payload,
            status: 'published'
          });
          console.log(`  ➕ Product: ${item.shortName}`);
        } else {
          await app.documents('api::product.product').update({
            documentId: existing.documentId,
            data: payload,
            status: 'published'
          });
          console.log(`  🔄 Product: ${item.shortName}`);
        }
      }
    }

    // 4. Industries (Collection Type)
    console.log('📌 Seeding Industries...');
    const industriesPath = path.join(dataDir, 'industries.json');
    if (fs.existsSync(industriesPath)) {
      const industries = JSON.parse(fs.readFileSync(industriesPath, 'utf8'));
      for (const item of industries) {
        const payload = {
          industryId: item.id,
          slug: item.slug,
          name: item.name,
          shortName: item.shortName,
          icon: item.icon,
          heroImage: item.heroImage,
          relatedService: (item.relatedService && item.relatedService.slug) ? item.relatedService : null,
          tagline: item.tagline,
          summary: item.summary,
          keySolutions: item.keySolutions || [],
          subIndustries: (item.subIndustries || []).map(sub => ({
            subId: sub.id,
            slug: sub.slug,
            name: sub.name,
            shortName: sub.shortName,
            icon: sub.icon,
            heroImage: sub.heroImage,
            tagline: sub.tagline,
            summary: sub.summary,
            keySolutions: sub.keySolutions || [],
            fullContentText: sub.fullContentText
          })),
          fullContentText: item.fullContentText,
          seo: item.seo || {}
        };
        const existing = await app.documents('api::industry.industry').findFirst({
          filters: { industryId: item.id }
        });
        if (!existing) {
          await app.documents('api::industry.industry').create({
            data: payload,
            status: 'published'
          });
          console.log(`  ➕ Industry: ${item.name}`);
        } else {
          await app.documents('api::industry.industry').update({
            documentId: existing.documentId,
            data: payload,
            status: 'published'
          });
          console.log(`  🔄 Industry: ${item.name}`);
        }
      }
    }

    // 5. Case Studies (Collection Type)
    console.log('📌 Seeding Case Studies...');
    const caseStudiesPath = path.join(dataDir, 'case-studies.json');
    if (fs.existsSync(caseStudiesPath)) {
      const caseStudies = JSON.parse(fs.readFileSync(caseStudiesPath, 'utf8'));
      for (const item of caseStudies) {
        const payload = {
          caseStudyId: item.id,
          title: item.title,
          clientIndustry: item.clientIndustry,
          location: item.location,
          badge: item.badge,
          duration: item.duration,
          heroImage: item.heroImage,
          summary: item.summary,
          challenge: item.challenge,
          solution: item.solution,
          metrics: item.metrics || [],
          tags: item.tags || [],
          seo: item.seo || {}
        };
        const existing = await app.documents('api::case-study.case-study').findFirst({
          filters: { caseStudyId: item.id }
        });
        if (!existing) {
          await app.documents('api::case-study.case-study').create({
            data: payload,
            status: 'published'
          });
          console.log(`  ➕ Case Study: ${item.title.slice(0, 40)}...`);
        } else {
          await app.documents('api::case-study.case-study').update({
            documentId: existing.documentId,
            data: payload,
            status: 'published'
          });
          console.log(`  🔄 Case Study: ${item.title.slice(0, 40)}...`);
        }
      }
    }

    // 6. Blog Posts (Collection Type)
    console.log('📌 Seeding Blog Posts...');
    const blogPostsPath = path.join(dataDir, 'blog-posts.json');
    if (fs.existsSync(blogPostsPath)) {
      const blogPosts = JSON.parse(fs.readFileSync(blogPostsPath, 'utf8'));
      for (const item of blogPosts) {
        const payload = {
          postId: item.id,
          slug: item.slug,
          title: item.title,
          excerpt: item.excerpt,
          content: item.content,
          category: item.category,
          author: item.author || {},
          date: item.date,
          readTime: item.readTime,
          featured: Boolean(item.featured),
          image: item.image,
          tags: item.tags || [],
          seo: item.seo || {}
        };
        const existing = await app.documents('api::blog-post.blog-post').findFirst({
          filters: { postId: item.id }
        });
        if (!existing) {
          await app.documents('api::blog-post.blog-post').create({
            data: payload,
            status: 'published'
          });
          console.log(`  ➕ Blog Post: ${item.title.slice(0, 40)}...`);
        } else {
          await app.documents('api::blog-post.blog-post').update({
            documentId: existing.documentId,
            data: payload,
            status: 'published'
          });
          console.log(`  🔄 Blog Post: ${item.title.slice(0, 40)}...`);
        }
      }
    }

    // 7. Jobs (Collection Type)
    console.log('📌 Seeding Jobs...');
    const jobsPath = path.join(dataDir, 'jobs.json');
    if (fs.existsSync(jobsPath)) {
      const jobs = JSON.parse(fs.readFileSync(jobsPath, 'utf8'));
      for (const item of jobs) {
        const payload = {
          jobId: item.id,
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
          benefits: item.benefits || []
        };
        const existing = await app.documents('api::job.job').findFirst({
          filters: { jobId: item.id }
        });
        if (!existing) {
          await app.documents('api::job.job').create({
            data: payload,
            status: 'published'
          });
          console.log(`  ➕ Job: ${item.title}`);
        } else {
          await app.documents('api::job.job').update({
            documentId: existing.documentId,
            data: payload,
            status: 'published'
          });
          console.log(`  🔄 Job: ${item.title}`);
        }
      }
    }

    // 8. Renewables (Single Type)
    console.log('📌 Seeding Renewables...');
    const renewablesPath = path.join(dataDir, 'renewables.json');
    if (fs.existsSync(renewablesPath)) {
      const renewablesData = JSON.parse(fs.readFileSync(renewablesPath, 'utf8'));
      const payload = {
        ...renewablesData,
        solutions: (renewablesData.solutions || []).map(s => ({
          solutionId: s.id,
          title: s.title,
          icon: s.icon,
          image: s.image,
          bullets: s.bullets || []
        }))
      };
      const existing = await app.documents('api::renewable.renewable').findFirst();
      if (!existing) {
        await app.documents('api::renewable.renewable').create({
          data: payload,
          status: 'published'
        });
        console.log('✅ Renewables page created');
      } else {
        await app.documents('api::renewable.renewable').update({
          documentId: existing.documentId,
          data: payload,
          status: 'published'
        });
        console.log('🔄 Renewables page updated');
      }
    }

    // 9. FAQs (Collection Type)
    console.log('📌 Seeding FAQs...');
    const faqsPath = path.join(dataDir, 'faqs.json');
    if (fs.existsSync(faqsPath)) {
      const faqs = JSON.parse(fs.readFileSync(faqsPath, 'utf8'));
      for (const item of faqs) {
        const existing = await app.documents('api::faq.faq').findFirst({
          filters: { question: item.question }
        });
        if (!existing) {
          await app.documents('api::faq.faq').create({
            data: item,
            status: 'published'
          });
          console.log(`  ➕ FAQ: ${item.question.slice(0, 40)}...`);
        }
      }
    }

    // 10. Offers (Collection Type)
    console.log('📌 Seeding Offers...');
    const offersPath = path.join(dataDir, 'offers.json');
    if (fs.existsSync(offersPath)) {
      const offersObj = JSON.parse(fs.readFileSync(offersPath, 'utf8'));
      for (const [key, item] of Object.entries(offersObj)) {
        const payload = {
          slug: item.slug || key,
          href: item.href,
          title: item.title,
          category: item.category,
          categoryLabel: item.categoryLabel,
          heroImage: item.heroImage,
          tagline: item.tagline,
          description: item.description,
          blocks: (item.blocks || []).map(b => ({
            title: b.title || '',
            variant: (b.variant === 'dark' || b.variant === 'light' || b.variant === 'subtle') ? b.variant : 'light',
            imagePosition: (b.imagePosition === 'left' || b.imagePosition === 'right') ? b.imagePosition : 'right',
            image: (b.image && b.image.src) ? { src: b.image.src, alt: b.image.alt || '' } : null,
            intro: b.intro || '',
            items: (b.items || []).map(i => ({
              title: i.title || '',
              description: i.description || ''
            })),
            paragraphs: b.paragraphs || []
          }))
        };
        const existing = await app.documents('api::offer.offer').findFirst({
          filters: { slug: payload.slug }
        });
        if (!existing) {
          await app.documents('api::offer.offer').create({
            data: payload,
            status: 'published'
          });
          console.log(`  ➕ Offer: ${item.title}`);
        } else {
          await app.documents('api::offer.offer').update({
            documentId: existing.documentId,
            data: payload,
            status: 'published'
          });
          console.log(`  🔄 Offer: ${item.title}`);
        }
      }
    }

    // 11. Set Public Permissions so Next.js Frontend can fetch without auth
    console.log('🔐 Configuring Public API Permissions for all 10 endpoints...');
    const publicRole = await app.documents('plugin::users-permissions.role').findFirst({
      filters: { type: 'public' },
      populate: ['permissions']
    });

    if (publicRole) {
      const apis = [
        { uid: 'api::site-config.site-config', actions: ['find'] },
        { uid: 'api::service.service', actions: ['find', 'findOne'] },
        { uid: 'api::product.product', actions: ['find', 'findOne'] },
        { uid: 'api::industry.industry', actions: ['find', 'findOne'] },
        { uid: 'api::case-study.case-study', actions: ['find', 'findOne'] },
        { uid: 'api::blog-post.blog-post', actions: ['find', 'findOne'] },
        { uid: 'api::job.job', actions: ['find', 'findOne'] },
        { uid: 'api::renewable.renewable', actions: ['find'] },
        { uid: 'api::faq.faq', actions: ['find', 'findOne'] },
        { uid: 'api::offer.offer', actions: ['find', 'findOne'] }
      ];

      for (const targetApi of apis) {
        for (const action of targetApi.actions) {
          const actionKey = `${targetApi.uid}.${action}`;
          const hasPerm = publicRole.permissions?.some(p => p.action === actionKey);
          if (!hasPerm) {
            await app.documents('plugin::users-permissions.permission').create({
              data: {
                action: actionKey,
                role: publicRole.id,
                enabled: true
              }
            });
          }
        }
      }
      console.log('✅ Public permissions granted');
    }

    console.log('\n🎉 ALL OFS STRAPI DATA SUCCESSFULLY SEEDED & VERIFIED!');
  } catch (err) {
    console.error('❌ Seeding error:', err);
    if (err.details) {
      console.error('📋 Validation Details:', JSON.stringify(err.details, null, 2));
    }
  } finally {
    await app.destroy();
    process.exit(0);
  }
}

seed();
