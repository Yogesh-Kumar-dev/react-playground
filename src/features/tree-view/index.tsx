import * as React from 'react'
import { faker } from '@faker-js/faker'
import { styled, alpha } from '@mui/material/styles'
import Box from '@mui/material/Box'
import Collapse from '@mui/material/Collapse'
import Typography from '@mui/material/Typography'
import { RichTreeView } from '@mui/x-tree-view/RichTreeView'
import { useTreeItem, type UseTreeItemParameters } from '@mui/x-tree-view/useTreeItem'
import { TreeItemCheckbox, TreeItemIconContainer, TreeItemLabel } from '@mui/x-tree-view/TreeItem'
import { TreeItemIcon } from '@mui/x-tree-view/TreeItemIcon'
import { TreeItemProvider } from '@mui/x-tree-view/TreeItemProvider'
import { TreeItemDragAndDropOverlay } from '@mui/x-tree-view/TreeItemDragAndDropOverlay'
import { useTreeItemModel } from '@mui/x-tree-view/hooks'
import {
    FileText,
    FileImage,
    FileVideo,
    NotebookText,
    Folder,
    FolderOpen,
    Trash2,
} from 'lucide-react'

type FileType = 'image' | 'pdf' | 'doc' | 'video' | 'folder' | 'pinned' | 'trash'

type ExtendedTreeItemProps = {
    fileType?: FileType
    id: string
    label: string
    children?: ExtendedTreeItemProps[]
}

// --- faker-generated data (in place of the doc example's hardcoded ITEMS) ---

const EXTENSION_TYPE: Record<string, FileType> = {
    png: 'image', jpg: 'image', jpeg: 'image', gif: 'image', webp: 'image',
    pdf: 'pdf',
    mp4: 'video', mov: 'video', webm: 'video',
}

function fileTypeFor(fileName: string): FileType {
    const ext = fileName.split('.').pop() ?? ''
    return EXTENSION_TYPE[ext] ?? 'doc'
}

let nextId = 0

function makeFile(): ExtendedTreeItemProps {
    const name = faker.system.fileName()
    return { id: String(nextId++), label: name, fileType: fileTypeFor(name) }
}

function makeFolder(depth: number, fileType?: FileType): ExtendedTreeItemProps {
    const children = Array.from({ length: faker.number.int({ min: 2, max: 4 }) }, () =>
        depth > 0 && faker.datatype.boolean({ probability: 0.35 })
            ? makeFolder(depth - 1)
            : makeFile(),
    )
    return { id: String(nextId++), label: faker.word.noun(), fileType, children }
}

function makeTree(): ExtendedTreeItemProps[] {
    return [
        makeFolder(2),
        { ...makeFolder(1), fileType: 'pinned' },
        makeFolder(1),
        { id: String(nextId++), label: 'Trash', fileType: 'trash' },
    ]
}

// --- custom tree item, adapted from the MUI docs "File Explorer" customization
// example (mui.com/x/react-tree-view/rich-tree-view/customization/#file-explorer):
// react-spring swapped for MUI's built-in Collapse animation, and
// @mui/icons-material swapped for lucide-react, to avoid new dependencies. ---

function DotIcon() {
    return (
        <Box
            sx={{
                width: 6,
                height: 6,
                borderRadius: '70%',
                bgcolor: 'warning.main',
                display: 'inline-block',
                verticalAlign: 'middle',
                zIndex: 1,
                mx: 1,
            }}
        />
    )
}

const TreeItemRoot = styled('li')(({ theme }) => ({
    listStyle: 'none',
    margin: 0,
    padding: 0,
    outline: 0,
    color: theme.palette.grey[400],
}))

const TreeItemContent = styled('div')(({ theme }) => ({
    padding: theme.spacing(0.5),
    paddingRight: theme.spacing(1),
    paddingLeft: `calc(${theme.spacing(1)} + var(--TreeView-itemChildrenIndentation) * var(--TreeView-itemDepth))`,
    width: '100%',
    boxSizing: 'border-box',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    cursor: 'pointer',
    WebkitTapHighlightColor: 'transparent',
    flexDirection: 'row-reverse',
    borderRadius: theme.spacing(0.7),
    marginBottom: theme.spacing(0.5),
    marginTop: theme.spacing(0.5),
    fontWeight: 500,
    '&[data-expanded]:not([data-focused], [data-selected]) .labelIcon': {
        color: theme.palette.primary.dark,
        '&::before': {
            content: '""',
            display: 'block',
            position: 'absolute',
            left: '16px',
            top: '44px',
            height: 'calc(100% - 48px)',
            width: '1.5px',
            backgroundColor: theme.palette.grey[700],
        },
    },
    '&[data-focused], &[data-selected]': {
        backgroundColor: theme.palette.primary.dark,
        color: theme.palette.primary.contrastText,
    },
    '&:not([data-focused], [data-selected]):hover': {
        backgroundColor: alpha(theme.palette.primary.main, 0.1),
        color: 'white',
    },
}))

