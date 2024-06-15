import network from "../common/config/network.json";

export const INSPECTOR_SIZE_PX = 650;

export const URL_BASE = network.dev_server_url;
export const INDEXED_TILES_URL = `${URL_BASE}/directory/indexed.csv`;
export const INSPECTOR_PADDING_PX = 5;

export const STORAGE_FOCAL_POINT_KEY = "inspector_focal_point"
export const STORAGE_SCOPE_KEY = "inspector_scope"
