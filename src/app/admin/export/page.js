export default function AdminExport() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Exportar Datos</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button className="bg-blue-600 text-white px-6 py-4 rounded-xl font-semibold shadow hover:bg-blue-700 transition">Exportar usuarios (CSV)</button>
        <button className="bg-green-600 text-white px-6 py-4 rounded-xl font-semibold shadow hover:bg-green-700 transition">Exportar proyectos (CSV)</button>
        <button className="bg-orange-600 text-white px-6 py-4 rounded-xl font-semibold shadow hover:bg-orange-700 transition">Exportar firmas (CSV)</button>
      </div>
      <div className="mt-8 text-gray-500">(Próximamente: exportación a PDF y opciones avanzadas)</div>
    </div>
  );
} 