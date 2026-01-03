// src/helpers/licenseAccess.ts

export const hasFeature = (
  license: any,
  featureSlug: string
): boolean => {
  if (!license?.licenseTypeId?.features) return false;

  return Boolean(license.licenseTypeId.features[featureSlug]);
};
