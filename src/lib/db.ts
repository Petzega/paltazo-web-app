import Dexie, { type Table } from 'dexie'
import type { Expense, Budget, Profile } from '@/types'

export class PaltazoDB extends Dexie {
  expenses!: Table<Expense, string>
  budget!: Table<Budget, string>
  profile!: Table<Profile, string>

  constructor() {
    super('paltazo')
    this.version(1).stores({
      expenses: 'id, userId, date, category',
      budget: 'userId',
      profile: 'id, email',
    })
  }
}

export const db = new PaltazoDB()
