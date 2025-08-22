import React, { useState, useEffect } from "react";
import { useValidation } from "../utils/validation";

interface CarrinhoItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
}

const CheckoutPage: React.FC = () => {
  const { validateCheckout } = useValidation();

  const [formData, setFormData] = useState({
    nomeCliente: "",
    email: "",
    telefone: "",
    cep: "",
    rua: "",
    numero: "",
    bairro: "",
    cidade: "",
    estado: "",
    carrinho: [] as CarrinhoItem[],
    total: 0,
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  // 📝 Atualiza campos do formulário
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // 📦 Carrinho de exemplo (simulação)
  useEffect(() => {
    const carrinhoExemplo = [
      { id: 10, name: "Camisa do pato", quantity: 1, price: 2.99 },
    ];
    const total = carrinhoExemplo.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
    setFormData((prev) => ({ ...prev, carrinho: carrinhoExemplo, total }));
  }, []);

  // 🚀 Enviar dados
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setLoading(true);

    // ✅ Validação local
    const validation = validateCheckout(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      setLoading(false);
      return;
    }

    // ✅ Montar payload no formato esperado pelo backend (Zod schema)
    const payload = {
      carrinho: formData.carrinho.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
      nomeCliente: formData.nomeCliente.trim(),
      email: formData.email.trim(),
      telefone: formData.telefone.trim(),
      endereco: {
        cep: formData.cep.trim(),
        rua: formData.rua.trim(),
        numero: formData.numero.trim(),
        bairro: formData.bairro.trim(),
        cidade: formData.cidade.trim(),
        estado: formData.estado.trim(),
      },
      total: formData.total,
    };

    try {
      console.log("📦 Payload enviado para backend:", payload);

      const response = await fetch(
        "https://backend-nectix.onrender.com/api/payments/criar-pagamento",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Erro no pagamento");
      }

      alert("Pagamento criado com sucesso!");
      console.log("✅ Resposta backend:", data);
    } catch (err: any) {
      setErrors([err.message || "Erro inesperado"]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white shadow rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Checkout</h2>

      {/* 🔔 Exibir erros */}
      {errors.length > 0 && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
          <ul>
            {errors.map((err, i) => (
              <li key={i}>⚠️ {err}</li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="nomeCliente"
          placeholder="Nome completo"
          value={formData.nomeCliente}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />

        <input
          type="text"
          name="telefone"
          placeholder="Telefone"
          value={formData.telefone}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />

        <input
          type="text"
          name="cep"
          placeholder="CEP"
          value={formData.cep}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />

        <input
          type="text"
          name="rua"
          placeholder="Rua"
          value={formData.rua}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />

        <input
          type="text"
          name="numero"
          placeholder="Número"
          value={formData.numero}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />

        <input
          type="text"
          name="bairro"
          placeholder="Bairro"
          value={formData.bairro}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />

        <input
          type="text"
          name="cidade"
          placeholder="Cidade"
          value={formData.cidade}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />

        <input
          type="text"
          name="estado"
          placeholder="Estado"
          value={formData.estado}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />

        <div className="p-3 border rounded bg-gray-50">
          <h3 className="font-semibold mb-2">Resumo do pedido</h3>
          {formData.carrinho.map((item) => (
            <div key={item.id} className="flex justify-between">
              <span>
                {item.name} x{item.quantity}
              </span>
              <span>R$ {(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="flex justify-between font-bold mt-2">
            <span>Total:</span>
            <span>R$ {formData.total.toFixed(2)}</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600"
        >
          {loading ? "Processando..." : "Finalizar Pedido"}
        </button>
      </form>
    </div>
  );
};

export default CheckoutPage;
