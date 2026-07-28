
import {
  type LeadResponse,
  type PageViewResponse,
} from '../types/tracking-events'

import {
  type ResponsePattern,
  type FunctionErrorPattern,
  type ResponsePatternCallback,
  type FunctionSucceededPattern,
} from '../types/requester'

import {
  type ICookieOptions,
} from '../types/cookie'

import {
  postErrorResponse,
  buildRequestOptions,
  postSuccessResponse,
} from './requester'

import {
  PIPE_STRING,
  EMPTY_STRING,
  XANO_BASE_URL,
} from './consts'

import {
  splitText,
  stringify,
} from './dom'

import {
  getCookie,
  setCookie,
} from './cookie'

import {
  HttpMethod,
} from '../types/http'

import {
  timestampDays,
} from './dates'

const parentScriptReference = document.currentScript

export const metaCookiesName = '_fbc|_fbp'

const TRACKING_BASE_URL = `${XANO_BASE_URL}/api:ODZfsyRM`

function generateFbpRandomPart (): string {
  if ('crypto' in window && crypto.getRandomValues) {
    const array = new Uint32Array(1)

    return crypto.getRandomValues(array)[0].toString()
  }

  return Math.floor(Math.random() * 4294967295).toString()
}

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

export function loadFacebookEvents () {
  const handleMetaCookies = (loaded: boolean) => {
    if (loaded) return

    const fbpName = '_fbp'
    const fbcName = '_fbc'

    setTimeout(() => {
      const now = Date.now()

      const currentFbp = getCookie(fbpName)

      const cookieOptions = {
        maxAge: 7776E3,
        expires: new Date(Date.now() + timestampDays(90)),
        domain: location.hostname.replace('www.', EMPTY_STRING),
      } satisfies ICookieOptions

      // Aqui o fbp será reescrito com nova validade usando o valor existente ou um novo valor seguindo os padrões da Meta
      setCookie(fbpName, currentFbp || `fb.2.${now}.${generateFbpRandomPart()}`, cookieOptions)

      const searchParams = new URLSearchParams(location.search)

      const fbclid = searchParams.get('fbclid')

      if (fbclid && fbclid.length) {
        setCookie(fbcName, `fb.2.${now}.${fbclid}`, cookieOptions)

        return
      }

      const currentFbc = getCookie(fbcName)

      if (currentFbc) {
        setCookie(fbcName, currentFbc, cookieOptions)
      }
    }, 2000)
  }

  const script = document.createElement('script')

  script.defer = true
  script.src = 'https://connect.facebook.net/en_US/fbevents.js'

  script.onload  = () => handleMetaCookies(true)
  script.onerror = () => handleMetaCookies(false)

  if (parentScriptReference instanceof HTMLScriptElement) {
    parentScriptReference.insertAdjacentElement('afterend', script)

    return
  }

  document.head.appendChild(script)
}

export async function pageViewTracking <T extends PageViewResponse> (): Promise<ResponsePattern<T>> {
  const defaultErrorMessage = 'Não foi possível registrar o evento'

  try {
    const response = await fetch(`${TRACKING_BASE_URL}/event/page-view/guest`, {
      ...buildRequestOptions([
        ...getMetaTrackingCookies(),
      ]),
      keepalive: true,
      priority: 'high',
    })

    if (!response.ok) {
      const error = await response.json()

      return postErrorResponse.call<
        Response, [string], FunctionErrorPattern
      >(response, error)
    }

    const data: T = await response.json()

    return postSuccessResponse.call<
      Response, [T, ResponsePatternCallback?], FunctionSucceededPattern<T>
    >(response, data)
  } catch (e) {
    return postErrorResponse(defaultErrorMessage)
  }
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

      return postErrorResponse.call<Response, [string], FunctionErrorPattern>(
        response, error?.message ?? defaultErrorMessage
      )
    }

    const data: R = await response.json()

    return postSuccessResponse.call<Response, [R, ResponsePatternCallback?], FunctionSucceededPattern<R>>(
      response, data
    )
  } catch (e) {
    return postErrorResponse(defaultErrorMessage, true)
  }
}
