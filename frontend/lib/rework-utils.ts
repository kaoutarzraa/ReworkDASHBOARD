// lib/rework-utils.ts
import type { ReworkData } from "@/lib/data-utils"

export function enhanceReworkData(originalData: any[]): ReworkData[] {
  return originalData.map(item => ({
    ...item,
    Status: item.Success === 1 ? 'Repaired' : 'Failed',
    Exit_Time: new Date().toISOString(),
    Failure_Reason: item.Success === 0 ? getFailureReason(item.Defect_type) : undefined
  }))
}

function getFailureReason(defectType: string): string {
  const reasons: Record<string, string> = {
    'File': 'Dégâts irréparables',
    'Terminal': 'Pièce non reparable',
    'Connecteur': 'Défectuosité majeure',
    'Sécurité/Couvercle/Tapa': 'Non conforme aux standards',
    'Seal/Bride/Composant': 'Défaillance matérielle'
  }
  return reasons[defectType] || 'Raison non spécifiée'
}