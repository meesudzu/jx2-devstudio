import React, { useCallback, useEffect, useState } from 'react'
import { useEditorStore } from '../../stores/editorStore'
import type { FileEntry, Encoding } from '../../types'
import { FolderIcon, FolderOpenIcon, FileIcon, ChevronIcon, GearIcon } from '../Icons'

function getFileIcon(entry: FileEntry) {
    if (entry.isDirectory) return { icon: <FolderIcon />, className: 'folder' }
    const ext = entry.extension || ''
    if (ext === '.lua') return { icon: <FileIcon />, className: 'lua' }
    if (ext === '.ini' || ext === '.cfg') return { icon: <GearIcon />, className: 'ini' }
    return { icon: <FileIcon />, className: 'txt' }
}

interface TreeItemProps {
    entry: FileEntry
    depth: number
}

function TreeItem({ entry, depth }: TreeItemProps) {
    const {
        expandedDirs,
        toggleDir,
        openFile,
        activeTabId,
        openTabs,
    } = useEditorStore()

    const [children, setChildren] = useState<FileEntry[]>([])
    const [loaded, setLoaded] = useState(false)

    const isExpanded = expandedDirs.has(entry.path)
    const isActive = openTabs.some(t => t.filePath === entry.path && t.id === activeTabId)
    const { icon, className } = getFileIcon(entry)

    const handleClick = useCallback(async () => {
        if (entry.isDirectory) {
            toggleDir(entry.path)
            if (!loaded) {
                try {
                    const items = await window.jx2.listDirectory(entry.path)
                    setChildren(items)
                    setLoaded(true)
                } catch (err) {
                    console.error('Failed to load directory:', err)
                }
            }
        } else {
            try {
                const result = await window.jx2.readFile(entry.path, undefined as any)
                const isTxt = entry.extension === '.txt'
                openFile({
                    id: entry.path,
                    filePath: entry.path,
                    fileName: entry.displayName,
                    content: result.content,
                    encoding: result.encoding as Encoding,
                    isDirty: false,
                    isTabular: isTxt,
                })
            } catch (err) {
                console.error('Failed to read file:', err)
            }
        }
    }, [entry, loaded, toggleDir, openFile])

    const indent = depth * 16 + 8

    return (
        <>
            <div
                className={`tree-item ${isActive ? 'active' : ''}`}
                style={{ '--indent': `${indent}px` } as React.CSSProperties}
                onClick={handleClick}
                title={entry.path}
            >
                {entry.isDirectory && (
                    <span className={`tree-icon chevron ${isExpanded ? 'expanded' : ''}`}>
                        <ChevronIcon />
                    </span>
                )}
                <span className={`tree-icon ${className}`}>{icon}</span>
                <span className="tree-name">{entry.displayName}</span>
            </div>
            {entry.isDirectory && isExpanded && children.map((child) => (
                <TreeItem key={child.path} entry={child} depth={depth + 1} />
            ))}
        </>
    )
}

export function FileExplorer() {
    const { fileTree, projectRoot } = useEditorStore()

    if (!projectRoot || fileTree.length === 0) {
        return (
            <div className="file-tree">
                <div className="empty-state">
                    <div className="empty-state-icon"><FolderOpenIcon size={32} /></div>
                    <span>No folder open</span>
                    <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                        Use Ctrl+O to open a project
                    </span>
                </div>
            </div>
        )
    }

    return (
        <div className="file-tree">
            {fileTree.map((entry) => (
                <TreeItem key={entry.path} entry={entry} depth={0} />
            ))}
        </div>
    )
}
