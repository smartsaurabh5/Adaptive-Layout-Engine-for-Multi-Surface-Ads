// ============================================================
// AdaptFlow — Unified API Client (Hybrid Real REST + Fallback)
// Connects to Spring Boot backend via httpClient with automatic
// fallback to mockApi when the backend is offline.
// ============================================================

import { httpClient } from './httpClient';
import {
  authApi as mockAuth,
  layoutApi as mockLayout,
  surfaceApi as mockSurface,
  assetApi as mockAsset,
  type User,
  type AuthTokens,
  type LayoutSummary,
  type Asset,
} from './mockApi';
import type { LayoutSchema, Surface } from '@/engine/engine';

export type { User, AuthTokens, LayoutSummary, Asset };

export const authApi = {
  async login(email: string, password: string): Promise<{ user: User; tokens: AuthTokens }> {
    try {
      const res = await httpClient.post<{ user: User; tokens: AuthTokens }>('/auth/login', {
        email,
        password,
      });
      if (res.data?.tokens?.accessToken) {
        localStorage.setItem('adaptflow_token', res.data.tokens.accessToken);
        localStorage.setItem('adaptflow_user', JSON.stringify(res.data.user));
      }
      return res.data;
    } catch {
      return mockAuth.login(email, password);
    }
  },

  async register(email: string, name: string, password: string): Promise<{ user: User; tokens: AuthTokens }> {
    try {
      const res = await httpClient.post<{ user: User; tokens: AuthTokens }>('/auth/register', {
        email,
        name,
        password,
      });
      if (res.data?.tokens?.accessToken) {
        localStorage.setItem('adaptflow_token', res.data.tokens.accessToken);
        localStorage.setItem('adaptflow_user', JSON.stringify(res.data.user));
      }
      return res.data;
    } catch {
      return mockAuth.register(email, name, password);
    }
  },

  async logout(): Promise<void> {
    try {
      await httpClient.post('/auth/logout');
    } catch {
      // ignore network errors on logout
    } finally {
      await mockAuth.logout();
    }
  },

  async me(): Promise<User | null> {
    try {
      const res = await httpClient.get<User>('/auth/me');
      return res.data;
    } catch {
      return mockAuth.me();
    }
  },

  isAuthenticated(): boolean {
    return mockAuth.isAuthenticated();
  },
};

export const layoutApi = {
  async list(): Promise<LayoutSummary[]> {
    try {
      const res = await httpClient.get<LayoutSummary[]>('/layouts');
      return res.data;
    } catch {
      return mockLayout.list();
    }
  },

  async get(id: string): Promise<LayoutSchema> {
    try {
      const res = await httpClient.get<LayoutSchema>(`/layouts/${id}`);
      return res.data;
    } catch {
      return mockLayout.get(id);
    }
  },

  async create(name: string): Promise<LayoutSummary> {
    try {
      const res = await httpClient.post<LayoutSummary>('/layouts', { name });
      return res.data;
    } catch {
      return mockLayout.create(name);
    }
  },

  async update(id: string, schema: LayoutSchema): Promise<void> {
    try {
      await httpClient.put(`/layouts/${id}`, {
        name: schema.name,
        schemaJson: JSON.stringify(schema),
        version: schema.version,
      });
    } catch {
      await mockLayout.update(id, schema);
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await httpClient.delete(`/layouts/${id}`);
    } catch {
      await mockLayout.delete(id);
    }
  },

  async resetToFactory(id: string): Promise<LayoutSchema> {
    try {
      const resetSchema = await mockLayout.resetToFactory(id);
      await httpClient.put(`/layouts/${id}`, {
        name: resetSchema.name,
        schemaJson: JSON.stringify(resetSchema),
        version: resetSchema.version,
      });
      return resetSchema;
    } catch {
      return mockLayout.resetToFactory(id);
    }
  },
};

export const surfaceApi = {
  async list(): Promise<Surface[]> {
    try {
      const res = await httpClient.get<Surface[]>('/surfaces');
      return res.data;
    } catch {
      return mockSurface.list();
    }
  },
};

export const assetApi = {
  async list(): Promise<Asset[]> {
    try {
      const res = await httpClient.get<Asset[]>('/assets');
      return res.data;
    } catch {
      return mockAsset.list();
    }
  },

  async upload(file: File): Promise<Asset> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await httpClient.post<Asset>('/assets/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    } catch {
      return mockAsset.upload(file);
    }
  },
};
