import { AuditLog, BatchType, FibrePack, InboundBatch, SortedPack, TraceableItem, User, UserRole, Consignment } from '../types';

const STORAGE_KEYS = {
  ITEMS: 'ecotrace_items',
  LOGS: 'ecotrace_logs',
  SESSION: 'ecotrace_session',
  USERS: 'ecotrace_users',
  SUPPLIERS: 'ecotrace_suppliers',
  BRANDS: 'ecotrace_brands',
  MATERIALS: 'ecotrace_materials',
  COLORS: 'ecotrace_colors',
  VENDORS: 'ecotrace_vendors',
  COUNTRIES: 'ecotrace_countries',
  CONSIGNMENTS: 'ecotrace_consignments',
  QR_COUNTERS: 'ecotrace_qr_counters',
};

// Initial Seed Data
const SEED_USERS = [
  { id: 'u1', username: 'admin', password: 'password', role: UserRole.ADMIN },
  { id: 'u2', username: 'operator', password: 'password', role: UserRole.OPERATOR },
];

const SEED_SUPPLIERS = ['EcoCollect Inc.', 'FibreCycle LLC', 'GreenTex Solutions'];
const SEED_VENDORS = ['Global Textiles', 'RecyclePro', 'Sustainable Threads'];
const SEED_COUNTRIES = ['India', 'Vietnam', 'Bangladesh', 'Turkey', 'Portugal'];
const SEED_BRANDS = ['Nike', 'Adidas', 'Uniqlo', 'Zara', 'H&M', 'Generic'];
const SEED_MATERIALS = ['Cotton', 'Polyester', 'Denim', 'Blend', 'Wool', 'Linen'];
const SEED_COLORS = ['White', 'Black', 'Grey', 'Red', 'Blue', 'Green', 'Yellow', 'Mixed'];

const SEED_ITEMS: TraceableItem[] = [
  {
    id: 'IB-SEED01',
    type: BatchType.INBOUND,
    createdAt: new Date('2024-07-15T10:00:00Z').toISOString(),
    createdBy: 'operator',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=IB-SEED01',
    supplier: 'EcoCollect Inc.',
    cartonCount: 2,
    cartonIds: ['CTN-A1', 'CTN-A2'],
  },
  {
    id: 'PACK-BLUE-COT-01',
    type: BatchType.SORTED,
    createdAt: new Date('2024-07-15T11:30:00Z').toISOString(),
    createdBy: 'operator',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=PACK-BLUE-COT-01',
    parentInboundId: 'IB-SEED01',
    color: 'Blue',
    material: 'Cotton',
    brand: 'Nike',
    weightKg: 5.5,
  },
  {
    id: 'PACK-RED-POLY-02',
    type: BatchType.SORTED,
    createdAt: new Date('2024-07-15T11:35:00Z').toISOString(),
    createdBy: 'operator',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=PACK-RED-POLY-02',
    parentInboundId: 'IB-SEED01',
    color: 'Red',
    material: 'Polyester',
    brand: 'Adidas',
    weightKg: 8.2,
  },
  {
    id: 'PACK-WHT-BLEND-03',
    type: BatchType.SORTED,
    createdAt: new Date('2024-07-15T11:40:00Z').toISOString(),
    createdBy: 'operator',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=PACK-WHT-BLEND-03',
    parentInboundId: 'IB-SEED01',
    color: 'White',
    material: 'Blend',
    brand: 'Uniqlo',
    weightKg: 4.1,
  },
  {
    id: 'FP-SEED-01',
    type: BatchType.FIBRE,
    createdAt: new Date('2024-07-16T09:00:00Z').toISOString(),
    createdBy: 'operator',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=FP-SEED-01',
    parentSortedIds: ['PACK-BLUE-COT-01', 'PACK-RED-POLY-02'],
    weightKg: 13.7,
    brands: ['Nike', 'Adidas'],
    material: 'Blend',
    color: 'Mixed',
  },
  {
    id: 'FP-SEED-02',
    type: BatchType.FIBRE,
    createdAt: new Date('2024-07-16T09:05:00Z').toISOString(),
    createdBy: 'operator',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=FP-SEED-02',
    parentSortedIds: ['PACK-WHT-BLEND-03'],
    weightKg: 4.1,
    brands: ['Uniqlo'],
    material: 'Blend',
    color: 'White',
  },
];


// Helper to simulate delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- Auth Services ---

const getUsers = (): any[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.USERS);
  if (stored) return JSON.parse(stored);
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

