import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      accessToken: null,
      refreshToken: null,
      
      login: (userData, accessToken, refreshToken) => set({
        user: userData,
        isAuthenticated: true,
        accessToken: accessToken,
        refreshToken: refreshToken
      }),
      
      logout: () => set({
        user: null,
        isAuthenticated: false,
        accessToken: null,
        refreshToken: null
      }),
      
      updateAccessToken: (newToken) => set({
        accessToken: newToken
      }),
      
      getUserRole: () => get().user?.role || null,
      
      isAuthorized: (requiredRole) => {
        const userRole = get().getUserRole()
        if (!userRole) return false
        
        // Define role hierarchy
        const roleHierarchy = {
          'admin': 5,
          'planner': 4,
          'qc': 3,
          'procurement': 3,
          'warehouse': 3,
          'sales': 3
        }
        
        return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        accessToken: state.accessToken
      })
    }
  )
)

export default useAuthStore