import React, { useState } from 'react';
import { User, Mail, CreditCard, Phone, Hash, MapPin, Home } from 'lucide-react';
import { CartItem } from '../types';

interface CheckoutFormProps {
  items: CartItem[];
  total: number;
  onSubmit: (data: any) => void;
  isLoading: boolean;
}

export const CheckoutForm: React.FC<CheckoutFormProps> = ({
  items,
  total,
  onSubmit,
  isLoading
}) => {
  const [formData, setFormData] = useState({
    nomeCliente: '',
    email: '',
    telefone: '',
    cpf: '',
    cep: '',
    rua: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nomeCliente.trim()) newErrors.nomeCliente = 'Nome é obrigatório';
    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.telefone.trim()) {
      newErrors.telefone = 'Telefone é obrigatório';
    } else if (formData.telefone.replace(/\D/g, '').length < 10) {
      newErrors.telefone = 'Telefone deve ter pelo menos 10 dígitos';
    }

    if (!formData.cep.trim()) newErrors.cep = 'CEP é obrigatório';
    if (!formData.rua.trim()) newErrors.rua = 'Rua é obrigatória';
    if (!formData.numero.trim()) newErrors.numero = 'Número é obrigatório';
    if (!formData.bairro.trim()) newErrors.bairro = 'Bairro é obrigatório';
    if (!formData.cidade.trim()) newErrors.cidade = 'Cidade é obrigatória';
    if (!formData.estado.trim()) newErrors.estado = 'Estado é obrigatório';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isFormValid = () => {
    return formData.nomeCliente.trim() &&
           formData.email.trim() &&
           /\S+@\S+\.\S+/.test(formData.email) &&
           formData.telefone.trim() &&
           formData.telefone.replace(/\D/g, '').length >= 10 &&
           formData.cep.trim() &&
           formData.rua.trim() &&
           formData.numero.trim() &&
           formData.bairro.trim() &&
           formData.cidade.trim() &&
           formData.estado.trim();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    let formattedValue = value;
    
    if (value.length >= 10) {
      if (value.length === 10) formattedValue = value.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
      else if (value.length === 11) formattedValue = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }

    setFormData(prev => ({ ...prev, telefone: formattedValue }));
    if (errors.telefone) setErrors(prev => ({ ...prev, telefone: '' }));
  };

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    const formattedValue = value.replace(/(\d{5})(\d{3})/, '$1-$2');
    setFormData(prev => ({ ...prev, cep: formattedValue }));
    if (errors.cep) setErrors(prev => ({ ...prev, cep: '' }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      const checkoutData = {
        carrinho: items.map(item => ({
          id: item.product.id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          variacoes: {
            cor: item.product.selectedColor || item.selectedColor || undefined,
            tamanho: item.product.selectedSize || item.selectedSize || undefined
          }
        })),
        nomeCliente: formData.nomeCliente.trim(),
        email: formData.email.trim(),
        telefone: formData.telefone.replace(/\D/g, '') || '', // garante string vazia se não preenchido
        endereco: {
          cep: formData.cep.replace(/\D/g, '') || '',
          rua: formData.rua.trim() || '',
          numero: formData.numero.trim() || '',
          complemento: formData.complemento.trim() || undefined,
          bairro: formData.bairro.trim() || '',
          cidade: formData.cidade.trim() || '',
          estado: formData.estado.trim() || ''
        },
        total
      };

      onSubmit(checkoutData);
    }
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ... todo o restante do formulário permanece igual ... */}
      </form>
    </div>
  );
};
