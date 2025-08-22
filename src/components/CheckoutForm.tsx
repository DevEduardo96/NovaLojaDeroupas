import React, { useState, useEffect } from 'react';
import { User, Mail, CreditCard, Phone, Hash, MapPin, Home, Package } from 'lucide-react';
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
    estado: '',
    cor: '',
    tamanho: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Preencher automaticamente cor e tamanho baseado nos itens do carrinho
  useEffect(() => {
    if (items && items.length > 0) {
      // Pegar as seleções do primeiro item do carrinho
      const firstItem = items[0];
      console.log('🔍 Preenchendo campos automaticamente:', firstItem);
      
      let newCor = '';
      let newTamanho = '';
      
      // Verificar múltiplas formas de obter cor e tamanho
      if (firstItem.selectedColor) {
        newCor = firstItem.selectedColor;
      } else if (firstItem.product && firstItem.product.selectedColor) {
        newCor = firstItem.product.selectedColor;
      } else if (firstItem.variationInfo && firstItem.variationInfo.color) {
        newCor = firstItem.variationInfo.color.name;
      }
      
      if (firstItem.selectedSize) {
        newTamanho = firstItem.selectedSize;
      } else if (firstItem.product && firstItem.product.selectedSize) {
        newTamanho = firstItem.product.selectedSize;
      } else if (firstItem.variationInfo && firstItem.variationInfo.size) {
        newTamanho = firstItem.variationInfo.size.name;
      }
      
      console.log('🎨 Cor encontrada:', newCor);
      console.log('📏 Tamanho encontrado:', newTamanho);
      
      if (newCor || newTamanho) {
        setFormData(prev => ({
          ...prev,
          cor: newCor || prev.cor,
          tamanho: newTamanho || prev.tamanho
        }));
      }
    }
  }, [items]);

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

    // Validar cor e tamanho se houver itens no carrinho que precisem dessas informações
    const hasVariations = items.some(item => item.selectedColor || item.selectedSize);
    if (hasVariations) {
      if (!formData.cor.trim()) newErrors.cor = 'Cor é obrigatória';
      if (!formData.tamanho.trim()) newErrors.tamanho = 'Tamanho é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isFormValid = () => {
    const basicValidation = formData.nomeCliente.trim() &&
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

    // Verificar se há variações nos itens do carrinho
    const hasVariations = items.some(item => item.selectedColor || item.selectedSize);
    if (hasVariations) {
      return basicValidation && formData.cor.trim() && formData.tamanho.trim();
    }

    return basicValidation;
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
    
    console.log('🚀 Formulário de checkout enviado!');
    console.log('📋 Dados do formulário:', formData);
    console.log('🛒 Itens do carrinho:', items);
    console.log('💰 Total:', total);

    if (validateForm()) {
      console.log('✅ Validação passou, enviando para checkout...');
      
      // **ESTRUTURA EXATA CONFORME ZOD DO BACKEND**
      const checkoutData = {
        // Carrinho com informações completas (conforme createPaymentSchema)
        carrinho: items.map(item => {
          // Determinar cor e tamanho de múltiplas fontes
          let itemCor = formData.cor;
          let itemTamanho = formData.tamanho;
          
          // Prioridade: formData > item direto > produto > variationInfo
          if (!itemCor) {
            itemCor = item.selectedColor || 
                     (item.product && item.product.selectedColor) ||
                     (item.variationInfo && item.variationInfo.color && item.variationInfo.color.name) ||
                     undefined;
          }
          
          if (!itemTamanho) {
            itemTamanho = item.selectedSize || 
                         (item.product && item.product.selectedSize) ||
                         (item.variationInfo && item.variationInfo.size && item.variationInfo.size.name) ||
                         undefined;
          }
          
          return {
            id: item.product.id,
            name: item.product.name,
            price: item.product.price,
            quantity: item.quantity,
            variacoes: {
              cor: itemCor || undefined,
              tamanho: itemTamanho || undefined
            }
          };
        }),
        // Dados do cliente (conforme createPaymentSchema)
        nomeCliente: formData.nomeCliente.trim(),
        email: formData.email.trim(),
        // TELEFONE OBRIGATÓRIO (conforme createPaymentSchema)
        telefone: formData.telefone.trim(), // Enviar telefone formatado
        // ENDEREÇO OBRIGATÓRIO (conforme enderecoSchema)
        endereco: {
          cep: formData.cep.replace(/\D/g, ''), // Remover formatação do CEP
          rua: formData.rua.trim(),
          numero: formData.numero.trim(),
          complemento: formData.complemento.trim() || undefined, // Opcional, mas se vazio, enviar undefined
          bairro: formData.bairro.trim(),
          cidade: formData.cidade.trim(),
          estado: formData.estado.trim()
        },
        // Total da compra (conforme createPaymentSchema)
        total: total
      };

      console.log('📦 Dados formatados para o backend (Zod):', JSON.stringify(checkoutData, null, 2));
      console.log('🔍 Verificação dos campos obrigatórios:');
      console.log(' - telefone:', checkoutData.telefone ? '✅' : '❌');
      console.log(' - endereco.cep:', checkoutData.endereco.cep ? '✅' : '❌');
      console.log(' - endereco.rua:', checkoutData.endereco.rua ? '✅' : '❌');
      console.log(' - endereco.numero:', checkoutData.endereco.numero ? '✅' : '❌');
      console.log(' - endereco.bairro:', checkoutData.endereco.bairro ? '✅' : '❌');
      console.log(' - endereco.cidade:', checkoutData.endereco.cidade ? '✅' : '❌');
      console.log(' - endereco.estado:', checkoutData.endereco.estado ? '✅' : '❌');

      onSubmit(checkoutData);
    } else {
      console.log('❌ Validação falhou, erros:', errors);
    }
  };

  return (
    <div className="space-y-8">


      {/* Formulário de Checkout */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Dados Pessoais */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <User className="w-5 h-5 mr-2" />
            Dados pessoais
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="nomeCliente" className="block text-sm font-medium text-gray-700 mb-1">
                Nome completo *
              </label>
              <input
                type="text"
                id="nomeCliente"
                name="nomeCliente"
                value={formData.nomeCliente}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.nomeCliente ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Digite seu nome completo"
              />
              {errors.nomeCliente && (
                <p className="text-red-500 text-xs mt-1">{errors.nomeCliente}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="seu@email.com"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="telefone" className="block text-sm font-medium text-gray-700 mb-1">
                <Phone className="w-4 h-4 inline mr-1" />
                Telefone *
              </label>
              <input
                type="tel"
                id="telefone"
                name="telefone"
                value={formData.telefone}
                onChange={handlePhoneChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.telefone ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="(11) 99999-9999"
                maxLength={15}
              />
              {errors.telefone && (
                <p className="text-red-500 text-xs mt-1">{errors.telefone}</p>
              )}
            </div>

            <div>
              <label htmlFor="cpf" className="block text-sm font-medium text-gray-700 mb-1">
                <Hash className="w-4 h-4 inline mr-1" />
                CPF (opcional)
              </label>
              <input
                type="text"
                id="cpf"
                name="cpf"
                value={formData.cpf}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="000.000.000-00"
              />
            </div>
          </div>
        </div>

        {/* Endereço de entrega */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            Endereço de entrega
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="cep" className="block text-sm font-medium text-gray-700 mb-1">
                CEP *
              </label>
              <input
                type="text"
                id="cep"
                name="cep"
                value={formData.cep}
                onChange={handleCepChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.cep ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="00000-000"
                maxLength={9}
              />
              {errors.cep && (
                <p className="text-red-500 text-xs mt-1">{errors.cep}</p>
              )}
            </div>

            <div>
              <label htmlFor="rua" className="block text-sm font-medium text-gray-700 mb-1">
                Rua *
              </label>
              <input
                type="text"
                id="rua"
                name="rua"
                value={formData.rua}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.rua ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Nome da rua"
              />
              {errors.rua && (
                <p className="text-red-500 text-xs mt-1">{errors.rua}</p>
              )}
            </div>

            <div>
              <label htmlFor="numero" className="block text-sm font-medium text-gray-700 mb-1">
                Número *
              </label>
              <input
                type="text"
                id="numero"
                name="numero"
                value={formData.numero}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.numero ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="123"
              />
              {errors.numero && (
                <p className="text-red-500 text-xs mt-1">{errors.numero}</p>
              )}
            </div>

            <div>
              <label htmlFor="complemento" className="block text-sm font-medium text-gray-700 mb-1">
                Complemento (opcional)
              </label>
              <input
                type="text"
                id="complemento"
                name="complemento"
                value={formData.complemento}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Apto, casa, etc."
              />
            </div>

            <div>
              <label htmlFor="bairro" className="block text-sm font-medium text-gray-700 mb-1">
                Bairro *
              </label>
              <input
                type="text"
                id="bairro"
                name="bairro"
                value={formData.bairro}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.bairro ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Nome do bairro"
              />
              {errors.bairro && (
                <p className="text-red-500 text-xs mt-1">{errors.bairro}</p>
              )}
            </div>

            <div>
              <label htmlFor="cidade" className="block text-sm font-medium text-gray-700 mb-1">
                Cidade *
              </label>
              <input
                type="text"
                id="cidade"
                name="cidade"
                value={formData.cidade}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.cidade ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Nome da cidade"
              />
              {errors.cidade && (
                <p className="text-red-500 text-xs mt-1">{errors.cidade}</p>
              )}
            </div>

            <div>
              <label htmlFor="estado" className="block text-sm font-medium text-gray-700 mb-1">
                Estado *
              </label>
              <select
                id="estado"
                name="estado"
                value={formData.estado}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.estado ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Selecione o estado</option>
                <option value="AC">Acre</option>
                <option value="AL">Alagoas</option>
                <option value="AP">Amapá</option>
                <option value="AM">Amazonas</option>
                <option value="BA">Bahia</option>
                <option value="CE">Ceará</option>
                <option value="DF">Distrito Federal</option>
                <option value="ES">Espírito Santo</option>
                <option value="GO">Goiás</option>
                <option value="MA">Maranhão</option>
                <option value="MT">Mato Grosso</option>
                <option value="MS">Mato Grosso do Sul</option>
                <option value="MG">Minas Gerais</option>
                <option value="PA">Pará</option>
                <option value="PB">Paraíba</option>
                <option value="PR">Paraná</option>
                <option value="PE">Pernambuco</option>
                <option value="PI">Piauí</option>
                <option value="RJ">Rio de Janeiro</option>
                <option value="RN">Rio Grande do Norte</option>
                <option value="RS">Rio Grande do Sul</option>
                <option value="RO">Rondônia</option>
                <option value="RR">Roraima</option>
                <option value="SC">Santa Catarina</option>
                <option value="SP">São Paulo</option>
                <option value="SE">Sergipe</option>
                <option value="TO">Tocantins</option>
              </select>
              {errors.estado && (
                <p className="text-red-500 text-xs mt-1">{errors.estado}</p>
              )}
            </div>
          </div>
        </div>

        {/* Variações do Produto */}
        {items.some(item => item.selectedColor || item.selectedSize) && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Package className="w-5 h-5 mr-2" />
              Variações do produto
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="cor" className="block text-sm font-medium text-gray-700 mb-1">
                  Cor *
                </label>
                <input
                  type="text"
                  id="cor"
                  name="cor"
                  value={formData.cor}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.cor ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Cor selecionada"
                />
                {errors.cor && (
                  <p className="text-red-500 text-xs mt-1">{errors.cor}</p>
                )}
              </div>

              <div>
                <label htmlFor="tamanho" className="block text-sm font-medium text-gray-700 mb-1">
                  Tamanho *
                </label>
                <input
                  type="text"
                  id="tamanho"
                  name="tamanho"
                  value={formData.tamanho}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.tamanho ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Tamanho selecionado"
                />
                {errors.tamanho && (
                  <p className="text-red-500 text-xs mt-1">{errors.tamanho}</p>
                )}
              </div>
            </div>

            {/* Informações dos itens do carrinho */}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Itens selecionados:</h4>
              <div className="space-y-2">
                {items.map((item, index) => (
                  <div key={`${item.product.id}-${item.selectedSize || ''}-${item.selectedColor || ''}`} className="text-sm text-gray-600">
                    <span className="font-medium">{item.product.name}</span>
                    {(item.selectedSize || item.selectedColor) && (
                      <span className="ml-2">
                        ({item.selectedSize && `Tamanho: ${item.selectedSize}`}
                        {item.selectedSize && item.selectedColor && ', '}
                        {item.selectedColor && `Cor: ${item.selectedColor}`})
                      </span>
                    )}
                    <span className="ml-2 text-gray-500">x{item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Resumo do total */}
        <div className="border-t pt-6">
          <div className="flex justify-between items-center text-xl font-bold">
            <span>Total:</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>

        {/* Botão de finalizar */}
        <div className="pt-6">
          <button
            type="submit"
            disabled={isLoading || !isFormValid()}
            className={`w-full py-3 px-4 rounded-md font-medium transition-colors flex items-center justify-center ${
              isLoading || !isFormValid()
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                Processando...
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5 mr-2" />
                Finalizar compra via PIX
              </>
            )}
          </button>
          {!isFormValid() && (
            <p className="text-sm text-gray-500 mt-2 text-center">
              Preencha todos os campos obrigatórios (*) 
              {items.some(item => item.selectedColor || item.selectedSize) && 
                " - incluindo cor e tamanho"}
            </p>
          )}
        </div>
      </form>  
    </div>
  );
};