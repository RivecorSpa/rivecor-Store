import api from "../services/api";

export default function GetnetButton({
  items,
  customer,
}) {
  const subtotal = items.reduce(
    (acc, item) =>
      acc +
      Number(item.price) *
        Number(item.quantity),
    0
  );

  const shipping = 0;

  const total =
    subtotal + shipping;

  const pagar = async () => {
    try {
      const { data } =
        await api.post(
          "/payments/getnet/create",
          {
            customer,
            items,
            subtotal,
            shipping,
            total,
            address:
              customer.address,
          }
        );

      if (!data.paymentUrl) {
        alert(
          "No se pudo generar pago"
        );
        return;
      }

      window.location.href =
        data.paymentUrl;
    } catch (error) {
      console.error(error);

      alert(
        "Error iniciando pago"
      );
    }
  };

  return (
    <button
      onClick={pagar}
      className="bg-yellow-400 text-black px-6 py-3 rounded-xl font-bold"
    >
      Pagar con Getnet
    </button>
  );
}