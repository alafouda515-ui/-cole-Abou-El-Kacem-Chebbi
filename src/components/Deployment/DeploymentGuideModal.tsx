import React, { useState } from 'react';
import { X, Server, Globe, Shield, Terminal, CheckCircle2, Copy, Check } from 'lucide-react';

interface Props {
  onClose: () => void;
}

export const DeploymentGuideModal: React.FC<Props> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'options' | 'checklist' | 'commands'>('options');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/20 text-blue-400 rounded-lg border border-blue-500/30">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-lg">Déploiement & Mise en Ligne (Partie IV du Cahier des Charges)</h2>
              <p className="text-xs text-slate-400">Options de production, tunnels d'accès public et checklist d'exploitation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-200 bg-slate-50 px-6 flex gap-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('options')}
            className={`py-3 border-b-2 transition ${
              activeTab === 'options'
                ? 'border-blue-600 text-blue-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            4 Options de Déploiement
          </button>
          <button
            onClick={() => setActiveTab('checklist')}
            className={`py-3 border-b-2 transition ${
              activeTab === 'checklist'
                ? 'border-blue-600 text-blue-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Checklist Avant Mise en Ligne (Table 16.1)
          </button>
          <button
            onClick={() => setActiveTab('commands')}
            className={`py-3 border-b-2 transition ${
              activeTab === 'commands'
                ? 'border-blue-600 text-blue-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Commandes & Tunnels
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-700">
          {activeTab === 'options' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Option A */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 hover:border-slate-300 transition">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-slate-900 text-base">Option A · Cloudflare Tunnel</h3>
                  <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-medium">Démonstration</span>
                </div>
                <p className="text-xs text-slate-600 mb-3">
                  Expose l'application locale sur Internet via une URL HTTPS temporaire (*.trycloudflare.com), sans compte ni configuration DNS.
                </p>
                <div className="bg-slate-900 text-slate-100 p-2.5 rounded font-mono text-xs mb-2">
                  cloudflared tunnel --url http://localhost:3000
                </div>
                <p className="text-[11px] text-slate-500 italic">Idéal pour présenter rapidement le projet au jury ou aux collègues.</p>
              </div>

              {/* Option B */}
              <div className="border-2 border-blue-500/40 rounded-xl p-4 bg-blue-50/30 hover:border-blue-500 transition relative">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-blue-950 text-base">Option B · Railway / Render</h3>
                  <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded font-semibold">Recommandée</span>
                </div>
                <p className="text-xs text-slate-600 mb-3">
                  Production simple et managée. Fournit une URL stable en HTTPS, base de données PostgreSQL incluse, déploiement automatique depuis GitHub.
                </p>
                <div className="text-xs space-y-1 text-slate-700 bg-white p-2 rounded border border-blue-100">
                  <p>• URL : <code>https://votre-app.up.railway.app</code></p>
                  <p>• Coût : Gratuit à ~5$/mois</p>
                  <p>• Zéro gestion de serveur Linux</p>
                </div>
              </div>

              {/* Option C */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 hover:border-slate-300 transition">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-slate-900 text-base">Option C · Nom de Domaine Pro</h3>
                  <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-medium">Professionnelle</span>
                </div>
                <p className="text-xs text-slate-600 mb-3">
                  L'école dispose d'une URL institutionnelle dédiée (ex: <code>https://ecole-aboukacem-chebbi.com</code>) avec certificat SSL Let's Encrypt automatique.
                </p>
                <div className="text-xs text-slate-700 bg-white p-2 rounded border border-slate-200">
                  Achat domaine OVH / Namecheap (~10-15 €/an) + pointage CNAME / A vers l'hébergeur.
                </div>
              </div>

              {/* Option D */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 hover:border-slate-300 transition">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-slate-900 text-base">Option D · Serveur VPS</h3>
                  <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-medium">Contrôle Total</span>
                </div>
                <p className="text-xs text-slate-600 mb-3">
                  Serveur dédié / virtuel Linux Ubuntu (OVH, DigitalOcean, AWS EC2) avec conteneur Docker, Nginx en reverse proxy et Certbot SSL.
                </p>
                <div className="text-xs text-slate-700 bg-white p-2 rounded border border-slate-200">
                  Contrôle total sur les données et sauvegardes. Requiert compétences d'administration système.
                </div>
              </div>
            </div>
          )}

          {activeTab === 'checklist' && (
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900">Checklist obligatoire avant mise en ligne (Table 16.1)</h4>
              <div className="overflow-hidden border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 font-semibold text-slate-700 border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Élément</th>
                      <th className="py-2.5 px-3">Statut dans l'application</th>
                      <th className="py-2.5 px-3">Justification du cahier des charges</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">HTTPS / SSL</td>
                      <td className="py-2.5 px-3 text-emerald-700 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Garanti par l'hébergement
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">Obligatoire (données d'enfants, RGPD)</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">Colonne annee_scolaire</td>
                      <td className="py-2.5 px-3 text-emerald-700 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Intégrée sur toutes les entités
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">Conserver l'historique lors du passage à l'année suivante</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">Base de données managée</td>
                      <td className="py-2.5 px-3 text-emerald-700 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> PostgreSQL ou Stockage Local synchronisé
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">Pérennité et scalabilité (Railway, Supabase, Neon)</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">Sauvegardes Quotidiennes</td>
                      <td className="py-2.5 px-3 text-emerald-700 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Export JSON / CSV disponible
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">Backup automatique, rétention 30 jours minimum</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">Variables d'environnement</td>
                      <td className="py-2.5 px-3 text-emerald-700 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Conforme .env.example
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">Ne jamais mettre les secrets dans le code</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'commands' && (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-xs text-slate-900">Lancement Cloudflare Quick Tunnel (Option A) :</span>
                  <button
                    onClick={() => copyToClipboard('cloudflared tunnel --url http://localhost:3000', 1)}
                    className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    {copiedIndex === 1 ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedIndex === 1 ? 'Copié !' : 'Copier'}
                  </button>
                </div>
                <pre className="bg-slate-900 text-slate-100 p-3 rounded-lg text-xs font-mono">
                  cloudflared tunnel --url http://localhost:3000
                </pre>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-xs text-slate-900">Build de production Vite & React :</span>
                  <button
                    onClick={() => copyToClipboard('npm run build', 2)}
                    className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    {copiedIndex === 2 ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedIndex === 2 ? 'Copié !' : 'Copier'}
                  </button>
                </div>
                <pre className="bg-slate-900 text-slate-100 p-3 rounded-lg text-xs font-mono">
                  npm run build
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex justify-between items-center text-xs text-slate-500">
          <span>Application École Abou El Kacem Chebbi · Architecture Mono-école</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg transition"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
