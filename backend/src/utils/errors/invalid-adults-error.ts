export class InvalidAdultsError extends Error {
  constructor() {
    super("There must be at least 1 adult.")
  }
}