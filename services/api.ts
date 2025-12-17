import { AuditLog, BatchType, FibrePack, InboundBatch, SortedPack, TraceableItem, User, UserRole } from '../types';

const STORAGE_KEYS = {
  ITEMS: 'ecotrace_items',
  LOGS: 'ecotrace_logs',
  SESSION: 'ecotrace_session',
  USERS: 'ecotrace_users',
};

// Initial Seed Data (if no users exist)
const SEED_USERS = [
  { id: 'u1', username: 'admin', password: 'password', role: UserRole.ADMIN },
  { id: 'u2', username: 'operator', password: 'password', role: UserRole.OPERATOR },
];

// Helper to simulate delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- Auth Services ---

const getUsers = (): any[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.USERS);
  if (stored) return JSON.parse(stored);
  // Initialize seed if empty
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(SEED_USERS));
  return SEED_USERS;
};

const saveUsers = (users: any[]) => {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
};

const saveUser = (user: any) => {
  const users = getUsers();
  users.push(user);
  saveUsers(users);
};

export const register = async (username: string, password: string, role: UserRole): Promise<User> => {
  await delay(800);
  const users = getUsers();
  if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
    throw new Error("Username already taken");
  }

  const newUser = {
    id: `u-${Date.now()}`,
    username,
    password, // In a real app, hash this!
    role
  };

  saveUser(newUser);
  
  // Auto login after register
  const { password: _, ...safeUser } = newUser;
  localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(safeUser));
  return safeUser;
};

export const login = async (username: string, password?: string): Promise<User> => {
  await delay(600);
  const users = getUsers();
  const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
  
  if (user && user.password === password) {
    const { password: _, ...safeUser } = user;
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(safeUser));
    return safeUser;
  }
  
  throw new Error("Invalid credentials");
};

export const resetPassword = async (username: string): Promise<void> => {
  await delay(1000);
  const users = getUsers();
  const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
  if (!user) throw new Error("User not found");
  // In a real app, send email here.
  return;
};

export const logout = async () => {
  localStorage.removeItem(STORAGE_KEYS.SESSION);
};

export const getCurrentUser = (): User | null => {
  const stored = localStorage.getItem(STORAGE_KEYS.SESSION);
  return stored ? JSON.parse(stored) : null;
};


// --- Admin User Management ---

export const getAllUsers = async (): Promise<User[]> => {
  await delay(200);
  const users = getUsers();
  return users.map(({ password, ...safeUser }) => safeUser);
};

export const createUser = async (data: {username: string, password: string, role: UserRole}): Promise<User> => {
  await delay(500);
  const admin = getCurrentUser();
  if (!admin || admin.role !== UserRole.ADMIN) throw new Error("Unauthorized");

  const users = getUsers();
  if (users.find(u => u.username.toLowerCase() === data.username.toLowerCase())) {
    throw new Error("Username already taken");
  }

  const newUser = {
    id: `u-${Date.now()}`,
    username: data.username,
    password: data.password,
    role: data.role,
  };

  saveUser(newUser);
  addLog('ADMIN_CREATE_USER', `Admin ${admin.username} created user ${data.username}`);

  const { password, ...safeUser } = newUser;
  return safeUser;
};


export const deleteUser = async (userId: string): Promise<void> => {
  await delay(300);
  const admin = getCurrentUser();
  if (!admin || admin.role !== UserRole.ADMIN) throw new Error("Unauthorized");
  if (admin.id === userId) throw new Error("You cannot delete your own account.");

  let users = getUsers();
  const userToDelete = users.find(u => u.id === userId);
  if (!userToDelete) throw new Error("User not found");

  const updatedUsers = users.filter(u => u.id !== userId);
  saveUsers(updatedUsers);

  addLog('ADMIN_DELETE_USER', `Admin ${admin.username} deleted user ${userToDelete.username} (ID: ${userId})`);
};


// --- Data Services ---

const getItems = (): TraceableItem[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.ITEMS);
  return stored ? JSON.parse(stored) : [];
};

