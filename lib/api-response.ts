import { NextResponse } from 'next/server'

export interface ApiErrorShape {
  success: false
  error: {
    code: string
    message: string
    details?: any
  }
  [key: string]: any
}

export interface ApiOkShape<T = any> {
  success: true
  data: T
  [key: string]: any
}

export function ok<T = any>(data: T, extra: Record<string, any> = {}, init?: ResponseInit) {
  const body: ApiOkShape<T> = { success: true, data, ...extra }
  return NextResponse.json(body, init)
}

export function err(status: number, code: string, message: string, details?: any, extra: Record<string, any> = {}) {
  const body: ApiErrorShape = { success: false, error: { code, message, details }, ...extra }
  return NextResponse.json(body, { status })
}

