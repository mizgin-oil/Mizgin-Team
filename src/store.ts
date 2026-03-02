
import { AppState } from './types';

const STORAGE_KEY = 'mizgin_app_data';

const DEFAULT_STATE: AppState = {
  currentUser: null,
  employees: [],
  categories: [],
  workLogs: []
};

export const getStore = (): AppState => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : DEFAULT_STATE;
};

export const saveStore = (state: AppState) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

export const clearUser = () => {
  const state = getStore();
  state.currentUser = null;
  saveStore(state);
};
