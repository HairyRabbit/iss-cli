export function makeUnknownCommandError(command: string): Error {
  return new Error(`Unknown command "${command}"`)
}
