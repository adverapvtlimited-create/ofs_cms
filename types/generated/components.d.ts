import type { Schema, Struct } from '@strapi/strapi';

export interface BlogAuthor extends Struct.ComponentSchema {
  collectionName: 'components_blog_authors';
  info: {
    description: 'Article author credentials';
    displayName: 'Author';
    icon: 'user';
  };
  attributes: {
    avatar: Schema.Attribute.String;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    role: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ElementsBulletItem extends Struct.ComponentSchema {
  collectionName: 'components_elements_bullet_items';
  info: {
    displayName: 'bullet-item';
    icon: 'write';
  };
  attributes: {
    text: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 255;
      }>;
  };
}

export interface ElementsSpecRow extends Struct.ComponentSchema {
  collectionName: 'components_elements_spec_rows';
  info: {
    displayName: 'spec-row';
    icon: 'crown';
  };
  attributes: {
    label: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 100;
      }>;
    value: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 150;
      }>;
  };
}

export interface IndustriesRelatedService extends Struct.ComponentSchema {
  collectionName: 'components_industries_related_services';
  info: {
    description: 'Cross reference to a service';
    displayName: 'Related Service';
    icon: 'link';
  };
  attributes: {
    label: Schema.Attribute.String;
    slug: Schema.Attribute.String;
  };
}

export interface IndustriesSubIndustry extends Struct.ComponentSchema {
  collectionName: 'components_industries_sub_industries';
  info: {
    description: 'Sector specialization under an industry';
    displayName: 'Sub Industry';
    icon: 'layer';
  };
  attributes: {
    fullContentText: Schema.Attribute.Text;
    heroImage: Schema.Attribute.String;
    icon: Schema.Attribute.String;
    keySolutions: Schema.Attribute.JSON;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    shortName: Schema.Attribute.String;
    slug: Schema.Attribute.String & Schema.Attribute.Required;
    subId: Schema.Attribute.String;
    summary: Schema.Attribute.Text;
    tagline: Schema.Attribute.String;
  };
}

export interface OffersBlockItem extends Struct.ComponentSchema {
  collectionName: 'components_offers_block_items';
  info: {
    description: 'Item with title and description within a block';
    displayName: 'Block Item';
    icon: 'bullet-list';
  };
  attributes: {
    description: Schema.Attribute.Text;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface OffersContentBlock extends Struct.ComponentSchema {
  collectionName: 'components_offers_content_blocks';
  info: {
    description: 'Multi-column content section';
    displayName: 'Content Block';
    icon: 'layout';
  };
  attributes: {
    image: Schema.Attribute.Component<'shared.image-with-alt', false>;
    imagePosition: Schema.Attribute.Enumeration<['left', 'right']> &
      Schema.Attribute.DefaultTo<'right'>;
    intro: Schema.Attribute.Text;
    items: Schema.Attribute.Component<'offers.block-item', true>;
    paragraphs: Schema.Attribute.JSON;
    title: Schema.Attribute.String;
    variant: Schema.Attribute.Enumeration<['dark', 'light', 'subtle']> &
      Schema.Attribute.DefaultTo<'light'>;
  };
}

export interface ProductsCatalogItem extends Struct.ComponentSchema {
  collectionName: 'components_products_catalog_items';
  info: {
    description: 'Product catalog item details';
    displayName: 'Catalog Item';
    icon: 'shopping-cart';
  };
  attributes: {
    description: Schema.Attribute.Text & Schema.Attribute.Required;
    image: Schema.Attribute.String;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface RenewablesPartnerCard extends Struct.ComponentSchema {
  collectionName: 'components_renewables_partner_cards';
  info: {
    description: 'Partner audience card';
    displayName: 'Partner Card';
    icon: 'handshake';
  };
  attributes: {
    desc: Schema.Attribute.Text & Schema.Attribute.Required;
    icon: Schema.Attribute.String;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface RenewablesPill extends Struct.ComponentSchema {
  collectionName: 'components_renewables_pills';
  info: {
    description: 'Why section feature pill';
    displayName: 'Renewables Pill';
    icon: 'check';
  };
  attributes: {
    icon: Schema.Attribute.String;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface RenewablesSolution extends Struct.ComponentSchema {
  collectionName: 'components_renewables_solutions';
  info: {
    description: 'Renewable energy domain solution';
    displayName: 'Renewable Solution';
    icon: 'sun';
  };
  attributes: {
    bullets: Schema.Attribute.JSON;
    icon: Schema.Attribute.String;
    image: Schema.Attribute.String;
    solutionId: Schema.Attribute.String;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface RenewablesStep extends Struct.ComponentSchema {
  collectionName: 'components_renewables_steps';
  info: {
    description: 'Approach step';
    displayName: 'Renewables Step';
    icon: 'arrow-right';
  };
  attributes: {
    desc: Schema.Attribute.Text & Schema.Attribute.Required;
    icon: Schema.Attribute.String;
    step: Schema.Attribute.Integer & Schema.Attribute.Required;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SectionsCatalogItem extends Struct.ComponentSchema {
  collectionName: 'components_sections_catalog_items';
  info: {
    displayName: 'catalog-item';
  };
  attributes: {
    description: Schema.Attribute.Text &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 500;
      }>;
    image: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'> &
      Schema.Attribute.Required;
    title: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 100;
      }>;
  };
}

export interface SectionsFeatureGrid extends Struct.ComponentSchema {
  collectionName: 'components_sections_feature_grids';
  info: {
    displayName: 'feature-grid';
  };
  attributes: {
    badge: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 50;
      }>;
    columns: Schema.Attribute.Enumeration<
      ['columns-2', 'columns-3', 'columns-4']
    > &
      Schema.Attribute.Required;
    heading: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 100;
      }>;
    items: Schema.Attribute.Component<'sections.value-card', true>;
  };
}

export interface SectionsHeroBanner extends Struct.ComponentSchema {
  collectionName: 'components_sections_hero_banners';
  info: {
    displayName: 'hero-banner';
    icon: 'information';
  };
  attributes: {
    backgroundMedia: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios'
    >;
    badge: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 50;
      }>;
    ctaButtons: Schema.Attribute.Component<'shared.cta-button', true>;
    highlightText: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 50;
      }>;
    subtitle: Schema.Attribute.Text &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 350;
      }>;
    title: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 150;
      }>;
  };
}

export interface SectionsProcessStep extends Struct.ComponentSchema {
  collectionName: 'components_sections_process_steps';
  info: {
    displayName: 'process-step';
    icon: 'crop';
  };
  attributes: {
    description: Schema.Attribute.Text &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 400;
      }>;
    stepNumber: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 10;
      }>;
    title: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 100;
      }>;
  };
}

export interface SectionsSubService extends Struct.ComponentSchema {
  collectionName: 'components_sections_sub_services';
  info: {
    displayName: 'sub-service';
    icon: 'connector';
  };
  attributes: {
    description: Schema.Attribute.Text &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 400;
      }>;
    icon: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 50;
      }>;
    title: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 100;
      }>;
  };
}

