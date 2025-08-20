
import React, { useState } from 'react';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { useProductVariations } from '../hooks/useProductVariations';
import type { ProductVariation } from '../types';
import { formatPrice } from '../lib/utils';

interface ProductVariationsManagerProps {
  productId: number;
}

export const ProductVariationsManager: React.FC<ProductVariationsManagerProps> = ({
  productId
}) => {
  const {
    variations,
    sizes,
    colors,
    loading,
    error,
    createVariation,
    updateVariation,
    deleteVariation,
    refetch
  } = useProductVariations(productId);

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    type: 'size' as 'size' | 'color',
    name: '',
    value: '',
    stock_quantity: 0,
    price_modifier: 0,
    is_available: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingId) {
        await updateVariation(editingId, formData);
        setEditingId(null);
      } else {
        await createVariation({
          ...formData,
          product_id: productId
        });
        setIsAdding(false);
      }
      
      setFormData({
        type: 'size',
        name: '',
        value: '',
        stock_quantity: 0,
        price_modifier: 0,
        is_available: true
      });
      
      await refetch();
    } catch (err) {
      console.error('Error saving variation:', err);
    }
  };

  const handleEdit = (variation: ProductVariation) => {
    setFormData({
      type: variation.type,
      name: variation.name,
      value: variation.value,
      stock_quantity: variation.stock_quantity || 0,
      price_modifier: variation.price_modifier || 0,
      is_available: variation.is_available
    });
    setEditingId(variation.id);
    setIsAdding(false);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir esta variação?')) {
      try {
        await deleteVariation(id);
        await refetch();
      } catch (err) {
        console.error('Error deleting variation:', err);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'size',
      name: '',
      value: '',
      stock_quantity: 0,
      price_modifier: 0,
      is_available: true
    });
    setIsAdding(false);
    setEditingId(null);
  };

  if (loading) {
    return <div className="text-center py-4">Carregando variações...</div>;
  }

  if (error) {
    return <div className="text-red-600 py-4">Erro: {error}</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Variações do Produto</h3>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          <span>Adicionar Variação</span>
        </button>
      </div>

      {/* Formulário de adicionar/editar */}
      {(isAdding || editingId) && (
        <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded-lg mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'size' | 'color' }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="size">Tamanho</option>
                <option value="color">Cor</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Grande, Azul"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valor
              </label>
              <input
                type="text"
                value={formData.value}
                onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
                placeholder="Ex: G, #0066CC"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estoque
              </label>
              <input
                type="number"
                value={formData.stock_quantity}
                onChange={(e) => setFormData(prev => ({ ...prev, stock_quantity: parseInt(e.target.value) || 0 }))}
                min="0"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Modificador de Preço (R$)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.price_modifier}
                onChange={(e) => setFormData(prev => ({ ...prev, price_modifier: parseFloat(e.target.value) || 0 }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>

            <div className="flex items-center">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.is_available}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_available: e.target.checked }))}
                  className="rounded"
                />
                <span className="text-sm font-medium text-gray-700">Disponível</span>
              </label>
            </div>
          </div>

          <div className="flex space-x-2">
            <button
              type="submit"
              className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              <Save className="w-4 h-4" />
              <span>{editingId ? 'Atualizar' : 'Salvar'}</span>
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              <X className="w-4 h-4" />
              <span>Cancelar</span>
            </button>
          </div>
        </form>
      )}

      {/* Lista de variações */}
      <div className="space-y-4">
        {/* Tamanhos */}
        {sizes.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Tamanhos</h4>
            <div className="space-y-2">
              {sizes.map((size) => (
                <div key={size.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <span className="font-medium">{size.name}</span>
                    <span className="text-gray-600">({size.value})</span>
                    {size.stock_quantity !== undefined && (
                      <span className="text-sm text-gray-500">
                        Estoque: {size.stock_quantity}
                      </span>
                    )}
                    {size.price_modifier && size.price_modifier !== 0 && (
                      <span className="text-sm font-medium text-green-600">
                        {size.price_modifier > 0 ? '+' : ''}{formatPrice(size.price_modifier)}
                      </span>
                    )}
                    <span className={`text-xs px-2 py-1 rounded ${
                      size.is_available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {size.is_available ? 'Disponível' : 'Indisponível'}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(size)}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(size.id)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cores */}
        {colors.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Cores</h4>
            <div className="space-y-2">
              {colors.map((color) => (
                <div key={color.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-6 h-6 rounded-full border border-gray-300"
                        style={{ backgroundColor: color.value }}
                      />
                      <span className="font-medium">{color.name}</span>
                    </div>
                    <span className="text-gray-600">({color.value})</span>
                    {color.stock_quantity !== undefined && (
                      <span className="text-sm text-gray-500">
                        Estoque: {color.stock_quantity}
                      </span>
                    )}
                    {color.price_modifier && color.price_modifier !== 0 && (
                      <span className="text-sm font-medium text-green-600">
                        {color.price_modifier > 0 ? '+' : ''}{formatPrice(color.price_modifier)}
                      </span>
                    )}
                    <span className={`text-xs px-2 py-1 rounded ${
                      color.is_available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {color.is_available ? 'Disponível' : 'Indisponível'}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(color)}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(color.id)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {variations.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Nenhuma variação cadastrada. Clique em "Adicionar Variação" para começar.
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductVariationsManager;
