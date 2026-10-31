// Cola de sync offline con IndexedDB
// Guarda operaciones pendientes cuando no hay conexión y las sincroniza al reconectar

const DB_NAME = 'paltazo-offline'
const STORE_NAME = 'pending-operations'
const DB_VERSION = 1

export interface PendingOperation {
  id: string
  type: 'addExpense' | 'updateExpense' | 'deleteExpense' | 'setBudget' | 'addCategory' | 'updateCategory' | 'deleteCategory' | 'addIncome' | 'updateIncome' | 'deleteIncome'
  payload: unknown
  timestamp: number
}

let _db: IDBDatabase | null = null

function openDB(): Promise<IDBDatabase> {
  if (_db) return Promise.resolve(_db)
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      _db = request.result
      resolve(_db)
    }
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' })
      }
    }
  })
}

export async function addOperation(op: Omit<PendingOperation, 'id' | 'timestamp'>): Promise<void> {
  const db = await openDB()
  const transaction = db.transaction(STORE_NAME, 'readwrite')
  const store = transaction.objectStore(STORE_NAME)
  const operation: PendingOperation = {
    ...op,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
  }
  await new Promise<void>((resolve, reject) => {
    const request = store.add(operation)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}

export async function getPendingOperations(): Promise<PendingOperation[]> {
  const db = await openDB()
  const transaction = db.transaction(STORE_NAME, 'readonly')
  const store = transaction.objectStore(STORE_NAME)
  const operations = await new Promise<PendingOperation[]>((resolve, reject) => {
    const request = store.getAll()
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
  })
  return operations.sort((a, b) => a.timestamp - b.timestamp)
}

export async function removeOperation(id: string): Promise<void> {
  const db = await openDB()
  const transaction = db.transaction(STORE_NAME, 'readwrite')
  const store = transaction.objectStore(STORE_NAME)
  await new Promise<void>((resolve, reject) => {
    const request = store.delete(id)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}

export async function clearOperations(): Promise<void> {
  const db = await openDB()
  const transaction = db.transaction(STORE_NAME, 'readwrite')
  const store = transaction.objectStore(STORE_NAME)
  await new Promise<void>((resolve, reject) => {
    const request = store.clear()
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}

export function isOnline(): boolean {
  return typeof navigator !== 'undefined' ? navigator.onLine : true
}