export interface SectionsValueCard extends Struct.ComponentSchema {
  collectionName: 'components_sections_value_cards';
  info: {
    displayName: 'value-card';
  };
  attributes: {
    description: Schema.Attribute.Text &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 400;
      }>;
    image: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    title: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 100;
      }>;
  };
}

export interface ServicesCapability extends Struct.ComponentSchema {
  collectionName: 'components_services_capabilities';
  info: {
    description: 'Service capability point';
    displayName: 'Capability';
    icon: 'shield';
  };
  attributes: {
    description: Schema.Attribute.Text & Schema.Attribute.Required;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ServicesProcessStep extends Struct.ComponentSchema {
  collectionName: 'components_services_process_steps';
  info: {
    description: 'Step-by-step workflow stage';
    displayName: 'Process Step';
    icon: 'bullet-list';
  };
  attributes: {
    desc: Schema.Attribute.Text & Schema.Attribute.Required;
    step: Schema.Attribute.String & Schema.Attribute.Required;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedAddress extends Struct.ComponentSchema {
  collectionName: 'components_shared_addresses';
  info: {
    description: 'Physical address structure';
    displayName: 'Address';
    icon: 'pin';
  };
  attributes: {
    city: Schema.Attribute.String;
    company: Schema.Attribute.String;
    country: Schema.Attribute.String;
    line1: Schema.Attribute.String;
    line2: Schema.Attribute.String;
    pincode: Schema.Attribute.String;
    state: Schema.Attribute.String;
  };
}

export interface SharedContact extends Struct.ComponentSchema {
  collectionName: 'components_shared_contacts';
  info: {
    description: 'Company contact info with global addresses';
    displayName: 'Contact Details';
    icon: 'phone';
  };
  attributes: {
    addressIndia: Schema.Attribute.Component<'shared.address', false>;
    addressUSA: Schema.Attribute.Component<'shared.address', false>;
    email: Schema.Attribute.Email & Schema.Attribute.Required;
    phone: Schema.Attribute.String & Schema.Attribute.Required;
    phoneRaw: Schema.Attribute.String;
  };
}

export interface SharedCtaButton extends Struct.ComponentSchema {
  collectionName: 'components_shared_cta_buttons';
  info: {
    displayName: 'cta-button';
    icon: 'bulletList';
  };
  attributes: {
    backgroundMedia: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios'
    >;
    isExternal: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    label: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 50;
      }>;
    url: Schema.Attribute.String & Schema.Attribute.Required;
    variant: Schema.Attribute.Enumeration<['primary', 'secondary', 'outline']> &
      Schema.Attribute.Required;
  };
}

export interface SharedFaqItem extends Struct.ComponentSchema {
  collectionName: 'components_shared_faq_items';
  info: {
    description: 'Question and answer pair';
    displayName: 'FAQ Item';
    icon: 'question';
  };
  attributes: {
    answer: Schema.Attribute.Text & Schema.Attribute.Required;
    question: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedImageWithAlt extends Struct.ComponentSchema {
  collectionName: 'components_shared_image_with_alts';
  info: {
    description: 'Image source and alt text';
    displayName: 'Image With Alt';
    icon: 'picture';
  };
  attributes: {
    alt: Schema.Attribute.String;
    src: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedOfficeLocation extends Struct.ComponentSchema {
  collectionName: 'components_shared_office_locations';
  info: {
    displayName: 'office-location';
    icon: 'search';
  };
  attributes: {
    addressLine1: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 150;
      }>;
    addressLine2: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 150;
      }>;
    city: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 80;
      }>;
    companyEntity: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 120;
      }>;
    country: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 80;
      }>;
    googleMapsUrl: Schema.Attribute.String;
    officeName: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 100;
      }>;
    pincode: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 20;
      }>;
    state: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 80;
      }>;
  };
}

