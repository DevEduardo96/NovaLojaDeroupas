
import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { productService } from '../lib/supabase';
import type { ProductVariation } from '../types';
import { Button } from './ui/Button';

interface ProductVariationManagerProps {
  productId: number;
  onVariationsChange?: (variations: ProductVariation[]) => void;
}

export const ProductVariationManager: React.FC<ProductVariationManagerProps> = ({
  productId,
  onVariationsChange
}) => {
  const [variations, setVariations] = useState<ProductVariation[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newVariation, setNewVariation] = useState<{
    type: 'size' | 'color';
    name: string;
    value: string;
    stock_quantity: number;
    price_modifier: number;
  }>({
    type: 'size',
    name: '',
    value: '',
    stock_quantity: 0,
    price_modifier: 0
  });
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    loadVariations();
  }, [productId]);

  const loadVariations = async () => {
    try {
      setLoading(true);
      const data = await productService.getProductVariations(productId);
      setVariations(data);
      onVariationsChange?.(data);
    } catch (error) {
      console.error('Error loading variations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddVariation = async () => {
    try {
      const variation = await productService.addProductVariation({
        product_id: productId,
        type: newVariation.type,
        name: newVariation.name,
        value: newVariation.value,
        stock_quantity: newVariation.stock_quantity,
        price_modifier: newVariation.price_modifier,
        is_available: true
      });

      setVariations(prev => [...prev, variation]);
      setNewVariation({
        type: 'size',
        name: '',
        value: '',
        stock_quantity: 0,
        price_modifier: 0
      });
      setShowAddForm(false);
      onVariationsChange?.([...variations, variation]);
    } catch (error) {
      console.error('Error adding variation:', error);
    }
  };

  const handleUpdateVariation = async (id: number, updates: Partial<ProductVariation>) => {
    try {
      const updatedVariation = await productService.updateProductVariation(id, updates);
      setVariations(prev => prev.map(v => v.id === id ? updatedVariation : v));
      setEditingId(null);
      onVariationsChange?.(variations.map(v => v.id === id ? updatedVariation : v));
    } catch (error) {
      console.error('Error updating variation:', error);
    }
  };

  const handleDeleteVariation = async (id: number) => {
    try {
      await productService.deleteProductVariation(id);
      const newVariations = variations.filter(v => v.id !== id);
      setVariations(newVariations);
      onVariationsChange?.(newVariations);
    } catch (error) {
      console.error('Error deleting variation:', error);
    }
  };

  if (loading) {
    return <div className="p-4 text-center">Carregando variações...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Variações do Produto</h3>
        <Button
          onClick={() => setShowAddForm(true)}
          variant="outline"
          size="sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Variação
        </Button>
      </div>

      {/* Form para adicionar nova variação */}
      {showAddForm && (
        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tipo</label>
              <select
                value={newVariation.type}
                onChange={(e) => setNewVariation(prev => ({ ...prev, type: e.target.value as 'size' | 'color' }))}
                className="w-full p-2 border rounded-md"
              >
                <option value="size">Tamanho</option>
                <option value="color">Cor</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nome</label>
              <input
                type="text"
                value={newVariation.name}
                onChange={(e) => setNewVariation(prev => ({ ...prev, name: e.target.value }))}
                className="w-full p-2 border rounded-md"
                placeholder={newVariation.type === 'size' ? 'ex: M, L, XL' : 'ex: Azul, Vermelho'}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Valor</label>
              <input
                type="text"
                value={newVariation.value}
                onChange={(e) => setNewVariation(prev => ({ ...prev, value: e.target.value }))}
                className="w-full p-2 border rounded-md"
                placeholder={newVariation.type === 'size' ? 'ex: Medium' : 'ex: #0000FF'}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Estoque</label>
              <input
                type="number"
                value={newVariation.stock_quantity}
                onChange={(e) => setNewVariation(prev => ({ ...prev, stock_quantity: parseInt(e.target.value) || 0 }))}
                className="w-full p-2 border rounded-md"
                min="0"
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setShowAddForm(false)}
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={handleAddVariation}>
              <Save className="w-4 h-4 mr-2" />
              Salvar
            </Button>
          </div>
        </div>
      )}

      {/* Lista de variações */}
      <div className="space-y-2">
        {variations.map(variation => (
          <div key={variation.id} className="bg-white p-4 rounded-lg border flex items-center justify-between">
            <div className="grid grid-cols-4 gap-4 flex-1">
              <div>
                <span className="text-sm text-gray-500">Tipo:</span>
                <p className="font-medium">
                  {variation.type === 'size' ? 'Tamanho' : 'Cor'}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Nome:</span>
                <p className="font-medium">{variation.name}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Valor:</span>
                <div className="flex items-center space-x-2">
                  {variation.type === 'color' && (
                    <div 
                      className="w-4 h-4 rounded-full border"
                      style={{ backgroundColor: variation.value }}
                    />
                  )}
                  <p className="font-medium">{variation.value}</p>
                </div>
              </div>
              <div>
                <span className="text-sm text-gray-500">Estoque:</span>
                <p className="font-medium">{variation.stock_quantity}</p>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditingId(variation.id)}
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDeleteVariation(variation.id)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {variations.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Nenhuma variação cadastrada para este produto.
        </div>
      )}
    </div>
  );
};

export default ProductVariationManager;
