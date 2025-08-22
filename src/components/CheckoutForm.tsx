import React, { useState } from 'react';
import { User, Mail, CreditCard, Phone, Hash } from 'lucide-react';
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
    if (!formData.telefone.trim()) newErrors.telefone = 'Telefone é obrigatório';
    if (!formData.cep.trim()) newErrors.cep = 'CEP é obrigatório';
    if (!formData.rua.trim()) newErrors.rua = 'Rua é obrigatória';
    if (!formData.numero.trim()) newErrors.numero = 'Número é obrigatório';
    if (!formData.bairro.trim()) newErrors.bairro = 'Bairro é obrigatório';
    if (!formData.cidade.trim()) newErrors.cidade = 'Cidade é obrigatória';
    if (!formData.estado.trim()) newErrors.estado = 'Estado é obrigatório';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Verificar se o formulário está preenchido corretamente
  const isFormValid = () => {
    return formData.nomeCliente.trim() &&
           formData.email.trim() &&
           /\S+@\S+\.\S+/.test(formData.email) &&
           formData.telefone.trim() &&
           formData.cep.trim() &&
           formData.rua.trim() &&
           formData.numero.trim() &&
           formData.bairro.trim() &&
           formData.cidade.trim() &&
           formData.estado.trim();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🚀 Formulário de checkout enviado!');
    console.log('📋 Dados do formulário:', formData);
    console.log('🛒 Itens do carrinho:', items);
    console.log('💰 Total:', total);
    
    if (validateForm()) {
      console.log('✅ Validação passou, enviando para checkout...');
      
      // **ESTRUTURA ATUALIZADA** - Enviar todos os dados para o backend
      const checkoutData = {
        // Carrinho com informações completas
        carrinho: items.map(item => ({
          id: item.product.id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          variacoes: {
            cor: item.product.selectedColor || undefined,
            tamanho: item.product.selectedSize || undefined,
            // Incluir outras variações se existirem
            ...(item.product.variationInfo && {
              cor_info: item.product.variationInfo.color,
              tamanho_info: item.product.variationInfo.size
            })
          }
        })),
        // Dados do cliente
        nomeCliente: formData.nomeCliente,
        email: formData.email,
        telefone: formData.telefone,
        // Endereço estruturado
        endereco: {
          cep: formData.cep,
          rua: formData.rua,
          numero: formData.numero,
          complemento: formData.complemento || undefined,
          bairro: formData.bairro,
          cidade: formData.cidade,
          estado: formData.estado
        },
        // Total da compra
        total: total,
        // CPF opcional
        ...(formData.cpf && { cpf: formData.cpf })
      };
      
      console.log('📦 Dados completos para o backend:', checkoutData);
      onSubmit(checkoutData);
    } else {
      console.log('❌ Validação falhou, erros:', errors);
    }
  };
