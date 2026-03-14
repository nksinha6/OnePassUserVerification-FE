import { get } from "./api";
import ENDPOINTS from "../constants/config";

export const getTenantById = (tenantId, config = {}) => {
  const cfg = {
    ...config,
    params: { ...(config.params || {}), tenantId },
  };

  return get(ENDPOINTS.TENANT_BY_ID, cfg);
};

export default {
  getTenantById,
};
