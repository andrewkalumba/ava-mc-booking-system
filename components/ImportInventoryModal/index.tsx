'use client'

import { useState, useRef, useCallback } from 'react'
import * as XLSX from 'xlsx'
import { useInventory } from '@/context/InventoryContext'
import { getDealershipId, getDealershipTag } from '@/lib/tenant'
import type { Motorcycle, SparePart, Accessory } from '@/utils/types'

// ─── Types ────────────────────────────────────────────────────────────────────

type ParsedSheet = {
    motorcycles: Partial<Motorcycle>[]
    spareParts:  Partial<SparePart>[]
    accessories: Partial<Accessory>[]
}

type ImportSummary = {
    motorcycles: number
    spareParts:  number
    accessories: number
    errors:      string[]
}

// ─── Column maps (header → field) ─────────────────────────────────────────────

const MC_COLS: Record<string, keyof Motorcycle> = {
    'name':            'name',
    'brand':           'brand',
    'article number':  'articleNumber',
    'article no':      'articleNumber',
    'vin':             'vin',
    'year':            'year',
    'engine cc':       'engineCC',
    'cc':              'engineCC',
    'color':           'color',
    'colour':          'color',
    'mc type':         'mcType',
    'type':            'mcType',
    'warehouse':       'warehouse',
    'stock':           'stock',
    'reorder qty':     'reorderQty',
    'reorder':         'reorderQty',
    'cost':            'cost',
    'selling price':   'sellingPrice',
    'sell price':      'sellingPrice',
    'price':           'sellingPrice',
    'vendor':          'vendor',
    'supplier':        'vendor',
    'description':     'description',
}

const SP_COLS: Record<string, keyof SparePart> = {
    'name':            'name',
    'brand':           'brand',
    'article number':  'articleNumber',
    'article no':      'articleNumber',
    'category':        'category',
    'stock':           'stock',
    'reorder qty':     'reorderQty',
    'reorder':         'reorderQty',
    'cost':            'cost',
    'selling price':   'sellingPrice',
    'sell price':      'sellingPrice',
    'price':           'sellingPrice',
    'vendor':          'vendor',
    'supplier':        'vendor',
    'description':     'description',
}

const ACC_COLS: Record<string, keyof Accessory> = {
    'name':            'name',
    'brand':           'brand',
    'article number':  'articleNumber',
    'article no':      'articleNumber',
    'category':        'category',
    'size':            'size',
    'stock':           'stock',
    'reorder qty':     'reorderQty',
    'reorder':         'reorderQty',
    'cost':            'cost',
    'selling price':   'sellingPrice',
    'sell price':      'sellingPrice',
    'price':           'sellingPrice',
    'vendor':          'vendor',
    'supplier':        'vendor',
    'description':     'description',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Generates a company-scoped ID: e.g. MC-AVA-001, SP-AVA-001
 *  The 3-char tag (from dealership name) ensures no collision across companies.
 */
function generateId(prefix: string, index: number, existingCount: number) {
    const tag = getDealershipTag()
    const n = existingCount + index + 1
    return `${prefix}-${tag}-${String(n).padStart(3, '0')}`
}

function parseRows<T>(
    sheet: XLSX.WorkSheet,
    colMap: Record<string, keyof T>,
): Partial<T>[] {
    const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
        defval: '',
        raw:    false,
    })
    return json.map((row) => {
        const out: Partial<T> = {}
        for (const [header, value] of Object.entries(row)) {
            const key = colMap[header.toLowerCase().trim()]
            if (key) (out as Record<string, unknown>)[key as string] = value
        }
        return out
    })
}

function num(v: unknown) { return Number(v) || 0 }
function str(v: unknown) { return String(v ?? '').trim() }

// ─── Download template ────────────────────────────────────────────────────────

