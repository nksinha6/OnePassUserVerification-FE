import { get } from "./api";
import ENDPOINTS from "../constants/config";

export const getTenantById = async (tenantId, config = {}) => {
  const cfg = {
    ...config,
    params: { ...(config.params || {}), tenantId },
  };

  const response = await get(ENDPOINTS.TENANT_BY_ID, cfg);

  return response;
};

export default {
  getTenantById,
};
