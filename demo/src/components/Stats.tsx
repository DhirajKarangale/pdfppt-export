import { useEffect, useState } from "react";
import { Download, Package, GitBranch, Shield } from "lucide-react";

type Stats = {
  downloads: number;
  version: string;
  license: string;
};

export default function Stats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [downloadsRes, pkgRes] = await Promise.all([
          fetch(
            "https://api.npmjs.org/downloads/point/2000-01-01:2030-01-01/pdf-ppt-export-react"
          ),
          fetch("https://registry.npmjs.org/pdf-ppt-export-react/latest"),
        ]);

        const downloadsData = await downloadsRes.json();
        const pkgData = await pkgRes.json();

        setStats({
          downloads: downloadsData.downloads,
          version: pkgData.version,
          license: pkgData.license,
        });
      } catch (e) {
        console.error("Failed to load stats", e);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 py-20">
      <div className="container mx-auto px-6 max-w-4xl">
        <h1 className="text-4xl font-bold text-slate-900 mb-4 text-center">
          Package Statistics
        </h1>
        <p className="text-slate-600 text-center mb-12">
          Live stats from npm registry
        </p>

        {loading || !stats ? (
          <p className="text-center text-slate-500">Loading stats…</p>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            <StatCard
              icon={Download}
              label="Downloads (Last Month)"
              value={stats.downloads.toLocaleString()}
            />
            <StatCard
              icon={GitBranch}
              label="Latest Version"
              value={stats.version}
            />
            <StatCard
              icon={Shield}
              label="License"
              value={stats.license}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) {
  return (
    <div className="p-6 bg-white rounded-lg border border-slate-200 text-center shadow-sm">
      <Icon className="w-8 h-8 text-blue-600 mx-auto mb-3" />
      <p className="text-sm text-slate-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}
