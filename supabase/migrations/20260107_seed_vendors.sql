-- Seed Vendors Database with Top 100 SaaS/Marketing Tools
-- Common tools used by NZ manufacturers and small businesses

INSERT INTO public.vendors (name, aliases, category, known_saas, typical_frequency, supports_annual_discount, retention_discount_likely, bundle_includes) VALUES

-- Email Marketing & CRM
('Mailchimp', ARRAY['MAILCHIMP', 'MAIL CHIMP'], 'marketing', true, 'monthly', true, true, NULL),
('HubSpot', ARRAY['HUBSPOT', 'HUB SPOT'], 'marketing', true, 'monthly', true, true, ARRAY['CRM', 'Email', 'Marketing']),
('ActiveCampaign', ARRAY['ACTIVECAMPAIGN', 'ACTIVE CAMPAIGN'], 'marketing', true, 'monthly', true, true, NULL),
('Constant Contact', ARRAY['CONSTANTCONTACT', 'CONSTANT CONTACT'], 'marketing', true, 'monthly', true, true, NULL),
('SendGrid', ARRAY['SENDGRID', 'SEND GRID', 'TWILIO SENDGRID'], 'marketing', true, 'monthly', false, false, NULL),
('Klaviyo', ARRAY['KLAVIYO'], 'marketing', true, 'monthly', true, true, NULL),
('ConvertKit', ARRAY['CONVERTKIT', 'CONVERT KIT'], 'marketing', true, 'monthly', true, true, NULL),

-- SEO & Marketing Tools
('SEMrush', ARRAY['SEMRUSH', 'SEM RUSH'], 'marketing', true, 'monthly', true, true, NULL),
('Ahrefs', ARRAY['AHREFS', 'AHR EFS'], 'marketing', true, 'monthly', true, true, NULL),
('Moz', ARRAY['MOZ', 'MOZ PRO'], 'marketing', true, 'monthly', true, true, NULL),
('Google Ads', ARRAY['GOOGLE ADS', 'GOOGLEADS', 'ADWORDS'], 'marketing', true, 'monthly', false, false, NULL),
('Facebook Ads', ARRAY['FACEBOOK ADS', 'FB ADS', 'META ADS'], 'marketing', true, 'monthly', false, false, NULL),
('LinkedIn Ads', ARRAY['LINKEDIN ADS', 'LINKEDIN'], 'marketing', true, 'monthly', false, false, NULL),

-- Design & Creative Tools
('Canva', ARRAY['CANVA', 'CANVA PRO'], 'marketing', true, 'monthly', true, true, NULL),
('Adobe Creative Cloud', ARRAY['ADOBE', 'CREATIVE CLOUD', 'ADOBE CC'], 'marketing', true, 'monthly', true, true, ARRAY['Photoshop', 'Illustrator', 'InDesign']),
('Figma', ARRAY['FIGMA'], 'marketing', true, 'monthly', true, true, NULL),
('Sketch', ARRAY['SKETCH', 'SKETCH APP'], 'marketing', true, 'annual', false, false, NULL),

-- Video & Meeting Tools
('Zoom', ARRAY['ZOOM', 'ZOOM MEETINGS'], 'software', true, 'monthly', true, true, NULL),
('Loom', ARRAY['LOOM'], 'marketing', true, 'monthly', true, true, NULL),
('Vimeo', ARRAY['VIMEO', 'VIMEO PRO'], 'marketing', true, 'monthly', true, true, NULL),
('Calendly', ARRAY['CALENDLY'], 'software', true, 'monthly', true, true, NULL),

-- E-commerce & Payments
('Shopify', ARRAY['SHOPIFY', 'SHOPIFY*'], 'software', true, 'monthly', true, true, ARRAY['Payments', 'Hosting']),
('Stripe', ARRAY['STRIPE', 'STRIPE*'], 'payments', true, 'monthly', false, false, NULL),
('PayPal', ARRAY['PAYPAL', 'PAY PAL'], 'payments', true, 'monthly', false, false, NULL),
('Square', ARRAY['SQUARE', 'SQ*'], 'payments', true, 'monthly', false, false, NULL),
('WooCommerce', ARRAY['WOOCOMMERCE', 'WOO COMMERCE'], 'software', true, 'monthly', false, false, NULL),
('BigCommerce', ARRAY['BIGCOMMERCE', 'BIG COMMERCE'], 'software', true, 'monthly', true, true, NULL),

