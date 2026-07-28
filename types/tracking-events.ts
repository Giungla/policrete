
export interface AdvancedMatchingData {
  /**
   * Endereço de e-mail após aplicação do SHA256
   */
  em: string;
  /**
   * Primeiro nome após aplicação do SHA256
   */
  fn?: string;
  /**
   * Último nome após aplicação do SHA256
   */
  ln?: string;
}

export interface PageViewMeta {
  /**
   * ID do dataset da Meta
   */
  app_id: string;
  /**
   * ID do evento de PageView registrado no backend
   */
  event_id: string;
  /**
   * Dados do cliente para correspondência avançada manual
   */
  customer_data?: AdvancedMatchingData;
}

export interface PageViewResponse {
  /**
   * ID do evento enviado para a Meta
   */
  meta: PageViewMeta;
}





export interface LeadEventData {
  /**
   * Tipo de lead eg: Contato comercial
   */
  lead_type: string;
  /**
   * Objetivo do formulário eg: Formulário de contato
   */
  content_name: string;
}

export interface LeadResponse {
  /**
   * Identificador do evento gerado no backend
   */
  event_id: string;
  /**
   * Dados do evento, no padrão exibido pelo serviço de tracking da Meta
   */
  event_data: LeadEventData;
}
