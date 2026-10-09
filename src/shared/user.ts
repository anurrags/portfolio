export type LocalUser = {
  name: string
  color: string
}

const STORAGE_KEY = 'notepad.user'

// Chosen to stay legible as a caret flag against the dark editor background.
const COLORS = [
  '#e06c75',
  '#98c379',
  '#61afef',
  '#c678dd',
  '#e5c07b',
  '#56b6c2',
  '#d19a66',
  '#ff79c6',
  '#7ee787',
  '#79c0ff',
]

const ADJECTIVES = ['Swift', 'Quiet', 'Bright', 'Calm', 'Brave', 'Keen', 'Lucky', 'Warm']
const ANIMALS = ['Otter', 'Falcon', 'Heron', 'Tapir', 'Lynx', 'Marten', 'Ibex', 'Crane']

function randomOf<T>(list: readonly T[]): T {
  return list[Math.floor(Math.random() * list.length)]!
}

export function loadUser(): LocalUser {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<LocalUser>
      if (typeof parsed.name === 'string' && typeof parsed.color === 'string') {
        return { name: parsed.name, color: parsed.color }
      }
    }
  } catch {
    // Private browsing, or storage disabled — fall through to a fresh identity.
  }
  const user = { name: `${randomOf(ADJECTIVES)} ${randomOf(ANIMALS)}`, color: randomOf(COLORS) }
  saveUser(user)
  return user
}

export function saveUser(user: LocalUser): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
  } catch {
    // Non-fatal: the name simply won't persist across reloads.
  }
}
