export class AppError extends Error {
  public readonly userMessage: string

  constructor(message: string, userMessage = 'Ett oväntat fel inträffade.') {
    super(message)
    this.name = 'AppError'
    this.userMessage = userMessage
  }
}

export function toUserError(error: unknown, fallback: string): string {
  if (error instanceof AppError) {
    return error.userMessage
  }

  if (error instanceof Error) {
    return error.message
  }

  return fallback
}
