"use client";

import * as React from "react";
import { Download, ArrowLeft, Save, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
// Removed unused Card imports
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
// Removed unused Badge import
import { Separator } from "@/components/ui/separator";
import type { PrescriptionResult, Medicine } from "@/lib/types";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { cn } from "@/lib/utils";
import { Pill } from "lucide-react";

interface PrescriptionEditorProps {
    result: PrescriptionResult;
    onBack?: () => void;
    onSave?: (updated: PrescriptionResult) => void | Promise<void>;
    isVerified?: boolean;
}

export function PrescriptionEditor({ result, onBack, onSave, isVerified = true }: PrescriptionEditorProps) {
    const [data, setData] = React.useState<PrescriptionResult>(result);
    const [isSaving, setIsSaving] = React.useState(false);

    const handlePatientInfoChange = (field: keyof PrescriptionResult, value: string | string[]) => {
        setData((prev) => ({ ...prev, [field]: value }));
    };

    const handleMedicineChange = (id: string, field: keyof Medicine, value: unknown) => {
        setData((prev) => ({
            ...prev,
            medicines: (prev.medicines || []).map((med) =>
                med.id === id ? { ...med, [field]: value } : med
            ),
        }));
    };

    const addMedicine = () => {
        const newMed: Medicine = {
            id: `m${Date.now()}`,
            name: "",
            dosage: "",
            frequency: "",
            duration: "",
            whatIsIt: "",
            whenToTake: "",
            importantWarnings: [],
            confidence: 1.0,
        };
        setData((prev) => ({ ...prev, medicines: [...prev.medicines, newMed] }));
    };

    const removeMedicine = (id: string) => {
        setData((prev) => ({
            ...prev,
            medicines: prev.medicines.filter((med) => med.id !== id),
        }));
    };

    const downloadPDF = () => {
        const doc = new jsPDF();

        // Header
        doc.setFontSize(22);
        doc.setTextColor(40, 40, 40);
        doc.text("Medical Prescription Analysis", 14, 22);

        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

        // Patient & Doctor Info
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text(`Doctor Name: Dr. ${data.doctorName || "N/A"}`, 14, 45);
        doc.text(`Patient Name: ${data.patientName || "N/A"}`, 14, 52);
        doc.text(`Date: ${new Date(data.createdAt).toLocaleDateString()}`, 14, 59);

        // Medicines Table
        const tableData = data.medicines.map((med) => [
            med.name,
            med.whatIsIt || "N/A",
            med.dosage,
            med.whenToTake || med.frequency,
            (med.importantWarnings || []).join(", ") || "None",
            `${Math.round((med.confidence || 0) * 100)}%`
        ]);

        autoTable(doc, {
            startY: 70,
            head: [["Medicine Name", "What it is", "Dosage", "When to Take", "Warnings", "Confidence"]],
            body: tableData,
            theme: "striped",
            headStyles: { fillColor: [59, 130, 246] }, // primary blue
            styles: { fontSize: 9 },
        });

        // Note
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const finalY = (doc as any).lastAutoTable.finalY + 10;
        doc.setFontSize(10);
        doc.setFont("helvetica", "italic");
        doc.text("Note: This is an AI-assisted analysis. Please consult your physician before following these instructions.", 14, finalY);

        doc.save(`Prescription_${data.patientName || "Analysis"}.pdf`);
    };

    const handleSaveClick = async () => {
        if (!onSave) return;
        setIsSaving(true);
        try {
            await onSave(data);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* File Header / Controls */}
            <div className="flex items-center justify-between px-4 pb-2 border-b border-border/50">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Plus className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">Prescription Document</h1>
                        <p className="text-xs text-muted-foreground">Editable AI-Generated Report</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    {onBack && (
                        <Button variant="ghost" onClick={onBack} size="sm" className="gap-2">
                            <ArrowLeft className="h-4 w-4" /> Back
                        </Button>
                    )}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={downloadPDF}
                        disabled={!isVerified}
                        className="gap-2 bg-background shadow-sm hover:shadow-md transition-all"
                        title={!isVerified ? "Please verify the prescription first" : ""}
                    >
                        <Download className="h-4 w-4" />
                        Download PDF
                    </Button>
                    <Button
                        size="sm"
                        onClick={handleSaveClick}
                        disabled={!isVerified || isSaving}
                        className="gap-2 shadow-sm hover:shadow-md transition-all"
                        title={!isVerified ? "Please verify the prescription first" : ""}
                    >
                        <Save className="h-4 w-4" />
                        {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                </div>
            </div>

            {/* Paper Container */}
            <div className="bg-white dark:bg-zinc-950 border border-border shadow-2xl rounded-sm min-h-[1000px] p-12 relative overflow-hidden ring-1 ring-border/50">
                {/* Professional Header */}
                <div className="flex justify-between items-start mb-12">
                    <div className="space-y-1">
                        <div className="text-2xl font-black tracking-tighter text-primary italic uppercase underline decoration-4 underline-offset-4">Runtime Rebels Medical</div>
                        <div className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Advanced Diagnostic Analysis</div>
                    </div>
                    <div className="text-right text-sm">
                        <div className="font-bold text-muted-foreground uppercase tracking-tighter">Report ID</div>
                        <div className="font-mono text-xs">{data.id?.substring(0, 12).toUpperCase()}</div>
                    </div>
                </div>

                {/* Basic Info (Grid) */}
                <div className="grid grid-cols-2 gap-y-6 gap-x-12 mb-12 border-y border-border/30 py-8">
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Consulting Doctor</label>
                            <div className="flex items-center gap-2 group">
                                <span className="text-sm font-semibold text-muted-foreground">Dr.</span>
                                <Input
                                    value={data.doctorName || ""}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePatientInfoChange("doctorName", e.target.value)}
                                    className="h-8 border-transparent hover:border-border/30 focus:border-primary/50 bg-transparent p-0 text-base font-bold transition-all"
                                    placeholder="Full Name"
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Primary Diagnosis</label>
                            <Input
                                value={data.diagnosis || ""}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePatientInfoChange("diagnosis", e.target.value)}
                                className="h-8 border-transparent hover:border-border/30 focus:border-primary/50 bg-transparent p-0 text-base font-medium text-muted-foreground transition-all"
                                placeholder="Condition not specified"
                            />
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="space-y-1 text-right">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Patient Name</label>
                            <Input
                                value={data.patientName || ""}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePatientInfoChange("patientName", e.target.value)}
                                className="h-8 border-transparent hover:border-border/30 focus:border-primary/50 bg-transparent p-0 text-base font-bold text-right transition-all"
                                placeholder="Patient Full Name"
                            />
                        </div>
                        <div className="space-y-1 text-right">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Issue Date</label>
                            <div className="text-sm font-medium">{new Date(data.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</div>
                        </div>
                    </div>
                </div>

                {/* Medicines Section */}
                <div className="space-y-4 mb-12">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-primary">Medication Schedule</h2>
                        <Button variant="ghost" size="xs" onClick={addMedicine} className="font-bold uppercase tracking-widest hover:bg-primary/5">
                            <Plus className="h-3 w-3 mr-1" /> Add Entry
                        </Button>
                    </div>

                    <div className="border border-border/40 rounded-sm overflow-hidden whitespace-nowrap">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-muted/30 border-b border-border/40">
                                <tr className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                    <th className="px-4 py-3">Medicine Name</th>
                                    <th className="px-4 py-3">Indication</th>
                                    <th className="px-4 py-3">Quantity</th>
                                    <th className="px-4 py-3">Frequency</th>
                                    <th className="px-4 py-3">Contraindications</th>
                                    <th className="px-4 py-3 text-center">Rel.</th>
                                    <th className="px-2 w-10"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/20">
                                {(data.medicines || []).map((med) => (
                                    <tr key={med.id} className="group hover:bg-primary/[0.02] transition-colors">
                                        <td className="px-4 py-3">
                                            <Input
                                                value={med.name}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleMedicineChange(med.id, "name", e.target.value)}
                                                className="h-7 border-none bg-transparent p-0 font-bold focus:ring-0 min-w-[140px]"
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            <Input
                                                value={med.whatIsIt || ""}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleMedicineChange(med.id, "whatIsIt", e.target.value)}
                                                className="h-7 border-none bg-transparent p-0 text-muted-foreground focus:ring-0 min-w-[150px]"
                                                placeholder="Treatment for..."
                                            />
                                        </td>
                                        <td className="px-4 py-3 w-32">
                                            <Input
                                                value={med.dosage}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleMedicineChange(med.id, "dosage", e.target.value)}
                                                className="h-7 border-none bg-transparent p-0 focus:ring-0 min-w-[80px]"
                                            />
                                        </td>
                                        <td className="px-4 py-3 w-40">
                                            <Input
                                                value={med.whenToTake || med.frequency}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleMedicineChange(med.id, "whenToTake", e.target.value)}
                                                className="h-7 border-none bg-transparent p-0 focus:ring-0 min-w-[120px]"
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            <Input
                                                value={(med.importantWarnings || []).join(", ")}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleMedicineChange(med.id, "importantWarnings", e.target.value.split(", "))}
                                                className="h-7 border-none bg-transparent p-0 text-red-500 font-medium focus:ring-0 min-w-[160px]"
                                                placeholder="E.g. No alcohol"
                                            />
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={cn(
                                                "text-[10px] font-bold px-1.5 py-0.5 rounded-full ring-1",
                                                (med.confidence || 0) > 0.8 ? "bg-green-500/10 text-green-500 ring-green-500/20" : "bg-orange-500/10 text-orange-500 ring-orange-500/20"
                                            )}>
                                                {Math.round((med.confidence || 0) * 100)}%
                                            </span>
                                        </td>
                                        <td className="px-2 py-3">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeMedicine(med.id)}
                                                className="h-6 w-6 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500 transition-all"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {data.medicines.length === 0 && (
                        <div className="py-20 text-center border-2 border-dashed border-border/30 rounded-sm">
                            <Pill className="h-8 w-8 mx-auto mb-2 text-muted-foreground/30" />
                            <p className="text-sm text-muted-foreground/50 font-medium">No medications listed.</p>
                            <Button variant="outline" size="sm" onClick={addMedicine} className="mt-4 gap-2">
                                <Plus className="h-4 w-4" /> Add your first medication
                            </Button>
                        </div>
                    )}
                </div>

                {/* Closing Notes */}
                <div className="space-y-3">
                    <h2 className="text-xs font-black uppercase tracking-[0.2em] text-primary">Doctor Instructions</h2>
                    <Textarea
                        value={(data.generalInstructions || []).join("\n")}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handlePatientInfoChange("generalInstructions", e.target.value.split("\n"))}
                        placeholder="No additional general instructions provided..."
                        className="min-h-[140px] border-none bg-primary/[0.02] hover:bg-primary/[0.04] focus:bg-transparent transition-all leading-relaxed p-4"
                    />
                </div>

                {/* Footer Disclaimer */}
                <div className="absolute bottom-12 left-12 right-12">
                    <Separator className="mb-4 opacity-50" />
                    <div className="flex justify-between items-end grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
                        <div className="max-w-[60%] space-y-1">
                            <div className="text-[10px] font-black uppercase tracking-widest italic decoration-primary underline decoration-2">Verified by AI. Consult Physician.</div>
                            <p className="text-[9px] leading-tight leading-relaxed">This digital record is generated via automated analysis. While highly accurate, Runtime Rebels does not assume liability for diagnostic errors. This document requires a physical practitioner signature to be legally valid for medication procurement.</p>
                        </div>
                        <div className="text-right">
                            <div className="h-10 w-24 border-b border-zinc-400 mb-1 ml-auto"></div>
                            <div className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">Digital Signature Ref: AI-RRX-2026</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
