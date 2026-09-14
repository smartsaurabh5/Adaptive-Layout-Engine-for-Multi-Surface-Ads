// ============================================================
// AdaptFlow — Mock API Layer
// Simulates the real REST API with localStorage persistence
// and realistic delays. Same function signatures as the real
// API client, so swapping is a one-import change.
// ============================================================

import type { LayoutSchema, Surface } from '@/engine/engine';
import { DEFAULT_SURFACES, createBlankSchema } from '@/engine/engine';

// ---- Types ----

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'EDITOR' | 'VIEWER';
  avatarUrl?: string;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LayoutSummary {
  id: string;
  name: string;
  thumbnailUrl?: string;
  surfaceTypes: string[];
  variationCount: number;
  description: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface Asset {
  id: string;
  fileName: string;
  fileType: 'SVG' | 'PNG' | 'JPG' | 'WEBP';
  mimeType: string;
  sizeBytes: number;
  url: string;
  tags: string[];
  usedInLayouts: number;
  createdAt: string;
}

// ---- Simulated delay ----

function delay(ms: number = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms + Math.random() * 200));
}

// ---- Storage helpers ----

const STORAGE_KEYS = {
  user: 'adaptflow_user',
  token: 'adaptflow_token',
  layouts: 'adaptflow_layouts',
  schemas: 'adaptflow_schemas',
} as const;

function getStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setStored(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value));
}

// ---- Seed data ----

const SEED_USER: User = {
  id: 'user-1',
  email: 'elena@flam.io',
  name: 'Elena Rostova',
  role: 'EDITOR',
  createdAt: '2025-01-15T10:00:00Z',
};

