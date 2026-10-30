'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAppState } from '@/lib/store'
import { countExpensesByCurrency, countExpensesByCategory } from '@/lib/supabase/repositories'
import { getCategoryColorClass } from '@/lib/categories'
import type { Category } from '@/types'

const SUPPORTED_CURRENCIES = [
  { value: 'S/', label: 'Soles (S/)' },
  { value: '$', label: 'Dólares ($)' },
  { value: '€', label: 'Euros (€)' },
]

const CATEGORY_EMOJIS = ['🍔', '🚗', '🏠', '🎬', '🛒', '💊', '✈️', '📚', '💼', '🐾', '🎁', '💡', '⚽', '☕', '📱', '📦']
const CATEGORY_COLORS = ['red', 'orange', 'amber', 'emerald', 'teal', 'blue', 'indigo', 'purple']

export default function SettingsPage() {
  const router = useRouter()
  const { budget, budgets, setBudget, addCurrency, removeCurrency, categories, addCategory, updateCategory, deleteCategory, logout, userId, notificationPermission, requestNotificationPermission } = useAppState()
  const [budgetInputs, setBudgetInputs] = useState<Record<string, string>>(() => {
    const inputs: Record<string, string> = {}
    if (budget.monthlyLimit > 0) inputs[budget.currency] = budget.monthlyLimit.toString()
    Object.values(budgets).forEach((b) => {
      if (b.monthlyLimit > 0) inputs[b.currency] = b.monthlyLimit.toString()
    })
    return inputs
  })
  const [saved, setSaved] = useState<string | null>(null)
  const [showRemoveConfirm, setShowRemoveConfirm] = useState<string | null>(null)
  const [removeCount, setRemoveCount] = useState<number>(0)
  const [isRemoving, setIsRemoving] = useState(false)
  const [showCategoryModal, setShowCategoryModal] = useState<{ mode: 'create' | 'edit'; categoryId?: string } | null>(null)
  const [categoryForm, setCategoryForm] = useState<{ name: string; icon: string; color: string }>({ name: '', icon: CATEGORY_EMOJIS[0], color: CATEGORY_COLORS[0] })
  const [categoryError, setCategoryError] = useState<string>('')
  const [showDeleteCategoryConfirm, setShowDeleteCategoryConfirm] = useState<string | null>(null)
  const [deleteCategoryCount, setDeleteCategoryCount] = useState<number>(0)
  const [isDeletingCategory, setIsDeletingCategory] = useState(false)

  const activeCurrencies = Object.keys(budgets)
  const availableCurrencies = SUPPORTED_CURRENCIES.filter(
    (c) => !activeCurrencies.includes(c.value)
  )

  const handleSaveBudget = async (currency: string) => {
    const val = parseFloat(budgetInputs[currency] || '0')
    if (val <= 0) return
    await setBudget(val, currency)
    setSaved(currency)
    setTimeout(() => setSaved(null), 2000)
  }

  const handleRemoveClick = async (currency: string) => {
    if (!userId) return
    const count = await countExpensesByCurrency(userId, currency)
    setRemoveCount(count)
    setShowRemoveConfirm(currency)
  }

  const handleRemoveConfirm = async () => {
    if (!showRemoveConfirm || isRemoving) return
    setIsRemoving(true)
    try {
      await removeCurrency(showRemoveConfirm)
      setShowRemoveConfirm(null)
      setRemoveCount(0)
    } catch (err) {
      console.error('Error removing currency:', err)
      alert('Error al eliminar la moneda. Intenta de nuevo.')
    } finally {
      setIsRemoving(false)
    }
  }

  const handleAddCurrency = async (currency: string) => {
    await addCurrency(currency)
  }

  const handleOpenCreateCategory = () => {
    setCategoryForm({ name: '', icon: CATEGORY_EMOJIS[0], color: CATEGORY_COLORS[0] })
    setCategoryError('')
    setShowCategoryModal({ mode: 'create' })
  }

  const handleOpenEditCategory = (cat: Category) => {
    setCategoryForm({ name: cat.name, icon: cat.icon, color: cat.color })
    setCategoryError('')
    setShowCategoryModal({ mode: 'edit', categoryId: cat.id })
  }

  const handleSaveCategory = async () => {
    if (!showCategoryModal) return
    const trimmedName = categoryForm.name.trim()
    if (!trimmedName) {
      setCategoryError('El nombre es obligatorio')
      return
    }
    if (trimmedName.length > 30) {
      setCategoryError('Máximo 30 caracteres')
      return
    }
    // Validación de nombre único (case-insensitive)
    const isDuplicate = categories.some(
      (c) => c.name.toLowerCase() === trimmedName.toLowerCase() && c.id !== showCategoryModal.categoryId
    )
    if (isDuplicate) {
      setCategoryError('Ya existe una categoría con ese nombre')
      return
    }
    try {
      if (showCategoryModal.mode === 'create') {
        await addCategory({ name: trimmedName, icon: categoryForm.icon, color: categoryForm.color })
      } else if (showCategoryModal.categoryId) {
        await updateCategory(showCategoryModal.categoryId, { name: trimmedName, icon: categoryForm.icon, color: categoryForm.color })
      }
      setShowCategoryModal(null)
      setCategoryForm({ name: '', icon: CATEGORY_EMOJIS[0], color: CATEGORY_COLORS[0] })
      setCategoryError('')
    } catch (err) {
      console.error('Error saving category:', err)
      setCategoryError('Error al guardar. Intenta de nuevo.')
    }
  }

  const handleDeleteCategoryClick = async (categoryId: string) => {
    if (!userId) return
    const count = await countExpensesByCategory(userId, categoryId)
    setDeleteCategoryCount(count)
    setShowDeleteCategoryConfirm(categoryId)
  }

  const handleDeleteCategoryConfirm = async () => {
    if (!showDeleteCategoryConfirm || isDeletingCategory) return
    setIsDeletingCategory(true)
    try {
      await deleteCategory(showDeleteCategoryConfirm)
      setShowDeleteCategoryConfirm(null)
      setDeleteCategoryCount(0)
    } catch (err) {
      console.error('Error deleting category:', err)
      alert('Error al eliminar la categoría. Intenta de nuevo.')
    } finally {
      setIsDeletingCategory(false)
    }
  }

  return (
    <main className="min-h-screen bg-surface pb-24 md:pb-space-xl max-w-xl mx-auto md:max-w-none px-gutter md:px-space-xl">
      <div className="pt-16 md:pt-space-xl pb-6 flex flex-col">
        <button
          onClick={() => router.push('/dashboard')}
          className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface hover:bg-surface-variant transition-colors mb-4 self-start"
          aria-label="Volver al inicio"
        >
          ←
        </button>
        <div className="mb-space-md">
          <h1 className="text-headline-lg-mobile md:text-headline-xl text-on-surface font-bold tracking-tight">
            Ajustes ⚙️
          </h1>
          <p className="text-body-sm text-text-secondary mt-0.5">
            Personaliza tu experiencia Paltazo
          </p>
        </div>

        <div className="space-y-space-lg md:grid md:grid-cols-2 md:gap-space-lg md:space-y-0">
          <section className="p-space-md rounded-2xl bg-surface-container-lowest shadow-sm md:col-span-2">
            <h3 className="text-label-lg text-on-surface font-semibold mb-space-sm flex items-center gap-2">
              💰 Presupuestos por moneda
            </h3>
            <p className="text-body-sm text-on-surface-variant mb-space-md">
              Configura un límite mensual independiente para cada moneda.
            </p>
            <div className="space-y-space-md">
              {SUPPORTED_CURRENCIES.filter(c => activeCurrencies.includes(c.value)).map(({ value, label }) => {
                const currentValue = budgetInputs[value] || ''
                const existingBudget = budgets[value]
                const isPrimary = value === budget.currency
                return (
                  <div key={value} className="flex flex-col gap-space-sm p-space-md rounded-xl bg-surface-container-lowest">
                    <div className="flex items-center justify-between">
                      <span className="text-label-lg text-on-surface font-semibold">
                        {label}
                      </span>
                      <div className="flex items-center gap-space-sm">
                        {isPrimary && (
                          <span className="text-label-sm px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                            Principal
                          </span>
                        )}
                        {existingBudget && !isPrimary && (
                          <span className="text-label-sm px-2 py-0.5 rounded-full bg-surface-container text-text-secondary">
                            Configurado
                          </span>
                        )}
                        {!isPrimary && (
                          <button
                            onClick={() => handleRemoveClick(value)}
                            className="text-label-sm px-2 py-0.5 rounded-full bg-danger/10 text-danger hover:bg-danger/20 transition-colors"
                          >
                            Quitar
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-space-sm">
                      <div className="flex-1 relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-body-md">
                          {value}
                        </span>
                        <input
                          type="number"
                          step="0.01"
                          value={currentValue}
                          onChange={(e) => setBudgetInputs((prev) => ({ ...prev, [value]: e.target.value }))}
                          className="w-full pl-10 pr-3 py-3 rounded-xl bg-surface-container border border-outline text-on-surface text-body-md focus:outline-none focus:border-primary transition-colors"
                          placeholder="0.00"
                        />
                      </div>
                      <button
                        onClick={() => handleSaveBudget(value)}
                        disabled={!currentValue || parseFloat(currentValue) <= 0}
                        className="px-5 py-3 rounded-xl bg-primary text-on-primary text-label-md font-semibold hover:bg-secondary transition-colors disabled:opacity-50"
                      >
                        {saved === value ? '✓' : 'Guardar'}
                      </button>
                    </div>
                  </div>
                )
              })}
              {availableCurrencies.length > 0 && (
                <div className="flex flex-col gap-space-sm p-space-md rounded-xl bg-surface-container-lowest border-2 border-dashed border-outline/30">
                  <p className="text-body-sm text-on-surface-variant text-center">
                    Agrega otra moneda para registrar gastos en ella
                  </p>
                  <div className="flex gap-space-sm justify-center flex-wrap">
                    {availableCurrencies.map(({ value, label }) => (
                      <button
                        key={value}
                        onClick={() => handleAddCurrency(value)}
                        className="px-4 py-2 rounded-xl bg-secondary-container text-on-secondary-container text-label-md font-semibold hover:bg-tertiary-container transition-colors"
                      >
                        + {label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>

          <section className="p-space-md rounded-2xl bg-surface-container-lowest shadow-sm md:col-span-2">
            <h3 className="text-label-lg text-on-surface font-semibold mb-space-sm flex items-center gap-2">
              🏷️ Categorías
            </h3>
            <p className="text-body-sm text-on-surface-variant mb-space-md">
              Personaliza las categorías para clasificar tus gastos.
            </p>
            <div className="space-y-space-sm">
              {categories.map((cat) => {
                const isProtected = cat.isProtected
                return (
                  <div key={cat.id} className="flex items-center justify-between p-space-md rounded-xl bg-surface-container-lowest">
                    <div className="flex items-center gap-space-sm">
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-[22px] shrink-0 ${getCategoryColorClass(cat.color)}`}>
                        {cat.icon}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-label-lg text-on-surface font-semibold">{cat.name}</span>
                        {isProtected && (
                          <span className="text-label-sm text-text-secondary">Protegida</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-space-xs">
                      <button
                        onClick={() => handleOpenEditCategory(cat)}
                        disabled={isProtected}
                        className="px-3 py-1.5 rounded-lg bg-surface-container text-on-surface-variant text-label-md hover:bg-surface-container-high transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteCategoryClick(cat.id)}
                        disabled={isProtected}
                        className="px-3 py-1.5 rounded-lg bg-danger/10 text-danger text-label-md hover:bg-danger/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                )
              })}
              <button
                onClick={handleOpenCreateCategory}
                className="w-full py-3 rounded-xl bg-secondary-container text-on-secondary-container text-label-lg font-semibold hover:bg-tertiary-container transition-colors"
              >
                + Nueva categoría
              </button>
            </div>
          </section>

          <section className="p-space-md rounded-2xl bg-surface-container-lowest shadow-sm">
            <h3 className="text-label-lg text-on-surface font-semibold mb-space-sm flex items-center gap-2">
              📊 Niveles de alerta
            </h3>
            <div className="space-y-space-sm text-body-md text-on-surface-variant">
              <div className="flex items-center justify-between p-space-sm rounded-xl bg-surface-container-lowest">
                <div className="flex items-center gap-space-sm">
                  <div className="w-3 h-3 bg-warning rounded-full" />
                  <span>Advertencia</span>
                </div>
                <span className="text-label-md font-semibold text-warning">80%</span>
              </div>
              <div className="flex items-center justify-between p-space-sm rounded-xl bg-surface-container-lowest">
                <div className="flex items-center gap-space-sm">
                  <div className="w-3 h-3 bg-danger rounded-full" />
                  <span>Límite alcanzado</span>
                </div>
                <span className="text-label-md font-semibold text-danger">100%</span>
              </div>
              <div className="flex items-center justify-between p-space-sm rounded-xl bg-surface-container-lowest">
                <div className="flex items-center gap-space-sm">
                  <div className="w-3 h-3 bg-danger rounded-full opacity-70" />
                  <span>Superado</span>
                </div>
                <span className="text-label-md font-semibold text-danger">101%</span>
              </div>
            </div>
          </section>

          <section className="p-space-md rounded-2xl bg-surface-container-lowest shadow-sm">
            <h3 className="text-label-lg text-on-surface font-semibold mb-space-sm flex items-center gap-2">
              🌿 Acerca de Paltazo
            </h3>
            <div className="space-y-space-xs text-body-md text-on-surface-variant">
              <div className="flex justify-between">
                <span>Versión</span>
                <span className="text-label-md text-on-surface">1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span>Tipo</span>
                <span className="text-label-md text-on-surface">App web progresiva</span>
              </div>
              <div className="flex justify-between">
                <span>Almacenamiento</span>
                <span className="text-label-md text-on-surface">Supabase</span>
              </div>
            </div>
          </section>
        </div>

        {/* Notificaciones */}
        <section className="p-space-md rounded-2xl bg-surface-container-lowest shadow-sm">
          <h3 className="text-label-lg text-on-surface font-semibold mb-space-sm flex items-center gap-2">
            🔔 Notificaciones
          </h3>
          <p className="text-body-sm text-on-surface-variant mb-space-md">
            Recibe alertas cuando te acerques a tu límite de presupuesto mensual.
          </p>
          <button
            onClick={async () => {
              if (notificationPermission === 'granted') {
                alert('Las notificaciones ya están activadas')
                return
              }
              if (notificationPermission === 'unsupported') {
                alert('Tu navegador no soporta notificaciones push')
                return
              }
              const perm = await requestNotificationPermission()
              if (perm === 'granted') {
                alert('✅ Notificaciones activadas')
              } else if (perm === 'denied') {
                alert('❌ Notificaciones bloqueadas. Actívalas en la configuración del navegador.')
              }
            }}
            disabled={notificationPermission === 'granted'}
            className="w-full py-3 rounded-xl bg-primary text-on-primary text-label-lg font-semibold hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {notificationPermission === 'granted' ? '✓ Notificaciones activadas' : 'Activar notificaciones'}
          </button>
          {notificationPermission === 'denied' && (
            <p className="text-body-sm text-error mt-2">
              Las notificaciones están bloqueadas. Habilítalas en la configuración de tu navegador.
            </p>
          )}
        </section>

        <div className="mt-space-lg">
          <button
            onClick={async () => {
              const { error } = await logout()
              if (error) return alert(error)
              window.location.href = '/session-closed'
            }}
            className="w-full py-3 rounded-2xl bg-danger/10 text-danger text-label-lg font-semibold hover:bg-danger/20 transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </div>

      {/* Modal de confirmación para eliminar moneda */}
      {showRemoveConfirm && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm p-gutter"
          onClick={() => !isRemoving && setShowRemoveConfirm(null)}
        >
          <div
            className="bg-surface-container-lowest rounded-2xl p-space-md max-w-sm w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-headline-sm text-on-surface font-bold mb-2">
              ¿Eliminar moneda {showRemoveConfirm}?
            </h3>
            <p className="text-body-sm text-text-secondary mb-4">
              {removeCount > 0
                ? `Se eliminarán ${removeCount} gasto${removeCount === 1 ? '' : 's'} y el presupuesto en ${showRemoveConfirm}. Esta acción no se puede deshacer.`
                : `Se eliminará el presupuesto en ${showRemoveConfirm}. Esta acción no se puede deshacer.`}
            </p>
            <div className="flex gap-space-sm">
              <button
                onClick={() => setShowRemoveConfirm(null)}
                disabled={isRemoving}
                className="flex-1 h-11 rounded-full bg-surface-container text-on-surface text-label-lg font-medium hover:bg-surface-container-high transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleRemoveConfirm}
                disabled={isRemoving}
                className="flex-1 h-11 rounded-full bg-error-container text-on-error-container text-label-lg font-medium hover:bg-error hover:text-on-error transition-colors disabled:opacity-50"
              >
                {isRemoving ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de formulario para crear/editar categoría */}
      {showCategoryModal && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm p-gutter"
          onClick={() => setShowCategoryModal(null)}
        >
          <div
            className="bg-surface-container-lowest rounded-2xl p-space-md max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-headline-sm text-on-surface font-bold mb-4">
              {showCategoryModal.mode === 'create' ? 'Nueva categoría' : 'Editar categoría'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-label-lg text-on-surface font-semibold block mb-2">
                  Nombre
                </label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => { setCategoryForm({ ...categoryForm, name: e.target.value }); setCategoryError('') }}
                  maxLength={30}
                  className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline text-on-surface text-body-md focus:outline-none focus:border-primary transition-colors"
                  placeholder="Ej: Compras"
                />
                {categoryError && (
                  <p className="text-body-sm text-error mt-1">{categoryError}</p>
                )}
              </div>
              <div>
                <label className="text-label-lg text-on-surface font-semibold block mb-2">
                  Icono
                </label>
                <div className="grid grid-cols-8 gap-2">
                  {CATEGORY_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setCategoryForm({ ...categoryForm, icon: emoji })}
                      className={`w-10 h-10 rounded-lg flex items-center justify-center text-2xl transition-all ${
                        categoryForm.icon === emoji
                          ? 'bg-primary-container ring-2 ring-primary scale-110'
                          : 'bg-surface-container hover:bg-surface-container-high'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-label-lg text-on-surface font-semibold block mb-2">
                  Color
                </label>
                <div className="grid grid-cols-8 gap-2">
                  {CATEGORY_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setCategoryForm({ ...categoryForm, color })}
                      className={`w-10 h-10 rounded-lg transition-all ${getCategoryColorClass(color)} ${
                        categoryForm.color === color
                          ? 'ring-2 ring-primary scale-110'
                          : 'hover:scale-105'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-space-sm pt-2">
                <button
                  onClick={() => { setShowCategoryModal(null); setCategoryError('') }}
                  className="flex-1 h-11 rounded-full bg-surface-container text-on-surface text-label-lg font-medium hover:bg-surface-container-high transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveCategory}
                  className="flex-1 h-11 rounded-full bg-primary text-on-primary text-label-lg font-semibold hover:bg-secondary transition-colors"
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación para eliminar categoría */}
      {showDeleteCategoryConfirm && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm p-gutter"
          onClick={() => !isDeletingCategory && setShowDeleteCategoryConfirm(null)}
        >
          <div
            className="bg-surface-container-lowest rounded-2xl p-space-md max-w-sm w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-headline-sm text-on-surface font-bold mb-2">
              ¿Eliminar categoría?
            </h3>
            <p className="text-body-sm text-text-secondary mb-4">
              Los {deleteCategoryCount} gasto{deleteCategoryCount === 1 ? '' : 's'} asociados a esta categoría pasarán a 'Otros'. Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-space-sm">
              <button
                onClick={() => setShowDeleteCategoryConfirm(null)}
                disabled={isDeletingCategory}
                className="flex-1 h-11 rounded-full bg-surface-container text-on-surface text-label-lg font-medium hover:bg-surface-container-high transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteCategoryConfirm}
                disabled={isDeletingCategory}
                className="flex-1 h-11 rounded-full bg-error-container text-on-error-container text-label-lg font-medium hover:bg-error hover:text-on-error transition-colors disabled:opacity-50"
              >
                {isDeletingCategory ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