const saveItem = (item: TraceableItem) => {
  const items = getItems();
  items.push(item);
  localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
};

export const getLogs = (): AuditLog[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.LOGS);
  return stored ? JSON.parse(stored) : [];
};

const addLog = (action: string, details: string, relatedItemId?: string) => {
  const user = getCurrentUser();
  const logs = getLogs();
  const newLog: AuditLog = {
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
    userId: user?.username || 'unknown',
    action,
    details,
    relatedItemId,
  };
  logs.unshift(newLog); // Prepend
  localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
};

// --- Business Logic ---

export const createInboundBatch = async (data: Omit<InboundBatch, 'id' | 'type' | 'createdAt' | 'createdBy' | 'qrCodeUrl'>): Promise<InboundBatch> => {
  await delay(400);
  const user = getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const id = `IB-${Date.now().toString().slice(-6)}`;
  const newItem: InboundBatch = {
    ...data,
    id,
    type: BatchType.INBOUND,
    createdAt: new Date().toISOString(),
    createdBy: user.username,
    qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${id}`,
  };
  
  saveItem(newItem);
  addLog('CREATE_INBOUND', `Created inbound batch ${id} from supplier ${data.supplier}`, id);
  return newItem;
};

export const createSortedPack = async (data: Omit<SortedPack, 'id' | 'type' | 'createdAt' | 'createdBy' | 'qrCodeUrl'>): Promise<SortedPack> => {
  await delay(400);
  const user = getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const id = `SP-${Date.now().toString().slice(-6)}`;
  const newItem: SortedPack = {
    ...data,
    id,
    type: BatchType.SORTED,
    createdAt: new Date().toISOString(),
    createdBy: user.username,
    qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${id}`,
  };

  saveItem(newItem);
  addLog('CREATE_SORTED', `Sorted pack ${id} created from batch ${data.parentInboundId}`, id);
  return newItem;
};

export const createFibrePack = async (data: Omit<FibrePack, 'id' | 'type' | 'createdAt' | 'createdBy' | 'qrCodeUrl'>): Promise<FibrePack> => {
  await delay(400);
  const user = getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const id = `FP-${Date.now().toString().slice(-6)}`;
  const newItem: FibrePack = {
    ...data,
    id,
    type: BatchType.FIBRE,
    createdAt: new Date().toISOString(),
    createdBy: user.username,
    qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${id}`,
  };

  saveItem(newItem);
  addLog('CREATE_FIBRE', `Fibre pack ${id} created from ${data.parentSortedIds.length} sorted packs`, id);
  return newItem;
};

// --- Retrieval ---

export const getAllItems = async (): Promise<TraceableItem[]> => {
  await delay(200);
  return getItems();
};

export const getItemById = async (id: string): Promise<TraceableItem | undefined> => {
  await delay(100);
  return getItems().find(i => i.id === id);
};

export const getItemsByType = async <T extends TraceableItem>(type: BatchType): Promise<T[]> => {
  await delay(200);
  return getItems().filter(i => i.type === type) as T[];
};

export const getTraceabilityChain = async (rootId: string) => {
  const allItems = getItems();
  const root = allItems.find(i => i.id === rootId);
  if (!root) return null;

  const chain: { root: TraceableItem; parents: TraceableItem[]; grandParents: TraceableItem[] } = {
    root,
    parents: [],
    grandParents: []
  };

  if (root.type === BatchType.SORTED) {
    const parent = allItems.find(i => i.id === (root as SortedPack).parentInboundId);
    if (parent) chain.parents.push(parent);
  } else if (root.type === BatchType.FIBRE) {
    const parentIds = (root as FibrePack).parentSortedIds;
    const parents = allItems.filter(i => parentIds.includes(i.id));
    chain.parents = parents;
    
    // Get Grandparents (Inbound)
    const grandParentIds = parents.map(p => (p as SortedPack).parentInboundId);
    const grandParents = allItems.filter(i => grandParentIds.includes(i.id));
    chain.grandParents = grandParents;
  }
  return chain;
};