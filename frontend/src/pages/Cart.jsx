import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  ShieldCheck,
} from "lucide-react";
import { useCart } from "../context/CartContext";

export default function Cart() {
  const { items, updateQuantity, removeItem, subtotal } = useCart();

  const services = items.reduce((acc, item) => {
    const itemServices = item.services || [];

    return (
      acc +
      itemServices.reduce(
        (serviceAcc, service) =>
          serviceAcc + Number(service.price || 0),
        0
      )
    );
  }, 0);

  const total = subtotal + services;

  return (
    <main className="min-h-screen bg-[#070A0F] px-6 py-12 text-white">
      <div className="mx-auto max-w-7xl">
        <Link
          to="/productos"
          className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-white/50 transition hover:text-yellow-400"
        >
          <ArrowLeft size={18} />
          Seguir comprando
        </Link>

        <div className="mb-10 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-400 text-black">
            <ShoppingBag size={28} />
          </div>

          <div>
            <h1 className="text-5xl font-black">Tu carrito</h1>

            <p className="mt-2 text-white/45">
              Revisa tus productos antes de finalizar la compra.
            </p>
          </div>
        </div>

        {items.length === 0 ? (
          <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-12 text-center">
            <ShoppingBag className="mx-auto text-yellow-400" size={60} />

            <h2 className="mt-6 text-3xl font-black">
              Tu carrito está vacío
            </h2>

            <p className="mt-3 text-white/45">
              Agrega neumáticos o llantas para continuar.
            </p>

            <Link
              to="/productos"
              className="mt-8 inline-flex rounded-2xl bg-yellow-400 px-8 py-4 font-black text-black transition hover:bg-yellow-300"
            >
              Ver productos
            </Link>
          </section>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
            <section className="space-y-5">
              {items.map((item, index) => (
                <motion.article
                  key={item.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  className="grid gap-5 rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 md:grid-cols-[180px_1fr]"
                >
                  <div className="h-[180px] overflow-hidden rounded-[1.5rem] bg-black">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="flex flex-col justify-between gap-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className="rounded-full bg-yellow-400 px-3 py-1 text-xs font-black text-black">
                          {item.brand}
                        </span>

                        <h2 className="mt-4 text-2xl font-black">
                          {item.name}
                        </h2>

                        <p className="mt-1 text-white/45">
                          Medida {item.size}
                        </p>

                        {item.services?.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {item.services.map((service) => (
                              <span
                                key={service.id}
                                className="rounded-full bg-yellow-400/10 px-3 py-1 text-xs font-bold text-yellow-400"
                              >
                                {service.name} + $
                                {Number(service.price).toLocaleString("es-CL")}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => removeItem(item.id)}
                        className="rounded-full border border-white/10 p-3 text-white/45 transition hover:border-red-400 hover:text-red-400"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                      <div className="flex w-fit items-center rounded-2xl border border-white/10 bg-black/40">
                        <button
                          onClick={() => updateQuantity(item.id, "minus")}
                          className="p-4 text-white hover:text-yellow-400"
                        >
                          <Minus size={18} />
                        </button>

                        <span className="min-w-12 text-center text-xl font-black">
                          {item.quantity}
                        </span>

                        <button
                          onClick={() => updateQuantity(item.id, "plus")}
                          className="p-4 text-white hover:text-yellow-400"
                        >
                          <Plus size={18} />
                        </button>
                      </div>

                      <div className="text-right">
                        <p className="text-sm text-white/40">
                          Subtotal
                        </p>

                        <p className="text-3xl font-black text-yellow-400">
                          $
                          {(
                            item.price * item.quantity
                          ).toLocaleString("es-CL")}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.article>
              ))}
            </section>

            <motion.aside
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              className="h-fit rounded-[2rem] border border-white/10 bg-white/[0.04] p-7 shadow-2xl"
            >
              <h2 className="text-3xl font-black">
                Resumen
              </h2>

              <p className="mt-2 text-white/45">
                Total estimado de tu compra.
              </p>

              <div className="mt-7 rounded-2xl bg-black/40 p-5">
                <div className="flex justify-between text-white/50">
                  <span>Productos</span>

                  <span>
                    ${subtotal.toLocaleString("es-CL")}
                  </span>
                </div>

                <div className="mt-3 flex justify-between text-white/50">
                  <span>Servicios</span>

                  <span>
                    ${services.toLocaleString("es-CL")}
                  </span>
                </div>

                <div className="mt-5 flex justify-between border-t border-white/10 pt-5 text-2xl font-black">
                  <span>Total</span>

                  <span className="text-yellow-400">
                    ${total.toLocaleString("es-CL")}
                  </span>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-green-400/20 bg-green-400/10 p-4 text-sm text-green-400">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={18} />
                  Compra protegida y pago seguro.
                </div>
              </div>

              <Link
                to="/checkout"
                className="mt-6 flex w-full items-center justify-center rounded-2xl bg-yellow-400 px-6 py-5 text-lg font-black text-black transition hover:bg-yellow-300"
              >
                Continuar al checkout
              </Link>

              <Link
                to="/productos"
                className="mt-3 flex w-full items-center justify-center rounded-2xl border border-white/10 px-6 py-5 text-lg font-black text-white transition hover:border-yellow-400 hover:text-yellow-400"
              >
                Agregar más productos
              </Link>
            </motion.aside>
          </div>
        )}
      </div>
    </main>
  );
}