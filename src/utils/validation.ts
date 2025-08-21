// 🔍 SISTEMA DE VALIDAÇÃO CENTRALIZADO

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export class ValidationUtils {
  /**
   * Valida email
   */
  static validateEmail(email: string): ValidationResult {
    const errors: string[] = [];
    
    if (!email || !email.trim()) {
      errors.push('Email é obrigatório');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.push('Email deve ter um formato válido');
    }
    
    return { isValid: errors.length === 0, errors };
  }

  /**
   * Valida CPF (formato básico)
   */
  static validateCPF(cpf: string): ValidationResult {
    const errors: string[] = [];
    
    if (cpf && cpf.trim()) {
      const cleanCPF = cpf.replace(/\D/g, '');
      if (cleanCPF.length !== 11) {
        errors.push('CPF deve ter 11 dígitos');
      }
    }
    
    return { isValid: errors.length === 0, errors };
  }

  /**
   * Valida CEP
   */
  static validateCEP(cep: string): ValidationResult {
    const errors: string[] = [];
    
    if (!cep || !cep.trim()) {
      errors.push('CEP é obrigatório');
    } else {
      const cleanCEP = cep.replace(/\D/g, '');
      if (cleanCEP.length !== 8) {
        errors.push('CEP deve ter 8 dígitos');
      }
    }
    
    return { isValid: errors.length === 0, errors };
  }

  /**
   * Valida telefone
   */
  static validatePhone(phone: string): ValidationResult {
    const errors: string[] = [];
    
    if (!phone || !phone.trim()) {
      errors.push('Telefone é obrigatório');
    } else {
      const cleanPhone = phone.replace(/\D/g, '');
      if (cleanPhone.length < 10 || cleanPhone.length > 11) {
        errors.push('Telefone deve ter 10 ou 11 dígitos');
      }
    }
    
    return { isValid: errors.length === 0, errors };
  }

  /**
   * Valida dados completos do checkout
   */
  static validateCheckoutData(data: any): ValidationResult {
    const errors: string[] = [];

    // Validações obrigatórias
    if (!data.nomeCliente || !data.nomeCliente.trim()) {
      errors.push('Nome é obrigatório');
    } else if (data.nomeCliente.trim().length < 2) {
      errors.push('Nome deve ter pelo menos 2 caracteres');
    }

    // Email
    const emailValidation = this.validateEmail(data.email);
    if (!emailValidation.isValid) {
      errors.push(...emailValidation.errors);
    }

    // Telefone
    const phoneValidation = this.validatePhone(data.telefone);
    if (!phoneValidation.isValid) {
      errors.push(...phoneValidation.errors);
    }

    // CEP
    const cepValidation = this.validateCEP(data.cep);
    if (!cepValidation.isValid) {
      errors.push(...cepValidation.errors);
    }

    // CPF (opcional, mas se fornecido deve ser válido)
    if (data.cpf) {
      const cpfValidation = this.validateCPF(data.cpf);
      if (!cpfValidation.isValid) {
        errors.push(...cpfValidation.errors);
      }
    }

    // Endereço
    if (!data.rua || !data.rua.trim()) {
      errors.push('Rua é obrigatória');
    }
    if (!data.numero || !data.numero.trim()) {
      errors.push('Número é obrigatório');
    }
    if (!data.bairro || !data.bairro.trim()) {
      errors.push('Bairro é obrigatório');
    }
    if (!data.cidade || !data.cidade.trim()) {
      errors.push('Cidade é obrigatória');
    }
    if (!data.estado || !data.estado.trim()) {
      errors.push('Estado é obrigatório');
    }

    return { isValid: errors.length === 0, errors };
  }

  /**
   * Formata CPF
   */
  static formatCPF(cpf: string): string {
    const cleanCPF = cpf.replace(/\D/g, '');
    return cleanCPF.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  /**
   * Formata CEP
   */
  static formatCEP(cep: string): string {
    const cleanCEP = cep.replace(/\D/g, '');
    return cleanCEP.replace(/(\d{5})(\d{3})/, '$1-$2');
  }

  /**
   * Formata telefone
   */
  static formatPhone(phone: string): string {
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length === 11) {
      return cleanPhone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (cleanPhone.length === 10) {
      return cleanPhone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return phone;
  }
}

// Hook para usar validações em componentes
export const useValidation = () => {
  const validateField = (fieldName: string, value: string) => {
    switch (fieldName) {
      case 'email':
        return ValidationUtils.validateEmail(value);
      case 'cpf':
        return ValidationUtils.validateCPF(value);
      case 'cep':
        return ValidationUtils.validateCEP(value);
      case 'telefone':
        return ValidationUtils.validatePhone(value);
      default:
        return { isValid: true, errors: [] };
    }
  };

  const formatField = (fieldName: string, value: string): string => {
    switch (fieldName) {
      case 'cpf':
        return ValidationUtils.formatCPF(value);
      case 'cep':
        return ValidationUtils.formatCEP(value);
      case 'telefone':
        return ValidationUtils.formatPhone(value);
      default:
        return value;
    }
  };

  return { validateField, formatField, validateCheckout: ValidationUtils.validateCheckoutData };
};