-- Cloud Storage & File Sharing
('Dropbox', ARRAY['DROPBOX', 'DROP BOX'], 'software', true, 'monthly', true, true, NULL),
('Google Workspace', ARRAY['GOOGLE WORKSPACE', 'GSUITE', 'G SUITE', 'GOOGLE'], 'software', true, 'monthly', true, true, ARRAY['Gmail', 'Drive', 'Meet', 'Calendar']),
('Microsoft 365', ARRAY['MICROSOFT 365', 'OFFICE 365', 'O365', 'MICROSOFT'], 'software', true, 'monthly', true, true, ARRAY['Office', 'OneDrive', 'Teams', 'Exchange']),
('iCloud', ARRAY['ICLOUD', 'APPLE ICLOUD', 'APPLE'], 'software', true, 'monthly', false, false, NULL),
('OneDrive', ARRAY['ONEDRIVE', 'ONE DRIVE'], 'software', true, 'monthly', false, false, NULL),
('Box', ARRAY['BOX', 'BOX COM'], 'software', true, 'monthly', true, true, NULL),

-- Project Management & Productivity
('Asana', ARRAY['ASANA'], 'software', true, 'monthly', true, true, NULL),
('Monday.com', ARRAY['MONDAY', 'MONDAYCOM', 'MONDAY COM'], 'software', true, 'monthly', true, true, NULL),
('Trello', ARRAY['TRELLO'], 'software', true, 'monthly', true, true, NULL),
('ClickUp', ARRAY['CLICKUP', 'CLICK UP'], 'software', true, 'monthly', true, true, NULL),
('Notion', ARRAY['NOTION'], 'software', true, 'monthly', true, true, NULL),
('Airtable', ARRAY['AIRTABLE', 'AIR TABLE'], 'software', true, 'monthly', true, true, NULL),
('Basecamp', ARRAY['BASECAMP', 'BASE CAMP'], 'software', true, 'annual', false, true, NULL),
('Jira', ARRAY['JIRA', 'ATLASSIAN JIRA'], 'software', true, 'monthly', true, true, NULL),
('Confluence', ARRAY['CONFLUENCE', 'ATLASSIAN CONFLUENCE'], 'software', true, 'monthly', true, true, NULL),

-- Communication & Collaboration
('Slack', ARRAY['SLACK'], 'software', true, 'monthly', true, true, NULL),
('Microsoft Teams', ARRAY['TEAMS', 'MS TEAMS', 'MICROSOFT TEAMS'], 'software', true, 'monthly', false, false, NULL),
('Discord', ARRAY['DISCORD'], 'software', true, 'monthly', false, false, NULL),

-- Accounting & Finance
('Xero', ARRAY['XERO'], 'software', true, 'monthly', true, true, NULL),
('QuickBooks', ARRAY['QUICKBOOKS', 'QUICK BOOKS', 'INTUIT'], 'software', true, 'monthly', true, true, NULL),
('MYOB', ARRAY['MYOB'], 'software', true, 'monthly', true, true, NULL),
('FreshBooks', ARRAY['FRESHBOOKS', 'FRESH BOOKS'], 'software', true, 'monthly', true, true, NULL),
('Wave', ARRAY['WAVE', 'WAVE ACCOUNTING'], 'software', true, 'monthly', false, false, NULL),

-- Website & Hosting
('Squarespace', ARRAY['SQUARESPACE', 'SQUARE SPACE'], 'software', true, 'monthly', true, true, ARRAY['Hosting', 'Domain']),
('Wix', ARRAY['WIX', 'WIX COM'], 'software', true, 'monthly', true, true, ARRAY['Hosting', 'Domain']),
('WordPress', ARRAY['WORDPRESS', 'WORD PRESS'], 'software', true, 'monthly', false, false, NULL),
('GoDaddy', ARRAY['GODADDY', 'GO DADDY'], 'software', true, 'annual', false, true, ARRAY['Domain', 'Hosting']),
('Bluehost', ARRAY['BLUEHOST', 'BLUE HOST'], 'software', true, 'annual', false, true, NULL),
('SiteGround', ARRAY['SITEGROUND', 'SITE GROUND'], 'software', true, 'annual', false, true, NULL),
('WP Engine', ARRAY['WPENGINE', 'WP ENGINE'], 'software', true, 'monthly', true, true, NULL),

-- Domain & DNS
('Namecheap', ARRAY['NAMECHEAP', 'NAME CHEAP'], 'software', true, 'annual', false, false, NULL),
('Cloudflare', ARRAY['CLOUDFLARE', 'CLOUD FLARE'], 'software', true, 'monthly', false, false, NULL),

-- Analytics & Tracking
('Google Analytics', ARRAY['GOOGLE ANALYTICS', 'GA4'], 'marketing', true, 'monthly', false, false, NULL),
('Hotjar', ARRAY['HOTJAR', 'HOT JAR'], 'marketing', true, 'monthly', true, true, NULL),
('Mixpanel', ARRAY['MIXPANEL', 'MIX PANEL'], 'marketing', true, 'monthly', true, true, NULL),
('Amplitude', ARRAY['AMPLITUDE'], 'marketing', true, 'monthly', true, true, NULL),