export const updateUser = async (userId: string, data: { username?: string, password?: string }): Promise<User> => {
    await delay(500);
    const admin = getCurrentUser();
    if (!admin || admin.role !== UserRole.ADMIN) throw new Error("Unauthorized");

    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) throw new Error("User not found");

    const existingUser = users[userIndex];
    let logDetails = `Admin ${admin.username} updated user ${existingUser.username}:`;

    // Check for username conflict if username is being changed
    if (data.username && data.username.toLowerCase() !== existingUser.username.toLowerCase()) {
        if (users.some(u => u.id !== userId && u.username.toLowerCase() === data.username.toLowerCase())) {
            throw new Error("Username already taken");
        }
        logDetails += ` username changed to ${data.username}.`;
        existingUser.username = data.username;
    }

    // Update password if a new one is provided
    if (data.password) {
        logDetails += ' password has been reset.';
        existingUser.password = data.password;
    }

    users[userIndex] = existingUser;
    saveUsers(users);

    addLog('ADMIN_UPDATE_USER', logDetails);

    const { password, ...safeUser } = existingUser;
    return safeUser;
};


// --- Data Services ---

const getItems = (): TraceableItem[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.ITEMS);
  if (stored) {
    const items = JSON.parse(stored);
    // Only return the stored items if it's a non-empty array.
    if (items && items.length > 0) {
      return items;
    }
  }
  // Otherwise, if stored is null, not valid JSON, or an empty array, re-seed.
  localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(SEED_ITEMS));
  return SEED_ITEMS;
};

const saveAllItems = (items: TraceableItem[]) => {
    localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
};

const saveItem = (item: TraceableItem) => {
  const items = getItems();
  items.push(item);
  saveAllItems(items);
};

const getLogs = (): AuditLog[] => {
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
  addLog('CREATE_INBOUND', `Created inbound batch ${id} from supplier ${data.supplier} with ${data.cartonCount} cartons`, id);
  return newItem;
};

// FIX: Correct the type of `data` to include `id` as it's provided from the UI.
export const createSortedPack = async (data: Omit<SortedPack, 'type' | 'createdAt' | 'createdBy' | 'qrCodeUrl'>): Promise<SortedPack> => {
  await delay(400);
  const user = getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  // The pack ID is provided from the UI now, not generated here.
  const newItem: SortedPack = {
    ...data,
    type: BatchType.SORTED,
    createdAt: new Date().toISOString(),
    createdBy: user.username,
    qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${data.id}`,
  };

  saveItem(newItem);
  addLog('CREATE_SORTED', `Sorted pack ${data.id} created from batch ${data.parentInboundId}`, data.id);
  return newItem;
};

export const createFibrePack = async (data: Omit<FibrePack, 'type' | 'createdAt' | 'createdBy' | 'qrCodeUrl'>): Promise<FibrePack> => {
  await delay(400);
  const user = getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const newItem: FibrePack = {
    ...data,
    type: BatchType.FIBRE,
    createdAt: new Date().toISOString(),
    createdBy: user.username,
    qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${data.id}`,
  };

  saveItem(newItem);
  addLog('CREATE_FIBRE', `Fibre pack ${data.id} created from ${data.parentSortedIds.length} sorted packs`, data.id);
  return newItem;
};

export const createConsignment = async (data: Omit<Consignment, 'id' | 'createdAt' | 'createdBy'>): Promise<Consignment> => {
  await delay(500);
  const user = getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  
  const getConsignments = (): Consignment[] => {
    const stored = localStorage.getItem(STORAGE_KEYS.CONSIGNMENTS);
    return stored ? JSON.parse(stored) : [];
  };

  const newConsignment: Consignment = {
    ...data,
    id: `CON-${Date.now().toString().slice(-6)}`,
    createdAt: new Date().toISOString(),
    createdBy: user.username,
  };

  const consignments = getConsignments();
  consignments.push(newConsignment);
  localStorage.setItem(STORAGE_KEYS.CONSIGNMENTS, JSON.stringify(consignments));
  addLog('CREATE_CONSIGNMENT', `Created consignment ${newConsignment.consignmentNumber} for vendor ${data.vendor} with ${data.linkedFibrePackIds.length} packs.`, newConsignment.id);
  return newConsignment;
};


