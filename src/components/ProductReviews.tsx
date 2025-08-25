
import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, ThumbsUp, Edit, Trash2, Send } from 'lucide-react';
import { reviewService, type Review } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/Button';
import { formatDate } from '../lib/utils';

interface ProductReviewsProps {
  productId: number;
  productName: string;
}

interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: { [key: number]: number };
}

const ProductReviews: React.FC<ProductReviewsProps> = ({ productId, productName }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats>({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [hasUserReviewed, setHasUserReviewed] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    rating: 5,
    comment: ''
  });

  useEffect(() => {
    loadReviews();
    if (user) {
      checkUserReview();
    }
  }, [productId, user]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const [reviewsData, statsData] = await Promise.all([
        reviewService.getProductReviews(productId),
        reviewService.getProductRatingStats(productId)
      ]);
      
      setReviews(reviewsData);
      setStats(statsData);
    } catch (error) {
      console.error('Erro ao carregar avaliações:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkUserReview = async () => {
    if (!user) return;
    
    try {
      const hasReviewed = await reviewService.hasUserReviewed(user.id, productId);
      setHasUserReviewed(hasReviewed);
    } catch (error) {
      console.error('Erro ao verificar avaliação do usuário:', error);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || submitting) return;

    try {
      setSubmitting(true);

      if (editingReview) {
        await reviewService.updateReview(editingReview.id, formData);
      } else {
        await reviewService.createReview({
          user_id: user.id,
          product_id: productId,
          rating: formData.rating,
          comment: formData.comment.trim() || null
        });
      }

      // Reset form
      setFormData({ rating: 5, comment: '' });
      setShowReviewForm(false);
      setEditingReview(null);
      
      // Reload reviews
      await loadReviews();
      await checkUserReview();
    } catch (error) {
      console.error('Erro ao enviar avaliação:', error);
      alert('Erro ao enviar avaliação. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditReview = (review: Review) => {
    setFormData({
      rating: review.rating,
      comment: review.comment || ''
    });
    setEditingReview(review);
    setShowReviewForm(true);
  };

  const handleDeleteReview = async (reviewId: number) => {
    if (!user || !confirm('Tem certeza que deseja excluir sua avaliação?')) return;

    try {
      await reviewService.deleteReview(reviewId, user.id);
      await loadReviews();
      await checkUserReview();
    } catch (error) {
      console.error('Erro ao excluir avaliação:', error);
      alert('Erro ao excluir avaliação. Tente novamente.');
    }
  };

  const renderStars = (rating: number, interactive = false, size = 'w-4 h-4') => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`${size} ${
          i < Math.floor(rating)
            ? 'text-yellow-400 fill-current'
            : 'text-gray-300'
        } ${interactive ? 'cursor-pointer hover:text-yellow-300' : ''}`}
        onClick={() => interactive && setFormData(prev => ({ ...prev, rating: i + 1 }))}
      />
    ));
  };

  const renderRatingDistribution = () => {
    return (
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((rating) => (
          <div key={rating} className="flex items-center space-x-2">
            <span className="text-sm w-3">{rating}</span>
            <Star className="w-3 h-3 text-yellow-400 fill-current" />
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className="bg-yellow-400 h-2 rounded-full"
                style={{
                  width: stats.totalReviews > 0 
                    ? `${(stats.ratingDistribution[rating] / stats.totalReviews) * 100}%`
                    : '0%'
                }}
              />
            </div>
            <span className="text-sm text-gray-600 w-8">
              {stats.ratingDistribution[rating]}
            </span>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Avaliações</h3>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Avaliações dos Clientes
        </h3>
        {user && !hasUserReviewed && !showReviewForm && (
          <Button
            onClick={() => setShowReviewForm(true)}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Avaliar Produto
          </Button>
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            {renderStars(stats.averageRating, false, 'w-5 h-5')}
            <span className="text-2xl font-bold text-gray-900">
              {stats.averageRating.toFixed(1)}
            </span>
          </div>
          <p className="text-gray-600">
            {stats.totalReviews} avaliações
          </p>
        </div>
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Distribuição das Notas</h4>
          {renderRatingDistribution()}
        </div>
      </div>

      {/* Review Form */}
      {showReviewForm && user && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="font-semibold text-gray-900 mb-4">
            {editingReview ? 'Editar Avaliação' : 'Avaliar Produto'}
          </h4>
          
          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nota
              </label>
              <div className="flex items-center space-x-1">
                {renderStars(formData.rating, true, 'w-6 h-6')}
                <span className="ml-2 text-sm text-gray-600">
                  {formData.rating} de 5 estrelas
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comentário (opcional)
              </label>
              <textarea
                value={formData.comment}
                onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Compartilhe sua experiência com este produto..."
              />
            </div>

            <div className="flex items-center space-x-3">
              <Button
                type="submit"
                disabled={submitting}
                className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
              >
                <Send className="w-4 h-4 mr-2" />
                {submitting ? 'Enviando...' : editingReview ? 'Atualizar' : 'Enviar Avaliação'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowReviewForm(false);
                  setEditingReview(null);
                  setFormData({ rating: 5, comment: '' });
                }}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Reviews List */}
      {stats.totalReviews > 0 ? (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 font-medium">
                      {review.user_email?.charAt(0).toUpperCase() || '?'}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      {renderStars(review.rating)}
                      <span className="text-sm text-gray-600">
                        {formatDate(review.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      {review.user_email?.replace(/(.{2})[^@]*(@.*)/, '$1***$2') || 'Usuário anônimo'}
                    </p>
                  </div>
                </div>

                {/* User Actions */}
                {user && user.id === review.user_id && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEditReview(review)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                      title="Editar avaliação"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteReview(review.id)}
                      className="p-1 text-gray-400 hover:text-red-600"
                      title="Excluir avaliação"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {review.comment && (
                <p className="text-gray-700">{review.comment}</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-4">
            Seja o primeiro a avaliar este produto!
          </p>
          {user && !showReviewForm && (
            <Button
              onClick={() => setShowReviewForm(true)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Escrever Avaliação
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductReviews;
