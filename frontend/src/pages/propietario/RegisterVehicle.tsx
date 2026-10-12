import { useState } from 'react';
import { Car, CheckCircle2, Loader2, Fuel, Gauge, Hash, Calendar, Palette } from 'lucide-react';

export default function RegisterVehicle() {
  const [plate, setPlate] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [color, setColor] = useState('');
  const [vin, setVin] = useState('');
  const [mileage, setMileage] = useState('');
  const [fuelType, setFuelType] = useState('gasoline');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const brands = ['Toyota', 'Honda', 'Ford', 'Chevrolet', 'Mazda', 'Tesla', 'Nissan', 'Volkswagen', 'BMW', 'Mercedes-Benz', 'Renault', 'Kia', 'Hyundai'];
  const fuelTypes = [
    { value: 'gasoline', label: 'Gasolina' },
    { value: 'diesel', label: 'Diésel' },
    { value: 'electric', label: 'Eléctrico' },
    { value: 'hybrid', label: 'Híbrido' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1500);
  };

  if (submitted) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="card max-w-md p-8 text-center animate-scale-in">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Vehículo registrado</h2>
          <p className="mt-2 text-sm text-slate-500">
            El vehículo <span className="font-mono font-semibold text-slate-700">{plate.toUpperCase()}</span> se registró
            en la blockchain. El registro es inmutable y verificable.
          </p>
          <div className="mt-4 rounded-lg bg-slate-50 p-3 text-left">
            <p className="text-xs text-slate-500">Hash del bloque</p>
            <p className="font-mono text-sm text-slate-700">0x3a7b...9f2c</p>
          </div>
          <button
            onClick={() => {
              setSubmitted(false);
              setPlate(''); setBrand(''); setModel(''); setYear(''); setColor(''); setVin(''); setMileage('');
            }}
            className="btn-primary mt-6 w-full"
          >
            Registrar otro vehículo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="page-title">Registrar Vehículo</h1>
        <p className="mt-1 text-sm text-slate-500">
          Completa los datos del vehículo. Se creará un registro inmutable en la blockchain.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-6 p-6">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50">
            <Car className="h-5 w-5 text-teal-600" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-900">Información del Vehículo</h2>
            <p className="text-xs text-slate-500">Todos los campos son obligatorios</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Placa</label>
            <input
              required
              value={plate}
              onChange={(e) => setPlate(e.target.value.toUpperCase())}
              placeholder="ABC123"
              className="input-field font-mono uppercase"
              maxLength={6}
            />
          </div>

          <div>
            <label className="label">VIN</label>
            <input
              required
              value={vin}
              onChange={(e) => setVin(e.target.value.toUpperCase())}
              placeholder="JTDKARFP6N3024567"
              className="input-field font-mono"
              maxLength={17}
            />
          </div>

          <div>
            <label className="label">Marca</label>
            <select required value={brand} onChange={(e) => setBrand(e.target.value)} className="select-field">
              <option value="">Seleccionar...</option>
              {brands.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Modelo</label>
            <input
              required
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="Corolla"
              className="input-field"
            />
          </div>

          <div>
            <label className="label">Año</label>
            <input
              required
              type="number"
              min={1990}
              max={2026}
              value={year}
              onChange={(e) => setYear(e.target.value)}
              placeholder="2022"
              className="input-field"
            />
          </div>

          <div>
            <label className="label">Color</label>
            <input
              required
              value={color}
              onChange={(e) => setColor(e.target.value)}
              placeholder="Plata"
              className="input-field"
            />
          </div>

          <div>
            <label className="label">Kilometraje</label>
            <input
              required
              type="number"
              min={0}
              value={mileage}
              onChange={(e) => setMileage(e.target.value)}
              placeholder="0"
              className="input-field"
            />
          </div>

          <div>
            <label className="label">Combustible</label>
            <select value={fuelType} onChange={(e) => setFuelType(e.target.value)} className="select-field">
              {fuelTypes.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Info note */}
        <div className="flex items-start gap-3 rounded-lg bg-teal-50 p-4">
          <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-teal-100">
            <svg className="h-4 w-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
            </svg>
          </div>
          <p className="text-xs leading-relaxed text-teal-700">
            Al registrar el vehículo, los datos se almacenan permanentemente en la blockchain.
            No podrán modificarse posteriormente. Verifica que toda la información sea correcta.
          </p>
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" className="btn-secondary">Cancelar</button>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Registrando...
              </>
            ) : (
              <>
                <Car className="h-4 w-4" />
                Registrar Vehículo
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
