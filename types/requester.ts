
export interface FunctionSucceededPattern <T = null> {
  /**
   * Dados recebidos ao completar da requisição
   */
  data: T;
  /**
   * Indicativo de finalização bem sucedida
   */
  succeeded: true;
}

export interface FunctionErrorPattern {
  /**
   * Indicativo de finalização mal sucedida
   */
  succeeded: false;
  /**
   * Mensagem de erro
   */
  message: string;
}

export type ResponsePattern <T> = FunctionSucceededPattern<T> | FunctionErrorPattern;

export type ResponsePatternCallback = (...params: any) => void;