function downloadTemplate() {
    const wb = XLSX.utils.book_new()

    const mcHeaders = [['Name','Brand','Article Number','VIN','Year','Engine CC','Color','MC Type','Warehouse','Stock','Reorder Qty','Cost','Selling Price','Vendor','Description']]
    const spHeaders = [['Name','Brand','Article Number','Category','Stock','Reorder Qty','Cost','Selling Price','Vendor','Description']]
    const accHeaders = [['Name','Brand','Article Number','Category','Size','Stock','Reorder Qty','Cost','Selling Price','Vendor','Description']]

    // Sample rows
    const mcSample = [['Yamaha MT-07','Yamaha','ART-001','1HGBH41JXMN109186',2024,689,'Midnight Black','New','Warehouse A',3,2,79900,94900,'Yamaha Sverige AB','Mid-weight naked bike']]
    const spSample = [['Brake Pad Set','Brembo','SP-BP-001','Brakes',15,5,450,750,'BikeParts AB','Front brake pads for most naked bikes']]
    const accSample = [['Shoei NXR2 Helmet','Shoei','ACC-H-001','Helmet','M',8,3,3800,5200,'Helmet World AB','Full-face racing helmet']]

    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([...mcHeaders,  ...mcSample]),  'Motorcycles')
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([...spHeaders,  ...spSample]),  'Spare Parts')
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([...accHeaders, ...accSample]), 'Accessories')

    XLSX.writeFile(wb, 'AVA_Inventory_Import_Template.xlsx')
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

