import { useEffect, useMemo, useState } from "react";
import {
  Upload,
  Package,
  FileSpreadsheet,
  Pencil,
  X,
  Save,
  Trash2,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:3001/api";
const PAGE_SIZE = 5;

export default function AdminCatalog() {
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [products, setProducts] = useState([]);
  const [loadingUpload, setLoadingUpload] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [message, setMessage] = useState("");
  const [editingProduct, setEditingProduct] = useState(null);
  const [hasOffer, setHasOffer] = useState(false);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);

  const [search, setSearch] = useState("");
  const [stockFilter, setStockFilter] = useState("TODOS");
  const [statusFilter, setStatusFilter] = useState("TODOS");

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    if (!token || user?.role !== "ADMIN") {
      navigate("/login");
      return;
    }

    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoadingProducts(true);

      const res = await fetch(`${API_URL}/products`);
      const data = await res.json();

      setProducts(Array.isArray(data) ? data : []);
    } catch {
      setMessage("Error cargando productos");
    } finally {
      setLoadingProducts(false);
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const text = `${product.sku} ${product.name} ${product.brand} ${product.category} ${product.size}`.toLowerCase();

      const matchSearch = text.includes(search.toLowerCase());
      const stock = Number(product.stock || 0);

      const matchStock =
        stockFilter === "TODOS" ||
        (stockFilter === "CON_STOCK" && stock > 0) ||
        (stockFilter === "SIN_STOCK" && stock === 0) ||
        (stockFilter === "CRITICO" && stock > 0 && stock <= 5);

      const matchStatus =
        statusFilter === "TODOS" ||
        (statusFilter === "ACTIVOS" && product.active) ||
        (statusFilter === "OCULTOS" && !product.active);

      return matchSearch && matchStock && matchStatus;
    });
  }, [products, search, stockFilter, statusFilter]);

  const totalProducts = products.length;
  const activeProducts = products.filter((p) => p.active).length;
  const noStockProducts = products.filter(
    (p) => Number(p.stock || 0) === 0
  ).length;
  const criticalProducts = products.filter(
    (p) => Number(p.stock || 0) > 0 && Number(p.stock || 0) <= 5
  ).length;

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));

  const paginatedProducts = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredProducts.slice(start, start + PAGE_SIZE);
  }, [filteredProducts, page]);

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!file) {
      setMessage("Selecciona un archivo Excel");
      return;
    }

    try {
      setLoadingUpload(true);
      setMessage("");

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${API_URL}/products/import-excel`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error importando Excel");
      }

      setMessage(`Catálogo importado correctamente. Productos: ${data.imported}`);
      setFile(null);
      setPage(1);
      await loadProducts();
    } catch (error) {
      setMessage(error.message || "Error al subir Excel");
    } finally {
      setLoadingUpload(false);
    }
  };

  const openEdit = (product) => {
  setHasOffer(product.offerPrice !== null);

  setEditingProduct({
    ...product,
    price: String(product.price ?? ""),
    offerPrice: product.offerPrice
      ? String(product.offerPrice)
      : "",
    stock: String(product.stock ?? ""),
  });
};

  const updateField = (field, value) => {
    setEditingProduct((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const saveProduct = async () => {
    try {
      setSaving(true);
      setMessage("");

      const payload = {
        name: editingProduct.name,
        brand: editingProduct.brand,
        category: editingProduct.category,
        rim: editingProduct.rim,
        size: editingProduct.size,
        price: Number(editingProduct.price || 0),
        offerPrice: hasOffer
  ? Number(editingProduct.offerPrice || 0)
  : null,
        stock: Number(editingProduct.stock || 0),
        imageUrl: editingProduct.imageUrl || "",
        description: editingProduct.description || "",
        active: Boolean(editingProduct.active),
      };

      const res = await fetch(`${API_URL}/products/${editingProduct.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error actualizando producto");
      }

      setProducts((prev) =>
        prev.map((product) => (product.id === data.id ? data : product))
      );

      setEditingProduct(null);
      setMessage("Producto actualizado correctamente");
    } catch (error) {
      setMessage(error.message || "Error guardando producto");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (product) => {
    const updated = {
      ...product,
      active: !product.active,
    };

    try {
      const res = await fetch(`${API_URL}/products/${product.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updated),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error cambiando estado");
      }

      setProducts((prev) =>
        prev.map((item) => (item.id === data.id ? data : item))
      );

      setMessage(data.active ? "Producto activado" : "Producto ocultado");
    } catch {
      setMessage("Error cambiando estado del producto");
    }
  };

  const deleteProduct = async (product) => {
    const ok = confirm(`¿Eliminar ${product.name}?`);
    if (!ok) return;

    try {
      const res = await fetch(`${API_URL}/products/${product.id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error eliminando producto");
      }

      const nextProducts = products.filter((item) => item.id !== product.id);
      setProducts(nextProducts);

      const nextTotalPages = Math.max(
        1,
        Math.ceil(nextProducts.length / PAGE_SIZE)
      );

      if (page > nextTotalPages) {
        setPage(nextTotalPages);
      }

      setMessage("Producto eliminado correctamente");
    } catch {
      setMessage("Error eliminando producto");
    }
  };

  return (
    <main>
      <header className="mb-10">
        <span className="rounded-full border border-yellow-400/30 bg-yellow-400/10 px-4 py-2 text-sm font-bold text-yellow-400">
          Catálogo
        </span>

        <h1 className="mt-5 text-3xl sm:text-5xl font-black">Productos</h1>

        <p className="mt-3 text-white/45">
          Importa productos por Excel, edita stock, activa/desactiva o elimina
          productos.
        </p>
      </header>

      <section className="grid gap-6 xl:grid-cols-[380px_1fr]">
        <div className="h-fit rounded-[2rem] border border-white/10 bg-white/[0.04] p-4 sm:p-7 shadow-2xl">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-yellow-400 p-3 text-black">
              <FileSpreadsheet size={28} />
            </div>

            <div>
              <h2 className="text-2xl font-black">Importar Excel</h2>
              <p className="text-sm text-white/45">Sube el catálogo.</p>
            </div>
          </div>

          <form onSubmit={handleUpload} className="space-y-5">
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-white/15 bg-black/35 px-6 py-10 text-center transition hover:border-yellow-400">
              <Upload className="mb-4 text-yellow-400" size={42} />

              <p className="font-black">
                {file ? file.name : "Seleccionar Excel"}
              </p>

              <p className="mt-2 text-sm text-white/40">.xlsx o .xls</p>

              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => setFile(e.target.files[0])}
                className="hidden"
              />
            </label>

            <button
              type="submit"
              disabled={loadingUpload}
              className="w-full rounded-2xl bg-yellow-400 px-6 py-4 text-lg font-black text-black transition hover:bg-yellow-300 disabled:opacity-60"
            >
              {loadingUpload ? "Importando..." : "Subir catálogo"}
            </button>
          </form>

          {message && (
            <div className="mt-5 rounded-2xl border border-white/10 bg-black/35 p-4 text-sm text-white/70">
              {message}
            </div>
          )}

          <div className="mt-7 rounded-2xl border border-yellow-400/20 bg-yellow-400/10 p-5">
            <h3 className="font-black text-yellow-400">Columnas</h3>
            <p className="mt-3 text-sm leading-6 text-white/55">
              sku, name, brand, category, rim, size, price, offerPrice, stock,
              imageUrl, description
            </p>
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-4 sm:p-7 shadow-2xl">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-yellow-400 p-3 text-black">
                <Package size={28} />
              </div>

              <div>
                <h2 className="text-2xl font-black">Stock cargado</h2>
                <p className="text-sm text-white/45">
                  Mostrando {filteredProducts.length} de {products.length}
                </p>
              </div>
            </div>

            <button
              onClick={loadProducts}
              className="rounded-full border border-white/10 px-5 py-3 font-bold text-white/70 transition hover:border-yellow-400 hover:text-yellow-400"
            >
              Actualizar
            </button>
          </div>

          <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-3">
            <MiniStat label="Total" value={totalProducts} />
            <MiniStat label="Activos" value={activeProducts} />
            <MiniStat label="Sin stock" value={noStockProducts} danger />
            <MiniStat label="Stock crítico" value={criticalProducts} warning />
          </div>

          <div className="mb-6 grid gap-3 lg:grid-cols-[1fr_190px_190px]">
            <div className="flex items-center rounded-2xl border border-white/10 bg-black/40 px-4">
              <Search size={18} className="text-white/35" />
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Buscar por SKU, producto, marca o medida..."
                className="w-full bg-transparent px-3 py-4 text-white outline-none placeholder:text-white/30"
              />
            </div>

            <select
              value={stockFilter}
              onChange={(e) => {
                setStockFilter(e.target.value);
                setPage(1);
              }}
              className="rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-white outline-none"
            >
              <option value="TODOS">Todo stock</option>
              <option value="CON_STOCK">Con stock</option>
              <option value="SIN_STOCK">Sin stock</option>
              <option value="CRITICO">Stock crítico</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-white outline-none"
            >
              <option value="TODOS">Todo estado</option>
              <option value="ACTIVOS">Activos</option>
              <option value="OCULTOS">Ocultos</option>
            </select>
          </div>

          {loadingProducts ? (
            <p className="text-white/45">Cargando productos...</p>
          ) : filteredProducts.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-black/35 p-10 text-center">
              <Package className="mx-auto text-yellow-400" size={52} />
              <h3 className="mt-5 text-2xl font-black">No hay productos</h3>
              <p className="mt-2 text-white/45">
                No hay resultados para los filtros actuales.
              </p>
            </div>
          ) : (
            <>
              <div className="grid gap-4">
                {paginatedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onEdit={() => openEdit(product)}
                    onToggle={() => toggleActive(product)}
                    onDelete={() => deleteProduct(product)}
                  />
                ))}
              </div>

              <div className="mt-7 flex items-center justify-between rounded-2xl border border-white/10 bg-black/30 p-4">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm font-bold text-white/70 disabled:opacity-30"
                >
                  <ChevronLeft size={18} />
                  Anterior
                </button>

                <p className="text-sm font-bold text-white/50">
                  Página {page} de {totalPages}
                </p>

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm font-bold text-white/70 disabled:opacity-30"
                >
                  Siguiente
                  <ChevronRight size={18} />
                </button>
              </div>
            </>
          )}
        </div>
      </section>

      {editingProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 px-5 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[2rem] border border-white/10 bg-[#0B0F14] p-7 shadow-2xl">
            <div className="mb-7 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-yellow-400">
                  Editar producto
                </p>
                <h2 className="text-3xl font-black">{editingProduct.sku}</h2>
              </div>

              <button
                onClick={() => setEditingProduct(null)}
                className="rounded-full border border-white/10 p-3 text-white/60 transition hover:border-red-400 hover:text-red-400"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
              <div className="space-y-4">
              <Input label="Nombre" value={editingProduct.name} onChange={(v) => updateField("name", v)} />
              <Input label="Marca" value={editingProduct.brand} onChange={(v) => updateField("brand", v)} />
              <Input label="Categoría" value={editingProduct.category} onChange={(v) => updateField("category", v)} />
              <Input label="Aro" value={editingProduct.rim} onChange={(v) => updateField("rim", v)} />
              <Input label="Medida" value={editingProduct.size} onChange={(v) => updateField("size", v)} />
              <Input
  label="Precio"
  type="number"
  value={editingProduct.price}
  onChange={(v) => updateField("price", v)}
/>
              <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/40 p-4">

<input
type="checkbox"
checked={hasOffer}
onChange={(e)=>setHasOffer(e.target.checked)}
/>

Producto en oferta

</label>
              
{hasOffer && (

<Input
label="Precio oferta"
type="number"
value={editingProduct.offerPrice}
onChange={(v)=>updateField("offerPrice",v)}
/>

)}

{hasOffer &&
editingProduct.price &&
editingProduct.offerPrice &&
Number(editingProduct.offerPrice) < Number(editingProduct.price) && (

  <p className="text-green-400 font-bold mt-2">
    Descuento:{" "}
    {Math.round(
      (1 -
        Number(editingProduct.offerPrice) /
          Number(editingProduct.price)) *
        100
    )}
    %
  </p>

)}
</div>
<div className="sticky top-6 self-start">

  <div className="rounded-3xl border border-white/10 bg-black/30 p-5">

    <h3 className="mb-4 text-xl font-black">
      Vista previa
    </h3>

    <div className="overflow-hidden rounded-2xl bg-[#111]">

      {editingProduct.imageUrl ? (

        <img
          src={editingProduct.imageUrl}
          alt={editingProduct.name}
          className="h-72 w-full object-cover"
        />

      ) : (

        <div className="flex h-72 items-center justify-center text-white/30">

          Sin imagen

        </div>

      )}

    </div>

    <h2 className="mt-5 text-2xl font-black">

      {editingProduct.name || "Nombre del producto"}

    </h2>

    <p className="mt-2 text-white/50">

      {editingProduct.brand} · {editingProduct.category}

    </p>

    <div className="mt-5">

      <p className="text-3xl font-black text-yellow-400">

        $
        {Number(
          editingProduct.offerPrice || editingProduct.price || 0
        ).toLocaleString("es-CL")}

      </p>

      {hasOffer && editingProduct.offerPrice && (

        <p className="text-sm text-white/40 line-through">

          $
          {Number(editingProduct.price).toLocaleString("es-CL")}

        </p>

      )}


    <div className="mt-5 rounded-xl bg-white/5 p-3">

      Stock:
      <strong className="ml-2">

        {editingProduct.stock}

      </strong>

    </div>

  </div>

</div>
<Input
label="Stock"
type="number"
value={editingProduct.stock}
onChange={(v)=>updateField("stock",v)}
/>

<Input
label="URL imagen"
value={editingProduct.imageUrl}
onChange={(v)=>updateField("imageUrl",v)}
className="md:col-span-2"
/>
</div>
            </div>

            <label className="mt-5 flex items-center gap-3 rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-sm font-bold text-white/60">
              <input
                type="checkbox"
                checked={Boolean(editingProduct.active)}
                onChange={(e) => updateField("active", e.target.checked)}
              />
              Producto activo en tienda
            </label>

            <div className="mt-5">
              <label className="mb-2 block text-sm font-bold text-white/55">
                Descripción
              </label>

              <textarea
                rows={4}
                value={editingProduct.description || ""}
                onChange={(e) => updateField("description", e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-white outline-none"
              />
            </div>

            <div className="mt-7 flex flex-col gap-3 md:flex-row md:justify-end">
              <button
                onClick={() => setEditingProduct(null)}
                className="rounded-2xl border border-white/10 px-6 py-4 font-black text-white/70 transition hover:border-red-400 hover:text-red-400"
              >
                Cancelar
              </button>

              <button
                onClick={saveProduct}
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-yellow-400 px-6 py-4 font-black text-black transition hover:bg-yellow-300 disabled:opacity-60"
              >
                <Save size={18} />
                {saving ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function ProductCard({ product, onEdit, onToggle, onDelete }) {
  const stock = Number(product.stock || 0);

  return (
    <article className="rounded-[1.5rem] border border-white/10 bg-black/30 p-5">
      <div className="grid gap-4 lg:grid-cols-[88px_1fr_auto] lg:items-center">
        <div className="h-22 w-22 overflow-hidden rounded-2xl bg-black">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-22 w-22 object-cover"
            />
          ) : (
            <div className="flex h-22 w-22 items-center justify-center text-xs text-white/30">
              Sin imagen
            </div>
          )}
        </div>

        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-yellow-400 px-3 py-1 text-xs font-black text-black">
              {product.brand || "Marca"}
            </span>

            <span
              className={`rounded-full px-3 py-1 text-xs font-black ${
                product.active
                  ? "bg-green-400/10 text-green-400"
                  : "bg-red-400/10 text-red-400"
              }`}
            >
              {product.active ? "Activo" : "Oculto"}
            </span>

            <span
              className={`rounded-full px-3 py-1 text-xs font-black ${
                stock > 5
                  ? "bg-blue-400/10 text-blue-300"
                  : stock > 0
                  ? "bg-yellow-400/10 text-yellow-400"
                  : "bg-red-400/10 text-red-400"
              }`}
            >
              {stock > 5
                ? `Stock ${stock}`
                : stock > 0
                ? `Crítico ${stock}`
                : "Sin stock"}
            </span>
          </div>

          <h3 className="text-lg sm:text-xl font-black break-words">{product.name}</h3>

          <p className="mt-1 text-sm text-white/45">
            SKU {product.sku} · {product.category} · Aro {product.rim} ·{" "}
            {product.size}
          </p>

          <p className="mt-2 text-xl sm:text-2xl font-black text-yellow-400">
            ${Number(product.price || 0).toLocaleString("es-CL")}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row flex-wrap gap-2 lg:justify-end">
          <button
            onClick={onEdit}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-3 text-xs font-bold text-white/70 transition hover:border-yellow-400 hover:text-yellow-400"
          >
            <Pencil size={15} />
            Editar
          </button>

          <button
            onClick={onToggle}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-3 text-xs font-bold text-white/70 transition hover:border-yellow-400 hover:text-yellow-400"
          >
            {product.active ? <EyeOff size={15} /> : <Eye size={15} />}
            {product.active ? "Ocultar" : "Activar"}
          </button>

          <button
            onClick={onDelete}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-3 text-xs font-bold text-red-400 transition hover:border-red-400"
          >
            <Trash2 size={15} />
            Eliminar
          </button>
        </div>
      </div>
    </article>
  );
}

function MiniStat({ label, value, danger = false, warning = false }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
      <p className="text-sm text-white/40">{label}</p>
      <p
        className={`mt-1 text-3xl font-black ${
          danger
            ? "text-red-400"
            : warning
            ? "text-yellow-400"
            : "text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function Input({ label, value, onChange, type = "text", className = "" }) {
  return (
    <div className={className}>
      <label className="mb-2 block text-sm font-bold text-white/55">
        {label}
      </label>

      <input
        type={type}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-white outline-none"
      />
    </div>
  );
}