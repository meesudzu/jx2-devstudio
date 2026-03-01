import React, { useCallback } from 'react'
import { useEditorStore } from '../../stores/editorStore'
import type { Encoding } from '../../types'
import { FolderIcon, EncodingIcon, DotIcon } from '../Icons'

const ENCODINGS: Encoding[] = ['gb18030', 'windows-1252']

export function StatusBar() {
    const { openTabs, activeTabId, updateTabEncoding, projectRoot } = useEditorStore()

    const activeTab = openTabs.find((t) => t.id === activeTabId)

    const handleEncodingToggle = useCallback(async () => {
        if (!activeTab) return

        const currentIdx = ENCODINGS.indexOf(activeTab.encoding)
        const nextEncoding = ENCODINGS[(currentIdx + 1) % ENCODINGS.length]

        try {
            const result = await window.jx2.reinterpretFile(activeTab.filePath, nextEncoding)
            updateTabEncoding(activeTab.id, nextEncoding, result.content)
        } catch (err) {
            console.error('Failed to reinterpret:', err)
        }
    }, [activeTab, updateTabEncoding])

    const lineCount = activeTab?.content.split('\n').length ?? 0

    return (
        <div className="statusbar">
            <div className="statusbar-left">
                {projectRoot && (
                    <span className="status-item" title={projectRoot}>
                        <FolderIcon size={12} /> {projectRoot.split('/').pop()}
                    </span>
                )}
            </div>

            <div className="statusbar-right">
                {activeTab && (
                    <>
                        <span className="status-item">
                            Ln {lineCount}
                        </span>

                        <span className="status-item" title={activeTab.filePath}>
                            {activeTab.filePath.split('/').pop()}
                        </span>

                        {/* Encoding toggle — THE key feature */}
                        <button
                            className="encoding-toggle active"
                            onClick={handleEncodingToggle}
                            title={`Current: ${activeTab.encoding.toUpperCase()}\nClick to toggle encoding`}
                        >
                            <EncodingIcon size={14} /> {activeTab.encoding.toUpperCase()}
                        </button>

                        {activeTab.isDirty && (
                            <span className="status-item" style={{ color: 'var(--accent-orange)' }}>
                                <DotIcon color="var(--accent-orange)" /> Modified
                            </span>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
