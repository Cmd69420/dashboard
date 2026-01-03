//src/context/LicenseContext.tsx

import { createContext, useContext, useEffect, useState } from "react";
import API from "../api/AxiosInstance";
import featureRegistry from "../registry/feature.registry";

/* -------------------------------------------------------
   Types
------------------------------------------------------- */

type RegistryFeature = {
  featureSlug: string;
  displayName: string;
  featureType: string;
  description: string;
  uiTemplate: string;
};

type LicenseContextType = {
  license: any;
  registryFeatures: RegistryFeature[];
  loading: boolean;
};

type License = {
  productId: { _id: string };
  licenseTypeId: {
    features: Record<string, boolean | number>;
  };
};

/* -------------------------------------------------------
   Context
------------------------------------------------------- */

const LicenseContext = createContext<LicenseContextType | null>(null);

/* -------------------------------------------------------
   Provider
------------------------------------------------------- */

export const LicenseProvider = ({ children }: any) => {

const [license, setLicense] = useState<License | null>(null);

  const [registryFeatures, setRegistryFeatures] = useState<RegistryFeature[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

 useEffect(() => {
  const initLicense = async () => {
    const user =
      JSON.parse(localStorage.getItem("user") || "null") ||
      { email: localStorage.getItem("userEmail") };

    if (!user?.email) {
      setLoading(false);
      return;
    }

    try {
      const res = await API.get(
        `/api/external/actve-license/${user.email}?productId=69589d3ba7306459dd47fd87`,
      );

      setLicense(res.data.activeLicense);
    } catch (err) {
      console.error("License fetch failed", err);
    } finally {
      setLoading(false);
    }
  };

  initLicense();
}, []);


  return (
    <LicenseContext.Provider
      value={{
        license,
        registryFeatures,
        loading,
      }}
    >
      {children}
    </LicenseContext.Provider>
  );
};

/* -------------------------------------------------------
   Hook
------------------------------------------------------- */

export const useLicense = () => {
  const context = useContext(LicenseContext);

  if (!context) {
    throw new Error("useLicense must be used inside LicenseProvider");
  }

  return context;
};