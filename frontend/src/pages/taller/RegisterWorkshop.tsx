import { useState } from 'react';
import { ShieldCheck, Clock3, XCircle } from 'lucide-react';
import { useWallet } from '@/lib/wallet';
import { store, useStore } from '@/lib/store';
import { shortAddr } from '@/lib/stellar';
import { TxLink } from '@/components/TxStatus';

// Aporte de Alexis — HU1JT: Registro de taller.
// Formulario de solicitud de incorporación, asociada a la cuenta Stellar
// conectada. Los datos quedan off-chain; el administrador la aprueba o rechaza
// en el contrato (HU1JA). Si ya hay solicitud, se muestra su estado.
export default function RegisterWorkshop() {
  const { address: wallet, workshopEnabled } = useWallet();
  const { applications } = useStore();
  const existing = applications.find((a) => a.wallet === wallet);
  const [name, setName] = useState('');
  const [nit, setNit] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!wallet) return;
    store.addApplication({
      id: `w${Date.now()}`,
      wallet,
      name,
      nit,
      address,
      city,
      email,
      phone,
      status: 'pending',
      requestedDate: new Date().toISOString().slice(0, 10),
    });
    setSubmitted(true);
  }

  if ((submitted || existing) && !(existing?.status === 'rejected' && !submitted)) {
    const enabled = workshopEnabled || existing?.status === 'approved';
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="card max-w-md p-8 text-center animate-scale-in">
          <div className={`mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full ${enabled ? 'bg-emerald-100' : 'bg-amber-100'}`}>
            {enabled ? <ShieldCheck className="h-8 w-8 text-emerald-600" /> : <Clock3 className="h-8 w-8 text-amber-600" />}
          </div>
          <h2 className="text-xl font-bold text-slate-900">{existing?.name ?? name}</h2>
          <p className="mt-2 text-sm text-slate-500">
            {enabled
              ? 'Tu taller está habilitado en el contrato VehicleChain. Ya puedes publicar servicios.'
              : 'Tu solicitud quedó pendiente de validación por un administrador.'}
          </p>
          <span className={`badge mt-4 ${enabled ? 'badge-success' : 'badge-warning'}`}>
            {enabled ? '✓ Habilitado' : '⏳ Pendiente de validación'}
          </span>
          <div className="mt-4 space-y-1 rounded-lg bg-slate-50 p-3 text-left text-xs text-slate-500">
            <p>Cuenta del taller <span className="float-right font-mono text-slate-700">{wallet ? shortAddr(wallet) : ''}</span></p>
            {existing?.nit && <p>NIT <span className="float-right font-mono text-slate-700">{existing.nit}</span></p>}
            {existing?.txHash && <p>Habilitación <span className="float-right"><TxLink hash={existing.txHash} /></span></p>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="page-title">Registrar taller</h1>
        <p className="mt-1 text-sm text-slate-500">HU1JT · Solicita la incorporación de tu taller a VehicleChain</p>
      </div>

      {existing?.status === 'rejected' && (
        <p className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          <XCircle className="h-4 w-4" /> Tu solicitud anterior fue rechazada. Puedes corregir los datos y enviarla de nuevo.
        </p>
      )}

      <form onSubmit={handleSubmit} className="card space-y-6 p-6">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50">
            <ShieldCheck className="h-5 w-5 text-teal-600" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-900">Información del taller</h2>
            <p className="text-xs text-slate-500">
              Se asocia a tu cuenta <span className="font-mono">{wallet ? shortAddr(wallet) : ''}</span>. Un administrador la revisará.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Nombre</label>
            <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Taller MotorPlus" className="input-field" />
          </div>
          <div>
            <label className="label">NIT</label>
            <input required value={nit} onChange={(e) => setNit(e.target.value)} placeholder="900123456" className="input-field font-mono" />
          </div>
          <div>
            <label className="label">Dirección</label>
            <input required value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Calle 45 #12-30" className="input-field" />
          </div>
          <div>
            <label className="label">Ciudad</label>
            <input required value={city} onChange={(e) => setCity(e.target.value)} placeholder="Bogotá" className="input-field" />
          </div>
          <div>
            <label className="label">Correo</label>
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="contacto@taller.com" className="input-field" />
          </div>
          <div>
            <label className="label">Teléfono</label>
            <input required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+57 300 000 0000" className="input-field" />
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" className="btn-primary">
            <ShieldCheck className="h-4 w-4" />
            Solicitar incorporación
          </button>
        </div>
      </form>
    </div>
  );
}
