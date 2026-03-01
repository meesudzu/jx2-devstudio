/**
 * SVG icon components — cross-platform, no emoji font dependency.
 * All icons are 16x16 with currentColor for easy theming.
 */

import React from 'react'

const Icon = ({ d, size = 16, ...props }: { d: string; size?: number } & React.SVGProps<SVGSVGElement>) => (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor"
        strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d={d} />
    </svg>
)

// Folder (open)
export const FolderIcon = (props: { size?: number }) => (
    <Icon d="M2 3h4l2 2h6v8H2V3z" {...props} />
)

// Folder open
export const FolderOpenIcon = (props: { size?: number }) => (
    <Icon d="M2 13V3h4l2 2h6v2H6l-2 6H2zm4-2h8l2-4" {...props} />
)

// File
export const FileIcon = (props: { size?: number }) => (
    <Icon d="M4 2h5l3 3v9H4V2zm5 0v3h3" {...props} />
)

// Search / magnifying glass
export const SearchIcon = (props: { size?: number }) => (
    <svg width={props.size || 16} height={props.size || 16} viewBox="0 0 16 16" fill="none"
        stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="7" cy="7" r="4.5" />
        <path d="M10.5 10.5L14 14" />
    </svg>
)

// Terminal / console
export const TerminalIcon = (props: { size?: number }) => (
    <Icon d="M2 3h12v10H2V3zm3 3l2 2-2 2m4 0h3" {...props} />
)

// Close (X)
export const CloseIcon = (props: { size?: number }) => (
    <Icon d="M4 4l8 8M12 4l-8 8" {...props} />
)

// Chevron right
export const ChevronIcon = (props: { size?: number; className?: string }) => (
    <svg width={props.size || 10} height={props.size || 10} viewBox="0 0 10 10" fill="none"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
        className={props.className}>
        <path d="M3 1.5l4 3.5-4 3.5" />
    </svg>
)

// Lua script file
export const LuaIcon = (props: { size?: number }) => (
    <svg width={props.size || 16} height={props.size || 16} viewBox="0 0 16 16" fill="currentColor">
        <text x="2" y="12" fontSize="10" fontFamily="monospace" fontWeight="bold">Lu</text>
    </svg>
)

// Config / gear
export const GearIcon = (props: { size?: number }) => (
    <svg width={props.size || 16} height={props.size || 16} viewBox="0 0 16 16" fill="none"
        stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="8" cy="8" r="2.5" />
        <path d="M8 1v2m0 10v2M1 8h2m10 0h2M3.05 3.05l1.41 1.41m7.08 7.08l1.41 1.41M3.05 12.95l1.41-1.41m7.08-7.08l1.41-1.41" />
    </svg>
)

// Grid / table
export const GridIcon = (props: { size?: number }) => (
    <Icon d="M2 2h12v12H2V2zm0 4h12m0 4H2m4-8v12m4-12v12" {...props} />
)

// Text / code
export const TextIcon = (props: { size?: number }) => (
    <Icon d="M3 4h10M3 8h7M3 12h10" {...props} />
)

// Encoding / A-Z with toggle
export const EncodingIcon = (props: { size?: number }) => (
    <svg width={props.size || 16} height={props.size || 16} viewBox="0 0 16 16" fill="currentColor">
        <text x="1" y="12" fontSize="11" fontFamily="sans-serif" fontWeight="bold">Aa</text>
    </svg>
)

// Dot (modified indicator)
export const DotIcon = (props: { size?: number; color?: string }) => (
    <svg width={props.size || 8} height={props.size || 8} viewBox="0 0 8 8">
        <circle cx="4" cy="4" r="4" fill={props.color || 'currentColor'} />
    </svg>
)

// Log / list
export const LogIcon = (props: { size?: number }) => (
    <Icon d="M3 3h10M3 6h8M3 9h10M3 12h6" {...props} />
)

// Filter
export const FilterIcon = (props: { size?: number }) => (
    <Icon d="M2 3h12L9 8v4l-2 1V8L2 3z" {...props} />
)

// Sword (JX2 branding)
export const SwordIcon = (props: { size?: number }) => (
    <Icon d="M12 2L5 9l-1.5 3.5L7 11l7-7m-3 0l2 2" {...props} />
)
