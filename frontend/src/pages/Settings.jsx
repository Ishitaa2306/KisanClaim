import React from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { User, Bell, Shield, Key, Database, Mail } from 'lucide-react';

export default function Settings() {
  const SettingSection = ({ title, icon: Icon, children }) => (
    <Card className="mb-6 p-0 overflow-hidden">
      <div className="bg-slate-50 p-4 border-b border-slate-100 flex items-center gap-3">
        <Icon className="w-5 h-5 text-slate-500" />
        <h3 className="font-bold text-slate-800 tracking-tight">{title}</h3>
      </div>
      <div className="p-6">
        {children}
      </div>
    </Card>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-2">Platform Preferences</h1>
        <p className="text-slate-500 text-sm">Manage your administrative profile, integration layers, and notification preferences.</p>
      </div>

      <div className="mt-8">
        <SettingSection title="Administrative Profile" icon={User}>
          <div className="flex gap-6 items-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center border-2 border-primary/20">
              <span className="text-2xl font-black text-primary">AK</span>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">SYSTEM CONTROLLER</p>
              <h2 className="text-xl font-bold text-slate-800">Amit Kumar</h2>
              <p className="text-sm text-slate-500">Regional Director, North Zone</p>
            </div>
            <button className="ml-auto bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-bold text-sm transition-colors">Edit Profile</button>
          </div>
        </SettingSection>

        <SettingSection title="Detection Thresholds" icon={Shield}>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-bold text-slate-700">Fraud Anomaly Sensitivity</span>
                <span className="text-sm font-bold text-primary">High (Default)</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-primary h-full w-[75%]"></div>
              </div>
              <p className="text-xs text-slate-500 mt-2">Adjusts the strictness of the multi-spectral verification engine before raising flags.</p>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-bold text-slate-700">Auto-Disbursement Limit</span>
                <span className="text-sm font-bold text-slate-800">₹5,00,000</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-slate-800 h-full w-[40%]"></div>
              </div>
            </div>
          </div>
        </SettingSection>

        <SettingSection title="Notification Integrations" icon={Bell}>
          <div className="space-y-4">
             <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-800">Critical Audits</h4>
                  <p className="text-xs text-slate-500 max-w-sm">Receive instant SMS alerts when a farm fraud score exceeds 85.</p>
                </div>
                <div className="w-12 h-6 bg-primary rounded-full relative cursor-pointer">
                  <div className="absolute right-1 top-1 bg-white w-4 h-4 rounded-full"></div>
                </div>
             </div>
             <div className="h-px bg-slate-100 w-full my-4"></div>
             <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-800">Daily Disbursement Summary</h4>
                  <p className="text-xs text-slate-500 max-w-sm">EOD report detailing all funds processed successfully.</p>
                </div>
                <div className="w-12 h-6 bg-primary rounded-full relative cursor-pointer">
                  <div className="absolute right-1 top-1 bg-white w-4 h-4 rounded-full"></div>
                </div>
             </div>
          </div>
        </SettingSection>

        <SettingSection title="API Keys & Database" icon={Database}>
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 font-mono text-sm flex justify-between items-center text-slate-600 mb-4 cursor-pointer hover:bg-slate-100">
             <span>ksn_prd_9f8d7c6b5a4...</span>
             <Badge className="bg-green-100 text-green-700 text-[10px] tracking-widest uppercase">Active</Badge>
          </div>
          <button className="text-[#005c8a] font-bold text-sm flex items-center gap-2 hover:underline">
            <Key className="w-4 h-4" /> Generate New Signature Token
          </button>
        </SettingSection>

      </div>
    </div>
  );
}
