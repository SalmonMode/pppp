import IsolatedDependencyChain from "../Relations/IsolatedDependencyChain";
import TaskUnit from "../Relations/TaskUnit";

export type UnitToChainMap = {
  [key: TaskUnit["id"]]: IsolatedDependencyChain;
};

export type IsolatedChainMapping = {
  [key: IsolatedDependencyChain["id"]]: IsolatedDependencyChain;
};

/**
 * Details the number of respective connections between this map's associated object and the objects associated with the
 * IDs referenced within.
 *
 * The keys for this object are the IDs of other objects of the same type as the object associated with this object.
 */
export type RelationshipMapping = {
  [key: string]: number;
};

/**
 * A mapping of the number of connections between the objects associated with this objects keys, and the objects
 * associated with the keys inside each {@link RelationshipMapping}.
 *
 * The keys for this object are the IDs of objects of a common type. The {@link RelationshipMapping} should only contain
 * IDs as keys that reference other objects of the same type.
 */
export type InterconnectionStrengthMapping = {
  [key: string]: RelationshipMapping;
};
