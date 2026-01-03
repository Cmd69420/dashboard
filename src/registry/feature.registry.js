const featureRegistry = [
  {
    productId: "69589d3ba7306459dd47fd87",
    productName: "Trackon",
    features: [
      // --------------------
      // LIMITS
      // --------------------
      {
        featureSlug: "user-limit",
        displayName: "Users",
        featureType: "limit",
        unit: "users",
        description: "Maximum number of users allowed",
        uiTemplate: "Up to {value} users",
      },
      {
        featureSlug: "storage-limit",
        displayName: "Storage",
        featureType: "limit",
        unit: "GB",
        description: "Total storage available",
        uiTemplate: "Up to {value} GB cloud storage",
      },

      // --------------------
      // TRACKING
      // --------------------
      {
        featureSlug: "gps-tracking",
        displayName: "GPS Tracking",
        featureType: "boolean",
        description: "Real-time GPS tracking of field staff",
        uiTemplate: "Real-time GPS tracking",
      },
      {
        featureSlug: "gps-interval-10",
        displayName: "GPS Update Interval",
        featureType: "boolean",
        description: "GPS tracking every 10 minutes",
        uiTemplate: "GPS tracking every 10 minutes",
      },
      {
        featureSlug: "gps-interval-5",
        displayName: "GPS Update Interval",
        featureType: "boolean",
        description: "GPS tracking every 5 minutes",
        uiTemplate: "GPS tracking every 5 minutes",
      },
      {
        featureSlug: "gps-interval-3",
        displayName: "GPS Update Interval",
        featureType: "boolean",
        description: "GPS tracking every 3 minutes",
        uiTemplate: "GPS tracking every 3 minutes",
      },

      // --------------------
      // CRM & MANAGEMENT
      // --------------------
      {
        featureSlug: "basic-crm",
        displayName: "Basic CRM",
        featureType: "boolean",
        description: "Basic client management",
        uiTemplate: "Basic client management",
      },
      {
        featureSlug: "advanced-crm",
        displayName: "Advanced CRM",
        featureType: "boolean",
        description: "Advanced client management features",
        uiTemplate: "Advanced client management",
      },
      {
        featureSlug: "crm-suite",
        displayName: "CRM Suite",
        featureType: "boolean",
        description: "Complete CRM suite",
        uiTemplate: "Complete CRM suite",
      },
      {
        featureSlug: "team-management",
        displayName: "Team Management",
        featureType: "boolean",
        description: "Manage teams and roles",
        uiTemplate: "Team management",
      },

      // --------------------
      // FILTERS & MAPS
      // --------------------
      {
        featureSlug: "pincode-filter-basic",
        displayName: "Pincode Filtering",
        featureType: "boolean",
        description: "Basic pincode-based filtering",
        uiTemplate: "Pincode-based filtering",
      },
      {
        featureSlug: "pincode-filter-smart",
        displayName: "Smart Filtering",
        featureType: "boolean",
        description: "Advanced smart pincode filtering",
        uiTemplate: "Smart pincode filtering",
      },
      {
        featureSlug: "interactive-maps",
        displayName: "Map Views",
        featureType: "boolean",
        description: "Interactive map views for tracking",
        uiTemplate: "Interactive map views",
      },

      // --------------------
      // INTEGRATIONS & API
      // --------------------
      {
        featureSlug: "api-access",
        displayName: "API Access",
        featureType: "boolean",
        description: "Access to developer APIs",
        uiTemplate: "Developer API's access",
      },
      {
        featureSlug: "tally-integration",
        displayName: "Tally Integration",
        featureType: "boolean",
        description: "Tally ERP integration",
        uiTemplate: "Tally ERP integration",
      },
      {
        featureSlug: "custom-integrations",
        displayName: "Custom Integrations",
        featureType: "boolean",
        description: "Custom system integrations",
        uiTemplate: "Custom integrations",
      },

      // --------------------
      // REPORTING & EXPORT
      // --------------------
      {
        featureSlug: "basic-reporting",
        displayName: "Reporting",
        featureType: "boolean",
        description: "Basic reporting features",
        uiTemplate: "Basic reporting",
      },
      {
        featureSlug: "advanced-analytics",
        displayName: "Analytics",
        featureType: "boolean",
        description: "Advanced analytics and insights",
        uiTemplate: "Advanced analytics",
      },
      {
        featureSlug: "data-export",
        displayName: "Data Export",
        featureType: "boolean",
        description: "Export reports and data",
        uiTemplate: "Export capabilities",
      },

      // --------------------
      // SUPPORT
      // --------------------
      {
        featureSlug: "email-support",
        displayName: "Email Support",
        featureType: "boolean",
        description: "Email-based customer support",
        uiTemplate: "Email support",
      },
      {
        featureSlug: "priority-support",
        displayName: "Priority Support",
        featureType: "boolean",
        description: "Priority customer support",
        uiTemplate: "Priority support",
      },
      {
        featureSlug: "support-24-7",
        displayName: "24/7 Support",
        featureType: "boolean",
        description: "24/7 dedicated support",
        uiTemplate: "24/7 dedicated support",
      },

      // --------------------
      // ENTERPRISE
      // --------------------
      {
        featureSlug: "white-label",
        displayName: "White Label",
        featureType: "boolean",
        description: "Remove Trackon branding",
        uiTemplate: "White-label option",
      },
      {
        featureSlug: "advanced-security",
        displayName: "Security",
        featureType: "boolean",
        description: "Advanced security controls",
        uiTemplate: "Advanced security",
      },
      {
        featureSlug: "dedicated-manager",
        displayName: "Account Manager",
        featureType: "boolean",
        description: "Dedicated account manager",
        uiTemplate: "Dedicated account manager",
      },
      {
        featureSlug: "custom-training",
        displayName: "Training",
        featureType: "boolean",
        description: "Custom onboarding & training",
        uiTemplate: "Custom training",
      },
    ],
  },
];

export default featureRegistry;
