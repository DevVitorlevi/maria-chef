
export interface CreateMenuInput {
  title: string
  checkIn: Date
  checkOut: Date
  adults: number
  kids?: number
  restricoes?: string[],
  preferencias?: string | undefined
}

export interface CreateMenuOutput {
  menu: {
    id: string
    titulo: string
    checkin: Date
    checkout: Date
    adultos: number
    criancas: number
    restricoes: string[]
    preferencias: string | null
    geradoPorIA: boolean
    createdAt: Date
    updatedAt: Date
  }
}

export interface FindByIdMenuParams {
  menuId: string
}

export interface FindByIdMenuOutput {
  menu: {
    id: string
    titulo: string
    checkin: Date
    checkout: Date
    adultos: number
    criancas: number
    restricoes: string[]
    preferencias: string | null
    geradoPorIA: boolean
    createdAt: Date
    updatedAt: Date
  }
}
export interface FindAllFiltersParams {
  titulo?: string | undefined
  data?: string | undefined
  page?: number | undefined
  limit?: number | undefined
}

export interface FindAllMenusOutput {
  menus: {
    id: string
    titulo: string
    checkin: Date
    checkout: Date
    adultos: number
    criancas: number
    restricoes: string[]
    preferencias: string | null
    geradoPorIA: boolean
    createdAt: Date
    updatedAt: Date
  }[]
  total: number
  page: number
  totalPages: number
}