import React from "react";
import {
  Download,
  Calendar,
  CreditCard,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { usePayments } from "../hooks/usePayments";
import { formatPrice } from "../lib/utils";
import { Button } from "./ui/Button";

export const PurchaseHistory: React.FC = () => {
  const { payments, loading, error } = usePayments();

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case "rejected":
      case "cancelled":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "Aprovado";
      case "pending":
        return "Pendente";
      case "rejected":
        return "Rejeitado";
      case "cancelled":
        return "Cancelado";
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "text-green-600 bg-green-100";
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      case "rejected":
      case "cancelled":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleDownload = (link: string) => {
    window.open(link, "_blank");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Carregando histórico...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 text-lg font-semibold mb-2">
          Erro ao carregar histórico
        </p>
        <p className="text-sm text-gray-500">{error}</p>
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <div className="text-center py-12">
        <CreditCard className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Nenhuma compra encontrada
        </h3>
        <p className="text-gray-500">
          Você ainda não fez nenhuma compra. Explore nossos produtos!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Histórico de Compras</h2>
        <div className="text-sm text-gray-500">
          {payments.length} compra{payments.length !== 1 ? "s" : ""}
        </div>
      </div>

      <div className="space-y-4">
        {payments.map((payment) => (
          <div
            key={payment.id}
            className="bg-white rounded-lg shadow-sm border p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                {getStatusIcon(payment.status)}
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Pedido #{payment.id.slice(-8)}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {payment.nome_cliente} • {payment.email_cliente}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900">
                  {formatPrice(payment.valor)}
                </div>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                    payment.status
                  )}`}
                >
                  {getStatusText(payment.status)}
                </span>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {formatDate(payment.created_at)}
                </div>
                <div>
                  {payment.produtos?.length || 0} produto
                  {(payment.produtos?.length || 0) !== 1 ? "s" : ""}
                </div>
              </div>

              {/* Lista de produtos */}
              {payment.produtos && payment.produtos.length > 0 && (
                <div className="space-y-2 mb-4">
                  {payment.produtos.map((product: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-10 h-10 object-cover rounded"
                          onError={(e) =>
                            ((e.target as HTMLImageElement).src =
                              "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=40&h=40&fit=crop")
                          }
                        />
                        <div>
                          <p className="font-medium text-gray-900">
                            {product.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {product.category}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          {formatPrice(product.price)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Links de download (se aprovado) */}
              {payment.status.toLowerCase() === "approved" &&
                payment.links_download &&
                payment.links_download.length > 0 && (
                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="font-medium text-gray-900 mb-2">
                      Links de Download
                    </h4>
                    <div className="space-y-2">
                      {payment.links_download.map((link, index) => (
                        <Button
                          key={index}
                          onClick={() => handleDownload(link)}
                          variant="outline"
                          size="sm"
                          className="w-full justify-start"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download {index + 1}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 