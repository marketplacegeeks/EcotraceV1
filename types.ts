export enum UserRole {
  ADMIN = 'ADMIN',
  OPERATOR = 'OPERATOR',
}

export interface User {
  id: string;
  username: string;
  role: UserRole;
}

export enum BatchType {
  INBOUND = 'INBOUND',
  SORTED = 'SORTED',
  FIBRE = 'FIBRE',
}

export interface BaseItem {
  id: string;
  type: BatchType;
  createdAt: string;
  createdBy: string;
  qrCodeUrl: string;
  notes?: string;
}

export interface InboundBatch extends BaseItem {
  type: BatchType.INBOUND;
  supplier: string;
  weightKg: number;
  receivedDate: string;
}

export interface SortedPack extends BaseItem {
  type: BatchType.SORTED;
  parentInboundId: string;
  color: string;
  material: string;
  brand: string;
  weightKg: number;
}

export interface FibrePack extends BaseItem {
  type: BatchType.FIBRE;
  parentSortedIds: string[]; // Can be created from multiple sorted packs
  qualityGrade: string;
  weightKg: number;
}

export type TraceableItem = InboundBatch | SortedPack | FibrePack;

export interface AuditLog {
  id: string;
  action: string;
  timestamp: string;
  userId: string;
  details: string;
  relatedItemId?: string;
}