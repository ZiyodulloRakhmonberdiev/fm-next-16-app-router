import { create } from 'zustand'

type CrudUiState = {
  createOpen: boolean
  editId: string | null
  deleteId: string | null
  setCreateOpen: (open: boolean) => void
  setEditId: (id: string | null) => void
  setDeleteId: (id: string | null) => void
  reset: () => void
}

function createCrudUiStore() {
  return create<CrudUiState>((set) => ({
    createOpen: false,
    editId: null,
    deleteId: null,
    setCreateOpen: (open) => set({ createOpen: open }),
    setEditId: (id) => set({ editId: id }),
    setDeleteId: (id) => set({ deleteId: id }),
    reset: () => set({ createOpen: false, editId: null, deleteId: null }),
  }))
}

export const useCategoriesUiStore = createCrudUiStore()
export const useThemesUiStore = createCrudUiStore()
export const useTagsUiStore = createCrudUiStore()
export const useUsersUiStore = createCrudUiStore()
