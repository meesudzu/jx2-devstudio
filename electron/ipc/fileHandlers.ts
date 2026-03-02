/**
 * File IPC handlers — bridge between renderer and EncodingManager.
 */

import { IpcMain, dialog } from 'electron'
import * as fs from 'fs'
import * as path from 'path'
import { encodingManager, Encoding } from '../core/EncodingManager'

export interface FileEntry {
    name: string
    displayName: string
    path: string
    isDirectory: boolean
    children?: FileEntry[]
    extension?: string
}

export function registerFileHandlers(ipcMain: IpcMain) {
    // Read a file with specified or auto-detected encoding
    ipcMain.handle('file:read', (_event, filePath: string, encoding?: Encoding) => {
        try {
            const rawBuffer = fs.readFileSync(Buffer.from(filePath, 'latin1'))
            const detectedEncoding = encoding || encodingManager.detectEncodingWithHint(rawBuffer, filePath)
            const result = encodingManager.readFile(filePath, detectedEncoding)
            return result
        } catch (err: any) {
            throw new Error(`Failed to read file: ${err.message}`)
        }
    })

    // Save file with specified encoding
    ipcMain.handle('file:save', (_event, filePath: string, content: string, encoding: Encoding) => {
        try {
            encodingManager.saveFile(filePath, content, encoding)
        } catch (err: any) {
            throw new Error(`Failed to save file: ${err.message}`)
        }
    })

    // Helper to resolve duplicate file names by appending (1), (2), etc.
    const resolveDuplicatePath = (targetPath: string): string => {
        const targetBuf = Buffer.from(targetPath, 'latin1')
        if (!fs.existsSync(targetBuf)) return targetPath

        const parsed = path.parse(targetPath)
        let newPath = targetPath
        let newPathBuf = targetBuf
        let counter = 1

        while (fs.existsSync(newPathBuf)) {
            newPath = path.join(parsed.dir, `${parsed.name} (${counter})${parsed.ext}`)
            newPathBuf = Buffer.from(newPath, 'latin1')
            counter++
        }
        return newPath
    }

    // Create a new empty file or directory
    ipcMain.handle('file:create', (_event, targetPath: string, isDirectory: boolean) => {
        try {
            const finalPath = resolveDuplicatePath(targetPath)
            const finalBuf = Buffer.from(finalPath, 'latin1')
            if (isDirectory) {
                fs.mkdirSync(finalBuf, { recursive: true })
            } else {
                fs.writeFileSync(finalBuf, '')
            }
        } catch (err: any) {
            throw new Error(`Failed to create: ${err.message}`)
        }
    })

    // Rename a file or directory
    ipcMain.handle('file:rename', (_event, oldPath: string, newPath: string) => {
        try {
            const finalPath = resolveDuplicatePath(newPath)
            fs.renameSync(Buffer.from(oldPath, 'latin1'), Buffer.from(finalPath, 'latin1'))
        } catch (err: any) {
            throw new Error(`Failed to rename: ${err.message}`)
        }
    })

    // Delete a file or directory
    ipcMain.handle('file:delete', (_event, targetPath: string) => {
        try {
            fs.rmSync(Buffer.from(targetPath, 'latin1'), { recursive: true, force: true })
            encodingManager.evictCache(targetPath)
        } catch (err: any) {
            throw new Error(`Failed to delete: ${err.message}`)
        }
    })

    // Custom recursive copy because fs.cpSync doesn't support Buffer paths
    const copyRecursiveSync = (src: Buffer, dest: Buffer) => {
        const stat = fs.statSync(src)
        if (stat.isDirectory()) {
            if (!fs.existsSync(dest)) {
                fs.mkdirSync(dest, { recursive: true })
            }
            const entries = fs.readdirSync(src, { encoding: 'buffer', withFileTypes: true })
            for (const entry of entries) {
                // To join, we can just concat the Buffers with a slash
                const srcPath = Buffer.concat([src, Buffer.from('/'), entry.name])
                const destPath = Buffer.concat([dest, Buffer.from('/'), entry.name])
                copyRecursiveSync(srcPath, destPath)
            }
        } else {
            fs.copyFileSync(src, dest)
        }
    }

    // Copy a file or directory
    ipcMain.handle('file:copy', (_event, sourcePath: string, targetPath: string) => {
        try {
            const finalPath = resolveDuplicatePath(targetPath)
            copyRecursiveSync(Buffer.from(sourcePath, 'latin1'), Buffer.from(finalPath, 'latin1'))
        } catch (err: any) {
            throw new Error(`Failed to copy: ${err.message}`)
        }
    })

    // List directory contents with GB18030 filename decoding
    ipcMain.handle('file:listDir', (_event, dirPath: string) => {
        try {
            return listDirectoryRecursive(dirPath, 1)
        } catch (err: any) {
            throw new Error(`Failed to list directory: ${err.message}`)
        }
    })

    // Re-interpret a cached file with a different encoding
    ipcMain.handle('file:reinterpret', (_event, filePath: string, newEncoding: Encoding) => {
        try {
            return encodingManager.reinterpret(filePath, newEncoding)
        } catch (err: any) {
            throw new Error(`Failed to reinterpret file: ${err.message}`)
        }
    })

    // Open a directory selection dialog
    ipcMain.handle('file:selectDir', async () => {
        const result = await dialog.showOpenDialog({
            properties: ['openDirectory'],
            title: 'Open JX2 Project Folder',
        })
        if (result.canceled || result.filePaths.length === 0) return null
        // Encode UTF-8 OS string to a latin1 string representing raw bytes
        return Buffer.from(result.filePaths[0], 'utf8').toString('latin1')
    })
}

/**
 * List directory entries, decoding filenames and expanding one level.
 */
function listDirectoryRecursive(dirPath: string, depth: number): FileEntry[] {
    const entries: FileEntry[] = []

    try {
        const dirBuf = Buffer.from(dirPath, 'latin1')
        const dirEntries = fs.readdirSync(dirBuf, { withFileTypes: true, encoding: 'buffer' })

        for (const entry of dirEntries) {
            // Skip hidden files/dirs
            if (entry.name[0] === 0x2e) continue // 0x2e is '.'

            const nameLatin1 = entry.name.toString('latin1')
            const fullPath = path.join(dirPath, nameLatin1)
            const fullPathBuf = Buffer.from(fullPath, 'latin1')

            const displayName = encodingManager.decodeFilename(entry.name)
            const ext = path.extname(nameLatin1).toLowerCase()

            const fileEntry: FileEntry = {
                name: nameLatin1,
                displayName,
                path: fullPath,
                isDirectory: entry.isDirectory(),
                extension: ext || undefined,
            }

            // Lazy loading: only expand children for first level
            if (entry.isDirectory() && depth > 0) {
                try {
                    // Just check if it has children, don't fully expand
                    const childCount = fs.readdirSync(fullPathBuf).length
                    fileEntry.children = childCount > 0 ? [] : undefined
                } catch {
                    // Can't read directory
                }
            }

            entries.push(fileEntry)
        }

        // Sort: directories first, then alphabetically
        entries.sort((a, b) => {
            if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1
            return a.displayName.localeCompare(b.displayName)
        })
    } catch {
        // Skip unreadable directories
    }

    return entries
}
