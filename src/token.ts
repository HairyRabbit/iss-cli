class _Token {
  constructor(public token: string | undefined, public from: string | undefined) {}
}

export interface Token {
  token: string | undefined
  from: string | undefined
}

export default function Token(token: string | undefined, from: string | undefined) {
  return new _Token(token, from)
}
