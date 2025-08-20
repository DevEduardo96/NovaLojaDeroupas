import React, { useState } from 'react';
import { User, Mail, CreditCard, Phone, Hash } from 'lucide-react';
import { CartItem } from '../types';

interface CheckoutFormProps {
  items: CartItem[];
  total: number;
  onSubmit: (data: any) => void; // agora pode receber todos os dados
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
      <div className="flex items-center space-x-3 mb-8">
        <CreditCard className="w-8 h-8 text-indigo-600" />
        <h2 className="text-2xl font-bold text-gray-900">Finalizar Compra</h2>
      </div>

      {/* Resumo do Pedido */}
      <div className="bg-gray-50 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo do Pedido</h3>
        
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.product.id} className="flex justify-between items-center">
              <div>
                <span className="text-gray-900">{item.product.name}</span>
                <span className="text-gray-500 ml-2">x{item.quantity}</span>
              </div>
              <span className="font-semibold">
                {formatPrice(item.product.price * item.quantity)}
              </span>
            </div>
          ))}
        </div>
        
        <div className="border-t pt-3 mt-3">
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-gray-900">Total:</span>
            <span className="text-xl font-bold text-indigo-600">
              {formatPrice(total)}
            </span>
          </div>
        </div>
      </div>

      {/* Formulário */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Nome */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <User className="w-4 h-4 inline mr-2" />
            Nome Completo
          </label>
          <input
            type="text"
            value={formData.nomeCliente}
            onChange={(e) => handleInputChange('nomeCliente', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
              errors.nomeCliente ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Digite seu nome completo"
          />
          {errors.nomeCliente && <p className="text-red-500 text-sm mt-1">{errors.nomeCliente}</p>}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Mail className="w-4 h-4 inline mr-2" />
            Email
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Digite seu email"
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>

        {/* Telefone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Phone className="w-4 h-4 inline mr-2" />
            Telefone
          </label>
          <input
            type="text"
            value={formData.telefone}
            onChange={(e) => handleInputChange('telefone', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
              errors.telefone ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="(11) 99999-9999"
          />
          {errors.telefone && <p className="text-red-500 text-sm mt-1">{errors.telefone}</p>}
        </div>

        {/* CPF */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Hash className="w-4 h-4 inline mr-2" />
            CPF (opcional)
          </label>
          <input
            type="text"
            value={formData.cpf}
            onChange={(e) => handleInputChange('cpf', e.target.value)}
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 border-gray-300"
            placeholder="Digite seu CPF"
          />
        </div>

        {/* Endereço */}
        <h3 className="text-lg font-semibold text-gray-900 mt-6">Endereço de Entrega</h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">CEP</label>
            <input
              type="text"
              value={formData.cep}
              onChange={(e) => handleInputChange('cep', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
                errors.cep ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="00000-000"
            />
            {errors.cep && <p className="text-red-500 text-sm mt-1">{errors.cep}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Número</label>
            <input
              type="text"
              value={formData.numero}
              onChange={(e) => handleInputChange('numero', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
                errors.numero ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="123"
            />
            {errors.numero && <p className="text-red-500 text-sm mt-1">{errors.numero}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Rua</label>
          <input
            type="text"
            value={formData.rua}
            onChange={(e) => handleInputChange('rua', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
              errors.rua ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Digite sua rua"
          />
          {errors.rua && <p className="text-red-500 text-sm mt-1">{errors.rua}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Complemento</label>
          <input
            type="text"
            value={formData.complemento}
            onChange={(e) => handleInputChange('complemento', e.target.value)}
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 border-gray-300"
            placeholder="Apartamento, bloco, referência..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Bairro</label>
          <input
            type="text"
            value={formData.bairro}
            onChange={(e) => handleInputChange('bairro', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
              errors.bairro ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Digite seu bairro"
          />
          {errors.bairro && <p className="text-red-500 text-sm mt-1">{errors.bairro}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Cidade</label>
            <input
              type="text"
              value={formData.cidade}
              onChange={(e) => handleInputChange('cidade', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
                errors.cidade ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Digite sua cidade"
            />
            {errors.cidade && <p className="text-red-500 text-sm mt-1">{errors.cidade}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
            <input
              type="text"
              value={formData.estado}
              onChange={(e) => handleInputChange('estado', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
                errors.estado ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="SP, RJ, MG..."
            />
            {errors.estado && <p className="text-red-500 text-sm mt-1">{errors.estado}</p>}
          </div>
        </div>

        {/* Info PIX */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white text-sm font-bold">i</span>
            </div>
            <div>
              <h4 className="font-semibold text-blue-900 mb-1">Pagamento via PIX</h4>
              <p className="text-blue-800 text-sm">
                Após confirmar, você receberá um QR Code para pagamento via PIX. 
                O pedido será enviado após a confirmação do pagamento.
              </p>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Processando...</span>
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5" />
              <span>Gerar QR Code PIX</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
