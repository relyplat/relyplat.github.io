import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docsSidebar: [
    {
      type: 'category',
      label: 'Getting Started',
      collapsed: false,
      items: [
        'getting-started/index',
        'getting-started/authentication',
        'getting-started/versioning',
        'getting-started/idempotency',
        'getting-started/rate-limits',
      ],
    },
    {
      type: 'category',
      label: 'Payee Registration & Onboarding',
      collapsed: false,
      items: [
        'payee-registration/index',
        'payee-registration/entities',
      ],
    },
    {
      type: 'category',
      label: 'Payouts',
      collapsed: false,
      items: [
        'payouts/index',
        'payouts/webhooks',
      ],
    },
    {
      type: 'category',
      label: 'Reference',
      collapsed: false,
      items: [
        'reference/entities',
        'reference/status-lifecycle',
        'reference/metadata',
        'reference/errors',
      ],
    },
  ],
};

export default sidebars;
