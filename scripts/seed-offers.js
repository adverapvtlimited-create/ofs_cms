"use strict";

const fs = require("fs");
const path = require("path");
const { createStrapi } = require("@strapi/strapi");
const { createChildLogger } = require("../src/utils/logger");

const cliLogger = createChildLogger("CLI:SeedOffers");

function formatBlocks(blocks) {
  if (!blocks || !Array.isArray(blocks)) return [];
  return blocks.map((b) => ({
    title: b.title || "",
    variant:
      b.variant === "dark" || b.variant === "light" || b.variant === "subtle"
        ? b.variant
        : "light",
    imagePosition:
      b.imagePosition === "left" || b.imagePosition === "right" || b.imagePosition === "top" || b.imagePosition === "bottom"
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
  }));
}

async function seedOffers() {
  cliLogger.info("Starting Strapi Seeding for all Offers (offers.json)...");

  const dataDir = path.resolve(__dirname, "../../OFS/src/data");
  const offersPath = path.join(dataDir, "offers.json");

  if (!fs.existsSync(offersPath)) {
    cliLogger.error({ path: offersPath }, "offers.json not found at expected path");
    process.exit(1);
  }

  const offersObj = JSON.parse(fs.readFileSync(offersPath, "utf8"));
  let app;

  try {
    app = await createStrapi().load();
    let createdCount = 0;
    let updatedCount = 0;

    for (const [key, item] of Object.entries(offersObj)) {
      const slug = item.slug || key;
      const payload = {
        slug: slug,
        href: item.href || `/${slug}`,
        title: item.title || "",
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
        blocks: formatBlocks(item.blocks),
      };

      const existing = await app.documents("api::offer.offer").findFirst({
        filters: { slug: slug },
      });

      if (!existing) {
        await app.documents("api::offer.offer").create({
          data: payload,
          status: "published",
        });
        cliLogger.info({ slug, title: item.title }, "Created Offer: [%s] %s", slug, item.title);
        createdCount++;
      } else {
        await app.documents("api::offer.offer").update({
          documentId: existing.documentId,
          data: payload,
          status: "published",
        });
        cliLogger.info({ slug, title: item.title }, "Updated Offer: [%s] %s", slug, item.title);
        updatedCount++;
      }
    }

    cliLogger.info(
      { created: createdCount, updated: updatedCount, total: Object.keys(offersObj).length },
      "Offer seeding completed: %d created, %d updated. Total: %d",
      createdCount,
      updatedCount,
      Object.keys(offersObj).length
    );

    // Ensure Public Permissions
    const publicRole = await app
      .documents("plugin::users-permissions.role")
      .findFirst({
        filters: { type: "public" },
        populate: ["permissions"],
      });

    if (publicRole) {
      for (const action of ["find", "findOne"]) {
        const actionKey = `api::offer.offer.${action}`;
        const hasPerm = publicRole.permissions?.some((p) => p.action === actionKey);
        if (!hasPerm) {
          await app.documents("plugin::users-permissions.permission").create({
            data: {
              action: actionKey,
              role: publicRole.id,
              enabled: true,
            },
          });
          cliLogger.info({ action: actionKey }, "Granted public permission: %s", actionKey);
        }
      }
    }
  } catch (err) {
    cliLogger.error({ err, details: err.details }, "Seeding Error: %s", err.message);
    process.exitCode = 1;
  } finally {
    if (app) {
      await app.destroy();
    }
    process.exit(process.exitCode || 0);
  }
}

seedOffers();
