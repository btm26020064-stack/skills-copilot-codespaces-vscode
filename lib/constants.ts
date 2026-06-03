export const documentTypes = [
  { value: 'ARRIVAL_NOTICE', label: 'Arrival Notice' },
  { value: 'CREW_LIST', label: 'Crew List' },
  { value: 'SAILING_PERMIT', label: 'Sailing Permit' },
  { value: 'MANIFEST', label: 'Manifest' },
  { value: 'K11', label: 'K11 (Permit Below Than 75 Ton)' },
  { value: 'OTHER', label: 'Other' }
] as const;

export const slotTypes = [
  { value: 'NEW_SHIP', label: 'New Ship' },
  { value: 'PC', label: 'PC' }
] as const;

export const reviewStatusStyles: Record<string, string> = {
  PENDING: 'bg-amber-50 text-amber-700 ring-amber-200',
  VERIFIED: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  REJECTED: 'bg-rose-50 text-rose-700 ring-rose-200',
  APPROVED: 'bg-emerald-50 text-emerald-700 ring-emerald-200'
};