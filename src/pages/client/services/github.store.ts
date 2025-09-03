// ---------------------------
// store/githubStore.ts
// ---------------------------
import { create } from 'zustand';

interface GithubState {
  token: string;
  owner: string;
  repo: string;
  email: string;
  setToken: (token: string) => void;
  setOwner: (owner: string) => void;
  setRepo: (repo: string) => void;
  setEmail: (email: string) => void;
}

const useStoreGithub = create<GithubState>((set) => ({
  token: '',
  owner: 'CesarMartinez7', // valor por defecto
  repo: 'TESTING-ELISA', // valor por defecto
  email: '',
  setToken: (token) => set({ token }),
  setOwner: (owner) => set({ owner }),
  setRepo: (repo) => set({ repo }),
  setEmail: (email) => set({ email }),
}));

export default useStoreGithub;
