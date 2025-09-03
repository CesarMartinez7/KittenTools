import { useState, useEffect, useRef } from 'react';
import { Icon } from '@iconify/react';
import ICONS_PAGES from '../../icons/ICONS_PAGE';
import LazyListPerform from '../../../../ui/LazyListPerform';
import { useRequestStore } from '../../stores/request.store';
import useItemNodeLogic from './CollectionNode.hook';
import { type CollectionItemNodeProps } from './types';


const CollectionItemNode = ({ item, collectionId, level } : CollectionItemNodeProps) => {

    const {
        nodeData,
        collapsed,
        showBar,
        isFolder,
        getDisplayName,
        setShowBar,
        handleClickContextMenu,
        handleClick,
        handleEdit,
        handleDelete,
    } = useItemNodeLogic({
        data: item,
        level,
        parentCollectionId: collectionId,
    });

    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(getDisplayName());
    const inputRef = useRef<HTMLInputElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const [examplesCollapsed, setExamplesCollapsed] = useState(true);

    // Obtener la función de la store de Zustand.
    const addFromNode = useRequestStore((state) => state.addFromNode);

    // Función unificada para manejar el clic en el nodo (carpeta o request)
    const handleNodeClick = (e) => {

        
        e.stopPropagation();
        if (isFolder) {
            
            handleClick(); // Lógica para colapsar/expandir la carpeta
        } else {
            
            // Llama a la función de la store para abrir el tab
            addFromNode({
                ...nodeData,
                collectionId: collectionId,
                id: item.id,
            });
        }
    };
    
    // Función para alternar la visibilidad de los ejemplos
    const toggleExamples = (e) => {
        e.stopPropagation();
        setExamplesCollapsed(!examplesCollapsed);
    };
    
    // Función para añadir un nuevo ejemplo a la petición
    const handleAddExample = (e) => {
        e.stopPropagation();
        const newExample = {
            name: 'Nuevo Ejemplo',
            code: 200,
            originalRequest: nodeData.request,
            body: {} // Ajusta esto según tu estructura de datos
        };
        useRequestStore.getState().addExample(collectionId, item.id, newExample);
    };

    useEffect(() => {
        if (isEditing) {
            inputRef.current?.focus();
        }
    }, [isEditing]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowBar(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [setShowBar]);

    const saveEdit = () => {
        handleEdit(editValue);
        setIsEditing(false);
    };

    const handleEditClick = (e) => {
        e.stopPropagation();
        setIsEditing(true);
        setShowBar(false);
    };

    // Mapeo de acciones para carpetas
    const mapperFolder = [
        { name: 'Nueva Carpeta', action: () => useRequestStore.getState().handleAddNewFolder(collectionId, item.id, 'Nueva Carpeta') },
        { name: 'Nueva Petición', action: () => useRequestStore.getState().handleAddNewItem(collectionId, item.id, 'Nueva Petición') },
        { name: 'Eliminar', action: handleDelete },
    ];

    // Mapeo de acciones para peticiones
    const mapperRequest = [
        { name: 'Añadir Ejemplo', action: handleAddExample },
        { name: 'Editar', action: handleEditClick },
        { name: 'Eliminar', action: handleDelete },
    ];

    const menuActions = isFolder ? mapperFolder : mapperRequest;

    const Skeleton = () => (
        <div className="flex h-[36px] items-center animate-pulse bg-gray-50 dark:bg-zinc-900 w-full py-1.5 px-2 cursor-pointer rounded-md transition-colors duration-200 group dark:hover:bg-zinc-700/50 hover:bg-gray-200/50" />
    );
    
    const methodBadgeStyles = (method) => {
        switch (method.toLowerCase()) {
            case 'get':
                return 'bg-blue-200 text-blue-800 dark:bg-blue-800 dark:text-blue-200';
            case 'post':
                return 'bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200';
            case 'put':
                return 'bg-yellow-200 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200';
            case 'delete':
                return 'bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-200';
            default:
                return 'bg-gray-200 text-gray-800 dark:bg-zinc-700 dark:text-zinc-300';
        }
    };


    if (!item) {
        return null;
    }


    return (
        <LazyListPerform skeleton={<Skeleton />}>
            <div
                key={item.id}
                className="relative text-gray-600 text-xs dark:text-zinc-200"
            >
                <div
                    className="flex items-center h-[36px] py-1.5 px-2 cursor-pointer rounded-md transition-colors duration-200 group dark:hover:bg-zinc-700/50 hover:bg-gray-200/50"
                    style={{ paddingLeft: `${level * 16 + 8}px` }}
                    onClick={handleNodeClick}
                    onContextMenu={handleClickContextMenu}
                >
                    {isFolder && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleClick();
                            }}
                            className="p-1 hover:bg-zinc-300 dark:hover:bg-zinc-800 rounded mr-1 flex items-center justify-center transition-colors"
                        >
                            {collapsed ? (
                                <Icon icon={ICONS_PAGES.chevronright} />
                            ) : (
                                <Icon icon={ICONS_PAGES.chevrondown} />
                            )}
                        </button>
                    )}
                    {!isFolder && item.response?.length > 0 && (
                        <button
                            onClick={toggleExamples}
                            className="p-1 hover:bg-zinc-300 dark:hover:bg-zinc-800 rounded mr-1 flex items-center justify-center transition-colors"
                        >
                            {examplesCollapsed ? (
                                <Icon icon={ICONS_PAGES.chevronright} />
                            ) : (
                                <Icon icon={ICONS_PAGES.chevrondown} />
                            )}
                        </button>
                    )}

                    {isFolder ? (
                        collapsed ? (
                            <Icon
                                icon={ICONS_PAGES.folderopen}
                                className="text-green-primary mr-2 size-4"
                            />
                        ) : (
                            <Icon
                                icon={ICONS_PAGES.folder}
                                className="text-green-primary mr-2 size-4"
                            />
                        )
                    ) : (
                        <Icon
                            icon="material-symbols:http"
                            width="22"
                            height="22"
                            className="text-green-primary mr-2"
                        />
                    )}

                    {isEditing ? (
                        <input
                            type="text"
                            ref={inputRef}
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={saveEdit}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') saveEdit();
                                if (e.key === 'Escape') setIsEditing(false);
                            }}
                            className="flex-1 px-1 py-0 border-b border-green-500 bg-transparent text-sm outline-none"
                        />
                    ) : (
                        <span
                            className="flex-1 text-xs truncate text-gray-700 dark:text-zinc-300 font-normal"
                            title={getDisplayName()}
                        >
                            {getDisplayName()}
                        </span>
                    )}

                    {!isFolder && nodeData.request && (
                        <span
                            className={`px-2 py-0.5 text-[11px] rounded-full font-bold ml-2 ${methodBadgeStyles(
                                nodeData.request.method,
                            )}`}
                        >
                            {nodeData.request.method}
                        </span>
                    )}

                    <div className="flex items-center gap-2 ml-auto text-gray-500">
                        {!isFolder && (
                            <button
                                onClick={handleAddExample}
                                className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
                                title="Añadir Ejemplo"
                            >
                                <Icon icon={ICONS_PAGES.plus} fontSize={14} />
                            </button>
                        )}
                        <button
                            onClick={handleEditClick}
                            className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
                            title="Editar"
                        >
                            <Icon icon={ICONS_PAGES.edit} fontSize={16} />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDelete();
                            }}
                            className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
                            title="Eliminar"
                        >
                            <Icon icon={ICONS_PAGES.trash} fontSize={16} />
                        </button>
                    </div>
                </div>

                {showBar && (
                    <div
                        ref={menuRef}
                        className="absolute z-10 top-full right-2 mt-2 w-38 text-xs rounded-md shadow-lg py-1 focus:outline-none border-gray-200 bg-white dark:bg-zinc-900 border dark:border-zinc-800"
                    >
                        {menuActions.map((action, index) => (
                            <button
                                key={index}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (action.action) action.action();
                                    setShowBar(false);
                                }}
                                className="w-full text-left px-4 py-2 text-gray-800 dark:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-700"
                            >
                                {action.name}
                            </button>
                        ))}
                    </div>
                )}
                
                {/* Renderizado de sub-items y ejemplos */}
                {isFolder && !collapsed && (
                    <div className="pl-4 border-l dark:border-zinc-700 ml-2 border-gray-200">
                        {item.item?.map((subItem) => (
                            <CollectionItemNode
                                key={subItem.id}
                                item={subItem}
                                collectionId={collectionId}
                                level={level + 1}
                            />
                        ))}
                    </div>
                )}

                {!isFolder && !examplesCollapsed && item.response?.length > 0 && (
                    <div className="pl-4 border-l dark:border-zinc-700 ml-2 border-gray-200">
                        {item.response.map((example, index) => (
                            <div
                                onClick={() => handleClick(example)}
                                key={`example-${item.id}-${index}`}
                                className="flex items-center gap-2 py-1 px-2 ml-6 text-xs text-gray-600 dark:text-zinc-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-800 rounded"
                            >
                                <Icon
                                    icon={ICONS_PAGES.clipboard}
                                    width="18"
                                    height="18"
                                    className="text-blue-400"
                                />
                                <span className="truncate">
                                    {example.name || `Ejemplo ${index + 1}`}
                                </span>
                                <span className="ml-auto text-[10px] px-2 py-0.5 rounded bg-gray-200 dark:bg-zinc-700">
                                    {example.code}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </LazyListPerform>
    );
};

export default CollectionItemNode;