export const updateFibrePackWeight = async (id: string, weightKg: number): Promise<FibrePack> => {
    await delay(300);
    const user = getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    const allItems = getItems();
    const itemIndex = allItems.findIndex(i => i.id === id);
    const item = allItems[itemIndex];

    if (itemIndex === -1 || !item || item.type !== BatchType.FIBRE) {
        throw new Error("Fibre pack not found");
    }

    const updatedPack: FibrePack = {
        ...(item as FibrePack),
        weightKg,
    };
    
    allItems[itemIndex] = updatedPack;
    saveAllItems(allItems);

    addLog('UPDATE_FIBRE_WEIGHT', `Updated weight for fibre pack ${id} to ${weightKg} kg`, id);
    return updatedPack;
};

// --- QR Code Printing Service ---

const getQrCounters = (): Record<string, number> => {
  const stored = localStorage.getItem(STORAGE_KEYS.QR_COUNTERS);
  const defaultCounters = { BOX: 0, SP: 0, FP: 0 };
  if (stored) return { ...defaultCounters, ...JSON.parse(stored) };
  return defaultCounters;
};

const saveQrCounters = (counters: Record<string, number>) => {
  localStorage.setItem(STORAGE_KEYS.QR_COUNTERS, JSON.stringify(counters));
};

export const generateQrLabels = async (labelType: 'BOX' | 'SP' | 'FP', quantity: number): Promise<{ id: string, qrCodeUrl: string }[]> => {
  await delay(500);
  const admin = getCurrentUser();
  if (!admin || admin.role !== UserRole.ADMIN) throw new Error("Unauthorized");

  const counters = getQrCounters();
  let currentCounter = counters[labelType];
  
  const generated = [];
  for (let i = 0; i < quantity; i++) {
    currentCounter++;
    const id = `${labelType}-${String(currentCounter).padStart(5, '0')}`;
    generated.push({
      id,
      qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${id}`,
    });
  }

  counters[labelType] = currentCounter;
  saveQrCounters(counters);

  addLog('ADMIN_PRINT_QR', `Admin ${admin.username} generated ${quantity} QR labels of type ${labelType}`);

  return generated;
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

// --- Config Management ---
const createConfigService = (key: string, seedData: string[]) => {
  const getRaw = (): string[] => {
    const stored = localStorage.getItem(key);
    if (stored) return JSON.parse(stored);
    localStorage.setItem(key, JSON.stringify(seedData));
    return seedData;
  };
  const save = (items: string[]) => {
    localStorage.setItem(key, JSON.stringify(items));
  };
  return {
    get: async (): Promise<string[]> => {
      await delay(100);
      return getRaw();
    },
    add: async (name: string): Promise<string> => {
      await delay(200);
      const admin = getCurrentUser();
      if (!admin || admin.role !== UserRole.ADMIN) throw new Error("Unauthorized");
      
      const items = getRaw();
      if (items.find(s => s.toLowerCase() === name.toLowerCase())) {
        throw new Error("Item already exists");
      }
      
      items.push(name);
      save(items);
      addLog(`ADMIN_ADD_${key.toUpperCase()}`, `Admin ${admin.username} added ${key}: ${name}`);
      return name;
    },
    remove: async (name: string): Promise<void> => {
      await delay(200);
      const admin = getCurrentUser();
      if (!admin || admin.role !== UserRole.ADMIN) throw new Error("Unauthorized");
      
      let items = getRaw();
      const updatedItems = items.filter(s => s !== name);
      
      if (items.length === updatedItems.length) {
        throw new Error("Item not found");
      }
      save(updatedItems);
      addLog(`ADMIN_DELETE_${key.toUpperCase()}`, `Admin ${admin.username} deleted ${key}: ${name}`);
    },
  };
};

export const suppliersService = createConfigService(STORAGE_KEYS.SUPPLIERS, SEED_SUPPLIERS);
// FIX: Export supplier service methods to be used directly in components.
export const getSuppliers = suppliersService.get;
export const addSupplier = suppliersService.add;
export const deleteSupplier = suppliersService.remove;
export const brandsService = createConfigService(STORAGE_KEYS.BRANDS, SEED_BRANDS);
export const materialsService = createConfigService(STORAGE_KEYS.MATERIALS, SEED_MATERIALS);
export const colorsService = createConfigService(STORAGE_KEYS.COLORS, SEED_COLORS);
export const vendorsService = createConfigService(STORAGE_KEYS.VENDORS, SEED_VENDORS);
export const countriesService = createConfigService(STORAGE_KEYS.COUNTRIES, SEED_COUNTRIES);