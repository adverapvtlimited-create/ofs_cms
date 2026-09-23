"use strict";

const fs = require("fs");
const path = require("path");
const { createStrapi } = require("@strapi/strapi");

function stripIdsAndMeta(obj) {
  if (!obj || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(stripIdsAndMeta);
  const copy = {};
  for (const [key, value] of Object.entries(obj)) {
    if (["id", "documentId", "createdAt", "updatedAt", "publishedAt"].includes(key)) {
      continue;
    }
    if (typeof value === "object" && value !== null) {
      copy[key] = stripIdsAndMeta(value);
    } else {
      copy[key] = value;
    }
  }
  return copy;
}

async function seed() {
  console.log("🌱 Starting Strapi Data Seeding from OFS/src/data...");

  const dataDir = path.resolve(__dirname, "../../OFS/src/data");
  if (!fs.existsSync(dataDir)) {
    console.error(`❌ Data directory not found at: ${dataDir}`);
    process.exit(1);
  }

  const app = await createStrapi().load();

  try {
    // 1. Site Config (Single Type)
    console.log("📌 Seeding Site Config...");
    const siteConfigPath = path.join(dataDir, "site-config.json");
    if (fs.existsSync(siteConfigPath)) {
      const rawSiteConfig = JSON.parse(fs.readFileSync(siteConfigPath, "utf8"));
      const siteConfigData = {
        name: rawSiteConfig.name,
        shortName: rawSiteConfig.shortName,
        legalName: rawSiteConfig.legalName,
        usEntityName: rawSiteConfig.usEntityName,
        tagline: rawSiteConfig.tagline,
        shortDesc: rawSiteConfig.shortDesc,
        headline: rawSiteConfig.headline,
        description: rawSiteConfig.description,
        longDesc: rawSiteConfig.longDesc,
        certifications: rawSiteConfig.certifications || [],
        contact: stripIdsAndMeta(rawSiteConfig.contact),
        stats: stripIdsAndMeta(rawSiteConfig.stats || []),
        socials: stripIdsAndMeta(rawSiteConfig.socials),
      };

      const existing = await app
        .documents("api::site-config.site-config")
        .findFirst();
      if (!existing) {
        await app.documents("api::site-config.site-config").create({
          data: siteConfigData,
          status: "published",
        });
        console.log("✅ Site Config created");
      } else {
        await app.documents("api::site-config.site-config").update({
          documentId: existing.documentId,
          data: siteConfigData,
          status: "published",
        });
        console.log("🔄 Site Config updated");
      }
    }


    // 3. Products (Collection Type)
    console.log("📌 Seeding Products...");
    const productsPath = path.join(dataDir, "products.json");
    if (fs.existsSync(productsPath)) {
      const products = JSON.parse(fs.readFileSync(productsPath, "utf8"));
      for (const item of products) {
        const payload = {
          productId: item.id,
          slug: item.slug,
          name: item.name,
          shortName: item.shortName,
          category: item.category,
          icon: item.icon,
          summary: item.summary,
          keyPoints: item.keyPoints || [],
          description: item.description,
          catalogItems: (item.catalogItems || []).map((c) => ({
            title: c.title || "Item",
            description: c.description || c.desc || c.title || "Specification details available on request.",
          })),
          seo: item.seo
            ? {
                metaTitle: item.seo.metaTitle || item.name,
                metaDescription: item.seo.metaDescription || item.summary,
                keywords: item.seo.keywords || "",
              }
            : null,
        };

        const existing = await app.documents("api::product.product").findFirst({
          filters: { productId: item.id },
        });
        if (!existing) {
          await app.documents("api::product.product").create({
            data: payload,
            status: "published",
          });
          console.log(`  ➕ Product: ${item.shortName}`);
        } else {
          await app.documents("api::product.product").update({
            documentId: existing.documentId,
            data: payload,
            status: "published",
          });
          console.log(`  🔄 Product: ${item.shortName}`);
        }
      }
    }

    // 4. Industries (Collection Type)
    console.log("📌 Seeding Industries...");
    const industriesPath = path.join(dataDir, "industries.json");
    if (fs.existsSync(industriesPath)) {
      const industries = JSON.parse(fs.readFileSync(industriesPath, "utf8"));
      for (const item of industries) {
        const payload = {
          industryId: item.id,
          slug: item.slug,
          name: item.name,
          shortName: item.shortName,
          icon: item.icon,
          relatedService:
            item.relatedService && item.relatedService.slug
              ? {
                  title: item.relatedService.title || "",
                  slug: item.relatedService.slug || "",
                  href: item.relatedService.href || "",
                }
              : null,
          tagline: item.tagline,
          summary: item.summary,
          keySolutions: item.keySolutions || [],
          subIndustries: (item.subIndustries || []).map((sub) => ({
            subId: sub.id,
            slug: sub.slug,
            name: sub.name,
            shortName: sub.shortName,
            icon: sub.icon,
            tagline: sub.tagline,
            summary: sub.summary,
            keySolutions: sub.keySolutions || [],
            fullContentText: sub.fullContentText,
          })),
          fullContentText: item.fullContentText,
          seo: item.seo
            ? {
                metaTitle: item.seo.metaTitle || item.name,
                metaDescription: item.seo.metaDescription || item.summary,
                keywords: item.seo.keywords || "",
              }
            : null,
        };

        const existing = await app
          .documents("api::industry.industry")
          .findFirst({
            filters: { industryId: item.id },
          });
        if (!existing) {
          await app.documents("api::industry.industry").create({
            data: payload,
            status: "published",
          });
          console.log(`  ➕ Industry: ${item.name}`);
        } else {
          await app.documents("api::industry.industry").update({
            documentId: existing.documentId,
            data: payload,
            status: "published",
          });
          console.log(`  🔄 Industry: ${item.name}`);
        }
      }
    }

    // 5. Case Studies (Collection Type)
    console.log("📌 Seeding Case Studies...");
    const caseStudiesPath = path.join(dataDir, "case-studies.json");
    if (fs.existsSync(caseStudiesPath)) {
      const caseStudies = JSON.parse(fs.readFileSync(caseStudiesPath, "utf8"));
      for (const item of caseStudies) {
        const payload = {
          caseStudyId: item.id,
          title: item.title,
          clientIndustry: item.clientIndustry,
          location: item.location,
          badge: item.badge,
          duration: item.duration,
          summary: item.summary,
          challenge: item.challenge,
          solution: item.solution,
          metrics: (item.metrics || []).map((m) => ({
            label: m.label || "",
            value: m.value || "",
          })),
          tags: item.tags || [],
          seo: item.seo
            ? {
                metaTitle: item.seo.metaTitle || item.title,
                metaDescription: item.seo.metaDescription || item.summary,
                keywords: item.seo.keywords || "",
              }
            : null,
        };

        const existing = await app
          .documents("api::case-study.case-study")
          .findFirst({
            filters: { caseStudyId: item.id },
          });
        if (!existing) {
          await app.documents("api::case-study.case-study").create({
            data: payload,
            status: "published",
          });
          console.log(`  ➕ Case Study: ${item.title.slice(0, 40)}...`);
        } else {
          await app.documents("api::case-study.case-study").update({
            documentId: existing.documentId,
            data: payload,
            status: "published",
          });
          console.log(`  🔄 Case Study: ${item.title.slice(0, 40)}...`);
        }
      }
    }

    // 6. Blog Posts (Collection Type)
    console.log("📌 Seeding Blog Posts...");
    const blogPostsPath = path.join(dataDir, "blog-posts.json");
    if (fs.existsSync(blogPostsPath)) {
      const blogPosts = JSON.parse(fs.readFileSync(blogPostsPath, "utf8"));
      for (const item of blogPosts) {
        const payload = {
          postId: item.id,
          slug: item.slug,
          title: item.title,
          excerpt: item.excerpt,
          content: item.content,
          category: item.category,
          author: item.author
            ? {
                name: item.author.name || "",
                role: item.author.role || "",
              }
            : null,
          date: item.date,
          readTime: item.readTime,
          featured: Boolean(item.featured),
          tags: item.tags || [],
          seo: item.seo
            ? {
                metaTitle: item.seo.metaTitle || item.title,
                metaDescription: item.seo.metaDescription || item.excerpt,
                keywords: item.seo.keywords || "",
              }
            : null,
        };

        const existing = await app
          .documents("api::blog-post.blog-post")
          .findFirst({
            filters: { postId: item.id },
          });
        if (!existing) {
          await app.documents("api::blog-post.blog-post").create({
            data: payload,
            status: "published",
          });
          console.log(`  ➕ Blog Post: ${item.title.slice(0, 40)}...`);
        } else {
          await app.documents("api::blog-post.blog-post").update({
            documentId: existing.documentId,
            data: payload,
            status: "published",
          });
          console.log(`  🔄 Blog Post: ${item.title.slice(0, 40)}...`);
        }
      }
    }

    // 7. Jobs (Collection Type)
    console.log("📌 Seeding Jobs...");
    const jobsPath = path.join(dataDir, "jobs.json");
    if (fs.existsSync(jobsPath)) {
      const jobs = JSON.parse(fs.readFileSync(jobsPath, "utf8"));
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
          benefits: item.benefits || [],
        };
        const existing = await app.documents("api::job.job").findFirst({
          filters: { jobId: item.id },
        });
        if (!existing) {
          await app.documents("api::job.job").create({
            data: payload,
            status: "published",
          });
          console.log(`  ➕ Job: ${item.title}`);
        } else {
          await app.documents("api::job.job").update({
            documentId: existing.documentId,
            data: payload,
            status: "published",
          });
          console.log(`  🔄 Job: ${item.title}`);
        }
      }
    }

    // 8. Renewables (Single Type)
    console.log("📌 Seeding Renewables...");
    const renewablesPath = path.join(dataDir, "renewables.json");
    if (fs.existsSync(renewablesPath)) {
      const renewablesData = JSON.parse(
        fs.readFileSync(renewablesPath, "utf8"),
      );
      const payload = {
        title: renewablesData.title,
        tagline: renewablesData.tagline,
        heroDescription: renewablesData.heroDescription || "",
        heroBacking: renewablesData.heroBacking || "",
        solutionsTag: renewablesData.solutionsTag || "",
        solutionsTitle: renewablesData.solutionsTitle || "",
        solutionsDesc: renewablesData.solutionsDesc || "",
        solutions: (renewablesData.solutions || []).map((s) => ({
          solutionId: s.id,
          title: s.title,
          icon: s.icon,
          bullets: s.bullets || [],
        })),
        whyTag: renewablesData.whyTag || "",
        whyTitle: renewablesData.whyTitle || "",
        whyDesc: renewablesData.whyDesc || "",
        whyPills: (renewablesData.whyPills || []).map((p) => ({
          title: p.title,
          icon: p.icon,
        })),
        approachTag: renewablesData.approachTag || "",
        approachTitle: renewablesData.approachTitle || "",
        approachSubtitle: renewablesData.approachSubtitle || "",
        approachSteps: (renewablesData.approachSteps || []).map((step) => ({
          step: Number(step.step) || 1,
          title: step.title,
          desc: step.desc,
          icon: step.icon,
        })),
        partnerTag: renewablesData.partnerTag || "",
        partnerTitle: renewablesData.partnerTitle || "",
        partnerDesc: renewablesData.partnerDesc || "",
        partnerCards: (renewablesData.partnerCards || []).map((c) => ({
          title: c.title,
          desc: c.desc,
          icon: c.icon,
        })),
        ctaTag: renewablesData.ctaTag || "",
        ctaTitle: renewablesData.ctaTitle || "",
        ctaDesc: renewablesData.ctaDesc || "",
        contactEmail:
          renewablesData.contactEmail || "renewables@ofsgroupindia.com",
      };
      const existing = await app
        .documents("api::renewable.renewable")
        .findFirst();
      if (!existing) {
        await app.documents("api::renewable.renewable").create({
          data: payload,
          status: "published",
        });
        console.log("✅ Renewables page created");
      } else {
        await app.documents("api::renewable.renewable").update({
          documentId: existing.documentId,
          data: payload,
          status: "published",
        });
        console.log("🔄 Renewables page updated");
      }
    }

    // 9. FAQs (Collection Type)
    console.log("📌 Seeding FAQs...");
    const faqsPath = path.join(dataDir, "faqs.json");
    if (fs.existsSync(faqsPath)) {
      const faqs = JSON.parse(fs.readFileSync(faqsPath, "utf8"));
      for (const item of faqs) {
        const existing = await app.documents("api::faq.faq").findFirst({
          filters: { question: item.question },
        });
        if (!existing) {
          await app.documents("api::faq.faq").create({
            data: { question: item.question, answer: item.answer },
            status: "published",
          });
          console.log(`  ➕ FAQ: ${item.question.slice(0, 40)}...`);
        } else {
          await app.documents("api::faq.faq").update({
            documentId: existing.documentId,
            data: { question: item.question, answer: item.answer },
            status: "published",
          });
        }
      }
    }

    // 10. Offers (Collection Type) - ALL 19 OFFERS
    console.log("📌 Seeding Offers (19 Offers & Solutions)...");
    const offersPath = path.join(dataDir, "offers.json");
    if (fs.existsSync(offersPath)) {
      const offersObj = JSON.parse(fs.readFileSync(offersPath, "utf8"));
      for (const [key, item] of Object.entries(offersObj)) {
        const slug = item.slug || key;
        const payload = {
          slug: slug,
          href: item.href || `/${slug}`,
          title: item.title,
          category: item.category || "services",
          categoryLabel: item.categoryLabel || "Services",
          heroImageUrl:
            typeof item.heroImage === "string"
              ? item.heroImage
              : item.heroImage?.src || null,
          tagline: item.tagline || item.title || "",
          description: item.description || "",
          overviewTitle: item.overviewTitle || null,
          overviewParagraphs: item.overviewParagraphs || null,
          features: item.features || null,
          sections: item.sections || null,
          gallery: item.gallery || null,
          blocks: (item.blocks || []).map((b) => ({
            title: b.title || "",
            variant:
              b.variant === "dark" ||
              b.variant === "light" ||
              b.variant === "subtle"
                ? b.variant
                : "light",
            imagePosition:
              b.imagePosition === "left" || b.imagePosition === "right"
                ? b.imagePosition
                : "right",
            imageUrl:
              typeof b.image === "string"
                ? b.image
                : b.image && (b.image.src || b.image.url)
                ? b.image.src || b.image.url
                : null,
            imageAlt: (b.image && b.image.alt) || b.title || "",
            intro: b.intro || "",
            items: (b.items || []).map((i) => ({
              title: typeof i === "string" ? i : i.title || "",
              description: typeof i === "string" ? "" : i.description || "",
              image: (typeof i === "object" && i.image) ? i.image : null,
              icon: (typeof i === "object" && i.icon) ? i.icon : null,
            })),
            paragraphs: b.paragraphs || [],
            type: b.type || null,
            eyebrow: b.eyebrow || null,
            subtitle: b.subtitle || null,
            buttonText: b.buttonText || null,
            buttonHref: b.buttonHref || null,
            noBullets: Boolean(b.noBullets),
            hasSubscribeForm: Boolean(b.hasSubscribeForm),
            stats: b.stats || null,
          })),
        };

        const existing = await app.documents("api::offer.offer").findFirst({
          filters: { slug: payload.slug },
        });
        if (!existing) {
          await app.documents("api::offer.offer").create({
            data: payload,
            status: "published",
          });
          console.log(`  ➕ Offer: ${item.title}`);
        } else {
          await app.documents("api::offer.offer").update({
            documentId: existing.documentId,
            data: payload,
            status: "published",
          });
          console.log(`  🔄 Offer: ${item.title}`);
        }
      }
    }

    // 11. Set Public Permissions so Next.js Frontend can fetch without auth
    console.log(
      "🔐 Configuring Public API Permissions for all 10 endpoints...",
    );
    const publicRole = await app
      .documents("plugin::users-permissions.role")
      .findFirst({
        filters: { type: "public" },
        populate: ["permissions"],
      });

    if (publicRole) {
      const apis = [
        { uid: "api::site-config.site-config", actions: ["find"] },
        { uid: "api::product.product", actions: ["find", "findOne"] },
        { uid: "api::industry.industry", actions: ["find", "findOne"] },
        { uid: "api::case-study.case-study", actions: ["find", "findOne"] },
        { uid: "api::blog-post.blog-post", actions: ["find", "findOne"] },
        { uid: "api::job.job", actions: ["find", "findOne"] },
        { uid: "api::renewable.renewable", actions: ["find"] },
        { uid: "api::faq.faq", actions: ["find", "findOne"] },
        { uid: "api::offer.offer", actions: ["find", "findOne"] },
        { uid: "api::enquiry.enquiry", actions: ["create"] },
      ];

      for (const targetApi of apis) {
        for (const action of targetApi.actions) {
          const actionKey = `${targetApi.uid}.${action}`;
          const hasPerm = publicRole.permissions?.some(
            (p) => p.action === actionKey,
          );
          if (!hasPerm) {
            await app.documents("plugin::users-permissions.permission").create({
              data: {
                action: actionKey,
                role: publicRole.id,
                enabled: true,
              },
            });
          }
        }
      }
      console.log("✅ Public permissions granted");
    }

    console.log("\n🎉 ALL OFS STRAPI DATA SUCCESSFULLY SEEDED & VERIFIED!");
  } catch (err) {
    console.error("❌ Seeding error:", err);
    if (err.details) {
      console.error(
        "📋 Validation Details:",
        JSON.stringify(err.details, null, 2),
      );
    }
  } finally {
    await app.destroy();
    process.exit(0);
  }
}

seed();