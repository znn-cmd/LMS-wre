// Client-side utility to get current user from localStorage
export function getCurrentUserClient() {
  if (typeof window === 'undefined') {
    return null
  }

  const userStr = localStorage.getItem('user')
  if (!userStr) {
    return null
  }

  try {
    return JSON.parse(userStr)
  } catch {
    return null
  }
}

export function isAuthenticated() {
  return getCurrentUserClient() !== null
}

export function requireAuthClient() {
  const user = getCurrentUserClient()
  if (!user) {
    if (typeof window !== 'undefined') {
      window.location.href = '/en/login'
    }
    return null
  }
  return user
}