const SEED_LAYOUTS: LayoutSummary[] = [
  {
    id: 'layout-1',
    name: 'Nike Air Max Launch Q3',
    thumbnailUrl: '',
    surfaceTypes: ['banner', 'story', 'square'],
    variationCount: 3,
    description: 'Footwear global seasonal push with programmatic resolution scaling',
    version: 2.4,
    createdAt: '2025-06-01T10:00:00Z',
    updatedAt: new Date(Date.now() - 24 * 60000).toISOString(),
  },
  {
    id: 'layout-2',
    name: 'Fintech Pro Black Card Promo',
    thumbnailUrl: '',
    surfaceTypes: ['leaderboard', 'skyscraper', 'square'],
    variationCount: 5,
    description: 'Ultra-high net-worth acquisition campaign across financial publisher networks',
    version: 1.8,
    createdAt: '2025-05-20T10:00:00Z',
    updatedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: 'layout-3',
    name: 'Botanical Serum Spring Drop',
    thumbnailUrl: '',
    surfaceTypes: ['banner', 'story', 'square'],
    variationCount: 4,
    description: 'D2C organic skincare launch with responsive narrative storytelling grids',
    version: 1.1,
    createdAt: '2025-05-10T10:00:00Z',
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

const SEED_SCHEMA: LayoutSchema = {
  id: 'layout-1',
  name: 'AcousticPro Studio Wireless',
  backgroundColor: '#090d16',
  version: 3.5,
  elements: [
    {
      id: 'el-logo',
      type: 'logo',
      label: 'Brand Logo',
      x: 34,
      y: 16,
      width: 32,
      height: 5,
      anchor: 'top-center',
      scalingStrategy: 'fit',
      priority: 1,
      zIndex: 10,
      visible: true,
      locked: false,
      props: {
        src: '/assets/headphones.jpg',
        alt: 'AcousticPro Audio',
        objectFit: 'contain',
        opacity: 1,
      },
    },
    {
      id: 'el-badge',
      type: 'text',
      label: 'Season Badge',
      x: 10,
      y: 22,
      width: 80,
      height: 4,
      anchor: 'top-center',
      scalingStrategy: 'fit',
      priority: 3,
      zIndex: 8,
      visible: true,
      locked: false,
      props: {
        content: 'SPATIAL AUDIO PRO · SERIES 2',
        fontSize: 11,
        fontWeight: 700,
        fontFamily: 'Inter',
        color: '#818cf8',
        textAlign: 'center',
        lineHeight: 1.2,
        letterSpacing: 2,
        textTransform: 'uppercase',
      },
    },
    {
      id: 'el-headline',
      type: 'text',
      label: 'Headline',
      x: 8,
      y: 27,
      width: 84,
      height: 10,
      anchor: 'top-center',
      scalingStrategy: 'reflow',
      priority: 1,
      zIndex: 8,
      visible: true,
      locked: false,
      props: {
        content: 'Next-Gen Performance Sound',
        fontSize: 26,
        fontWeight: 800,
        fontFamily: 'Inter',
        color: '#f8fafc',
        textAlign: 'center',
        lineHeight: 1.15,
        letterSpacing: -0.5,
      },
    },
    {
      id: 'el-product-image',
      type: 'image',
      label: 'Headphones Cutout',
      x: 14,
      y: 38,
      width: 72,
      height: 33,
      anchor: 'center',
      scalingStrategy: 'fit',
      priority: 1,
      zIndex: 6,
      visible: true,
      locked: false,
      props: {
        src: '/assets/headphones.jpg',
        alt: 'AcousticPro Noise-Cancelling Headphones',
        objectFit: 'contain',
        borderRadius: 16,
        opacity: 1,
      },
    },
    {
      id: 'el-subtext',
      type: 'text',
      label: 'Subheading',
      x: 10,
      y: 72,
      width: 80,
      height: 6,
      anchor: 'bottom-center',
      scalingStrategy: 'reflow',
      priority: 3,
      zIndex: 8,
      visible: true,
      locked: false,
      props: {
        content: 'Spatial audio engineered for extreme focus and acoustic precision.',
        fontSize: 12,
        fontWeight: 400,
        fontFamily: 'Inter',
        color: '#94a3b8',
        textAlign: 'center',
        lineHeight: 1.35,
        letterSpacing: 0,
      },
    },
    {
      id: 'el-cta',
      type: 'button',
      label: 'CTA Button',
      x: 15,
      y: 80,
      width: 70,
      height: 7,
      anchor: 'bottom-center',
      scalingStrategy: 'fit',
      priority: 1,
      zIndex: 12,
      visible: true,
      locked: false,
      props: {
        label: 'Pre-order Now - $249',
        backgroundColor: '#4f46e5',
        textColor: '#ffffff',
        fontSize: 14,
        fontWeight: 700,
        borderRadius: 9999,
        paddingX: 20,
        paddingY: 10,
        icon: '→',
      },
    },
  ],
};

const SEED_SCHEMA_2: LayoutSchema = {
  id: 'layout-2',
  name: 'AcousticPro Wireless Audio',
  backgroundColor: '#090d16',
  version: 3.5,
  elements: [
    {
      id: 'el-logo',
      type: 'logo',
      label: 'Brand Logo',
      x: 34,
      y: 16,
      width: 32,
      height: 5,
      anchor: 'top-center',
      scalingStrategy: 'fit',
      priority: 1,
      zIndex: 10,
      visible: true,
      locked: false,
      props: {
        src: '/assets/headphones.jpg',
        alt: 'AcousticPro Audio',
        objectFit: 'contain',
        opacity: 1,
      },
    },
    {
      id: 'el-badge',
      type: 'text',
      label: 'Season Badge',
      x: 10,
      y: 22,
      width: 80,
      height: 4,
      anchor: 'top-center',
      scalingStrategy: 'fit',
      priority: 3,
      zIndex: 8,
      visible: true,
      locked: false,
      props: {
        content: 'SPATIAL AUDIO PRO · SERIES 2',
        fontSize: 11,
        fontWeight: 700,
        fontFamily: 'Inter',
        color: '#818cf8',
        textAlign: 'center',
        lineHeight: 1.2,
        letterSpacing: 2,
        textTransform: 'uppercase',
      },
    },
    {
      id: 'el-headline',
      type: 'text',
      label: 'Headline',
      x: 8,
      y: 27,
      width: 84,
      height: 10,
      anchor: 'top-center',
      scalingStrategy: 'reflow',
      priority: 1,
      zIndex: 8,
      visible: true,
      locked: false,
      props: {
        content: 'Next-Gen Performance Sound',
        fontSize: 26,
        fontWeight: 800,
        fontFamily: 'Inter',
        color: '#f8fafc',
        textAlign: 'center',
        lineHeight: 1.15,
        letterSpacing: -0.5,
      },
    },
    {
      id: 'el-product-image',
      type: 'image',
      label: 'Headphones Cutout',
      x: 14,
      y: 38,
      width: 72,
      height: 33,
      anchor: 'center',
      scalingStrategy: 'fit',
      priority: 1,
      zIndex: 6,
      visible: true,
      locked: false,
      props: {
        src: '/assets/headphones.jpg',
        alt: 'AcousticPro Noise-Cancelling Headphones',
        objectFit: 'contain',
        borderRadius: 16,
        opacity: 1,
      },
    },
    {
      id: 'el-subtext',
      type: 'text',
      label: 'Subheading',
      x: 10,
      y: 72,
      width: 80,
      height: 6,
      anchor: 'bottom-center',
      scalingStrategy: 'reflow',
      priority: 3,
      zIndex: 8,
      visible: true,
      locked: false,
      props: {
        content: 'Spatial audio engineered for extreme focus and acoustic precision.',
        fontSize: 12,
        fontWeight: 400,
        fontFamily: 'Inter',
        color: '#94a3b8',
        textAlign: 'center',
        lineHeight: 1.35,
        letterSpacing: 0,
      },
    },
    {
      id: 'el-cta',
      type: 'button',
      label: 'CTA Button',
      x: 15,
      y: 80,
      width: 70,
      height: 7,
      anchor: 'bottom-center',
      scalingStrategy: 'fit',
      priority: 1,
      zIndex: 12,
      visible: true,
      locked: false,
      props: {
        label: 'Pre-order Now - $249',
        backgroundColor: '#4f46e5',
        textColor: '#ffffff',
        fontSize: 14,
        fontWeight: 700,
        borderRadius: 9999,
        paddingX: 20,
        paddingY: 10,
        icon: '→',
      },
    },
  ],
};

const SEED_ASSETS: Asset[] = [
  {
    id: 'asset-1',
    fileName: 'AdaptFlow-Mark-Dark.svg',
    fileType: 'SVG',
    mimeType: 'image/svg+xml',
    sizeBytes: 12288,
    url: '',
    tags: ['Primary Brand', 'Vector Ready'],
    usedInLayouts: 42,
    createdAt: '2025-03-01T10:00:00Z',
  },
  {
    id: 'asset-2',
    fileName: 'Acoustic-Pro-Headphones-Cutout.png',
    fileType: 'PNG',
    mimeType: 'image/png',
    sizeBytes: 2516582,
    url: '',
    tags: ['Cutout', 'Transparent'],
    usedInLayouts: 18,
    createdAt: '2025-03-15T10:00:00Z',
  },
  {
    id: 'asset-3',
    fileName: 'Summer-Warm-Glow-Backdrop.jpg',
    fileType: 'JPG',
    mimeType: 'image/jpeg',
    sizeBytes: 3985408,
    url: '',
    tags: ['Campaigns', 'Full Bleed'],
    usedInLayouts: 7,
    createdAt: '2025-04-01T10:00:00Z',
  },
  {
    id: 'asset-4',
    fileName: 'Watch-Ultra-Titanium.png',
    fileType: 'PNG',
    mimeType: 'image/png',
    sizeBytes: 1992294,
    url: '',
    tags: ['E-Commerce', '3D Render'],
    usedInLayouts: 11,
    createdAt: '2025-04-15T10:00:00Z',
  },
  {
    id: 'asset-5',
    fileName: 'Brand-Accent-Gradient.png',
    fileType: 'PNG',
    mimeType: 'image/png',
    sizeBytes: 860160,
    url: '',
    tags: ['Texture', 'Hero Fill'],
    usedInLayouts: 29,
    createdAt: '2025-05-01T10:00:00Z',
  },
  {
    id: 'asset-6',
    fileName: 'Flam-Wordmark-Primary.svg',
    fileType: 'SVG',
    mimeType: 'image/svg+xml',
    sizeBytes: 8192,
    url: '',
    tags: ['Corporate', 'High Priority'],
    usedInLayouts: 50,
    createdAt: '2025-02-01T10:00:00Z',
  },
];

// ---- Initialize storage with seed data ----

function initializeStorage(): void {
  const layouts = getStored<LayoutSummary[]>(STORAGE_KEYS.layouts, []);
  if (layouts.length === 0) {
    setStored(STORAGE_KEYS.layouts, SEED_LAYOUTS);
  }
  const schemas = getStored<Record<string, LayoutSchema>>(STORAGE_KEYS.schemas, {});
  const l1 = schemas['layout-1'];
  const l2 = schemas['layout-2'];
  if (!l1 || !l2 || (l1.version ?? 0) < 3.5 || (l2.version ?? 0) < 3.5) {
    setStored(STORAGE_KEYS.schemas, {
      ...schemas,
      'layout-1': SEED_SCHEMA,
      'layout-2': SEED_SCHEMA_2,
    });
  }
}

initializeStorage();

// ============================================================
// Auth API
// ============================================================

export const authApi = {
  async login(email: string, _password: string): Promise<{ user: User; tokens: AuthTokens }> {
    await delay(500);
    const user: User = { ...SEED_USER, email };
    const tokens: AuthTokens = {
      accessToken: `mock-jwt-${Date.now()}`,
      refreshToken: `mock-refresh-${Date.now()}`,
      expiresIn: 900000,
    };
    setStored(STORAGE_KEYS.user, user);
    setStored(STORAGE_KEYS.token, tokens.accessToken);
    return { user, tokens };
  },

  async register(email: string, name: string, _password: string): Promise<{ user: User; tokens: AuthTokens }> {
    await delay(500);
    const user: User = {
      id: `user-${Date.now()}`,
      email,
      name,
      role: 'EDITOR',
      createdAt: new Date().toISOString(),
    };
    const tokens: AuthTokens = {
      accessToken: `mock-jwt-${Date.now()}`,
      refreshToken: `mock-refresh-${Date.now()}`,
      expiresIn: 900000,
    };
    setStored(STORAGE_KEYS.user, user);
    setStored(STORAGE_KEYS.token, tokens.accessToken);
    return { user, tokens };
  },

  async logout(): Promise<void> {
    await delay(200);
    localStorage.removeItem(STORAGE_KEYS.user);
    localStorage.removeItem(STORAGE_KEYS.token);
  },

  async me(): Promise<User | null> {
    await delay(200);
    return getStored<User | null>(STORAGE_KEYS.user, null);
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem(STORAGE_KEYS.token);
  },
};

// ============================================================
// Layout API
// ============================================================

export const layoutApi = {
  async list(): Promise<LayoutSummary[]> {
    await delay();
    return getStored<LayoutSummary[]>(STORAGE_KEYS.layouts, SEED_LAYOUTS);
  },

  async get(id: string): Promise<LayoutSchema> {
    await delay();
    const schemas = getStored<Record<string, LayoutSchema>>(STORAGE_KEYS.schemas, {});
    const schema = schemas[id];
    if (!schema) {
      // Return a blank schema for new layouts
      const layouts = await this.list();
      const layout = layouts.find((l) => l.id === id);
      const blank = createBlankSchema(layout?.name ?? 'Untitled');
      blank.id = id;
      return blank;
    }
    return schema;
  },

  async create(name: string): Promise<LayoutSummary> {
    await delay(400);
    const schema = createBlankSchema(name);
    const summary: LayoutSummary = {
      id: schema.id,
      name,
      surfaceTypes: [],
      variationCount: 0,
      description: '',
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const layouts = getStored<LayoutSummary[]>(STORAGE_KEYS.layouts, []);
    layouts.unshift(summary);
    setStored(STORAGE_KEYS.layouts, layouts);

    const schemas = getStored<Record<string, LayoutSchema>>(STORAGE_KEYS.schemas, {});
    schemas[schema.id] = schema;
    setStored(STORAGE_KEYS.schemas, schemas);

    return summary;
  },

  async update(id: string, schema: LayoutSchema): Promise<void> {
    await delay(200);
    const schemas = getStored<Record<string, LayoutSchema>>(STORAGE_KEYS.schemas, {});
    schemas[id] = { ...schema, updatedAt: new Date().toISOString() };
    setStored(STORAGE_KEYS.schemas, schemas);

    // Update the summary too
    const layouts = getStored<LayoutSummary[]>(STORAGE_KEYS.layouts, []);
    const idx = layouts.findIndex((l) => l.id === id);
    if (idx !== -1) {
      layouts[idx].name = schema.name;
      layouts[idx].updatedAt = new Date().toISOString();
      layouts[idx].version = schema.version;
      setStored(STORAGE_KEYS.layouts, layouts);
    }
  },

  async resetToFactory(id: string): Promise<LayoutSchema> {
    await delay(150);
    const targetSchema = id === 'layout-2' ? SEED_SCHEMA_2 : SEED_SCHEMA;
    const schemas = getStored<Record<string, LayoutSchema>>(STORAGE_KEYS.schemas, {});
    schemas[id] = { ...targetSchema, id };
    setStored(STORAGE_KEYS.schemas, schemas);
    return schemas[id];
  },

  async delete(id: string): Promise<void> {
    await delay(300);
    const layouts = getStored<LayoutSummary[]>(STORAGE_KEYS.layouts, []);
    setStored(STORAGE_KEYS.layouts, layouts.filter((l) => l.id !== id));

    const schemas = getStored<Record<string, LayoutSchema>>(STORAGE_KEYS.schemas, {});
    delete schemas[id];
    setStored(STORAGE_KEYS.schemas, schemas);
  },
};

// ============================================================
// Surface API
// ============================================================

export const surfaceApi = {
  async list(): Promise<Surface[]> {
    await delay(200);
    return DEFAULT_SURFACES;
  },
};

// ============================================================
// Asset API
// ============================================================

export const assetApi = {
  async list(): Promise<Asset[]> {
    await delay();
    return SEED_ASSETS;
  },

  async upload(_file: File): Promise<Asset> {
    await delay(800);
    const asset: Asset = {
      id: `asset-${Date.now()}`,
      fileName: _file.name,
      fileType: _file.name.split('.').pop()?.toUpperCase() as Asset['fileType'] ?? 'PNG',
      mimeType: _file.type,
      sizeBytes: _file.size,
      url: URL.createObjectURL(_file),
      tags: [],
      usedInLayouts: 0,
      createdAt: new Date().toISOString(),
    };
    return asset;
  },
};