export function ImportInventoryModal({ onClose }: { onClose: () => void }) {
    const { motorcycles, spareParts, accessories, addItem } = useInventory()

    const [parsed,    setParsed]    = useState<ParsedSheet | null>(null)
    const [fileName,  setFileName]  = useState('')
    const [importing, setImporting] = useState(false)
    const [done,      setDone]      = useState<ImportSummary | null>(null)
    const [dragOver,  setDragOver]  = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    const processFile = useCallback((file: File) => {
        setFileName(file.name)
        const reader = new FileReader()
        reader.onload = (e) => {
            const data = e.target?.result
            const wb   = XLSX.read(data, { type: 'binary' })

            // Find sheets by name (case-insensitive) or use index fallback
            const findSheet = (...names: string[]) => {
                for (const name of names) {
                    const match = wb.SheetNames.find(
                        (s) => s.toLowerCase().replace(/[^a-z]/g, '') === name.toLowerCase().replace(/[^a-z]/g, '')
                    )
                    if (match) return wb.Sheets[match]
                }
                return null
            }

            const mcSheet  = findSheet('motorcycles', 'motorcycle', 'mc', 'bikes')
            const spSheet  = findSheet('spareparts', 'spare_parts', 'sparepart', 'parts')
            const accSheet = findSheet('accessories', 'accessory', 'acc', 'gear')

            setParsed({
                motorcycles: mcSheet  ? parseRows<Motorcycle>(mcSheet,  MC_COLS)  : [],
                spareParts:  spSheet  ? parseRows<SparePart> (spSheet,  SP_COLS)  : [],
                accessories: accSheet ? parseRows<Accessory> (accSheet, ACC_COLS) : [],
            })
        }
        reader.readAsBinaryString(file)
    }, [])

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) processFile(file)
    }

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setDragOver(false)
        const file = e.dataTransfer.files?.[0]
        if (file) processFile(file)
    }

    async function handleImport() {
        if (!parsed) return
        setImporting(true)
        const errors: string[] = []
        let mcCount = 0, spCount = 0, accCount = 0

        // Import Motorcycles
        for (let i = 0; i < parsed.motorcycles.length; i++) {
            const row = parsed.motorcycles[i]
            if (!row.name) continue
            try {
                await addItem('motorcycles', {
                    id:           generateId('MC', i, motorcycles.length),
                    name:         str(row.name),
                    brand:        str(row.brand),
                    articleNumber: str(row.articleNumber),
                    vin:          str(row.vin),
                    year:         num(row.year) || new Date().getFullYear(),
                    engineCC:     num(row.engineCC),
                    color:        str(row.color),
                    mcType:       (['New','Trade-In','Commission'].includes(str(row.mcType)) ? row.mcType : 'New') as 'New' | 'Trade-In' | 'Commission',
                    warehouse:    (['Warehouse A','Warehouse B','Warehouse C','Warehouse D'].includes(str(row.warehouse)) ? row.warehouse : 'Warehouse A') as 'Warehouse A' | 'Warehouse B' | 'Warehouse C' | 'Warehouse D',
                    stock:        num(row.stock),
                    reorderQty:   num(row.reorderQty),
                    cost:         num(row.cost),
                    sellingPrice: num(row.sellingPrice),
                    vendor:       str(row.vendor),
                    description:  str(row.description),
                })
                mcCount++
            } catch (e: unknown) {
                errors.push(`Motorcycle row ${i + 2}: ${e instanceof Error ? e.message : 'failed'}`)
            }
        }

        // Import Spare Parts
        for (let i = 0; i < parsed.spareParts.length; i++) {
            const row = parsed.spareParts[i]
            if (!row.name) continue
            try {
                await addItem('spareParts', {
                    id:           generateId('SP', i, spareParts.length),
                    name:         str(row.name),
                    brand:        str(row.brand),
                    articleNumber: str(row.articleNumber),
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    category:     (str(row.category) || 'Engine') as any,
                    stock:        num(row.stock),
                    reorderQty:   num(row.reorderQty),
                    cost:         num(row.cost),
                    sellingPrice: num(row.sellingPrice),
                    vendor:       str(row.vendor),
                    description:  str(row.description),
                })
                spCount++
            } catch (e: unknown) {
                errors.push(`Spare part row ${i + 2}: ${e instanceof Error ? e.message : 'failed'}`)
            }
        }

        // Import Accessories
        for (let i = 0; i < parsed.accessories.length; i++) {
            const row = parsed.accessories[i]
            if (!row.name) continue
            try {
                await addItem('accessories', {
                    id:           generateId('ACC', i, accessories.length),
                    name:         str(row.name),
                    brand:        str(row.brand),
                    articleNumber: str(row.articleNumber),
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    category:     (str(row.category) || 'Helmet') as any,
                    size:         str(row.size) || undefined,
                    stock:        num(row.stock),
                    reorderQty:   num(row.reorderQty),
                    cost:         num(row.cost),
                    sellingPrice: num(row.sellingPrice),
                    vendor:       str(row.vendor),
                    description:  str(row.description),
                })
                accCount++
            } catch (e: unknown) {
                errors.push(`Accessory row ${i + 2}: ${e instanceof Error ? e.message : 'failed'}`)
            }
        }

        setImporting(false)
        setDone({ motorcycles: mcCount, spareParts: spCount, accessories: accCount, errors })
    }

    const totalRows = parsed
        ? parsed.motorcycles.filter((r) => r.name).length +
          parsed.spareParts.filter((r) => r.name).length +
          parsed.accessories.filter((r) => r.name).length
        : 0

    // ── Success screen ───────────────────────────────────────────────────────
    if (done) {
        const total = done.motorcycles + done.spareParts + done.accessories
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center" onClick={(e) => e.stopPropagation()}>
                    <div className="text-5xl mb-4">{done.errors.length === 0 ? '🎉' : '⚠️'}</div>
                    <h2 className="text-xl font-bold text-gray-900 mb-1">Import Complete</h2>
                    <p className="text-gray-500 text-sm mb-6">{total} item{total !== 1 ? 's' : ''} imported successfully</p>

                    <div className="grid grid-cols-3 gap-3 mb-6">
                        {[
                            { icon: '🏍️', label: 'Motorcycles', count: done.motorcycles },
                            { icon: '🔧', label: 'Spare Parts', count: done.spareParts },
                            { icon: '🪖', label: 'Accessories', count: done.accessories },
                        ].map((s) => (
                            <div key={s.label} className="bg-gray-50 rounded-xl p-3">
                                <div className="text-2xl mb-1">{s.icon}</div>
                                <div className="text-lg font-bold text-gray-800">{s.count}</div>
                                <div className="text-xs text-gray-500">{s.label}</div>
                            </div>
                        ))}
                    </div>

                    {done.errors.length > 0 && (
                        <div className="mb-4 text-left bg-red-50 border border-red-200 rounded-lg p-3 max-h-32 overflow-y-auto">
                            {done.errors.map((e, i) => (
                                <p key={i} className="text-xs text-red-600">{e}</p>
                            ))}
                        </div>
                    )}

                    <button
                        onClick={onClose}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 rounded-lg transition-colors"
                    >
                        View Inventory
                    </button>
                </div>
            </div>
        )
    }

    // ── Main screen ──────────────────────────────────────────────────────────
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl flex flex-col overflow-hidden max-h-[90vh]" onClick={(e) => e.stopPropagation()}>

                {/* Header */}
                <div className="flex items-center justify-between px-7 pt-6 pb-4 border-b border-gray-100 shrink-0">
                    <div>
                        <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-0.5">Bulk Import</p>
                        <h2 className="text-xl font-bold text-gray-900">Import Inventory</h2>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 text-sm font-bold">
                        ✕
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-7 py-5 space-y-5">

                    {/* Template download */}
                    <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
                        <div>
                            <p className="text-sm font-semibold text-blue-800">Download the Excel template</p>
                            <p className="text-xs text-blue-600 mt-0.5">3 sheets: Motorcycles, Spare Parts, Accessories</p>
                        </div>
                        <button
                            onClick={downloadTemplate}
                            className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5"
                        >
                            ⬇ Template
                        </button>
                    </div>

                    {/* Drop zone */}
                    <div
                        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                            dragOver ? 'border-orange-400 bg-orange-50' : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50/50'
                        }`}
                        onClick={() => inputRef.current?.click()}
                        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={onDrop}
                    >
                        <input
                            ref={inputRef}
                            type="file"
                            accept=".xlsx,.xls,.csv"
                            className="hidden"
                            onChange={onFileChange}
                        />
                        {fileName ? (
                            <>
                                <div className="text-3xl mb-2">📊</div>
                                <p className="font-semibold text-gray-800 text-sm">{fileName}</p>
                                <p className="text-xs text-gray-400 mt-1">Click to change file</p>
                            </>
                        ) : (
                            <>
                                <div className="text-4xl mb-3">📂</div>
                                <p className="font-semibold text-gray-700">Drop your Excel or CSV file here</p>
                                <p className="text-xs text-gray-400 mt-1">or click to browse — .xlsx, .xls, .csv</p>
                            </>
                        )}
                    </div>

                    {/* Preview */}
                    {parsed && (
                        <div className="space-y-3">
                            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Preview</p>
                            {[
                                { icon: '🏍️', label: 'Motorcycles', rows: parsed.motorcycles.filter((r) => r.name) },
                                { icon: '🔧', label: 'Spare Parts', rows: parsed.spareParts.filter((r) => r.name) },
                                { icon: '🪖', label: 'Accessories', rows: parsed.accessories.filter((r) => r.name) },
                            ].map(({ icon, label, rows }) => (
                                <div key={label} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl">{icon}</span>
                                        <span className="text-sm font-medium text-gray-700">{label}</span>
                                    </div>
                                    <span className={`text-sm font-bold px-3 py-0.5 rounded-full ${
                                        rows.length > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-400'
                                    }`}>
                                        {rows.length} row{rows.length !== 1 ? 's' : ''}
                                    </span>
                                </div>
                            ))}

                            {totalRows === 0 && (
                                <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2">
                                    No data found. Make sure your sheet names match: <strong>Motorcycles</strong>, <strong>Spare Parts</strong>, <strong>Accessories</strong>
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-7 py-4 border-t border-gray-100 flex items-center justify-between shrink-0">
                    <p className="text-xs text-gray-400">
                        {totalRows > 0 ? `${totalRows} items ready to import` : 'Upload a file to preview'}
                    </p>
                    <div className="flex gap-3">
                        <button onClick={onClose} className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-lg transition-colors">
                            Cancel
                        </button>
                        <button
                            onClick={handleImport}
                            disabled={!parsed || totalRows === 0 || importing}
                            className="px-5 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors"
                        >
                            {importing ? 'Importing…' : `Import ${totalRows > 0 ? totalRows + ' Items' : ''}`}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
