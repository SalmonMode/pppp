export type ResourceID = string;

export type ResourceMap<T extends { id: ResourceID }> = {
  [key: ResourceID]: T;
};
export type ConnectedResourcesSetMap<T extends { id: ResourceID }> = {
  [key: ResourceID]: Set<T>;
};
