import { get } from "./api";
import ENDPOINTS from "../constants/config";

export const getPropertyById = (propertyId, config = {}) => {
  const cfg = { ...config, params: { ...(config.params || {}), propertyId } };
  return get(ENDPOINTS.PROPERTY_BY_ID, cfg);
};

export default {
  getPropertyById,
};
