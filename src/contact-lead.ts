
import {
  attachEvent,
  querySelector,
} from '../utils/dom'
import {leadTracking} from "../utils/tracking";

const formContainer = querySelector<'div'>('#contact-form')

if (!formContainer) {
  throw new Error('`#contact-form` is required`')
}

const formElement = querySelector<'form'>('#wf-form-contact-form', formContainer)

if (!formElement) {
  throw new Error('`#wf-form-contact-form` is required')
}

attachEvent(formElement, 'submit', event => {
  event.preventDefault()

  const formData = new FormData(formElement)

  const leadPayload = {
    first_name: formData.get('first_name'),
    last_name: formData.get('last_name'),
    email: formData.get('email'),
    zipcode: formData.get('zipcode'),
    message: formData.get('message'),
  }

  leadTracking(leadPayload, 'contact').then(response => {
    if (!response.succeeded) return

    const {
      event_id,
      event_data,
    } = response.data

    fbq?.('track', 'Lead', event_data, {
      eventID: event_id,
    })
  })
})