const TreeItemLabelText = styled(Typography)({
    color: 'inherit',
    fontWeight: 500,
})

interface CustomLabelProps {
    children: React.ReactNode
    icon?: React.ElementType
    expandable?: boolean
}

function CustomLabel({ icon: Icon, expandable, children, ...other }: CustomLabelProps) {
    return (
        <TreeItemLabel {...other} sx={{ display: 'flex', alignItems: 'center' }}>
            {Icon && (
                <Box
                    component={Icon}
                    className="labelIcon"
                    sx={{ color: 'inherit', mr: 1, fontSize: '1.2rem' }}
                />
            )}
            <TreeItemLabelText variant="body2">{children}</TreeItemLabelText>
            {expandable && <DotIcon />}
        </TreeItemLabel>
    )
}

const getIconFromFileType = (fileType: FileType) => {
    switch (fileType) {
        case 'image':
            return FileImage
        case 'pdf':
            return FileText
        case 'doc':
            return NotebookText
        case 'video':
            return FileVideo
        case 'folder':
            return Folder
        case 'pinned':
            return FolderOpen
        case 'trash':
            return Trash2
        default:
            return NotebookText
    }
}

interface CustomTreeItemProps
    extends Omit<UseTreeItemParameters, 'rootRef'>,
        Omit<React.HTMLAttributes<HTMLLIElement>, 'onFocus'> {}

const CustomTreeItem = React.forwardRef(function CustomTreeItem(
    props: CustomTreeItemProps,
    ref: React.Ref<HTMLLIElement>,
) {
    const { id, itemId, label, disabled, children, ...other } = props

    const {
        getContextProviderProps,
        getRootProps,
        getContentProps,
        getIconContainerProps,
        getCheckboxProps,
        getLabelProps,
        getGroupTransitionProps,
        getDragAndDropOverlayProps,
        status,
    } = useTreeItem({ id, itemId, children, label, disabled, rootRef: ref })

    const item = useTreeItemModel<ExtendedTreeItemProps>(itemId)!

    let icon
    if (status.expandable) {
        icon = Folder
    } else if (item.fileType) {
        icon = getIconFromFileType(item.fileType)
    }

    return (
        <TreeItemProvider {...getContextProviderProps()}>
            <TreeItemRoot {...getRootProps(other)}>
                <TreeItemContent {...getContentProps()}>
                    <TreeItemIconContainer {...getIconContainerProps()}>
                        <TreeItemIcon status={status} />
                    </TreeItemIconContainer>
                    <TreeItemCheckbox {...getCheckboxProps()} />
                    <CustomLabel
                        {...getLabelProps({
                            icon,
                            expandable: status.expandable && status.expanded,
                        })}
                    />
                    <TreeItemDragAndDropOverlay {...getDragAndDropOverlayProps()} />
                </TreeItemContent>
                {children && <Collapse {...getGroupTransitionProps()} />}
            </TreeItemRoot>
        </TreeItemProvider>
    )
})

export default function TreeView() {
    const items = React.useMemo(() => makeTree(), [])

    return (
        <div className="space-y-6 p-6">
            <div>
                <h1 className="text-2xl font-bold">Tree View</h1>
                <p className="text-muted-foreground">
                    MUI X RichTreeView, customized per the docs&apos; File Explorer example,
                    fed with faker-generated files and folders.
                </p>
            </div>

            <RichTreeView
                items={items}
                defaultExpandedItems={[items[0].id, items[0].children![0].id]}
                defaultSelectedItems={items[0].children![0].id}
                sx={{ height: 'fit-content', flexGrow: 1, maxWidth: 400, overflowY: 'auto' }}
                slots={{ item: CustomTreeItem }}
                itemChildrenIndentation={24}
            />
        </div>
    )
}
