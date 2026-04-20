"use client";

import { useState, useTransition } from "react";
import { updateSetting } from "@/lib/actions/settings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Save } from "lucide-react";
import { toast } from "sonner";

interface SettingItemProps {
  label: string;
  settingKey: string;
  initialValues: string[];
}

function SettingManager({ label, settingKey, initialValues }: SettingItemProps) {
  const [values, setValues] = useState<string[]>(initialValues);
  const [inputValue, setInputValue] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleAdd = () => {
    if (!inputValue.trim()) return;
    if (values.includes(inputValue.trim())) {
      toast.error("Item already exists");
      return;
    }
    setValues([...values, inputValue.trim()]);
    setInputValue("");
  };

  const handleRemove = (val: string) => {
    setValues(values.filter(v => v !== val));
  };

  const handleSave = () => {
    startTransition(async () => {
      try {
        await updateSetting(settingKey, values);
        toast.success(`${label} updated successfully`);
      } catch (error) {
        toast.error(`Failed to update ${label}`);
      }
    });
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3 border-b flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-lg font-bold">{label}</CardTitle>
        <Button 
          size="sm" 
          onClick={handleSave} 
          disabled={isPending}
        >
          <Save className="w-4 h-4 mr-2" />
          {isPending ? "Saving..." : "Save Changes"}
        </Button>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        <div className="flex gap-2">
          <Input 
            placeholder={`Add new ${label.toLowerCase()}...`} 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
          <Button type="button" size="icon" onClick={handleAdd} variant="secondary">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="flex flex-wrap gap-2 max-h-[200px] overflow-y-auto p-1">
          {values.length === 0 && <p className="text-sm text-gray-400 italic">No items added yet.</p>}
          {values.map(val => (
            <Badge key={val} variant="secondary" className="pl-3 py-1.5 flex items-center gap-1 group">
              {val}
              <button 
                onClick={() => handleRemove(val)}
                className="p-0.5 hover:bg-gray-200 rounded-full transition-colors ml-1"
              >
                <X className="w-3 h-3 text-gray-500" />
              </button>
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function SettingsView({ initialSettings }: { initialSettings: any[] }) {
  const getValues = (key: string) => {
    return initialSettings.find(s => s.key === key)?.values || [];
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">System Settings</h2>
      <p className="text-muted-foreground">Manage global dropdown lists for the entire application.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <SettingManager label="Product Types" settingKey="productTypes" initialValues={getValues("productTypes")} />
        <SettingManager label="Organizations" settingKey="organizations" initialValues={getValues("organizations")} />
        <SettingManager label="Regions" settingKey="regions" initialValues={getValues("regions")} />
        <SettingManager label="Branches" settingKey="branches" initialValues={getValues("branches")} />
        <SettingManager label="States" settingKey="states" initialValues={getValues("states")} />
      </div>
    </div>
  );
}
