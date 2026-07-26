
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
