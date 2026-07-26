
import {
  type LeadResponse,
} from '../types/tracking-events'

import {
  type ResponsePattern,
  type FunctionErrorPattern,
  type ResponsePatternCallback,
  type FunctionSucceededPattern,
} from '../types/requester'

import {
  postErrorResponse,
  buildRequestOptions,
  postSuccessResponse,
} from './requester'

import {
  EMPTY_STRING,
  PIPE_STRING,
  XANO_BASE_URL,
} from './consts'

import {
  splitText, stringify,
} from './dom'

import {
  getCookie,
} from './cookie'
import {HttpMethod} from "../types/http";

export const metaCookiesName = '_fbc|_fbp'

const TRACKING_BASE_URL = `${XANO_BASE_URL}/api:ODZfsyRM`

export function getMetaTrackingCookies (): [string, string][] {
  return splitText(metaCookiesName, PIPE_STRING).reduce((acc, name) => {
    const cookie = getCookie(name)

    if (!cookie) return acc

    return [
      ...acc,
      [
        name.replace('_', EMPTY_STRING),
        cookie,
      ],
    ]
  }, [] as [string, string][])
}

export async function leadTracking <T extends object, R extends LeadResponse> (payload: T, leadType: string): Promise<ResponsePattern<R>> {
  const defaultErrorMessage = 'Não foi possível registrar o evento'

  try {
    const response = await fetch(`${TRACKING_BASE_URL}/event/${leadType}/lead/guest`, {
      ...buildRequestOptions([
        ...getMetaTrackingCookies(),
      ], HttpMethod.POST),
      keepalive: true,
      priority: 'high',
      body: stringify({
        lead: payload,
      })
    })

    if (!response.ok) {
      const error = await response.json()

      return postErrorResponse.call(
        response, error?.message ?? defaultErrorMessage
      )
    }

    const data: R = await response.json()

    return postSuccessResponse.call(response, data)
  } catch (e) {
    return postErrorResponse(defaultErrorMessage, true)
  }
}