-- Social Media Management
('Hootsuite', ARRAY['HOOTSUITE', 'HOOT SUITE'], 'marketing', true, 'monthly', true, true, NULL),
('Buffer', ARRAY['BUFFER'], 'marketing', true, 'monthly', true, true, NULL),
('Later', ARRAY['LATER'], 'marketing', true, 'monthly', true, true, NULL),
('Sprout Social', ARRAY['SPROUTSOCIAL', 'SPROUT SOCIAL'], 'marketing', true, 'monthly', true, true, NULL),

-- Customer Support & Chat
('Zendesk', ARRAY['ZENDESK', 'ZEN DESK'], 'software', true, 'monthly', true, true, NULL),
('Intercom', ARRAY['INTERCOM'], 'software', true, 'monthly', true, true, NULL),
('Freshdesk', ARRAY['FRESHDESK', 'FRESH DESK'], 'software', true, 'monthly', true, true, NULL),
('Help Scout', ARRAY['HELPSCOUT', 'HELP SCOUT'], 'software', true, 'monthly', true, true, NULL),
('LiveChat', ARRAY['LIVECHAT', 'LIVE CHAT'], 'software', true, 'monthly', true, true, NULL),

-- HR & Recruitment
('BambooHR', ARRAY['BAMBOOHR', 'BAMBOO HR'], 'software', true, 'monthly', true, true, NULL),
('Gusto', ARRAY['GUSTO'], 'software', true, 'monthly', true, true, NULL),
('Workable', ARRAY['WORKABLE'], 'software', true, 'monthly', true, true, NULL),

-- Security & VPN
('LastPass', ARRAY['LASTPASS', 'LAST PASS'], 'software', true, 'annual', false, true, NULL),
('1Password', ARRAY['1PASSWORD', '1 PASSWORD'], 'software', true, 'annual', false, true, NULL),
('NordVPN', ARRAY['NORDVPN', 'NORD VPN'], 'software', true, 'annual', false, true, NULL),
('ExpressVPN', ARRAY['EXPRESSVPN', 'EXPRESS VPN'], 'software', true, 'annual', false, true, NULL),

-- Development & Technical
('GitHub', ARRAY['GITHUB', 'GIT HUB'], 'software', true, 'monthly', true, true, NULL),
('GitLab', ARRAY['GITLAB', 'GIT LAB'], 'software', true, 'monthly', true, true, NULL),
('Bitbucket', ARRAY['BITBUCKET', 'BIT BUCKET'], 'software', true, 'monthly', true, true, NULL),
('Vercel', ARRAY['VERCEL'], 'software', true, 'monthly', true, true, NULL),
('Netlify', ARRAY['NETLIFY', 'NET LIFY'], 'software', true, 'monthly', true, true, NULL),
('AWS', ARRAY['AWS', 'AMAZON WEB SERVICES', 'AMAZON AWS'], 'software', true, 'monthly', false, false, NULL),
('DigitalOcean', ARRAY['DIGITALOCEAN', 'DIGITAL OCEAN'], 'software', true, 'monthly', true, true, NULL),
('Heroku', ARRAY['HEROKU'], 'software', true, 'monthly', true, true, NULL),

-- Backup & Security
('Backblaze', ARRAY['BACKBLAZE', 'BACK BLAZE'], 'software', true, 'monthly', false, false, NULL),
('Carbonite', ARRAY['CARBONITE'], 'software', true, 'monthly', false, true, NULL),

-- Telecom (NZ-specific)
('Spark', ARRAY['SPARK NZ', 'SPARK'], 'telco', true, 'monthly', false, true, NULL),
('Vodafone', ARRAY['VODAFONE', 'VODAFONE NZ'], 'telco', true, 'monthly', false, true, NULL),
('2degrees', ARRAY['2DEGREES', '2 DEGREES'], 'telco', true, 'monthly', false, true, NULL),
('Skinny', ARRAY['SKINNY', 'SKINNY MOBILE'], 'telco', true, 'monthly', false, false, NULL),
('One NZ', ARRAY['ONE NZ', 'ONENZ'], 'telco', true, 'monthly', false, true, NULL),

-- Business Services NZ
('NZ Post', ARRAY['NZPOST', 'NZ POST', 'NEW ZEALAND POST'], 'other', true, 'monthly', false, false, NULL),
('CourierPost', ARRAY['COURIERPOST', 'COURIER POST'], 'other', true, 'monthly', false, false, NULL);