export interface SharedSeo extends Struct.ComponentSchema {
  collectionName: 'components_shared_seos';
  info: {
    description: 'Search engine optimization metadata';
    displayName: 'SEO';
    icon: 'search';
  };
  attributes: {
    canonicalURL: Schema.Attribute.String;
    keywords: Schema.Attribute.Text;
    metaDescription: Schema.Attribute.Text & Schema.Attribute.Required;
    metaRobots: Schema.Attribute.String;
    metaTitle: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedSocialLink extends Struct.ComponentSchema {
  collectionName: 'components_shared_social_links';
  info: {
    displayName: 'social-link';
    icon: 'link';
  };
  attributes: {
    platform: Schema.Attribute.Enumeration<
      ['LinkedIn', 'Twitter', 'Facebook', 'YouTube']
    > &
      Schema.Attribute.Required;
    url: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedSocials extends Struct.ComponentSchema {
  collectionName: 'components_shared_socials';
  info: {
    description: 'Social media links';
    displayName: 'Social Links';
    icon: 'share';
  };
  attributes: {
    facebook: Schema.Attribute.String;
    instagram: Schema.Attribute.String;
    linkedin: Schema.Attribute.String;
    twitter: Schema.Attribute.String;
    youtube: Schema.Attribute.String;
  };
}

export interface SharedStat extends Struct.ComponentSchema {
  collectionName: 'components_shared_stats';
  info: {
    description: 'Statistics metric card';
    displayName: 'Stat';
    icon: 'chart-pie';
  };
  attributes: {
    desc: Schema.Attribute.Text;
    label: Schema.Attribute.String & Schema.Attribute.Required;
    numeric: Schema.Attribute.Decimal;
    suffix: Schema.Attribute.String;
    value: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedStatMetric extends Struct.ComponentSchema {
  collectionName: 'components_shared_stat_metrics';
  info: {
    description: 'Metric value with label and subtext';
    displayName: 'Stat Metric';
    icon: 'dashboard';
  };
  attributes: {
    label: Schema.Attribute.String & Schema.Attribute.Required;
    subtext: Schema.Attribute.String;
    value: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

declare module '@strapi/strapi' {
  export namespace Public {
    export interface ComponentSchemas {
      'blog.author': BlogAuthor;
      'elements.bullet-item': ElementsBulletItem;
      'elements.spec-row': ElementsSpecRow;
      'industries.related-service': IndustriesRelatedService;
      'industries.sub-industry': IndustriesSubIndustry;
      'offers.block-item': OffersBlockItem;
      'offers.content-block': OffersContentBlock;
      'products.catalog-item': ProductsCatalogItem;
      'renewables.partner-card': RenewablesPartnerCard;
      'renewables.pill': RenewablesPill;
      'renewables.solution': RenewablesSolution;
      'renewables.step': RenewablesStep;
      'sections.catalog-item': SectionsCatalogItem;
      'sections.feature-grid': SectionsFeatureGrid;
      'sections.hero-banner': SectionsHeroBanner;
      'sections.process-step': SectionsProcessStep;
      'sections.sub-service': SectionsSubService;
      'sections.value-card': SectionsValueCard;
      'services.capability': ServicesCapability;
      'services.process-step': ServicesProcessStep;
      'shared.address': SharedAddress;
      'shared.contact': SharedContact;
      'shared.cta-button': SharedCtaButton;
      'shared.faq-item': SharedFaqItem;
      'shared.image-with-alt': SharedImageWithAlt;
      'shared.office-location': SharedOfficeLocation;
      'shared.seo': SharedSeo;
      'shared.social-link': SharedSocialLink;
      'shared.socials': SharedSocials;
      'shared.stat': SharedStat;
      'shared.stat-metric': SharedStatMetric;
    }
  }
}
