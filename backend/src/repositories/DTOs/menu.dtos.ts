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
    nome: string
    checkIn: Date
    checkOut: Date
    adultos?: number
    restricoes?: string[],
    preferencias?: string
  }
}